const express = require('express');
const router = express.Router();
const { getNextInvoiceNumber, getAll, getOne, insert, runQuery } = require('../db/database');

// GET all invoices with customer details
router.get('/', async (req, res) => {
  try {
    const invoices = await getAll(`
      SELECT
        i.*,
        c.name as customer_name,
        c.address as customer_address,
        c.gstin as customer_gstin,
        c.phone as customer_phone
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      ORDER BY CAST(i.invoice_no AS INTEGER) DESC
    `);

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET monthly analytics data (must be before /:id)
router.get('/analytics/monthly', async (req, res) => {
  try {
    const result = await getAll(`
      SELECT
        TO_CHAR(TO_DATE(date, 'DD-MM-YYYY'), 'YYYY-MM') as month_key,
        SUM(grand_total) as total_revenue,
        SUM(CASE WHEN payment_status = 'paid' THEN grand_total ELSE 0 END) as paid_amount,
        SUM(CASE WHEN payment_status = 'pending' THEN grand_total ELSE 0 END) as pending_amount,
        COUNT(*) as invoice_count
      FROM invoices
      GROUP BY TO_CHAR(TO_DATE(date, 'DD-MM-YYYY'), 'YYYY-MM')
      ORDER BY TO_CHAR(TO_DATE(date, 'DD-MM-YYYY'), 'YYYY-MM') ASC
    `);

    if (result.length === 0) {
      return res.json({
        months: [],
        revenue: [],
        paid: [],
        pending: [],
        invoiceCount: []
      });
    }

    // Format months and build response
    const months = [];
    const revenue = [];
    const paid = [];
    const pending = [];
    const invoiceCount = [];

    result.forEach(row => {
      // Parse month_key (YYYY-MM) and format as "Mon YYYY"
      const [year, month] = row.month_key.split('-');
      const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthLabel = monthNames[parseInt(month)] + ' ' + year;

      months.push(monthLabel);
      revenue.push(Math.round(parseFloat(row.total_revenue) * 100) / 100);
      paid.push(Math.round(parseFloat(row.paid_amount) * 100) / 100);
      pending.push(Math.round(parseFloat(row.pending_amount) * 100) / 100);
      invoiceCount.push(parseInt(row.invoice_count));
    });

    res.json({
      months,
      revenue,
      paid,
      pending,
      invoiceCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET next invoice number
router.get('/next-number', async (req, res) => {
  try {
    const nextNumber = await getNextInvoiceNumber();
    res.json({ invoice_no: nextNumber });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single invoice by ID with items
router.get('/:id', async (req, res) => {
  try {
    const invoice = await getOne(`
      SELECT
        i.*,
        c.name as customer_name,
        c.address as customer_address,
        c.gstin as customer_gstin,
        c.phone as customer_phone,
        c.email as customer_email
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = $1
    `, [req.params.id]);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Get items
    const items = await getAll(`
      SELECT * FROM invoice_items WHERE invoice_id = $1
    `, [req.params.id]);

    res.json({ ...invoice, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new invoice with items
router.post('/', async (req, res) => {
  const { invoice_no, date, customer_id, items, notes } = req.body;

  try {
    // Calculate totals
    let subtotal = 0;
    if (items && Array.isArray(items)) {
      items.forEach(item => {
        subtotal += item.qty * item.rate;
      });
    }

    const sgst = subtotal * 0.09; // 9% SGST
    const cgst = subtotal * 0.09; // 9% CGST
    const grand_total = subtotal + sgst + cgst;

    // Insert invoice
    const invoiceId = await insert(`
      INSERT INTO invoices (invoice_no, date, customer_id, subtotal, sgst, cgst, grand_total, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [invoice_no, date, customer_id || null, subtotal, sgst, cgst, grand_total, notes || '']);

    // Insert items
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const amount = item.qty * item.rate;
        await runQuery(`
          INSERT INTO invoice_items (invoice_id, description, hsn_code, qty, rate, amount)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [invoiceId, item.description, item.hsn_code || null, item.qty, item.rate, amount]);
      }
    }

    res.status(201).json({
      id: invoiceId,
      invoice_no,
      message: 'Invoice created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update invoice
router.put('/:id', async (req, res) => {
  const { date, customer_id, items, notes, payment_status } = req.body;

  try {
    // Calculate totals
    let subtotal = 0;
    if (items && Array.isArray(items)) {
      items.forEach(item => {
        subtotal += item.qty * item.rate;
      });
    }

    const sgst = subtotal * 0.09;
    const cgst = subtotal * 0.09;
    const grand_total = subtotal + sgst + cgst;

    // Update invoice
    await runQuery(`
      UPDATE invoices
      SET date = $1, customer_id = $2, subtotal = $3, sgst = $4, cgst = $5,
          grand_total = $6, notes = $7, payment_status = $8
      WHERE id = $9
    `, [date, customer_id || null, subtotal, sgst, cgst, grand_total, notes || '', payment_status || 'pending', req.params.id]);

    // Delete old items and insert new ones
    if (items && Array.isArray(items)) {
      await runQuery('DELETE FROM invoice_items WHERE invoice_id = $1', [req.params.id]);

      for (const item of items) {
        const amount = item.qty * item.rate;
        await runQuery(`
          INSERT INTO invoice_items (invoice_id, description, hsn_code, qty, rate, amount)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [req.params.id, item.description, item.hsn_code || null, item.qty, item.rate, amount]);
      }
    }

    res.json({ message: 'Invoice updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH update payment status only
router.patch('/:id/status', async (req, res) => {
  const { payment_status } = req.body;

  try {
    await runQuery(`UPDATE invoices SET payment_status = $1 WHERE id = $2`, [payment_status, req.params.id]);
    res.json({ message: 'Payment status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE invoice
router.delete('/:id', async (req, res) => {
  try {
    // Delete items first (cascade handled by DB but explicit is clearer)
    await runQuery('DELETE FROM invoice_items WHERE invoice_id = $1', [req.params.id]);
    // Delete invoice
    await runQuery('DELETE FROM invoices WHERE id = $1', [req.params.id]);

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { getNextInvoiceNumber, getCurrentBatch, getAll, getOne, insert, runQuery } = require('../db/database');

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

// GET all batches
router.get('/batches', async (req, res) => {
  try {
    const batches = await getAll(`
      SELECT 
        batch,
        COUNT(*) as invoice_count,
        SUM(grand_total) as total_revenue,
        MIN(date) as start_date,
        MAX(date) as end_date
      FROM invoices
      GROUP BY batch
      ORDER BY batch DESC
    `);
    res.json(batches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET next invoice number (with optional batch)
router.get('/next-number', async (req, res) => {
  try {
    const batch = req.query.batch || await getCurrentBatch();
    const nextNumber = await getNextInvoiceNumber(batch);
    const currentBatch = await getCurrentBatch();
    res.json({ 
      next_number: nextNumber,
      current_batch: currentBatch
    });
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
  const { 
    invoice_no, 
    date, 
    customer_id, 
    customer_name,
    customer_address,
    customer_gstin,
    customer_phone,
    items, 
    notes,
    batch  // New field
  } = req.body;

  try {
    // Determine batch
    const finalBatch = batch || await getCurrentBatch();
    const batch_invoice_no = invoice_no; // Use same number within batch

    // Check if invoice number already exists in this batch
    const existingInvoice = await getOne(
      'SELECT id FROM invoices WHERE batch = $1 AND batch_invoice_no = $2',
      [finalBatch, batch_invoice_no]
    );
    
    if (existingInvoice) {
      const nextNumber = await getNextInvoiceNumber(finalBatch);
      return res.status(400).json({ 
        error: `Invoice number ${batch_invoice_no} already exists in ${finalBatch}. Try using ${nextNumber}`,
        suggested_number: nextNumber
      });
    }

    let finalCustomerId = customer_id;

    // If no customer_id provided but customer details exist, create or find customer
    if (!finalCustomerId && customer_name) {
      // Check if customer already exists
      const existingCustomer = await getOne(
        'SELECT id FROM customers WHERE LOWER(name) = LOWER($1)',
        [customer_name]
      );

      if (existingCustomer) {
        finalCustomerId = existingCustomer.id;
      } else {
        // Create new customer
        finalCustomerId = await insert(`
          INSERT INTO customers (name, address, gstin, phone)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `, [customer_name, customer_address || '', customer_gstin || '', customer_phone || '']);
      }
    }

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

    // Insert invoice with batch info
    const invoiceId = await insert(`
      INSERT INTO invoices (invoice_no, batch, batch_invoice_no, date, customer_id, subtotal, sgst, cgst, grand_total, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `, [invoice_no, finalBatch, batch_invoice_no, date, finalCustomerId || null, subtotal, sgst, cgst, grand_total, notes || '']);

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
      batch: finalBatch,
      batch_invoice_no,
      message: 'Invoice created successfully'
    });
  } catch (error) {
    console.error('Invoice creation error:', error);
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

// PATCH bulk update customer_id for invoices
router.patch('/bulk/update-customer', async (req, res) => {
  const { fromCustomerId, toCustomerId } = req.body;

  try {
    const result = await runQuery(
      `UPDATE invoices SET customer_id = $1 WHERE customer_id = $2`,
      [toCustomerId, fromCustomerId]
    );
    res.json({ message: `Updated invoices from customer ${fromCustomerId} to ${toCustomerId}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

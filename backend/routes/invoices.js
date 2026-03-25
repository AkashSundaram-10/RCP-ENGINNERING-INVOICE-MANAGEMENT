const express = require('express');
const router = express.Router();
const { getDb, getNextInvoiceNumber, saveDatabase, getAll, getOne, insert } = require('../db/database');

// GET all invoices with customer details
router.get('/', (req, res) => {
  try {
    const invoices = getAll(`
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
router.get('/analytics/monthly', (req, res) => {
  try {
    const db = getDb();

    // Query to get monthly revenue data
    const result = db.exec(`
      SELECT
        SUBSTR(date, 7, 4) || '-' || SUBSTR(date, 4, 2) as month_key,
        SUM(grand_total) as total_revenue,
        SUM(CASE WHEN payment_status = 'paid' THEN grand_total ELSE 0 END) as paid_amount,
        SUM(CASE WHEN payment_status = 'pending' THEN grand_total ELSE 0 END) as pending_amount,
        COUNT(*) as invoice_count
      FROM invoices
      GROUP BY month_key
      ORDER BY month_key ASC
    `);

    if (result.length === 0 || result[0].values.length === 0) {
      return res.json({
        months: [],
        revenue: [],
        paid: [],
        pending: [],
        invoiceCount: []
      });
    }

    const columns = result[0].columns;
    const rows = result[0].values;

    // Format months and build response
    const months = [];
    const revenue = [];
    const paid = [];
    const pending = [];
    const invoiceCount = [];

    rows.forEach(row => {
      const obj = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });

      // Parse month_key (YYYY-MM) and format as "Mon YYYY"
      const [year, month] = obj.month_key.split('-');
      const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthLabel = monthNames[parseInt(month)] + ' ' + year;

      months.push(monthLabel);
      revenue.push(Math.round(obj.total_revenue * 100) / 100);
      paid.push(Math.round(obj.paid_amount * 100) / 100);
      pending.push(Math.round(obj.pending_amount * 100) / 100);
      invoiceCount.push(obj.invoice_count);
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
router.get('/next-number', (req, res) => {
  try {
    const nextNumber = getNextInvoiceNumber();
    res.json({ invoice_no: nextNumber });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single invoice by ID with items
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const invoiceResult = db.exec(`
      SELECT
        i.*,
        c.name as customer_name,
        c.address as customer_address,
        c.gstin as customer_gstin,
        c.phone as customer_phone,
        c.email as customer_email
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ${req.params.id}
    `);

    if (invoiceResult.length === 0 || invoiceResult[0].values.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const columns = invoiceResult[0].columns;
    const values = invoiceResult[0].values[0];
    const invoice = {};
    columns.forEach((col, idx) => {
      invoice[col] = values[idx];
    });

    // Get items
    const itemsResult = db.exec(`
      SELECT * FROM invoice_items WHERE invoice_id = ${req.params.id}
    `);

    let items = [];
    if (itemsResult.length > 0) {
      const itemCols = itemsResult[0].columns;
      items = itemsResult[0].values.map(row => {
        const obj = {};
        itemCols.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj;
      });
    }

    res.json({ ...invoice, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new invoice with items
router.post('/', (req, res) => {
  const { invoice_no, date, customer_id, items, notes } = req.body;

  try {
    const db = getDb();

    // Calculate totals
    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.qty * item.rate;
    });

    const sgst = subtotal * 0.09; // 9% SGST
    const cgst = subtotal * 0.09; // 9% CGST
    const grand_total = subtotal + sgst + cgst;

    // Insert invoice
    db.run(`
      INSERT INTO invoices (invoice_no, date, customer_id, subtotal, sgst, cgst, grand_total, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [invoice_no, date, customer_id, subtotal, sgst, cgst, grand_total, notes || '']);

    // Get last insert ID
    const idResult = db.exec('SELECT last_insert_rowid() as id');
    const invoiceId = idResult[0].values[0][0];

    // Insert items
    items.forEach(item => {
      const amount = item.qty * item.rate;
      db.run(`
        INSERT INTO invoice_items (invoice_id, description, hsn_code, qty, rate, amount)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [invoiceId, item.description, item.hsn_code, item.qty, item.rate, amount]);
    });

    saveDatabase();

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
router.put('/:id', (req, res) => {
  const { date, customer_id, items, notes, payment_status } = req.body;

  try {
    const db = getDb();

    // Calculate totals
    let subtotal = 0;
    if (items) {
      items.forEach(item => {
        subtotal += item.qty * item.rate;
      });
    }

    const sgst = subtotal * 0.09;
    const cgst = subtotal * 0.09;
    const grand_total = subtotal + sgst + cgst;

    // Update invoice
    db.run(`
      UPDATE invoices
      SET date = ?, customer_id = ?, subtotal = ?, sgst = ?, cgst = ?,
          grand_total = ?, notes = ?, payment_status = ?
      WHERE id = ?
    `, [date, customer_id, subtotal, sgst, cgst, grand_total, notes || '', payment_status, req.params.id]);

    // Delete old items and insert new ones
    if (items) {
      db.run('DELETE FROM invoice_items WHERE invoice_id = ?', [req.params.id]);

      items.forEach(item => {
        const amount = item.qty * item.rate;
        db.run(`
          INSERT INTO invoice_items (invoice_id, description, hsn_code, qty, rate, amount)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [req.params.id, item.description, item.hsn_code, item.qty, item.rate, amount]);
      });
    }

    saveDatabase();

    res.json({ message: 'Invoice updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH update payment status only
router.patch('/:id/status', (req, res) => {
  const { payment_status } = req.body;

  try {
    const db = getDb();
    db.run(`UPDATE invoices SET payment_status = ? WHERE id = ?`, [payment_status, req.params.id]);
    saveDatabase();

    res.json({ message: 'Payment status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE invoice
router.delete('/:id', (req, res) => {
  try {
    const db = getDb();

    // Delete items first
    db.run('DELETE FROM invoice_items WHERE invoice_id = ?', [req.params.id]);
    // Delete invoice
    db.run('DELETE FROM invoices WHERE id = ?', [req.params.id]);

    saveDatabase();

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

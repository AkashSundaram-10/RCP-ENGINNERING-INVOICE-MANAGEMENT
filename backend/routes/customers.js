const express = require('express');
const router = express.Router();
const { getDb, saveDatabase, getAll } = require('../db/database');

// GET all customers
router.get('/', (req, res) => {
  try {
    const customers = getAll(`SELECT * FROM customers ORDER BY name ASC`);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET search customers by name (for autocomplete)
router.get('/search', (req, res) => {
  const { q } = req.query;

  try {
    const db = getDb();
    const result = db.exec(`
      SELECT * FROM customers
      WHERE name LIKE '%${q}%'
      ORDER BY name ASC
      LIMIT 10
    `);

    let customers = [];
    if (result.length > 0) {
      const columns = result[0].columns;
      customers = result[0].values.map(row => {
        const obj = {};
        columns.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj;
      });
    }

    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single customer by ID
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const result = db.exec(`SELECT * FROM customers WHERE id = ${req.params.id}`);

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const columns = result[0].columns;
    const values = result[0].values[0];
    const customer = {};
    columns.forEach((col, idx) => {
      customer[col] = values[idx];
    });

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new customer
router.post('/', (req, res) => {
  const { name, address, gstin, phone, email } = req.body;

  try {
    const db = getDb();
    db.run(`
      INSERT INTO customers (name, address, gstin, phone, email)
      VALUES (?, ?, ?, ?, ?)
    `, [name, address || '', gstin || '', phone || '', email || '']);

    const idResult = db.exec('SELECT last_insert_rowid() as id');
    const customerId = idResult[0].values[0][0];

    saveDatabase();

    res.status(201).json({
      id: customerId,
      message: 'Customer created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update customer
router.put('/:id', (req, res) => {
  const { name, address, gstin, phone, email } = req.body;

  try {
    const db = getDb();
    db.run(`
      UPDATE customers
      SET name = ?, address = ?, gstin = ?, phone = ?, email = ?
      WHERE id = ?
    `, [name, address || '', gstin || '', phone || '', email || '', req.params.id]);

    saveDatabase();

    res.json({ message: 'Customer updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE customer
router.delete('/:id', (req, res) => {
  try {
    const db = getDb();

    // Check if customer has invoices
    const result = db.exec(`
      SELECT COUNT(*) as count FROM invoices WHERE customer_id = ${req.params.id}
    `);

    const count = result[0].values[0][0];
    if (count > 0) {
      return res.status(400).json({
        error: 'Cannot delete customer with existing invoices'
      });
    }

    db.run('DELETE FROM customers WHERE id = ?', [req.params.id]);
    saveDatabase();

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { getAll, getOne, insert, runQuery } = require('../db/database');

// GET all customers
router.get('/', async (req, res) => {
  try {
    const customers = await getAll(`SELECT * FROM customers ORDER BY name ASC`);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET search customers by name (for autocomplete)
// Note: Must be defined BEFORE /:id route
router.get('/search', async (req, res) => {
  const { q } = req.query;

  try {
    const customers = await getAll(`
      SELECT * FROM customers
      WHERE name ILIKE $1
      ORDER BY name ASC
      LIMIT 10
    `, [`%${q}%`]);

    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await getOne(`SELECT * FROM customers WHERE id = $1`, [req.params.id]);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new customer
router.post('/', async (req, res) => {
  const { name, address, gstin, phone, email } = req.body;

  try {
    const customerId = await insert(`
      INSERT INTO customers (name, address, gstin, phone, email)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [name, address || '', gstin || '', phone || '', email || '']);

    res.status(201).json({
      id: customerId,
      message: 'Customer created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update customer
router.put('/:id', async (req, res) => {
  const { name, address, gstin, phone, email } = req.body;

  try {
    await runQuery(`
      UPDATE customers
      SET name = $1, address = $2, gstin = $3, phone = $4, email = $5
      WHERE id = $6
    `, [name, address || '', gstin || '', phone || '', email || '', req.params.id]);

    res.json({ message: 'Customer updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE customer
router.delete('/:id', async (req, res) => {
  try {
    // Check if customer has invoices
    const result = await getOne(`
      SELECT COUNT(*) as count FROM invoices WHERE customer_id = $1
    `, [req.params.id]);

    const count = parseInt(result.count);
    if (count > 0) {
      return res.status(400).json({
        error: 'Cannot delete customer with existing invoices'
      });
    }

    await runQuery('DELETE FROM customers WHERE id = $1', [req.params.id]);

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST merge duplicate customers into one
router.post('/merge', async (req, res) => {
  const { keepId, deleteIds } = req.body;

  if (!keepId || !deleteIds || !Array.isArray(deleteIds) || deleteIds.length === 0) {
    return res.status(400).json({ error: 'keepId and deleteIds array required' });
  }

  try {
    // Update all invoices from deleted customers to the kept customer
    for (const deleteId of deleteIds) {
      await runQuery(`
        UPDATE invoices 
        SET customer_id = $1, customer_name = (SELECT name FROM customers WHERE id = $1)
        WHERE customer_id = $2
      `, [keepId, deleteId]);

      // Delete the duplicate customer
      await runQuery('DELETE FROM customers WHERE id = $1', [deleteId]);
    }

    res.json({ message: `Merged ${deleteIds.length} customer(s) into ID ${keepId}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

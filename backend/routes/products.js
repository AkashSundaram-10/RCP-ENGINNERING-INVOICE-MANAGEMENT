const express = require('express');
const router = express.Router();
const { getAll } = require('../db/database');

router.get('/', async (req, res) => {
  try {
    const products = await getAll(`
      SELECT DISTINCT ON (UPPER(TRIM(ii.description))) 
        ii.id,
        UPPER(TRIM(ii.description)) as name, 
        ii.rate as price, 
        c.name as company
      FROM invoice_items ii
      JOIN invoices i ON ii.invoice_id = i.id
      JOIN customers c ON i.customer_id = c.id
      WHERE ii.description IS NOT NULL AND TRIM(ii.description) != ''
      ORDER BY UPPER(TRIM(ii.description)), i.id DESC	    `);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

module.exports = router;

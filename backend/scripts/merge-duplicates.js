// Script to merge duplicate customers
// Run this on the server: node scripts/merge-duplicates.js

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function mergeDuplicates() {
  const client = await pool.connect();
  
  try {
    console.log('Starting duplicate customer merge...\n');

    // Find duplicates (case-insensitive, trim spaces)
    const customers = await client.query('SELECT * FROM customers ORDER BY id ASC');
    
    const normalizedMap = {};
    const duplicates = [];
    
    for (const customer of customers.rows) {
      const normalized = customer.name.toLowerCase().trim();
      if (!normalizedMap[normalized]) {
        normalizedMap[normalized] = customer;
      } else {
        duplicates.push({
          keep: normalizedMap[normalized],
          duplicate: customer
        });
      }
    }

    console.log(`Found ${duplicates.length} duplicate(s) to merge:\n`);

    for (const { keep, duplicate } of duplicates) {
      console.log(`Merging "${duplicate.name}" (ID ${duplicate.id}) into "${keep.name}" (ID ${keep.id})`);
      
      // Update invoices to point to the kept customer
      const updateResult = await client.query(
        `UPDATE invoices SET customer_id = $1, customer_name = $2 WHERE customer_id = $3`,
        [keep.id, keep.name, duplicate.id]
      );
      console.log(`  - Updated ${updateResult.rowCount} invoice(s)`);

      // Delete the duplicate customer
      await client.query('DELETE FROM customers WHERE id = $1', [duplicate.id]);
      console.log(`  - Deleted customer ID ${duplicate.id}`);
    }

    // Verify final state
    const finalCustomers = await client.query('SELECT id, name FROM customers ORDER BY name ASC');
    console.log('\n--- Final Customer List ---');
    for (const c of finalCustomers.rows) {
      console.log(`ID ${c.id}: ${c.name}`);
    }

    console.log('\n✅ Merge complete!');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

mergeDuplicates();

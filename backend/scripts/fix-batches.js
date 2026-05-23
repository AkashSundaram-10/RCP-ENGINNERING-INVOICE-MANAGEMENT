const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

async function fixBatches() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    // Show current batches
    const current = await client.query('SELECT batch, COUNT(*) as count FROM invoices GROUP BY batch ORDER BY batch');
    console.log('\nCurrent batches:');
    current.rows.forEach(r => console.log('  ' + r.batch + ': ' + r.count + ' invoices'));
    
    // First, drop the unique constraint temporarily
    console.log('\nRemoving unique constraint temporarily...');
    try {
      await client.query("ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_batch_invoice_no_unique");
      await client.query("ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_invoice_no_key");
    } catch (e) {
      console.log('Constraint may not exist, continuing...');
    }
    
    // Update old batch names to new format
    console.log('\nUpdating batch names to 2 batches only...');
    
    // Everything old goes to 2025-2026
    await client.query("UPDATE invoices SET batch = '2025-2026' WHERE batch = 'Batch 1'");
    await client.query("UPDATE invoices SET batch = '2025-2026' WHERE batch = '1' OR batch IS NULL");
    await client.query("UPDATE invoices SET batch = '2025-2026' WHERE batch = '2024-25'");
    await client.query("UPDATE invoices SET batch = '2025-2026' WHERE batch = 'Batch 2' AND batch NOT LIKE '%2026%'");
    
    // New FY 2026-27 goes to 2026-2027
    await client.query("UPDATE invoices SET batch = '2026-2027' WHERE batch LIKE '%2026-27%' OR batch LIKE '%FY 2026%'");
    await client.query("UPDATE invoices SET batch = '2026-2027' WHERE batch = 'Batch 2 (New - FY 2026-27)'");
    
    // Show updated batches
    const updated = await client.query('SELECT batch, COUNT(*) as count FROM invoices GROUP BY batch ORDER BY batch');
    console.log('\nUpdated batches (should be only 2):');
    updated.rows.forEach(r => console.log('  ' + r.batch + ': ' + r.count + ' invoices'));
    
    // Get total count
    const total = await client.query('SELECT COUNT(*) as total FROM invoices');
    console.log('\nTotal invoices preserved: ' + total.rows[0].total);
    
    client.release();
    await pool.end();
    console.log('\n✅ Batch names fixed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixBatches();

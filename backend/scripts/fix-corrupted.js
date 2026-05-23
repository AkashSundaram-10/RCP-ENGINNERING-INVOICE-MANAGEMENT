const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

async function fixCorruptedData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    // Find and delete corrupted invoices with non-numeric invoice_no
    console.log('Finding corrupted records...');
    const corrupted = await client.query("SELECT id, invoice_no FROM invoices WHERE invoice_no !~ '^[0-9]+$'");
    console.log('Found ' + corrupted.rows.length + ' corrupted records');
    
    if (corrupted.rows.length > 0) {
      corrupted.rows.forEach(r => console.log('  Will delete: ID=' + r.id + ', invoice_no=' + r.invoice_no));
      await client.query("DELETE FROM invoices WHERE invoice_no !~ '^[0-9]+$'");
      console.log('Corrupted records deleted');
    }
    
    // Check remaining data
    const remaining = await client.query('SELECT COUNT(*) as total FROM invoices');
    console.log('\nRemaining valid invoices: ' + remaining.rows[0].total);
    
    // Show batch breakdown
    const batches = await client.query('SELECT batch, COUNT(*) as count FROM invoices GROUP BY batch ORDER BY batch');
    console.log('\nBatches:');
    batches.rows.forEach(r => console.log('  ' + r.batch + ': ' + r.count + ' invoices'));
    
    client.release();
    await pool.end();
    console.log('\n✅ Database cleaned!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixCorruptedData();

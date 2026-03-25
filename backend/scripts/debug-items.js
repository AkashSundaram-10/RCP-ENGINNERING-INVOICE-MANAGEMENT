const { initializeDatabase, getDb } = require('../db/database');

async function debug() {
  await initializeDatabase();
  const db = getDb();

  console.log('Checking database tables...\n');

  // Check invoices table
  const invoiceResult = db.exec('SELECT COUNT(*) as count FROM invoices');
  console.log('Invoices count:', invoiceResult[0].values[0][0]);

  // Check invoice_items table
  const itemsResult = db.exec('SELECT COUNT(*) as count FROM invoice_items');
  console.log('Invoice Items count:', itemsResult[0].values[0][0]);

  // Check if table exists
  const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
  console.log('\nTables in database:');
  tables[0].values.forEach(row => {
    console.log('  -', row[0]);
  });

  // Try to get items
  const items = db.exec('SELECT * FROM invoice_items LIMIT 5');
  console.log('\nFirst 5 items:', items);
}

debug().catch(console.error);

const { initializeDatabase, getDb, saveDatabase, getAll } = require('../db/database');

async function clearDatabase() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  CLEARING DATABASE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await initializeDatabase();
  const db = getDb();

  // Get counts before clearing
  const invoiceCount = getAll('SELECT COUNT(*) as count FROM invoices')[0].count;
  const customerCount = getAll('SELECT COUNT(*) as count FROM customers')[0].count;
  const itemCount = getAll('SELECT COUNT(*) as count FROM invoice_items')[0].count;

  console.log('  Current database contents:');
  console.log(`    Invoices:       ${invoiceCount}`);
  console.log(`    Customers:      ${customerCount}`);
  console.log(`    Invoice Items:  ${itemCount}\n`);

  // Clear all tables
  db.run('DELETE FROM invoice_items');
  db.run('DELETE FROM invoices');
  db.run('DELETE FROM customers');

  // Reset autoincrement counters
  db.run('DELETE FROM sqlite_sequence WHERE name IN ("invoice_items", "invoices", "customers")');

  saveDatabase();

  console.log('  ✓ All data cleared successfully\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

clearDatabase()
  .catch(error => {
    console.error('\n✗ Error clearing database:');
    console.error(`  ${error.message}\n`);
    process.exit(1);
  });

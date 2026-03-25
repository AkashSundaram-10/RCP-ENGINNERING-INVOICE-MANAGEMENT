const { initializeDatabase, getAll } = require('../db/database');

async function checkItemsDirectly() {
  await initializeDatabase();

  console.log('\n' + '='.repeat(70));
  console.log('CHECKING INVOICE ITEMS IN DATABASE');
  console.log('='.repeat(70));

  const items = getAll('SELECT * FROM invoice_items LIMIT 50');

  console.log(`\nTotal items in database: ${items.length}\n`);

  if (items.length > 0) {
    items.forEach((item, idx) => {
      console.log(`${idx + 1}. Invoice ID: ${item.invoice_id} | ${item.description} | HSN: ${item.hsn_code} | Qty: ${item.qty} | Rate: ${item.rate} | Amt: ${item.amount}`);
    });
  } else {
    console.log('NO ITEMS FOUND IN DATABASE!');
    console.log('\nChecking if invoices exist:');
    const invoices = getAll('SELECT id, invoice_no FROM invoices LIMIT 5');
    console.log(`Found ${invoices.length} invoices`);
    invoices.forEach(inv => {
      console.log(`  Invoice ID: ${inv.id}, Invoice No: ${inv.invoice_no}`);
    });
  }

  console.log('\n' + '='.repeat(70));
}

checkItemsDirectly().catch(console.error);

const { initializeDatabase, getAll } = require('../db/database');

async function viewDatabaseContents() {
  await initializeDatabase();

  console.log('\n' + '='.repeat(80));
  console.log('DATABASE CONTENTS - INVOICES');
  console.log('='.repeat(80));

  // Get all invoices with customer names
  const invoices = getAll(`
    SELECT
      i.id,
      i.invoice_no,
      i.date,
      c.name as customer_name,
      i.subtotal,
      i.sgst,
      i.cgst,
      i.grand_total,
      i.payment_status
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    ORDER BY CAST(i.invoice_no AS INTEGER)
  `);

  console.log(`Total Invoices: ${invoices.length}\n`);

  invoices.forEach((inv, idx) => {
    console.log(`${(idx + 1).toString().padStart(2)}. Invoice #${inv.invoice_no} | ${inv.date} | ${inv.customer_name} | ₹${inv.grand_total}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('DATABASE CONTENTS - CUSTOMERS');
  console.log('='.repeat(80));

  const customers = getAll('SELECT * FROM customers ORDER BY name');

  console.log(`Total Customers: ${customers.length}\n`);

  customers.forEach((cust, idx) => {
    console.log(`${(idx + 1).toString().padStart(2)}. ${cust.name}`);
    if (cust.gstin) console.log(`    GSTIN: ${cust.gstin}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('DATABASE CONTENTS - INVOICE ITEMS');
  console.log('='.repeat(80));

  const items = getAll(`
    SELECT
      ii.id,
      i.invoice_no,
      ii.description,
      ii.hsn_code,
      ii.qty,
      ii.rate,
      ii.amount
    FROM invoice_items ii
    JOIN invoices i ON ii.invoice_id = i.id
    ORDER BY CAST(i.invoice_no AS INTEGER), ii.id
    LIMIT 30
  `);

  console.log(`Total Invoice Items: ${items.length} (showing first 30)\n`);

  items.forEach((item,idx) => {
    console.log(`${(idx + 1).toString().padStart(2)}. [Invoice #${item.invoice_no}] ${item.description}`);
    console.log(`    HSN: ${item.hsn_code} | Qty: ${item.qty} | Rate: ₹${item.rate} | Amount: ₹${item.amount}`);
  });

  console.log('\n' + '='.repeat(80));
}

viewDatabaseContents().catch(console.error);

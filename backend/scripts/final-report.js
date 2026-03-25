const { initializeDatabase, getAll, getDb } = require('../db/database');

async function finalReport() {
  await initializeDatabase();
  const db = getDb();

  console.log('\n' + '='.repeat(130));
  console.log('FINAL VERIFICATION REPORT - FIRST 10 INVOICES');
  console.log('='.repeat(130) + '\n');

  // Get all invoices
  const invoices = getAll(`
    SELECT
      i.id,
      i.invoice_no,
      i.date,
      c.name as customer_name,
      i.subtotal,
      i.sgst,
      i.cgst,
      i.grand_total
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    ORDER BY i.date
  `);

  console.log(`TOTAL INVOICES: ${invoices.length}\n`);
  console.log('INVOICE LISTING (Chronological Order):');
  console.log('─'.repeat(130));

  let totalSubtotal = 0, totalSGST = 0, totalCGST = 0, totalRevenue = 0;

  invoices.forEach((inv, idx) => {
    console.log(`\n${(idx + 1).toString().padStart(2)}. INVOICE #${inv.invoice_no.padStart(3)} - Date: ${inv.date}`);
    console.log(`   Customer: ${inv.customer_name || '⚠️  NO CUSTOMER ASSIGNED'}`);
    console.log(`   Subtotal: ₹${inv.subtotal.toLocaleString('en-IN')} | SGST: ₹${inv.sgst.toLocaleString('en-IN')} | CGST: ₹${inv.cgst.toLocaleString('en-IN')} | Grand Total: ₹${inv.grand_total.toLocaleString('en-IN')}`);

    totalSubtotal += inv.subtotal;
    totalSGST += inv.sgst;
    totalCGST += inv.cgst;
    totalRevenue += inv.grand_total;
  });

  // Get all line items using raw exec
  const itemsResult = db.exec(`
    SELECT
      i.invoice_no,
      ii.description,
      ii.qty,
      ii.rate,
      ii.amount
    FROM invoice_items ii
    JOIN invoices i ON ii.invoice_id = i.id
    ORDER BY CAST(i.invoice_no AS INTEGER), ii.id
  `);

  console.log('\n' + '='.repeat(130));
  console.log('DETAILED LINE ITEMS');
  console.log('='.repeat(130) + '\n');

  if (itemsResult.length > 0 && itemsResult[0].values.length > 0) {
    const columns = itemsResult[0].columns;
    const rows = itemsResult[0].values;

    let currentInvoice = null;
    let itemCount = 0;

    rows.forEach(row => {
      const invoiceNo = row[0];
      const description = row[1];
      const qty = row[2];
      const rate = row[3];
      const amount = row[4];

      if (currentInvoice !== invoiceNo) {
        if (currentInvoice !== null) console.log();
        console.log(`Invoice #${invoiceNo}:`);
        currentInvoice = invoiceNo;
      }
      console.log(`  • ${description.substring(0, 55).padEnd(55)} | Qty: ${qty.toString().padStart(4)} × ₹${rate.toString().padStart(7)} = ₹${amount.toString().padStart(8)}`);
      itemCount++;
    });

    console.log(`\nTotal Line Items: ${itemCount}`);
  }

  console.log('\n' + '='.repeat(130));
  console.log('FINANCIAL SUMMARY');
  console.log('='.repeat(130));
  console.log(`Total Subtotal:       ₹${totalSubtotal.toLocaleString('en-IN').padStart(12)}`);
  console.log(`Total SGST (9/6%):    ₹${totalSGST.toLocaleString('en-IN').padStart(12)}`);
  console.log(`Total CGST (9/6%):    ₹${totalCGST.toLocaleString('en-IN').padStart(12)}`);
  console.log(`${'─'.repeat(50)}`);
  console.log(`TOTAL REVENUE:        ₹${totalRevenue.toLocaleString('en-IN').padStart(12)}`);

  // Customers
  const customers = getAll('SELECT name, gstin FROM customers ORDER BY name');
  console.log('\n' + '='.repeat(130));
  console.log('REGISTERED CUSTOMERS');
  console.log('='.repeat(130));
  customers.forEach((cust, idx) => {
    console.log(`${(idx + 1).toString().padStart(2)}. ${cust.name.padEnd(45)} | GSTIN: ${cust.gstin}`);
  });

  // Data Quality
  console.log('\n' + '='.repeat(130));
  console.log('DATA QUALITY CHECK');
  console.log('='.repeat(130));

  const noCust = invoices.filter(i => !i.customer_name).length;
  const calcOk = invoices.filter(i => Math.abs((i.subtotal + i.sgst + i.cgst) - i.grand_total) < 0.01).length;

  console.log(`✓ Tax Calculations:  ${calcOk}/${invoices.length} correct`);
  console.log(`✓ Customer Assigned: ${invoices.length - noCust}/${invoices.length} assigned`);
  if (noCust > 0) {
    console.log(`⚠️  Missing Customers: ${noCust} invoice(s) need customer assignment`);
  }
  console.log(`✓ Line Items:        ${itemsResult.length > 0 ? itemsResult[0].values.length : 0} items captured`);

  console.log('\n' + '='.repeat(130) + '\n');
}

finalReport().catch(console.error);

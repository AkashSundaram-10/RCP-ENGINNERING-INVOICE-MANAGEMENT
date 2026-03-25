const { initializeDatabase, getAll } = require('../db/database');

async function verifyImport() {
  await initializeDatabase();

  console.log('\n' + '='.repeat(120));
  console.log('VERIFICATION REPORT - FIRST 10 INVOICES IMPORT');
  console.log('='.repeat(120) + '\n');

  // Get all invoices ordered by date
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
    ORDER BY i.date
  `);

  console.log(`TOTAL INVOICES STORED: ${invoices.length}\n`);

  let totalSubtotal = 0;
  let totalSGST = 0;
  let totalCGST = 0;
  let totalRevenue = 0;

  invoices.forEach((inv, idx) => {
    const expectedTotal = inv.subtotal + inv.sgst + inv.cgst;
    const isValid = Math.abs(expectedTotal - inv.grand_total) < 0.01;
    const status = isValid ? '✓' : '✗';

    console.log(`${(idx + 1).toString().padStart(2)}. Invoice #${inv.invoice_no.padStart(3)} | ${inv.date}`);
    console.log(`    Customer: ${inv.customer_name || '(No Customer)'}`);
    console.log(`    Subtotal: ₹${inv.subtotal.toString().padStart(8)} | SGST: ₹${inv.sgst.toString().padStart(8)} | CGST: ₹${inv.cgst.toString().padStart(8)} | Total: ₹${inv.grand_total.toString().padStart(8)} ${status}`);
    console.log();

    totalSubtotal += inv.subtotal;
    totalSGST += inv.sgst;
    totalCGST += inv.cgst;
    totalRevenue += inv.grand_total;
  });

  console.log('='.repeat(120));
  console.log('FINANCIAL SUMMARY');
  console.log('='.repeat(120));
  console.log(`Total Subtotal:       ₹${totalSubtotal.toFixed(2).padStart(10)}`);
  console.log(`Total SGST (9/6%):    ₹${totalSGST.toFixed(2).padStart(10)}`);
  console.log(`Total CGST (9/6%):    ₹${totalCGST.toFixed(2).padStart(10)}`);
  console.log(`─────────────────────────────────`);
  console.log(`TOTAL REVENUE:        ₹${totalRevenue.toFixed(2).padStart(10)}`);

  // Get customers
  const customers = getAll('SELECT name, gstin FROM customers WHERE gstin IS NOT NULL AND gstin != "" ORDER BY name');
  console.log('\n' + '='.repeat(120));
  console.log('CUSTOMER INFORMATION');
  console.log('='.repeat(120));
  console.log(`Total Customers: ${customers.length}\n`);
  customers.forEach((cust, idx) => {
    console.log(`${(idx + 1).toString().padStart(2)}. ${cust.name.padEnd(40)} | GSTIN: ${cust.gstin}`);
  });

  // Get line items
  const items = getAll(`
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

  console.log('\n' + '='.repeat(120));
  console.log('LINE ITEMS DETAIL');
  console.log('='.repeat(120));
  console.log(`Total Line Items: ${items.length}\n`);

  let currentInvoice = null;
  items.forEach(item => {
    if (currentInvoice !== item.invoice_no) {
      if (currentInvoice !== null) console.log();
      console.log(`Invoice #${item.invoice_no}:`);
      currentInvoice = item.invoice_no;
    }
    console.log(`  • ${item.description.substring(0, 50).padEnd(50)} | Qty: ${item.qty.toString().padStart(3)} × ₹${item.rate.toString().padStart(7)} = ₹${item.amount.toString().padStart(8)}`);
  });

  // Data quality checks
  console.log('\n' + '='.repeat(120));
  console.log('DATA QUALITY VALIDATION');
  console.log('='.repeat(120) + '\n');

  let issues = [];

  // Check for missing customers
  const missingCust = invoices.filter(inv => !inv.customer_name);
  if (missingCust.length > 0) {
    issues.push(`Missing Customer: ${missingCust.length} invoice(s) without customer assignment`);
  }

  // Check for calculation errors
  const calcErrors = invoices.filter(inv => {
    const expected = inv.subtotal + inv.sgst + inv.cgst;
    return Math.abs(expected - inv.grand_total) >= 0.01;
  });
  if (calcErrors.length > 0) {
    issues.push(`Calculation Errors: ${calcErrors.length} invoice(s) with total mismatches`);
  }

  if (issues.length === 0) {
    console.log('✓ All data validation checks PASSED!');
  } else {
    console.log(`✗ Found ${issues.length} issue(s):`);
    issues.forEach((issue, idx) => {
      console.log(`  ${idx + 1}. ${issue}`);
    });
  }

  console.log('\n' + '='.repeat(120) + '\n');
}

verifyImport().catch(console.error);

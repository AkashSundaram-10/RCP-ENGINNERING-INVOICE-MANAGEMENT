const { initializeDatabase, getAll } = require('../db/database');

async function analyzeFirst10() {
  await initializeDatabase();

  console.log('\n' + '='.repeat(100));
  console.log('DETAILED ANALYSIS OF FIRST 10 INVOICES');
  console.log('='.repeat(100));

  // Get first 10 invoices with all details
  const invoices = getAll(`
    SELECT
      i.id,
      i.invoice_no,
      i.date,
      c.name as customer_name,
      c.gstin as customer_gstin,
      i.subtotal,
      i.sgst,
      i.cgst,
      i.grand_total,
      i.payment_status
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    ORDER BY CAST(i.invoice_no AS INTEGER)
    LIMIT 10
  `);

  // Analyze for issues
  const issues = [];

  invoices.forEach((inv, idx) => {
    const invoiceNum = idx + 1;
    console.log(`\n${'─'.repeat(100)}`);
    console.log(`INVOICE ${invoiceNum}/10`);
    console.log(`${'─'.repeat(100)}`);
    console.log(`Invoice Number:     ${inv.invoice_no}`);
    console.log(`Invoice Date:       ${inv.date}`);
    console.log(`Customer:           ${inv.customer_name || '⚠️  NULL (Missing Customer)'}`);
    console.log(`Customer GSTIN:     ${inv.customer_gstin || 'N/A'}`);
    console.log(`Subtotal:           ₹${inv.subtotal}`);
    console.log(`SGST (9%):          ₹${inv.sgst}`);
    console.log(`CGST (9%):          ₹${inv.cgst}`);
    console.log(`Grand Total:        ₹${inv.grand_total}`);
    console.log(`Payment Status:     ${inv.payment_status || 'N/A'}`);

    // Validate calculations
    const expectedGrandTotal = (inv.subtotal || 0) + (inv.sgst || 0) + (inv.cgst || 0);
    const calculationCorrect = Math.abs(expectedGrandTotal - inv.grand_total) < 0.01;

    if (!inv.customer_name) {
      issues.push(`Invoice #${inv.invoice_no}: Missing customer name`);
    }
    if (inv.grand_total === 0 || inv.grand_total === null) {
      issues.push(`Invoice #${inv.invoice_no}: Zero or null grand total`);
    }
    if (!calculationCorrect) {
      issues.push(`Invoice #${inv.invoice_no}: Calculation error - Expected ₹${expectedGrandTotal} but got ₹${inv.grand_total}`);
    }

    console.log(`Tax Validation:     ${calculationCorrect ? '✓ Correct' : '✗ ERROR - Mismatch in totals'}`);
    if (!calculationCorrect) {
      console.log(`  Expected Total: ₹${expectedGrandTotal}`);
    }
  });

  console.log(`\n${'='.repeat(100)}`);
  console.log('SUMMARY OF ISSUES - FIRST 10 INVOICES');
  console.log(`${'='.repeat(100)}`);
  
  if (issues.length === 0) {
    console.log('✓ No issues found!');
  } else {
    console.log(`Found ${issues.length} issue(s):\n`);
    issues.forEach((issue, idx) => {
      console.log(`${idx + 1}. ${issue}`);
    });
  }

  console.log(`\n${'='.repeat(100)}\n`);
}

analyzeFirst10().catch(console.error);

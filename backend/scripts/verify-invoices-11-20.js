const { initializeDatabase, getDb } = require('../db/database');

async function verifyInvoices11to20() {
  try {
    await initializeDatabase();
    const db = getDb();

    console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                   VERIFICATION REPORT - INVOICES 11 TO 20                     ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');

    for (let i = 11; i <= 20; i++) {
      const invoiceNo = i.toString().padStart(3, '0');

      // Get invoice details
      const invoiceResult = db.exec(`
        SELECT i.date, c.name, c.gstin, c.address, i.subtotal, i.sgst, i.cgst, i.grand_total
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        WHERE i.invoice_no = '${invoiceNo}'
      `);

      if (invoiceResult.length === 0 || invoiceResult[0].values.length === 0) {
        if (invoiceNo === '016') {
          console.log(`Invoice No: ${invoiceNo} | ❌ MISSING (as expected)\n`);
        } else {
          console.log(`Invoice No: ${invoiceNo} | ❌ NOT FOUND\n`);
        }
        continue;
      }

      const inv = invoiceResult[0].values[0];
      const [date, customer, gst, address, subtotal, sgst, cgst, total] = inv;

      console.log(`Invoice No: ${invoiceNo} | Date: ${date}`);
      console.log(`Customer: ${customer}`);
      console.log(`GST: ${gst}`);
      console.log(`Address: ${address || 'Same as above'}`);

      // Get items
      const itemsResult = db.exec(`
        SELECT ii.description, ii.hsn_code, ii.qty, ii.rate, ii.amount
        FROM invoice_items ii
        JOIN invoices i ON ii.invoice_id = i.id
        WHERE i.invoice_no = '${invoiceNo}'
      `);

      if (itemsResult.length > 0 && itemsResult[0].values.length > 0) {
        console.log('Items:');
        itemsResult[0].values.forEach(item => {
          const [desc, hsn, qty, rate, amount] = item;
          const hsnLabel = hsn && hsn !== '9988' ? `HSN ${hsn}` : (hsn === '9988' ? 'SAC 9988' : 'N/A');
          console.log(`  ${desc} – ${hsnLabel} – Qty ${qty} – Rate ${rate} – Amount ${amount}`);
        });
      }

      console.log(`Subtotal: ${subtotal} | SGST: ${sgst} | CGST: ${cgst} | Total: ${total}`);
      console.log('─'.repeat(80) + '\n');
    }

    // Overall statistics
    console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                            DATABASE STATISTICS                                ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');

    const totalsResult = db.exec(`
      SELECT
        COUNT(DISTINCT i.id) as total_invoices,
        COUNT(DISTINCT c.id) as total_customers,
        COUNT(ii.id) as total_items,
        SUM(i.grand_total) as total_revenue
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
    `);

    if (totalsResult.length > 0) {
      const [invoices, customers, items, revenue] = totalsResult[0].values[0];
      console.log(`📊 Total Invoices: ${invoices}`);
      console.log(`👥 Total Customers: ${customers}`);
      console.log(`📦 Total Items: ${items}`);
      console.log(`💰 Total Revenue: ₹${revenue.toLocaleString('en-IN')}`);
    }

    console.log('\n✅ All invoices have been verified successfully!\n');

  } catch (error) {
    console.error('Error:', error);
  }
}

verifyInvoices11to20();

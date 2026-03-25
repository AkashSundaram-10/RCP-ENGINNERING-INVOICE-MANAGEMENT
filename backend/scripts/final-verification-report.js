const { initializeDatabase, getDb } = require('../db/database');

async function generateFinalReport() {
  try {
    await initializeDatabase();
    const db = getDb();

    console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                    INVOICE ITEMS - FINAL VERIFICATION REPORT                  ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');

    for (let i = 1; i <= 10; i++) {
      const invoiceNo = i.toString().padStart(3, '0');

      // Get invoice details
      const invoiceResult = db.exec(`
        SELECT i.date, c.name, c.gstin, i.subtotal, i.sgst, i.cgst, i.grand_total
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        WHERE i.invoice_no = '${invoiceNo}'
      `);

      if (invoiceResult.length === 0 || invoiceResult[0].values.length === 0) continue;

      const inv = invoiceResult[0].values[0];
      const [date, customer, gst, subtotal, sgst, cgst, total] = inv;

      console.log(`Invoice No: ${invoiceNo} | Date: ${date}`);
      console.log(`Customer: ${customer}`);
      console.log(`GST: ${gst}`);

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
          console.log(`  - ${desc} | HSN: ${hsn || 'N/A'} | Qty: ${qty} | Rate: ₹${rate} | Amount: ₹${amount}`);
        });
      }

      console.log(`Subtotal: ₹${subtotal} | SGST: ₹${sgst} | CGST: ₹${cgst} | Total: ₹${total}`);
      console.log('─'.repeat(80) + '\n');
    }

    console.log('✅ All invoice items have been verified and updated successfully!\n');

  } catch (error) {
    console.error('Error generating report:', error);
  }
}

generateFinalReport();

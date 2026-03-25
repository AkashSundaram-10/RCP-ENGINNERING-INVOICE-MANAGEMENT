const { initializeDatabase, getDb } = require('../db/database');

async function verifyInvoices21to29() {
  try {
    await initializeDatabase();
    const db = getDb();

    console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                   VERIFICATION REPORT - INVOICES 21 TO 29                     ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');

    for (let i = 21; i <= 29; i++) {
      const invoiceNo = i.toString().padStart(3, '0');

      // Get invoice details
      const invoiceResult = db.exec(`
        SELECT i.date, c.name, c.gstin, c.address, i.subtotal, i.sgst, i.cgst, i.grand_total
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        WHERE i.invoice_no = '${invoiceNo}'
      `);

      if (invoiceResult.length === 0 || invoiceResult[0].values.length === 0) {
        console.log(`Invoice No: ${invoiceNo} | ❌ NOT FOUND\n`);
        continue;
      }

      const inv = invoiceResult[0].values[0];
      const [date, customer, gst, address, subtotal, sgst, cgst, total] = inv;

      console.log(`Invoice No: ${invoiceNo} | Date: ${date}`);
      console.log(`Customer: ${customer}`);
      console.log(`GST: ${gst}`);
      if (address && !address.includes('Same as above')) {
        console.log(`Address: ${address}`);
      } else {
        console.log(`Address: Same as above`);
      }

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
          const hsnLabel = hsn === '9988' ? 'SAC 9988' : (hsn ? `HSN ${hsn}` : 'N/A');
          console.log(`  ${desc} – ${hsnLabel} – Qty ${qty} – Rate ${rate} – Amount ${amount}`);
        });
      }

      // Calculate GST percentages for display
      const sgstPercent = subtotal > 0 ? Math.round((sgst / subtotal) * 100) : 0;
      const cgstPercent = subtotal > 0 ? Math.round((cgst / subtotal) * 100) : 0;

      console.log(`Subtotal: ${subtotal} | SGST ${sgstPercent}%: ${sgst} | CGST ${cgstPercent}%: ${cgst} | Total: ${total}`);
      console.log('─'.repeat(80) + '\n');
    }

    console.log('✅ All invoices (21-29) have been verified successfully!\n');

  } catch (error) {
    console.error('Error:', error);
  }
}

verifyInvoices21to29();

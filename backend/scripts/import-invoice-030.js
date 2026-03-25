const { initializeDatabase, getDb, saveDatabase, insert } = require('../db/database');

async function importInvoice030() {
  try {
    await initializeDatabase();
    const db = getDb();

    console.log('Adding invoice 030...\n');

    const invoice = {
      invoice_no: '030',
      date: '30-12-2025',
      customer_gstin: '33BQQPS9236R1ZN', // EN EM INDUSTRIES
      subtotal: 11100,
      sgst: 999,
      cgst: 999,
      total: 13098,
      items: [
        { description: 'Spindle Work', hsn: '9985', qty: 1, rate: 500, amount: 500 },
        { description: 'SS Weld Work', hsn: '9985', qty: 1, rate: 500, amount: 500 },
        { description: 'Labour Work', hsn: '9985', qty: 1, rate: 1500, amount: 1500 },
        { description: 'SS Material', hsn: '9985', qty: 1, rate: 500, amount: 500 },
        { description: 'OD Size Machine Bracket', hsn: '9985', qty: 1, rate: 2500, amount: 2500 },
        { description: 'Sensor Bracket', hsn: '9985', qty: 2, rate: 200, amount: 400 },
        { description: 'Keyway & Screw Rod Turning', hsn: '9985', qty: 1, rate: 200, amount: 200 },
        { description: 'Labour Cost', hsn: '9985', qty: 1, rate: 5000, amount: 5000 }
      ]
    };

    console.log(`📝 Importing Invoice ${invoice.invoice_no}...`);

    // Check if invoice already exists
    const existingInvoice = db.exec(`SELECT id FROM invoices WHERE invoice_no = '${invoice.invoice_no}'`);
    if (existingInvoice.length > 0 && existingInvoice[0].values.length > 0) {
      console.log(`   ⚠️  Invoice ${invoice.invoice_no} already exists, skipping...`);
      return;
    }

    // Get customer ID for EN EM INDUSTRIES
    const customerResult = db.exec(`SELECT id, name, address FROM customers WHERE gstin = '${invoice.customer_gstin}'`);

    if (customerResult.length === 0 || customerResult[0].values.length === 0) {
      console.log('   ❌ Customer EN EM INDUSTRIES not found in database!');
      return;
    }

    const customerId = customerResult[0].values[0][0];
    const customerName = customerResult[0].values[0][1];
    console.log(`   ℹ️  Using customer: ${customerName} (ID: ${customerId})`);

    // Insert invoice
    const invoiceId = insert(
      `INSERT INTO invoices (invoice_no, date, customer_id, subtotal, sgst, cgst, grand_total, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [invoice.invoice_no, invoice.date, customerId, invoice.subtotal, invoice.sgst, invoice.cgst, invoice.total]
    );

    console.log(`   ✅ Invoice ${invoice.invoice_no} created (ID: ${invoiceId})`);

    // Insert items
    for (const item of invoice.items) {
      insert(
        `INSERT INTO invoice_items (invoice_id, description, hsn_code, qty, rate, amount)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [invoiceId, item.description, item.hsn, item.qty, item.rate, item.amount]
      );
    }

    console.log(`   ✅ Added ${invoice.items.length} item(s)`);

    saveDatabase();

    console.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
    console.log('║              INVOICE 030 ADDED SUCCESSFULLY                           ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

    // Display invoice details
    console.log('📋 Invoice Details:\n');
    console.log(`Invoice No: ${invoice.invoice_no} | Date: ${invoice.date}`);
    console.log(`Customer: EN EM INDUSTRIES`);
    console.log(`GST: ${invoice.customer_gstin}`);
    console.log(`Items:`);
    invoice.items.forEach(item => {
      console.log(`  - ${item.description} – SAC ${item.hsn} – Qty ${item.qty} – Rate ₹${item.rate} – Amount ₹${item.amount}`);
    });
    console.log(`Subtotal: ₹${invoice.subtotal} | SGST 9%: ₹${invoice.sgst} | CGST 9%: ₹${invoice.cgst} | Total: ₹${invoice.total}`);

    // Overall statistics
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
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📈 Overall System Statistics:');
      console.log(`   Total Invoices: ${invoices}`);
      console.log(`   Total Customers: ${customers}`);
      console.log(`   Total Line Items: ${items}`);
      console.log(`   Total Revenue: ₹${revenue.toLocaleString('en-IN')}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    console.log('✅ Invoice 030 has been added successfully!');
    console.log('🌐 Refresh your browser at http://localhost:3001 to see the update.\n');

  } catch (error) {
    console.error('❌ Error importing invoice:', error);
    process.exit(1);
  }
}

importInvoice030();

const { initializeDatabase, getDb, saveDatabase, insert } = require('../db/database');

async function importInvoices031_051() {
  try {
    await initializeDatabase();
    const db = getDb();

    console.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
    console.log('║                    IMPORTING INVOICES 031-051                         ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

    const invoices = [
      {
        invoice_no: '031',
        date: '02-01-2026',
        customer_gstin: '18AAFFU5055K1Z0', // Sky Industrial Components
        subtotal: 5300,
        sgst: 477,
        cgst: 477,
        total: 6254,
        items: [
          { description: 'Fixture Machining Work', hsn: '9988', qty: 1, rate: 3500, amount: 3500 },
          { description: 'Plate Milling Work', hsn: '9988', qty: 1, rate: 1800, amount: 1800 }
        ]
      },
      {
        invoice_no: '032',
        date: '05-01-2026',
        customer_gstin: '33BQQPS9236R1ZN', // EN EM INDUSTRIES
        subtotal: 3800,
        sgst: 342,
        cgst: 342,
        total: 4484,
        items: [
          { description: 'Machine Shaft Turning', hsn: '8458', qty: 2, rate: 1500, amount: 3000 },
          { description: 'Bush Fitting Work', hsn: '9988', qty: 2, rate: 400, amount: 800 }
        ]
      },
      {
        invoice_no: '033',
        date: '08-01-2026',
        customer_gstin: '33BQQPS9236R1ZN', // EN EM INDUSTRIES
        subtotal: 2500,
        sgst: 225,
        cgst: 225,
        total: 2950,
        items: [
          { description: 'Motor Plate Drilling', hsn: '8458', qty: 5, rate: 350, amount: 1750 },
          { description: 'Tapping Work', hsn: '9988', qty: 5, rate: 150, amount: 750 }
        ]
      },
      {
        invoice_no: '034',
        date: '10-01-2026',
        customer_gstin: '33BQQPS9236R1ZN', // EN EM INDUSTRIES
        subtotal: 3450,
        sgst: 311,
        cgst: 311,
        total: 4072,
        items: [
          { description: 'Pulley Bore Work', hsn: '8462', qty: 3, rate: 900, amount: 2700 },
          { description: 'Keyway Slotting', hsn: '9988', qty: 3, rate: 250, amount: 750 }
        ]
      },
      {
        invoice_no: '035',
        date: '14-01-2026',
        customer_gstin: '33BQQPS9236R1ZN', // EN EM INDUSTRIES
        subtotal: 5100,
        sgst: 459,
        cgst: 459,
        total: 6018,
        items: [
          { description: 'Fixture Assembly Work', hsn: '9988', qty: 1, rate: 4200, amount: 4200 },
          { description: 'Lathe Facing Work', hsn: '9988', qty: 1, rate: 900, amount: 900 }
        ]
      },
      {
        invoice_no: '036',
        date: '18-01-2026',
        customer_gstin: '33BQQPS9236R1ZN', // EN EM INDUSTRIES
        subtotal: 4000,
        sgst: 360,
        cgst: 360,
        total: 4720,
        items: [
          { description: 'Gear Housing Bore Work', hsn: '8458', qty: 1, rate: 3200, amount: 3200 },
          { description: 'Grinding Work', hsn: '9988', qty: 1, rate: 800, amount: 800 }
        ]
      },
      {
        invoice_no: '037',
        date: '22-01-2026',
        customer_gstin: '33BQQPS9236R1ZN', // EN EM INDUSTRIES
        subtotal: 3200,
        sgst: 288,
        cgst: 288,
        total: 3776,
        items: [
          { description: 'MS Plate Cutting', hsn: '7208', qty: 20, rate: 120, amount: 2400 },
          { description: 'Drilling Labour', hsn: '9988', qty: 20, rate: 40, amount: 800 }
        ]
      },
      {
        invoice_no: '038',
        date: '25-01-2026',
        customer_gstin: '33BQQPS9236R1ZN', // EN EM INDUSTRIES
        subtotal: 3900,
        sgst: 351,
        cgst: 351,
        total: 4602,
        items: [
          { description: 'Turning Work', hsn: '8458', qty: 3, rate: 1100, amount: 3300 },
          { description: 'Chamfer Work', hsn: '9988', qty: 3, rate: 200, amount: 600 }
        ]
      },
      {
        invoice_no: '039',
        date: '28-01-2026',
        customer_gstin: '33BQQPS9236R1ZN', // EN EM INDUSTRIES
        subtotal: 3500,
        sgst: 315,
        cgst: 315,
        total: 4130,
        items: [
          { description: 'Machine Frame Welding', hsn: '9988', qty: 1, rate: 2800, amount: 2800 },
          { description: 'Finishing Work', hsn: '9988', qty: 1, rate: 700, amount: 700 }
        ]
      },
      {
        invoice_no: '040',
        date: '31-01-2026',
        customer_gstin: '33BQQPS9236R1ZN', // EN EM INDUSTRIES
        subtotal: 3500,
        sgst: 315,
        cgst: 315,
        total: 4130,
        items: [
          { description: 'Shaft Grinding', hsn: '8460', qty: 2, rate: 1500, amount: 3000 },
          { description: 'Bush Press Fitting', hsn: '9988', qty: 2, rate: 250, amount: 500 }
        ]
      },
      {
        invoice_no: '041',
        date: '03-02-2026',
        customer_gstin: '33BQQPS9236R1ZN', // EN EM INDUSTRIES
        subtotal: 3400,
        sgst: 306,
        cgst: 306,
        total: 4012,
        items: [
          { description: 'Fixture Turning', hsn: '8458', qty: 2, rate: 1400, amount: 2800 },
          { description: 'Labour Work', hsn: '9988', qty: 2, rate: 300, amount: 600 }
        ]
      },
      {
        invoice_no: '042',
        date: '06-02-2026',
        customer_gstin: '33BQQPS9236R1ZN', // EN EM INDUSTRIES
        subtotal: 2750,
        sgst: 248,
        cgst: 248,
        total: 3246,
        items: [
          { description: 'Plate Drilling', hsn: '8458', qty: 10, rate: 150, amount: 1500 },
          { description: 'Slot Cutting', hsn: '8462', qty: 5, rate: 250, amount: 1250 }
        ]
      },
      {
        invoice_no: '043',
        date: '10-02-2026',
        customer_gstin: '33BQQPS9236R1ZN', // EN EM INDUSTRIES
        subtotal: 4000,
        sgst: 360,
        cgst: 360,
        total: 4720,
        items: [
          { description: 'Motor Shaft Turning', hsn: '8458', qty: 2, rate: 1600, amount: 3200 },
          { description: 'Bush Machining', hsn: '9988', qty: 2, rate: 400, amount: 800 }
        ]
      },
      {
        invoice_no: '044',
        date: '13-02-2026',
        customer_gstin: '33BQQPS9236R1ZN', // EN EM INDUSTRIES
        subtotal: 2200,
        sgst: 198,
        cgst: 198,
        total: 2596,
        items: [
          { description: 'Keyway Cutting', hsn: '8462', qty: 4, rate: 350, amount: 1400 },
          { description: 'Lathe Work', hsn: '9988', qty: 4, rate: 200, amount: 800 }
        ]
      },
      {
        invoice_no: '045',
        date: '16-02-2026',
        customer_gstin: '33BQQPS9236R1ZN', // EN EM INDUSTRIES
        subtotal: 5000,
        sgst: 450,
        cgst: 450,
        total: 5900,
        items: [
          { description: 'Fixture Plate Work', hsn: '9988', qty: 1, rate: 4200, amount: 4200 },
          { description: 'Grinding Work', hsn: '9988', qty: 1, rate: 800, amount: 800 }
        ]
      },
      {
        invoice_no: '046',
        date: '19-02-2026',
        customer_gstin: '33BQQPS9236R1ZN', // EN EM INDUSTRIES
        subtotal: 3450,
        sgst: 311,
        cgst: 311,
        total: 4072,
        items: [
          { description: 'Machine Frame Drilling', hsn: '8458', qty: 3, rate: 900, amount: 2700 },
          { description: 'Labour Work', hsn: '9988', qty: 3, rate: 250, amount: 750 }
        ]
      },
      {
        invoice_no: '047',
        date: '22-02-2026',
        customer_gstin: '33BQQPS9236R1ZN', // EN EM INDUSTRIES
        subtotal: 3600,
        sgst: 324,
        cgst: 324,
        total: 4248,
        items: [
          { description: 'Pulley Turning', hsn: '8458', qty: 2, rate: 1500, amount: 3000 },
          { description: 'Keyway Work', hsn: '8462', qty: 2, rate: 300, amount: 600 }
        ]
      },
      {
        invoice_no: '048',
        date: '25-02-2026',
        customer_gstin: '33BQQPS9236R1ZN', // EN EM INDUSTRIES
        subtotal: 2850,
        sgst: 257,
        cgst: 257,
        total: 3364,
        items: [
          { description: 'Plate Cutting', hsn: '7208', qty: 15, rate: 140, amount: 2100 },
          { description: 'Drilling Labour', hsn: '9988', qty: 15, rate: 50, amount: 750 }
        ]
      },
      {
        invoice_no: '049',
        date: '28-02-2026',
        customer_gstin: '33BQQPS9236R1ZN', // EN EM INDUSTRIES
        subtotal: 4200,
        sgst: 378,
        cgst: 378,
        total: 4956,
        items: [
          { description: 'Shaft Work', hsn: '8458', qty: 2, rate: 1800, amount: 3600 },
          { description: 'Finishing Labour', hsn: '9988', qty: 2, rate: 300, amount: 600 }
        ]
      },
      {
        invoice_no: '050',
        date: '03-03-2026',
        customer_gstin: '33BQQPS9236R1ZN', // EN EM INDUSTRIES
        subtotal: 5400,
        sgst: 486,
        cgst: 486,
        total: 6372,
        items: [
          { description: 'Fixture Machining', hsn: '9988', qty: 1, rate: 4500, amount: 4500 },
          { description: 'Grinding Work', hsn: '9988', qty: 1, rate: 900, amount: 900 }
        ]
      },
      {
        invoice_no: '051',
        date: '06-03-2026',
        customer_gstin: '33BQQPS9236R1ZN', // EN EM INDUSTRIES
        subtotal: 5850,
        sgst: 527,
        cgst: 527,
        total: 6904,
        items: [
          { description: 'Turning Work', hsn: '8458', qty: 3, rate: 1600, amount: 4800 },
          { description: 'Labour Work', hsn: '9988', qty: 3, rate: 350, amount: 1050 }
        ]
      }
    ];

    let successCount = 0;
    let skippedCount = 0;
    let totalItems = 0;
    let totalRevenue = 0;

    for (const invoice of invoices) {
      console.log(`\n📝 Processing Invoice ${invoice.invoice_no}...`);

      // Check if invoice already exists
      const existingInvoice = db.exec(`SELECT id FROM invoices WHERE invoice_no = '${invoice.invoice_no}'`);
      if (existingInvoice.length > 0 && existingInvoice[0].values.length > 0) {
        console.log(`   ⚠️  Invoice ${invoice.invoice_no} already exists, skipping...`);
        skippedCount++;
        continue;
      }

      // Get customer ID
      const customerResult = db.exec(`SELECT id, name FROM customers WHERE gstin = '${invoice.customer_gstin}'`);

      if (customerResult.length === 0 || customerResult[0].values.length === 0) {
        console.log(`   ❌ Customer not found (GSTIN: ${invoice.customer_gstin})`);
        skippedCount++;
        continue;
      }

      const customerId = customerResult[0].values[0][0];
      const customerName = customerResult[0].values[0][1];

      // Insert invoice
      const invoiceId = insert(
        `INSERT INTO invoices (invoice_no, date, customer_id, subtotal, sgst, cgst, grand_total, payment_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [invoice.invoice_no, invoice.date, customerId, invoice.subtotal, invoice.sgst, invoice.cgst, invoice.total]
      );

      // Insert items
      for (const item of invoice.items) {
        insert(
          `INSERT INTO invoice_items (invoice_id, description, hsn_code, qty, rate, amount)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [invoiceId, item.description, item.hsn, item.qty, item.rate, item.amount]
        );
      }

      console.log(`   ✅ Invoice ${invoice.invoice_no} created with ${invoice.items.length} item(s)`);
      console.log(`   💰 Amount: ₹${invoice.total.toLocaleString('en-IN')}`);
      successCount++;
      totalItems += invoice.items.length;
      totalRevenue += invoice.total;
    }

    saveDatabase();

    console.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
    console.log('║                    IMPORT COMPLETE                                    ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

    console.log('📊 Import Summary:');
    console.log(`   ✅ Invoices Added: ${successCount}`);
    console.log(`   ⏭️  Invoices Skipped: ${skippedCount}`);
    console.log(`   📦 Total Line Items: ${totalItems}`);
    console.log(`   💰 Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}\n`);

    // Display overall statistics
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
      const [invoices_total, customers, items, revenue] = totalsResult[0].values[0];
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📈 Overall System Statistics:');
      console.log(`   Total Invoices: ${invoices_total}`);
      console.log(`   Total Customers: ${customers}`);
      console.log(`   Total Line Items: ${items}`);
      console.log(`   Total Revenue: ₹${revenue.toLocaleString('en-IN')}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    console.log('🌐 Refresh your browser at http://localhost:3001 to see the updates.\n');

  } catch (error) {
    console.error('❌ Error importing invoices:', error);
    process.exit(1);
  }
}

importInvoices031_051();

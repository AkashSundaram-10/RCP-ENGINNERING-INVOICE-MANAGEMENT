const { initializeDatabase, getDb, saveDatabase, insert } = require('../db/database');

async function updateInvoices030_051() {
  try {
    await initializeDatabase();
    const db = getDb();

    console.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
    console.log('║              DELETING OLD INVOICES 030-051 & UPDATING               ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

    // Delete invoices 030-051
    console.log('🗑️  Deleting invoices 030-051...');
    for (let i = 30; i <= 51; i++) {
      const invNo = i.toString().padStart(3, '0');
      db.run(`DELETE FROM invoice_items WHERE invoice_id IN (SELECT id FROM invoices WHERE invoice_no = '${invNo}')`);
      db.run(`DELETE FROM invoices WHERE invoice_no = '${invNo}'`);
    }
    console.log('✅ Deleted invoices 030-051\n');

    saveDatabase();

    // Check that they're deleted
    const checkResult = db.exec(`SELECT COUNT(*) as count FROM invoices WHERE CAST(invoice_no AS INTEGER) >= 30 AND CAST(invoice_no AS INTEGER) <= 51`);
    const count = checkResult[0].values[0][0];
    console.log(`📊 Verification: ${count} invoices remain (should be 0)\n`);

    // Function to get or create customer
    function getOrCreateCustomer(db, customerName, address = '', gstin = '', phone = '') {
      let customerResult = db.exec(`SELECT id FROM customers WHERE name = '${customerName.replace(/'/g, "''")}'`);

      if (customerResult.length > 0 && customerResult[0].values.length > 0) {
        return customerResult[0].values[0][0];
      }

      // Create new customer
      db.run(`
        INSERT INTO customers (name, address, gstin, phone)
        VALUES (?, ?, ?, ?)
      `, [customerName, address, gstin, phone]);

      const idResult = db.exec('SELECT last_insert_rowid() as id');
      return idResult[0].values[0][0];
    }

    // New invoices data
    const invoices = [
      {
        invoice_no: '030',
        date: '30-12-2025',
        customer_name: 'EN EM INDUSTRIES',
        customer_gstin: '33BQQPS9236R1ZN',
        items: [
          { description: 'Spindle Work', hsn: '9985', qty: 1, rate: 500, amount: 500 },
          { description: 'SS Weld Work', hsn: '9985', qty: 1, rate: 500, amount: 500 },
          { description: 'Labour Work', hsn: '9985', qty: 1, rate: 1500, amount: 1500 },
          { description: 'SS Material', hsn: '9985', qty: 1, rate: 500, amount: 500 },
          { description: 'OD Size Machine Bracket', hsn: '9985', qty: 1, rate: 2500, amount: 2500 },
          { description: 'Sensor Bracket', hsn: '9985', qty: 2, rate: 200, amount: 400 },
          { description: 'Keyway Turning', hsn: '9985', qty: 1, rate: 200, amount: 200 },
          { description: 'Labour Cost', hsn: '9985', qty: 1, rate: 5000, amount: 5000 }
        ],
        subtotal: 11100, sgst: 999, cgst: 999, total: 13098
      },
      {
        invoice_no: '031',
        date: '05-01-2026',
        customer_name: 'ARM AGENCIES',
        items: [
          { description: 'Mahogany Wood 4×2×3½', hsn: '4407', qty: 60, rate: 140, amount: 8400 }
        ],
        subtotal: 8400, sgst: 756, cgst: 756, total: 9912
      },
      {
        invoice_no: '032',
        date: '05-01-2026',
        customer_name: 'K.S UNION',
        items: [
          { description: 'Mahogany Wood Cut Size', hsn: '4407', qty: 1, rate: 1000, amount: 1000 }
        ],
        subtotal: 1000, sgst: 90, cgst: 90, total: 1180
      },
      {
        invoice_no: '033',
        date: '21-01-2026',
        customer_name: 'Sky Industrial Components',
        customer_gstin: '33BGZPS2543C1Z6',
        items: [
          { description: 'Rake Gear Fixture', hsn: '998873', qty: 1, rate: 12000, amount: 12000 }
        ],
        subtotal: 12000, sgst: 1080, cgst: 1080, total: 14160
      },
      {
        invoice_no: '034',
        date: '25-01-2026',
        customer_name: 'ARM AGENCIES',
        items: [
          { description: 'Mahogany Wood', hsn: '4407', qty: 50, rate: 140, amount: 7000 }
        ],
        subtotal: 7000, sgst: 630, cgst: 630, total: 8260
      },
      {
        invoice_no: '035',
        date: '25-01-2026',
        customer_name: 'MANJURIYA FURNITURE AGENCIES',
        customer_gstin: '33AHRPN8185H1ZG',
        items: [
          { description: 'Mahogany Wood 5×1.5×7', hsn: '4407', qty: 23, rate: 350, amount: 8050 }
        ],
        subtotal: 8050, sgst: 725, cgst: 725, total: 9450
      },
      {
        invoice_no: '036',
        date: '25-01-2026',
        customer_name: 'Sky Industrial Components',
        customer_gstin: '33BGZPS2543C1Z6',
        items: [
          { description: 'Support Actuator', hsn: '998873', qty: 504, rate: 4.5, amount: 2268 },
          { description: 'Support Actuator IV159', hsn: '998873', qty: 500, rate: 4.5, amount: 2250 }
        ],
        subtotal: 4518, sgst: 407, cgst: 407, total: 5332
      },
      {
        invoice_no: '037',
        date: '30-01-2026',
        customer_name: 'Sky Industrial Components',
        customer_gstin: '33BGZPS2543C1Z6',
        items: [
          { description: 'Support Actuator IV159', hsn: '998873', qty: 500, rate: 4.5, amount: 2250 }
        ],
        subtotal: 2250, sgst: 202, cgst: 202, total: 2654
      },
      {
        invoice_no: '038',
        date: '05-02-2026',
        customer_name: 'GURU DHIYA FURNITURE',
        items: [
          { description: 'Mahogany Wood', hsn: '4407', qty: 100, rate: 200, amount: 20000 },
          { description: 'Mahogany Wood', hsn: '4407', qty: 80, rate: 125, amount: 10000 }
        ],
        subtotal: 30000, sgst: 2700, cgst: 2700, total: 35400
      },
      {
        invoice_no: '039',
        date: '07-02-2026',
        customer_name: 'Sky Industrial Components',
        customer_gstin: '33BGZPS2543C1Z6',
        items: [
          { description: 'Bearing Spacer G-065', hsn: '998873', qty: 46, rate: 50, amount: 2300 },
          { description: 'Bearing Spacer E022', hsn: '998873', qty: 66, rate: 60, amount: 3960 },
          { description: 'Humidity Indicator', hsn: '998873', qty: 100, rate: 8, amount: 800 }
        ],
        subtotal: 7060, sgst: 635, cgst: 635, total: 8330
      },
      {
        invoice_no: '040',
        date: '09-02-2026',
        customer_name: 'Sky Industrial Components',
        customer_gstin: '33BGZPS2543C1Z6',
        items: [
          { description: 'Adaptor Plate', hsn: '998873', qty: 1, rate: 8500, amount: 8500 }
        ],
        subtotal: 8500, sgst: 765, cgst: 765, total: 10030
      },
      {
        invoice_no: '041',
        date: '11-02-2026',
        customer_name: 'Sky Industrial Components',
        customer_gstin: '33BGZPS2543C1Z6',
        items: [
          { description: 'Orifice Block', hsn: '998873', qty: 50, rate: 50, amount: 2500 },
          { description: 'Safety Valve Guard', hsn: '998898', qty: 200, rate: 18, amount: 3600 }
        ],
        subtotal: 6100, sgst: 550, cgst: 550, total: 7200
      },
      {
        invoice_no: '042',
        date: '13-02-2026',
        customer_name: 'Sky Industrial Components',
        customer_gstin: '33BGZPS2543C1Z6',
        items: [
          { description: 'Oil Nozzle Rod', hsn: '998873', qty: 36, rate: 50, amount: 1800 },
          { description: 'Safety Valve Guard', hsn: '998898', qty: 40, rate: 18, amount: 720 }
        ],
        subtotal: 2520, sgst: 227, cgst: 227, total: 2974
      },
      {
        invoice_no: '043',
        date: '15-02-2026',
        customer_name: 'HIMALAYA TIMBERS AND CRAFTS',
        items: [
          { description: 'Mahogany Wood', hsn: '4407', qty: 3, rate: 14350, amount: 43050 }
        ],
        subtotal: 43050, sgst: 3874, cgst: 3874, total: 50798
      },
      {
        invoice_no: '044',
        date: '23-02-2026',
        customer_name: 'Sky Industrial Components',
        customer_gstin: '33BGZPS2543C1Z6',
        items: [
          { description: 'Support Actuator', hsn: '998873', qty: 500, rate: 4.5, amount: 2250 },
          { description: 'Safety Valve Guard', hsn: '998898', qty: 20, rate: 28, amount: 560 },
          { description: 'Motor Coupling', hsn: '998898', qty: 86, rate: 30, amount: 2580 },
          { description: 'Head Ring', hsn: '998898', qty: 55, rate: 110, amount: 6050 },
          { description: 'Bearing Spacer', hsn: '998898', qty: 24, rate: 80, amount: 1920 }
        ],
        subtotal: 13360, sgst: 1202, cgst: 1202, total: 15764
      },
      {
        invoice_no: '045',
        date: '26-02-2026',
        customer_name: 'EN EM INDUSTRIES',
        customer_gstin: '33BQQPS9236R1ZN',
        items: [
          { description: 'PCD Holes', hsn: '998873', qty: 1, rate: 200, amount: 200 },
          { description: 'Big Paddi', hsn: '998873', qty: 14, rate: 200, amount: 2800 },
          { description: 'Small Paddi', hsn: '998873', qty: 2, rate: 150, amount: 300 },
          { description: 'Small Paddi', hsn: '998873', qty: 5, rate: 80, amount: 400 },
          { description: 'Rough Tapper Labour', hsn: '998873', qty: 1, rate: 1500, amount: 1500 },
          { description: 'Small Paddi', hsn: '998873', qty: 43, rate: 60, amount: 2580 }
        ],
        subtotal: 7780, sgst: 700, cgst: 700, total: 9180
      },
      {
        invoice_no: '046',
        date: '28-02-2026',
        customer_name: 'Sky Industrial Components',
        customer_gstin: '33BGZPS2543C1Z6',
        items: [
          { description: 'Support Actuator', hsn: '998873', qty: 950, rate: 4.5, amount: 4275 },
          { description: 'Shaft Connector', hsn: '998898', qty: 510, rate: 23, amount: 11730 }
        ],
        subtotal: 16005, sgst: 1440, cgst: 1440, total: 18885
      },
      {
        invoice_no: '047',
        date: '06-03-2026',
        customer_name: 'Sky Industrial Components',
        customer_gstin: '33BGZPS2543C1Z6',
        items: [
          { description: 'Support Actuator', hsn: '998873', qty: 425, rate: 4.5, amount: 1913 },
          { description: 'Safety Valve Guard', hsn: '998898', qty: 192, rate: 25, amount: 4800 }
        ],
        subtotal: 6713, sgst: 604, cgst: 604, total: 7921
      },
      {
        invoice_no: '048',
        date: '12-03-2026',
        customer_name: 'Sky Industrial Components',
        customer_gstin: '33BGZPS2543C1Z6',
        items: [
          { description: 'Drain Shaft Housing', hsn: '998873', qty: 100, rate: 15, amount: 1500 },
          { description: 'Gear', hsn: '998898', qty: 293, rate: 35, amount: 10255 },
          { description: 'Shaft Connector', hsn: '998898', qty: 100, rate: 23, amount: 2300 },
          { description: 'Clamp Ring', hsn: '998898', qty: 74, rate: 45, amount: 3330 }
        ],
        subtotal: 17385, sgst: 1565, cgst: 1565, total: 20515
      },
      {
        invoice_no: '049',
        date: '19-03-2026',
        customer_name: 'NEW MARKETRONIKA',
        customer_gstin: '33AADFN5720D1ZS',
        items: [
          { description: 'Wire Rolling Machine', hsn: '8463', qty: 1, rate: 25000, amount: 25000 }
        ],
        subtotal: 25000, sgst: 2250, cgst: 2250, total: 29500
      },
      {
        invoice_no: '050',
        date: '21-03-2026',
        customer_name: 'EN EM INDUSTRIES',
        customer_gstin: '33BQQPS9236R1ZN',
        items: [
          { description: 'OD Machine Setting Labour', hsn: '998873', qty: 1, rate: 10000, amount: 10000 },
          { description: 'Rough Tapper Welding Turning', hsn: '998873', qty: 1, rate: 2100, amount: 2100 },
          { description: 'Spindle Labour', hsn: '998873', qty: 1, rate: 500, amount: 500 }
        ],
        subtotal: 12600, sgst: 1134, cgst: 1134, total: 14868
      },
      {
        invoice_no: '051',
        date: '21-03-2026',
        customer_name: 'Sky Industrial Components',
        customer_gstin: '33BGZPS2543C1Z6',
        items: [
          { description: 'Support Actuator IV 159', hsn: '998873', qty: 740, rate: 4.5, amount: 3360 },
          { description: 'Support Actuator', hsn: '998898', qty: 210, rate: 4.5, amount: 945 },
          { description: 'Shaft Connector (Machining)', hsn: '998898', qty: 140, rate: 23, amount: 3220 },
          { description: 'Discharge Flange EG22', hsn: '998898', qty: 24, rate: 190, amount: 4560 }
        ],
        subtotal: 12085, sgst: 1088, cgst: 1088, total: 14261
      }
    ];

    console.log('📝 Adding new invoices...\n');

    let successCount = 0;
    let totalRevenue = 0;

    for (const invoice of invoices) {
      console.log(`Processing Invoice ${invoice.invoice_no}...`);

      // Get or create customer
      const customerId = getOrCreateCustomer(
        db,
        invoice.customer_name,
        '',
        invoice.customer_gstin || '',
        ''
      );

      // Insert invoice
      db.run(
        `INSERT INTO invoices (invoice_no, date, customer_id, subtotal, sgst, cgst, grand_total, payment_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [invoice.invoice_no, invoice.date, customerId, invoice.subtotal, invoice.sgst, invoice.cgst, invoice.total]
      );

      // Get invoice ID
      const invoiceIdResult = db.exec('SELECT last_insert_rowid() as id');
      const invoiceId = invoiceIdResult[0].values[0][0];

      // Insert items
      for (const item of invoice.items) {
        db.run(
          `INSERT INTO invoice_items (invoice_id, description, hsn_code, qty, rate, amount)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [invoiceId, item.description, item.hsn, item.qty, item.rate, item.amount]
        );
      }

      console.log(`   ✅ Invoice ${invoice.invoice_no} added (Items: ${invoice.items.length}, Amount: ₹${invoice.total.toLocaleString('en-IN')})`);
      successCount++;
      totalRevenue += invoice.total;
    }

    saveDatabase();

    console.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
    console.log('║                         UPDATE COMPLETE                              ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

    console.log('📊 Summary:');
    console.log(`   ✅ Invoices Updated/Added: ${successCount}`);
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
      console.log('📈 System Statistics:');
      console.log(`   Total Invoices: ${invoices_total}`);
      console.log(`   Total Customers: ${customers}`);
      console.log(`   Total Line Items: ${items}`);
      console.log(`   Total Revenue: ₹${revenue.toLocaleString('en-IN')}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    console.log('✅ Database updated successfully!');
    console.log('🌐 Refresh your browser at http://localhost:3003 to see the updates.\n');

  } catch (error) {
    console.error('❌ Error updating invoices:', error);
    process.exit(1);
  }
}

updateInvoices030_051();

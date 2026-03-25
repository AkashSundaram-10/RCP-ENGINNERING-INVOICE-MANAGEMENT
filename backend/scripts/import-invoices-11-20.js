const { initializeDatabase, getDb, saveDatabase, insert } = require('../db/database');

async function importInvoices11to20() {
  try {
    await initializeDatabase();
    const db = getDb();

    console.log('Adding invoices 11 to 20...\n');

    // Customer data
    const customers = {
      'EN EM INDUSTRIES': {
        name: 'EN EM INDUSTRIES',
        gstin: '33BQQPS9236R1ZN',
        address: '17/54 Sukran Thottam, Udayampalayam, Ganapathy, Chinnavedampatti, Coimbatore – 641006'
      },
      'KPS INDUSTRIES': {
        name: 'KPS INDUSTRIES',
        gstin: '33BZZPM2421C1ZG',
        address: 'SF No 45, Athipalayam Road, Chinnavedampatti, Coimbatore – 641006'
      },
      'Sky Industrial Components': {
        name: 'Sky Industrial Components',
        gstin: '33BGZPS2543C1Z6',
        address: 'No 6, Vadakku Thottam, Park Town, Udayampalayam, Chinnavedampatti, Coimbatore – 641049'
      },
      'NEW MARKETRONIKA': {
        name: 'NEW MARKETRONIKA',
        gstin: '33AADFN5720D1ZS',
        address: '23/A-1 Lakshmipuram, Ganapathy, Coimbatore – 641006'
      }
    };

    // Function to get or create customer
    function getOrCreateCustomer(customerKey) {
      const customer = customers[customerKey];

      // Check if customer exists
      const result = db.exec(`SELECT id FROM customers WHERE gstin = '${customer.gstin}'`);

      if (result.length > 0 && result[0].values.length > 0) {
        return result[0].values[0][0];
      }

      // Create new customer
      const customerId = insert(
        `INSERT INTO customers (name, gstin, address) VALUES (?, ?, ?)`,
        [customer.name, customer.gstin, customer.address]
      );

      console.log(`✅ Created customer: ${customer.name}`);
      return customerId;
    }

    // Invoice data
    const invoices = [
      {
        invoice_no: '011',
        date: '20-08-2025',
        customer: 'EN EM INDUSTRIES',
        subtotal: 4500,
        sgst: 270,
        cgst: 270,
        total: 5040,
        items: [
          { description: 'SS Plates Drilling & Milling Works', hsn: '8458', qty: 50, rate: 90, amount: 4500 }
        ]
      },
      {
        invoice_no: '012',
        date: '21-08-2025',
        customer: 'KPS INDUSTRIES',
        subtotal: 6000,
        sgst: 360,
        cgst: 360,
        total: 6720,
        items: [
          { description: '8mm Ball Radius Turning Works', hsn: '8458', qty: 200, rate: 30, amount: 6000 }
        ]
      },
      {
        invoice_no: '013',
        date: '29-08-2025',
        customer: 'EN EM INDUSTRIES',
        subtotal: 6000,
        sgst: 360,
        cgst: 360,
        total: 6720,
        items: [
          { description: 'Carbide Bush', hsn: '8483', qty: 2, rate: 3000, amount: 6000 }
        ]
      },
      {
        invoice_no: '014',
        date: '22-09-2025',
        customer: 'EN EM INDUSTRIES',
        subtotal: 9700,
        sgst: 873,
        cgst: 873,
        total: 11446,
        items: [
          { description: 'Lathe Drum Welding Work', hsn: '9988', qty: 1, rate: 800, amount: 800 },
          { description: 'Bearing Seal', hsn: '8482', qty: 1, rate: 1800, amount: 1800 },
          { description: 'Nylon Turning', hsn: '9988', qty: 1, rate: 200, amount: 200 },
          { description: 'SS Bush', hsn: '7326', qty: 1, rate: 200, amount: 200 },
          { description: 'Main Spindle Assembly', hsn: '8483', qty: 1, rate: 500, amount: 500 },
          { description: 'Paper Spindle Assembly', hsn: '8483', qty: 1, rate: 500, amount: 500 },
          { description: 'Cutter Removing Press Work', hsn: '9988', qty: 1, rate: 200, amount: 200 },
          { description: 'OD Hardening Metal Turning', hsn: '9988', qty: 1, rate: 500, amount: 500 },
          { description: 'Bush', hsn: '7326', qty: 1, rate: 200, amount: 200 },
          { description: 'Bush', hsn: '7326', qty: 1, rate: 200, amount: 200 },
          { description: 'SS Cup', hsn: '7326', qty: 1, rate: 200, amount: 200 },
          { description: 'Bearing', hsn: '8482', qty: 1, rate: 2400, amount: 2400 },
          { description: '75 Square Rod', hsn: '7214', qty: 1, rate: 1500, amount: 1500 },
          { description: 'Bearing Plate', hsn: '7326', qty: 1, rate: 500, amount: 500 }
        ]
      },
      {
        invoice_no: '015',
        date: '29-09-2025',
        customer: 'EN EM INDUSTRIES',
        subtotal: 5050,
        sgst: 454,
        cgst: 454,
        total: 5958,
        items: [
          { description: 'SS Blade Milling & Drilling Works', hsn: '8208', qty: 101, rate: 50, amount: 5050 }
        ]
      },
      {
        invoice_no: '017',
        date: '13-10-2025',
        customer: 'Sky Industrial Components',
        subtotal: 10000,
        sgst: 900,
        cgst: 900,
        total: 11800,
        items: [
          { description: 'Adaptor 180 Gauge', hsn: '9026', qty: 1, rate: 6000, amount: 6000 },
          { description: 'Thermal Valve Housing Gauge', hsn: '8481', qty: 1, rate: 4000, amount: 4000 }
        ]
      },
      {
        invoice_no: '018',
        date: '14-10-2025',
        customer: 'NEW MARKETRONIKA',
        subtotal: 18000,
        sgst: 1620,
        cgst: 1620,
        total: 21240,
        items: [
          { description: 'Cutting Machine', hsn: '8461', qty: 1, rate: 18000, amount: 18000 }
        ]
      },
      {
        invoice_no: '019',
        date: '15-10-2025',
        customer: 'Sky Industrial Components',
        subtotal: 12700,
        sgst: 1143,
        cgst: 1143,
        total: 14986,
        items: [
          { description: 'Adaptor Plate Fixture', hsn: '8487', qty: 1, rate: 10500, amount: 10500 },
          { description: '24.880 Bore Gauge', hsn: '9017', qty: 1, rate: 2200, amount: 2200 }
        ]
      },
      {
        invoice_no: '020',
        date: '01-11-2025',
        customer: 'EN EM INDUSTRIES',
        subtotal: 7900,
        sgst: 711,
        cgst: 711,
        total: 9322,
        items: [
          { description: 'OD Spindle Assembly', hsn: '8483', qty: 1, rate: 500, amount: 500 },
          { description: 'Cutting Machine Rod', hsn: '8462', qty: 1, rate: 1500, amount: 1500 },
          { description: 'Pneumatic Bracket', hsn: '8412', qty: 1, rate: 1800, amount: 1800 },
          { description: 'Pneumatic Fixer Square', hsn: '8412', qty: 1, rate: 1000, amount: 1000 },
          { description: 'Bore', hsn: '9017', qty: 1, rate: 500, amount: 500 },
          { description: 'PCD Drill', hsn: '8207', qty: 1, rate: 200, amount: 200 },
          { description: 'Motor Plate', hsn: '8483', qty: 3, rate: 700, amount: 2100 },
          { description: 'Powder Coating', hsn: '9988', qty: 1, rate: 300, amount: 300 }
        ]
      }
    ];

    // Import each invoice
    for (const invoice of invoices) {
      console.log(`\n📝 Importing Invoice ${invoice.invoice_no}...`);

      // Check if invoice already exists
      const existingInvoice = db.exec(`SELECT id FROM invoices WHERE invoice_no = '${invoice.invoice_no}'`);
      if (existingInvoice.length > 0 && existingInvoice[0].values.length > 0) {
        console.log(`   ⚠️  Invoice ${invoice.invoice_no} already exists, skipping...`);
        continue;
      }

      // Get or create customer
      const customerId = getOrCreateCustomer(invoice.customer);

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
    }

    saveDatabase();

    console.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
    console.log('║              IMPORT COMPLETED SUCCESSFULLY                            ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

    // Display summary
    console.log('📊 Summary of imported invoices:\n');
    const summaryResult = db.exec(`
      SELECT
        i.invoice_no,
        i.date,
        c.name as customer,
        i.grand_total,
        COUNT(ii.id) as item_count
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
      WHERE CAST(i.invoice_no AS INTEGER) >= 11 AND CAST(i.invoice_no AS INTEGER) <= 20
      GROUP BY i.id
      ORDER BY CAST(i.invoice_no AS INTEGER)
    `);

    if (summaryResult.length > 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Invoice | Date       | Customer                       | Total    | Items');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      summaryResult[0].values.forEach(row => {
        const [inv_no, date, customer, total, items] = row;
        console.log(`${inv_no.padEnd(8)}| ${date.padEnd(11)}| ${customer.padEnd(31)}| ₹${total.toString().padEnd(7)}| ${items}`);
      });
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    console.log('✅ All invoices (11-20, except 16) have been added to the system!');
    console.log('🌐 Refresh your browser at http://localhost:3001 to see the updates.\n');

  } catch (error) {
    console.error('❌ Error importing invoices:', error);
    process.exit(1);
  }
}

importInvoices11to20();

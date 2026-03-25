const { initializeDatabase, getDb, saveDatabase, insert } = require('../db/database');

async function importInvoices21to29() {
  try {
    await initializeDatabase();
    const db = getDb();

    console.log('Adding invoices 21 to 29...\n');

    // New customer data
    const newCustomer = {
      name: 'MANJURIYA FURNITURE AGENCIES',
      gstin: '33AHRPN8185H1ZG',
      address: '2B2 Pudhupalayam Road, Maniyakarampalayam, Idikarai, Coimbatore – 641022'
    };

    // Function to get or create customer
    function getOrCreateCustomer(gstin, name, address) {
      const result = db.exec(`SELECT id FROM customers WHERE gstin = '${gstin}'`);

      if (result.length > 0 && result[0].values.length > 0) {
        return result[0].values[0][0];
      }

      const customerId = insert(
        `INSERT INTO customers (name, gstin, address) VALUES (?, ?, ?)`,
        [name, gstin, address]
      );

      console.log(`✅ Created customer: ${name}`);
      return customerId;
    }

    // Invoice data
    const invoices = [
      {
        invoice_no: '021',
        date: '11-11-2025',
        customer: { gstin: '33BGZPS2543C1Z6', name: 'Sky Industrial Components', address: 'No 6, Vadakku Thottam, Park Town, Udayampalayam, Chinnavedampatti, Coimbatore – 641049' },
        subtotal: 3500,
        sgst: 315,
        cgst: 315,
        total: 4130,
        items: [
          { description: '24.880 Gauge Wirecut & Grinding Work', hsn: '9988', qty: 1, rate: 800, amount: 800 },
          { description: 'Rough Milling Plate 155×40', hsn: '9988', qty: 1, rate: 300, amount: 300 },
          { description: 'Rough Milling Plate 705×40', hsn: '9988', qty: 1, rate: 1200, amount: 1200 },
          { description: 'Rough Milling Plate 350×40', hsn: '9988', qty: 2, rate: 600, amount: 1200 }
        ]
      },
      {
        invoice_no: '022',
        date: '12-11-2025',
        customer: { gstin: '33BQQPS9236R1ZN', name: 'EN EM INDUSTRIES', address: '17/54 Sukran Thottam, Udayampalayam, Ganapathy, Chinnavedampatti, Coimbatore – 641006' },
        subtotal: 4500,
        sgst: 405,
        cgst: 405,
        total: 5310,
        items: [
          { description: 'Rough Tapper Machine Lock Milling Labour', hsn: '9988', qty: 1, rate: 2500, amount: 2500 },
          { description: 'SS Sheet Door Labour Work', hsn: '9988', qty: 1, rate: 2000, amount: 2000 }
        ]
      },
      {
        invoice_no: '023',
        date: '19-11-2025',
        customer: newCustomer,
        subtotal: 11000,
        sgst: 990,
        cgst: 990,
        total: 12980,
        items: [
          { description: 'Mahogany Wood 5×1.5×7', hsn: '4407', qty: 25, rate: 350, amount: 8750 },
          { description: 'Mahogany Wood 4×1.5×7', hsn: '4407', qty: 10, rate: 225, amount: 2250 }
        ]
      },
      {
        invoice_no: '024',
        date: '19-11-2025',
        customer: { gstin: '33BQQPS9236R1ZN', name: 'EN EM INDUSTRIES', address: '17/54 Sukran Thottam, Udayampalayam, Ganapathy, Chinnavedampatti, Coimbatore – 641006' },
        subtotal: 12975,
        sgst: 1168,
        cgst: 1168,
        total: 15310,
        items: [
          { description: 'MS Bright Bar', hsn: '9988', qty: 2, rate: 353, amount: 706 },
          { description: 'EN8 Steel Round', hsn: '9988', qty: 2, rate: 353, amount: 706 },
          { description: 'MS Bright Bar', hsn: '9988', qty: 1, rate: 222, amount: 222 },
          { description: 'MS Bright Bar', hsn: '9988', qty: 2, rate: 305, amount: 610 },
          { description: 'MS Plate', hsn: '9988', qty: 1, rate: 1650, amount: 1650 },
          { description: 'MS Bright Bar', hsn: '9988', qty: 2, rate: 298, amount: 596 },
          { description: 'EN8 Steel Flat', hsn: '9988', qty: 2, rate: 485, amount: 970 },
          { description: '6 Inch Pulley', hsn: '9988', qty: 4, rate: 450, amount: 1800 },
          { description: 'Timing Pulley Machining', hsn: '9988', qty: 4, rate: 1250, amount: 5000 },
          { description: 'MS Bright Bar', hsn: '9988', qty: 1, rate: 50, amount: 50 },
          { description: 'EN8 Steel Flat', hsn: '9988', qty: 1, rate: 665, amount: 665 }
        ]
      },
      {
        invoice_no: '025',
        date: '12-12-2025',
        customer: { gstin: '33BQQPS9236R1ZN', name: 'EN EM INDUSTRIES', address: '17/54 Sukran Thottam, Udayampalayam, Ganapathy, Chinnavedampatti, Coimbatore – 641006' },
        subtotal: 17450,
        sgst: 1571,
        cgst: 1571,
        total: 20592,
        items: [
          { description: 'SS Welding', hsn: '9988', qty: 1, rate: 450, amount: 450 },
          { description: 'Bush', hsn: '9988', qty: 2, rate: 625, amount: 1250 },
          { description: 'Rod', hsn: '9988', qty: 2, rate: 625, amount: 1250 },
          { description: 'Flange Plate', hsn: '9988', qty: 2, rate: 1700, amount: 3400 },
          { description: 'Index Plate', hsn: '9988', qty: 1, rate: 700, amount: 700 },
          { description: 'Rough Tapper Timing Pulley', hsn: '9988', qty: 4, rate: 1250, amount: 5000 },
          { description: '20mm EN8 Pulley', hsn: '9988', qty: 1, rate: 3900, amount: 3900 },
          { description: '20mm EN8 Pulley', hsn: '9988', qty: 1, rate: 1500, amount: 1500 }
        ]
      },
      {
        invoice_no: '026',
        date: '16-12-2025',
        customer: { gstin: '33BGZPS2543C1Z6', name: 'Sky Industrial Components', address: 'No 6 Vadakku Thottam Park Town Udayampalayam Coimbatore – 641049' },
        subtotal: 10800,
        sgst: 972,
        cgst: 972,
        total: 12744,
        items: [
          { description: 'Drilling Fixture 1', hsn: '9988', qty: 1, rate: 1800, amount: 1800 },
          { description: 'Drilling Fixture 2', hsn: '9988', qty: 1, rate: 4500, amount: 4500 },
          { description: 'Drilling Fixture 3', hsn: '9988', qty: 1, rate: 4500, amount: 4500 }
        ]
      },
      {
        invoice_no: '027',
        date: '20-12-2025',
        customer: { gstin: '33BGZPS2543C1Z6', name: 'Sky Industrial Components', address: 'No 6 Vadakku Thottam Park Town Udayampalayam Coimbatore – 641049' },
        subtotal: 1760,
        sgst: 158,
        cgst: 158,
        total: 2076,
        items: [
          { description: 'Humidity Indicator Washer Drilling', hsn: '84149090', qty: 220, rate: 8, amount: 1760 }
        ]
      },
      {
        invoice_no: '028',
        date: '27-12-2025',
        customer: { gstin: '33BGZPS2543C1Z6', name: 'Sky Industrial Components', address: 'No 6 Vadakku Thottam Park Town Udayampalayam Coimbatore – 641049' },
        subtotal: 15500,
        sgst: 1395,
        cgst: 1395,
        total: 18290,
        items: [
          { description: 'Locking Plate Fixture', hsn: '9988', qty: 1, rate: 12000, amount: 12000 },
          { description: 'Adaptor Plate Tapping Fixture', hsn: '9988', qty: 1, rate: 3500, amount: 3500 }
        ]
      },
      {
        invoice_no: '029',
        date: '29-12-2025',
        customer: { gstin: '33BGZPS2543C1Z6', name: 'Sky Industrial Components', address: 'No 6 Vadakku Thottam Park Town Udayampalayam Coimbatore – 641049' },
        subtotal: 9000,
        sgst: 810,
        cgst: 810,
        total: 10620,
        items: [
          { description: 'Locknut Tapping Fixture Small', hsn: '9988', qty: 1, rate: 4500, amount: 4500 },
          { description: 'Locknut Tapping Fixture Big', hsn: '9988', qty: 1, rate: 4500, amount: 4500 }
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
      const customerId = getOrCreateCustomer(invoice.customer.gstin, invoice.customer.name, invoice.customer.address);

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
      WHERE CAST(i.invoice_no AS INTEGER) >= 21 AND CAST(i.invoice_no AS INTEGER) <= 29
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

    // Overall statistics
    const totalsResult = db.exec(`
      SELECT
        COUNT(DISTINCT i.id) as total_invoices,
        COUNT(DISTINCT c.id) as total_customers,
        SUM(i.grand_total) as total_revenue
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
    `);

    if (totalsResult.length > 0) {
      const [invoices, customers, revenue] = totalsResult[0].values[0];
      console.log('📈 Overall System Statistics:');
      console.log(`   Total Invoices: ${invoices}`);
      console.log(`   Total Customers: ${customers}`);
      console.log(`   Total Revenue: ₹${revenue.toLocaleString('en-IN')}\n`);
    }

    console.log('✅ Invoices 21-29 have been added successfully!');
    console.log('⚠️  Invoice 030 data is incomplete - please provide complete details to add it.');
    console.log('🌐 Refresh your browser at http://localhost:3001 to see the updates.\n');

  } catch (error) {
    console.error('❌ Error importing invoices:', error);
    process.exit(1);
  }
}

importInvoices21to29();

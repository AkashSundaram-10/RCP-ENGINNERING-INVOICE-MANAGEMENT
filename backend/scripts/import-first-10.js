const { initializeDatabase, insert, getOne, getAll } = require('../db/database');

const invoiceData = [
  {
    invoiceNo: '001',
    date: '02-07-2025',
    customer: {
      name: 'EN EM INDUSTRIES',
      address: '17/54 Sukran Thottam, Udayampalayam, Ganapathy, Chinnavedampatti, Coimbatore – 641006',
      gstin: '33BQQPS9236R1ZN'
    },
    items: [
      { description: 'Stone Drill Fixture Ø16 hole', hsn: '', qty: 1, rate: 6500 },
      { description: 'Stone Drill Fixture Ø6 hole', hsn: '', qty: 1, rate: 6500 },
      { description: 'SS Flat Drill Fixture Ø6', hsn: '', qty: 1, rate: 4500 },
      { description: 'Plastic Inspection Gauge', hsn: '', qty: 1, rate: 1800 }
    ],
    subtotal: 19300,
    sgst: 1737,
    cgst: 1737,
    grandTotal: 22774,
    taxRate: 9
  },
  {
    invoiceNo: '002',
    date: '15-07-2025',
    customer: {
      name: 'EN EM INDUSTRIES',
      address: '17/54 Sukran Thottam, Udayampalayam, Ganapathy, Chinnavedampatti, Coimbatore – 641006',
      gstin: '33BQQPS9236R1ZN'
    },
    items: [
      { description: 'Cutting Machine Fixture', hsn: '', qty: 1, rate: 8500 },
      { description: 'Cutting Machine Spindle Assembly Labour', hsn: '', qty: 1, rate: 6000 },
      { description: 'Rough Tapper Spindle Assembly Labour', hsn: '', qty: 1, rate: 4000 },
      { description: 'Lathe Attachment Spindle Work Labour', hsn: '', qty: 1, rate: 5000 }
    ],
    subtotal: 23500,
    sgst: 1410,
    cgst: 1410,
    grandTotal: 26320,
    taxRate: 6
  },
  {
    invoiceNo: '003',
    date: '14-07-2025',
    customer: {
      name: 'NEW MARKETRONIKA',
      address: '23/A-1 Lakshmipuram, Ganapathy, Coimbatore – 641006',
      gstin: '33AADFN5720D1ZS'
    },
    items: [
      { description: 'Brass ½ BSP Sensor Plug', hsn: '', qty: 10, rate: 600 },
      { description: '5mm Pin', hsn: '', qty: 4, rate: 80 }
    ],
    subtotal: 6320,
    sgst: 569,
    cgst: 569,
    grandTotal: 7458,
    taxRate: 9
  },
  {
    invoiceNo: '004',
    date: '17-07-2025',
    customer: {
      name: 'Orange Sorting Machines India Pvt Ltd',
      address: 'SF No.62/1, Atthipalayam Road, Chinnavedampatti, Coimbatore – 641049',
      gstin: '33AAACO7124L1ZH'
    },
    items: [
      { description: 'MAC 63 Gear Box Shaft', hsn: '', qty: 1, rate: 1500 }
    ],
    subtotal: 1500,
    sgst: 135,
    cgst: 135,
    grandTotal: 1770,
    taxRate: 9
  },
  {
    invoiceNo: '005',
    date: '17-07-2025',
    customer: {
      name: 'Orange Sorting Machines India Pvt Ltd',
      address: 'SF No.62/1, Atthipalayam Road, Chinnavedampatti, Coimbatore – 641049',
      gstin: '33AAACO7124L1ZH'
    },
    items: [
      { description: 'V Pulley 6" Bore & Keyway Work', hsn: '', qty: 1, rate: 350 }
    ],
    subtotal: 350,
    sgst: 21,
    cgst: 21,
    grandTotal: 392,
    taxRate: 6
  },
  {
    invoiceNo: '006',
    date: '22-07-2025',
    customer: {
      name: 'EN EM INDUSTRIES',
      address: '17/54 Sukran Thottam, Udayampalayam, Ganapathy, Chinnavedampatti, Coimbatore – 641006',
      gstin: '33BQQPS9236R1ZN'
    },
    items: [
      { description: 'Oil Lubrication Pump with Fitting Assembly', hsn: '', qty: 1, rate: 12000 }
    ],
    subtotal: 12000,
    sgst: 1080,
    cgst: 1080,
    grandTotal: 14160,
    taxRate: 9
  },
  {
    invoiceNo: '007',
    date: '22-07-2025',
    customer: {
      name: 'EN EM INDUSTRIES',
      address: '17/54 Sukran Thottam, Udayampalayam, Ganapathy, Chinnavedampatti, Coimbatore – 641006',
      gstin: '33BQQPS9236R1ZN'
    },
    items: [
      { description: 'Rough Taper Motor Assembly', hsn: '', qty: 1, rate: 6500 }
    ],
    subtotal: 6500,
    sgst: 390,
    cgst: 390,
    grandTotal: 7280,
    taxRate: 6
  },
  {
    invoiceNo: '008',
    date: '11-08-2025',
    customer: {
      name: 'EN EM INDUSTRIES',
      address: '17/54 Sukran Thottam, Udayampalayam, Ganapathy, Chinnavedampatti, Coimbatore – 641006',
      gstin: '33BQQPS9236R1ZN'
    },
    items: [
      { description: 'Pneumatic Press Fixture with Hose Valve & T Connector', hsn: '', qty: 1, rate: 8500 }
    ],
    subtotal: 8500,
    sgst: 765,
    cgst: 765,
    grandTotal: 10030,
    taxRate: 9
  },
  {
    invoiceNo: '009',
    date: '11-08-2025',
    customer: {
      name: 'EN EM INDUSTRIES',
      address: '17/54 Sukran Thottam, Udayampalayam, Ganapathy, Chinnavedampatti, Coimbatore – 641006',
      gstin: '33BQQPS9236R1ZN'
    },
    items: [
      { description: 'SS Sheet Metal Work', hsn: '', qty: 1, rate: 1800 },
      { description: 'TIG Welding Bracket', hsn: '', qty: 1, rate: 600 },
      { description: 'Additional Welding', hsn: '', qty: 1, rate: 300 }
    ],
    subtotal: 2700,
    sgst: 162,
    cgst: 162,
    grandTotal: 3024,
    taxRate: 6
  },
  {
    invoiceNo: '010',
    date: '16-08-2025',
    customer: {
      name: 'EN EM INDUSTRIES',
      address: '17/54 Sukran Thottam, Udayampalayam, Ganapathy, Chinnavedampatti, Coimbatore – 641006',
      gstin: '33BQQPS9236R1ZN'
    },
    items: [
      { description: 'Head Assembly TIG Welding Turning', hsn: '', qty: 1, rate: 3500 }
    ],
    subtotal: 3500,
    sgst: 210,
    cgst: 210,
    grandTotal: 3920,
    taxRate: 6
  }
];

async function importInvoices() {
  await initializeDatabase();

  console.log('\n' + '='.repeat(100));
  console.log('IMPORTING FIRST 10 INVOICES WITH VALIDATION');
  console.log('='.repeat(100) + '\n');

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const inv of invoiceData) {
    try {
      // Get or create customer
      let customer = getOne(
        'SELECT id FROM customers WHERE name = ? AND gstin = ?',
        [inv.customer.name, inv.customer.gstin]
      );

      let customerId = null;
      if (!customer) {
        customerId = insert(
          'INSERT INTO customers (name, address, gstin) VALUES (?, ?, ?)',
          [inv.customer.name, inv.customer.address, inv.customer.gstin]
        );
        console.log(`✓ Created customer: ${inv.customer.name}`);
      } else {
        customerId = customer.id;
      }

      // Validate totals
      const expectedTotal = inv.subtotal + inv.sgst + inv.cgst;
      const isValid = Math.abs(expectedTotal - inv.grandTotal) < 0.01;

      if (!isValid) {
        throw new Error(
          `Total mismatch: Expected ₹${expectedTotal}, got ₹${inv.grandTotal}`
        );
      }

      // Insert invoice
      const invoiceId = insert(
        'INSERT INTO invoices (invoice_no, date, customer_id, subtotal, sgst, cgst, grand_total, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [inv.invoiceNo, inv.date, customerId, inv.subtotal, inv.sgst, inv.cgst, inv.grandTotal, 'pending']
      );

      // Insert line items
      for (const item of inv.items) {
        insert(
          'INSERT INTO invoice_items (invoice_id, description, hsn_code, qty, rate, amount) VALUES (?, ?, ?, ?, ?, ?)',
          [invoiceId, item.description, item.hsn || null, item.qty, item.rate, item.qty * item.rate]
        );
      }

      console.log(`✓ Invoice #${inv.invoiceNo} - ₹${inv.grandTotal} (${inv.items.length} items) - ${inv.customer.name}`);
      successCount++;

    } catch (error) {
      errorCount++;
      const msg = `✗ Invoice #${inv.invoiceNo}: ${error.message}`;
      console.log(msg);
      errors.push(msg);
    }
  }

  console.log('\n' + '='.repeat(100));
  console.log('IMPORT SUMMARY');
  console.log('='.repeat(100));
  console.log(`✓ Successfully imported: ${successCount}/10`);
  console.log(`✗ Failed: ${errorCount}/10`);

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(`  ${e}`));
  }

  // Display all imported invoices in descending order
  console.log('\n' + '='.repeat(100));
  console.log('ALL INVOICES (DESCENDING ORDER BY INVOICE NUMBER)');
  console.log('='.repeat(100) + '\n');

  const invoices = getAll(`
    SELECT
      i.id,
      i.invoice_no,
      i.date,
      c.name as customer_name,
      i.subtotal,
      i.sgst,
      i.cgst,
      i.grand_total
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    ORDER BY CAST(i.invoice_no AS INTEGER) DESC
  `);

  invoices.forEach((inv, idx) => {
    console.log(`${(idx + 1).toString().padStart(2)}. Invoice #${inv.invoice_no} | ${inv.date} | ${inv.customer_name}`);
    console.log(`     Subtotal: ₹${inv.subtotal} | SGST: ₹${inv.sgst} | CGST: ₹${inv.cgst} | Total: ₹${inv.grand_total}\n`);
  });

  // Display line items
  console.log('='.repeat(100));
  console.log('LINE ITEMS FOR IMPORTED INVOICES');
  console.log('='.repeat(100) + '\n');

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

  let currentInvoice = null;
  items.forEach(item => {
    if (currentInvoice !== item.invoice_no) {
      if (currentInvoice !== null) console.log();
      console.log(`Invoice #${item.invoice_no}:`);
      currentInvoice = item.invoice_no;
    }
    console.log(`  • ${item.description} - Qty: ${item.qty} × ₹${item.rate} = ₹${item.amount}`);
  });

  console.log('\n' + '='.repeat(100) + '\n');
}

importInvoices().catch(console.error);

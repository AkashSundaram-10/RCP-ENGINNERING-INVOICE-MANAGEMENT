const { initializeDatabase, getDb, saveDatabase } = require('../db/database');

async function updateInvoiceDates() {
  try {
    await initializeDatabase();
    const db = getDb();

    const updates = [
      { invoice_no: '001', date: '02-07-2025' },
      { invoice_no: '002', date: '15-07-2025' },
      { invoice_no: '003', date: '14-07-2025' },
      { invoice_no: '004', date: '17-07-2025' },
      { invoice_no: '005', date: '17-07-2025' },
      { invoice_no: '006', date: '22-07-2025' },
      { invoice_no: '007', date: '22-07-2025' },
      { invoice_no: '008', date: '11-08-2025' },
      { invoice_no: '009', date: '11-08-2025' },
      { invoice_no: '010', date: '16-08-2025' }
    ];

    console.log('Updating invoice dates...\n');

    for (const update of updates) {
      // Check if invoice exists
      const checkResult = db.exec(`
        SELECT id, date FROM invoices WHERE invoice_no = '${update.invoice_no}'
      `);

      if (checkResult.length === 0 || checkResult[0].values.length === 0) {
        console.log(`❌ Invoice ${update.invoice_no} not found`);
        continue;
      }

      const oldDate = checkResult[0].values[0][1];

      // Update the date
      db.run(`
        UPDATE invoices SET date = ? WHERE invoice_no = ?
      `, [update.date, update.invoice_no]);

      console.log(`✅ Invoice ${update.invoice_no}: ${oldDate} → ${update.date}`);
    }

    saveDatabase();
    console.log('\n✅ All invoice dates updated successfully!');

    // Display updated invoices
    console.log('\n📋 Updated Invoice Dates:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const result = db.exec(`
      SELECT invoice_no, date, c.name as customer_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE invoice_no IN ('001','002','003','004','005','006','007','008','009','010')
      ORDER BY CAST(invoice_no AS INTEGER)
    `);

    if (result.length > 0) {
      result[0].values.forEach(row => {
        console.log(`Invoice ${row[0]} | ${row[1]} | ${row[2]}`);
      });
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('Error updating invoice dates:', error);
    process.exit(1);
  }
}

updateInvoiceDates();

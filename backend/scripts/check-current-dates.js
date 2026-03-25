const { initializeDatabase, getDb } = require('../db/database');

async function checkCurrentDates() {
  try {
    await initializeDatabase();
    const db = getDb();

    console.log('📋 Current Invoice Dates in Database:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const result = db.exec(`
      SELECT
        i.id,
        i.invoice_no,
        i.date,
        c.name as customer_name,
        i.grand_total
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      ORDER BY CAST(i.invoice_no AS INTEGER)
    `);

    if (result.length > 0 && result[0].values.length > 0) {
      result[0].values.forEach(row => {
        console.log(`ID: ${row[0]} | Invoice: ${row[1]} | Date: ${row[2]} | Customer: ${row[3]} | Total: ₹${row[4]}`);
      });
      console.log(`\nTotal invoices found: ${result[0].values.length}`);
    } else {
      console.log('❌ No invoices found in database!');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('Error checking dates:', error);
  }
}

checkCurrentDates();

const { initializeDatabase, getDb } = require('../db/database');

async function showItems() {
  await initializeDatabase();
  const db = getDb();

  console.log('Query 1: Direct items');
  const result1 = db.exec('SELECT id, invoice_id, description, qty, rate FROM invoice_items LIMIT 5');
  console.log(JSON.stringify(result1[0], null, 2));

  console.log('\n\nQuery 2: Items with join');
  const result2 = db.exec(`
    SELECT
      i.invoice_no,
      ii.id,
      ii.description,
      ii.qty,
      ii.rate
    FROM invoice_items ii
    JOIN invoices i ON ii.invoice_id = i.id
    LIMIT 5
  `);
  console.log(JSON.stringify(result2, null, 2));

  console.log('\n\nQuery 3: Simple count');
  const result3 = db.exec('SELECT COUNT(*) as cnt FROM invoice_items');
  console.log(JSON.stringify(result3, null, 2));
}

showItems().catch(console.error);

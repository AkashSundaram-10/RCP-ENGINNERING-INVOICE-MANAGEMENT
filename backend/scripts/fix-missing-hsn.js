const { initializeDatabase, getDb, saveDatabase } = require('../db/database');

async function fixMissingHSN() {
  try {
    await initializeDatabase();
    const db = getDb();

    console.log('Fixing missing HSN code...\n');

    // Find the specific item
    const query = `
      SELECT ii.id, ii.description, ii.hsn_code
      FROM invoice_items ii
      JOIN invoices i ON ii.invoice_id = i.id
      WHERE i.invoice_no = '001'
      AND ii.description LIKE '%Ø6 hole%'
    `;

    const result = db.exec(query);

    if (result.length > 0 && result[0].values.length > 0) {
      const itemId = result[0].values[0][0];
      const description = result[0].values[0][1];
      const currentHsn = result[0].values[0][2];

      console.log(`Found item ID: ${itemId}`);
      console.log(`Description: ${description}`);
      console.log(`Current HSN: ${currentHsn || 'N/A'}`);

      // Update to correct HSN
      db.run(`UPDATE invoice_items SET hsn_code = '8466' WHERE id = ?`, [itemId]);
      saveDatabase();

      console.log(`✅ Updated to HSN: 8466\n`);
    }

    // Verify all Invoice 001 items
    console.log('📋 Verifying Invoice 001 items:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const verifyResult = db.exec(`
      SELECT ii.description, ii.hsn_code
      FROM invoice_items ii
      JOIN invoices i ON ii.invoice_id = i.id
      WHERE i.invoice_no = '001'
    `);

    if (verifyResult.length > 0) {
      verifyResult[0].values.forEach(row => {
        console.log(`  ${row[0]} | HSN: ${row[1] || 'N/A'}`);
      });
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('Error:', error);
  }
}

fixMissingHSN();

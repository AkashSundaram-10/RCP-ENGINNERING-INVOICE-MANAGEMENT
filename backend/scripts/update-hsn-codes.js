const { initializeDatabase, getDb, saveDatabase } = require('../db/database');

async function updateHSNCodes() {
  try {
    await initializeDatabase();
    const db = getDb();

    // Map of invoice items with their HSN codes
    const hsnUpdates = [
      // Invoice 001
      { invoice_no: '001', description: 'Stone Drill Fixture Ø16 hole', hsn: '8466' },
      { invoice_no: '001', description: 'Stone Drill Fixture Ø6 hole', hsn: '8466' },
      { invoice_no: '001', description: 'SS Flat Drill Fixture Ø6', hsn: '8466' },
      { invoice_no: '001', description: 'Plastic Inspection Gauge', hsn: '9031' },

      // Invoice 002
      { invoice_no: '002', description: 'Cutting Machine Fixture', hsn: '8466' },
      { invoice_no: '002', description: 'Cutting Machine Spindle Assembly Labour', hsn: '9988' },
      { invoice_no: '002', description: 'Rough Tapper Spindle Assembly Labour', hsn: '8466' },
      { invoice_no: '002', description: 'Lathe Attachment Spindle Work Labour', hsn: '9988' },

      // Invoice 003
      { invoice_no: '003', description: 'Brass ½ BSP Sensor Plug', hsn: '7415' },
      { invoice_no: '003', description: '5mm Pin', hsn: '7415' },

      // Invoice 004
      { invoice_no: '004', description: 'MAC 63 Gear Box Shaft', hsn: '8483' },

      // Invoice 005
      { invoice_no: '005', description: 'V Pulley 6" Bore & Keyway Work', hsn: '8483' },

      // Invoice 006
      { invoice_no: '006', description: 'Oil Lubrication Pump with Fitting Assembly', hsn: '8413' },

      // Invoice 007
      { invoice_no: '007', description: 'Rough Taper Motor Assembly', hsn: '8501' },

      // Invoice 008
      { invoice_no: '008', description: 'Pneumatic Press Fixture with Hose Valve & T Connector', hsn: '8412' },

      // Invoice 009
      { invoice_no: '009', description: 'SS Sheet Metal Work', hsn: '8501' },
      { invoice_no: '009', description: 'TIG Welding Bracket', hsn: '' },
      { invoice_no: '009', description: 'Additional Welding', hsn: '' },

      // Invoice 010
      { invoice_no: '010', description: 'Head Assembly TIG Welding Turning', hsn: '8501' }
    ];

    console.log('Updating HSN codes for invoice items...\n');
    let successCount = 0;
    let notFoundCount = 0;

    for (const update of hsnUpdates) {
      // Find the item by invoice number and description
      const query = `
        SELECT ii.id, ii.description, ii.hsn_code
        FROM invoice_items ii
        JOIN invoices i ON ii.invoice_id = i.id
        WHERE i.invoice_no = '${update.invoice_no}'
        AND ii.description LIKE '%${update.description.substring(0, 20)}%'
      `;

      const result = db.exec(query);

      if (result.length === 0 || result[0].values.length === 0) {
        console.log(`❌ Item not found: Invoice ${update.invoice_no} - ${update.description}`);
        notFoundCount++;
        continue;
      }

      const itemId = result[0].values[0][0];
      const oldHsn = result[0].values[0][2] || 'N/A';

      // Update the HSN code
      db.run(`
        UPDATE invoice_items
        SET hsn_code = ?
        WHERE id = ?
      `, [update.hsn, itemId]);

      console.log(`✅ Invoice ${update.invoice_no}: ${update.description.substring(0, 30)}... | HSN: ${oldHsn} → ${update.hsn || 'N/A'}`);
      successCount++;
    }

    saveDatabase();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ HSN codes updated successfully!`);
    console.log(`   - ${successCount} items updated`);
    console.log(`   - ${notFoundCount} items not found`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Display updated items by invoice
    console.log('\n📋 Updated Invoice Items with HSN Codes:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    for (let i = 1; i <= 10; i++) {
      const invoiceNo = i.toString().padStart(3, '0');
      const itemsResult = db.exec(`
        SELECT ii.description, ii.hsn_code, ii.qty, ii.rate, ii.amount
        FROM invoice_items ii
        JOIN invoices inv ON ii.invoice_id = inv.id
        WHERE inv.invoice_no = '${invoiceNo}'
      `);

      if (itemsResult.length > 0 && itemsResult[0].values.length > 0) {
        console.log(`\nInvoice ${invoiceNo}:`);
        itemsResult[0].values.forEach(row => {
          console.log(`  - ${row[0]} | HSN: ${row[1] || 'N/A'} | Qty: ${row[2]} | Rate: ₹${row[3]}`);
        });
      }
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('Error updating HSN codes:', error);
    process.exit(1);
  }
}

updateHSNCodes();

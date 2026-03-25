/**
 * Export SQLite Data to JSON
 * Safely extracts all data from SQLite database for PostgreSQL migration
 * NO DATA IS DELETED - This creates a backup JSON file
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../db/rcp_invoices.db');
const exportPath = path.join(__dirname, '../db/sqlite-export.json');

async function exportData() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   SQLite → PostgreSQL Migration - Data Export        ║');
  console.log('║   Extracting all data without deletion...            ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    // Load SQLite database
    console.log('📂 Loading SQLite database...');
    if (!fs.existsSync(dbPath)) {
      console.error('❌ Error: SQLite database not found at:', dbPath);
      process.exit(1);
    }

    const SQL = await initSqlJs();
    const fileBuffer = fs.readFileSync(dbPath);
    const db = new SQL.Database(fileBuffer);
    console.log('✅ Database loaded successfully\n');

    // Extract data from each table
    const exportData = {
      timestamp: new Date().toISOString(),
      source: 'SQLite (sql.js)',
      tables: {}
    };

    // Table 1: Customers
    console.log('📋 Exporting customers table...');
    const customersResult = db.exec('SELECT * FROM customers ORDER BY id');
    let customers = [];
    if (customersResult.length > 0) {
      const columns = customersResult[0].columns;
      const values = customersResult[0].values;
      customers = values.map(row => {
        const obj = {};
        columns.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj;
      });
    }
    exportData.tables.customers = {
      count: customers.length,
      data: customers
    };
    console.log(`  ✓ Exported ${customers.length} customers\n`);

    // Table 2: Invoices
    console.log('📋 Exporting invoices table...');
    const invoicesResult = db.exec('SELECT * FROM invoices ORDER BY id');
    let invoices = [];
    if (invoicesResult.length > 0) {
      const columns = invoicesResult[0].columns;
      const values = invoicesResult[0].values;
      invoices = values.map(row => {
        const obj = {};
        columns.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj;
      });
    }
    exportData.tables.invoices = {
      count: invoices.length,
      data: invoices
    };
    console.log(`  ✓ Exported ${invoices.length} invoices\n`);

    // Table 3: Invoice Items
    console.log('📋 Exporting invoice_items table...');
    const itemsResult = db.exec('SELECT * FROM invoice_items ORDER BY id');
    let items = [];
    if (itemsResult.length > 0) {
      const columns = itemsResult[0].columns;
      const values = itemsResult[0].values;
      items = values.map(row => {
        const obj = {};
        columns.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj;
      });
    }
    exportData.tables.invoice_items = {
      count: items.length,
      data: items
    };
    console.log(`  ✓ Exported ${items.length} invoice items\n`);

    // Data Integrity Checks
    console.log('🔍 Data Integrity Verification...');
    let issuesFound = false;

    // Check customer references
    const customerIds = new Set(customers.map(c => c.id));
    const orphanedInvoices = invoices.filter(inv => inv.customer_id && !customerIds.has(inv.customer_id));
    if (orphanedInvoices.length > 0) {
      console.warn(`  ⚠ Warning: ${orphanedInvoices.length} invoices reference non-existent customers`);
      issuesFound = true;
    }

    // Check invoice references
    const invoiceIds = new Set(invoices.map(inv => inv.id));
    const orphanedItems = items.filter(item => !invoiceIds.has(item.invoice_id));
    if (orphanedItems.length > 0) {
      console.warn(`  ⚠ Warning: ${orphanedItems.length} items reference non-existent invoices`);
      issuesFound = true;
    }

    if (!issuesFound) {
      console.log('  ✓ All references are valid\n');
    } else {
      console.log('  ⚠ Some data integrity issues found - review before importing\n');
    }

    // Save export file
    console.log('💾 Saving export to JSON...');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    console.log(`✅ Data exported successfully!\n`);

    // Print summary
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║              EXPORT SUMMARY                            ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log(`║ Export File: ${exportPath.padEnd(35)} ║`);
    console.log(`║ Customers:   ${customers.length.toString().padEnd(35)} ║`);
    console.log(`║ Invoices:    ${invoices.length.toString().padEnd(35)} ║`);
    console.log(`║ Items:       ${items.length.toString().padEnd(35)} ║`);
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log('║ ✅ Next Steps:                                         ║');
    console.log('║    1. Set up PostgreSQL (local or cloud)              ║');
    console.log('║    2. Update .env with PostgreSQL credentials         ║');
    console.log('║    3. Run: npm install pg                             ║');
    console.log('║    4. Run: node backend/scripts/import-from-sqlite.js ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

exportData();

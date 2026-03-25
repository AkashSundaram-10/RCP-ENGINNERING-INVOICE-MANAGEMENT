/**
 * Import Data from SQLite Export to PostgreSQL
 * Loads the exported JSON data into PostgreSQL database
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const exportPath = path.join(__dirname, '../db/sqlite-export.json');

async function importData() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   SQLite → PostgreSQL Migration - Data Import        ║');
  console.log('║   Loading data from export...                        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  let pool = null;

  try {
    // Check if export file exists
    if (!fs.existsSync(exportPath)) {
      console.error('❌ Error: Export file not found at:', exportPath);
      console.error('Run: node backend/scripts/migrate-to-postgres.js first');
      process.exit(1);
    }

    // Load export data
    console.log('📂 Loading export file...');
    const exportData = JSON.parse(fs.readFileSync(exportPath, 'utf-8'));
    console.log(`✅ Export loaded (created: ${exportData.timestamp})\n`);

    // Connect to PostgreSQL
    console.log('🔌 Connecting to PostgreSQL...');
    const connectionConfig = process.env.DATABASE_URL
      ? {
          connectionString: process.env.DATABASE_URL,
          ssl: {
            rejectUnauthorized: false  // For cloud providers like Render
          }
        }
      : {
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 5432,
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'invoice_db'
        };

    pool = new Pool(connectionConfig);
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL\n');

    try {
      // Create tables first if they don't exist
      console.log('📋 Creating tables if not exist...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS customers (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          address TEXT,
          gstin TEXT,
          phone TEXT,
          email TEXT,
          created_at TIMESTAMP DEFAULT now()
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS invoices (
          id SERIAL PRIMARY KEY,
          invoice_no TEXT UNIQUE NOT NULL,
          date TEXT NOT NULL,
          customer_id INTEGER,
          subtotal REAL DEFAULT 0,
          sgst REAL DEFAULT 0,
          cgst REAL DEFAULT 0,
          grand_total REAL DEFAULT 0,
          payment_status TEXT DEFAULT 'pending',
          notes TEXT,
          created_at TIMESTAMP DEFAULT now(),
          FOREIGN KEY (customer_id) REFERENCES customers(id)
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS invoice_items (
          id SERIAL PRIMARY KEY,
          invoice_id INTEGER NOT NULL,
          description TEXT NOT NULL,
          hsn_code TEXT,
          qty REAL DEFAULT 1,
          rate REAL DEFAULT 0,
          amount REAL DEFAULT 0,
          FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ Tables created\n');

      // Clear existing data (in correct order due to foreign keys)
      console.log('🧹 Clearing existing data...');
      await client.query('DELETE FROM invoice_items');
      await client.query('DELETE FROM invoices');
      await client.query('DELETE FROM customers');
      await client.query('ALTER SEQUENCE customers_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE invoices_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE invoice_items_id_seq RESTART WITH 1');
      console.log('✅ Data cleared, sequences reset\n');

      // Import customers
      console.log('📋 Importing customers...');
      let customerCount = 0;
      for (const customer of exportData.tables.customers.data) {
        await client.query(
          `INSERT INTO customers (id, name, address, gstin, phone, email, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            customer.id,
            customer.name,
            customer.address || null,
            customer.gstin || null,
            customer.phone || null,
            customer.email || null,
            customer.created_at || new Date().toISOString()
          ]
        );
        customerCount++;
      }
      console.log(`✅ Imported ${customerCount} customers\n`);

      // Import invoices
      console.log('📋 Importing invoices...');
      let invoiceCount = 0;
      for (const invoice of exportData.tables.invoices.data) {
        await client.query(
          `INSERT INTO invoices (id, invoice_no, date, customer_id, subtotal, sgst, cgst, grand_total, payment_status, notes, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            invoice.id,
            invoice.invoice_no,
            invoice.date,
            invoice.customer_id || null,
            invoice.subtotal || 0,
            invoice.sgst || 0,
            invoice.cgst || 0,
            invoice.grand_total || 0,
            invoice.payment_status || 'pending',
            invoice.notes || null,
            invoice.created_at || new Date().toISOString()
          ]
        );
        invoiceCount++;
      }
      console.log(`✅ Imported ${invoiceCount} invoices\n`);

      // Import invoice items
      console.log('📋 Importing invoice items...');
      let itemCount = 0;
      for (const item of exportData.tables.invoice_items.data) {
        await client.query(
          `INSERT INTO invoice_items (id, invoice_id, description, hsn_code, qty, rate, amount)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            item.id,
            item.invoice_id,
            item.description,
            item.hsn_code || null,
            item.qty || 1,
            item.rate || 0,
            item.amount || 0
          ]
        );
        itemCount++;
      }
      console.log(`✅ Imported ${itemCount} invoice items\n`);

      // Verify import
      console.log('🔍 Verifying import...');
      const customerCheck = await client.query('SELECT COUNT(*) FROM customers');
      const invoiceCheck = await client.query('SELECT COUNT(*) FROM invoices');
      const itemCheck = await client.query('SELECT COUNT(*) FROM invoice_items');

      const importedCustomers = parseInt(customerCheck.rows[0].count);
      const importedInvoices = parseInt(invoiceCheck.rows[0].count);
      const importedItems = parseInt(itemCheck.rows[0].count);

      const customersMatch = importedCustomers === exportData.tables.customers.count;
      const invoicesMatch = importedInvoices === exportData.tables.invoices.count;
      const itemsMatch = importedItems === exportData.tables.invoice_items.count;

      console.log(`  Customers: ${importedCustomers} (expected: ${exportData.tables.customers.count}) ${customersMatch ? '✓' : '✗'}`);
      console.log(`  Invoices:  ${importedInvoices} (expected: ${exportData.tables.invoices.count}) ${invoicesMatch ? '✓' : '✗'}`);
      console.log(`  Items:     ${importedItems} (expected: ${exportData.tables.invoice_items.count}) ${itemsMatch ? '✓' : '✗'}\n`);

      if (customersMatch && invoicesMatch && itemsMatch) {
        console.log('✅ All data verified successfully!\n');

        // Test foreign keys
        console.log('🔗 Verifying relationships...');
        const orphanedInvoices = await client.query(
          `SELECT COUNT(*) FROM invoices WHERE customer_id IS NOT NULL AND customer_id NOT IN (SELECT id FROM customers)`
        );
        const orphanedItems = await client.query(
          `SELECT COUNT(*) FROM invoice_items WHERE invoice_id NOT IN (SELECT id FROM invoices)`
        );

        const orphanedInvCount = parseInt(orphanedInvoices.rows[0].count);
        const orphanedItemCount = parseInt(orphanedItems.rows[0].count);

        if (orphanedInvCount === 0 && orphanedItemCount === 0) {
          console.log('  ✓ All relationships intact\n');
        } else {
          console.warn(`  ⚠ Found ${orphanedInvCount} orphaned invoices and ${orphanedItemCount} orphaned items\n`);
        }

        console.log('╔════════════════════════════════════════════════════════╗');
        console.log('║            ✅ MIGRATION SUCCESSFUL!                    ║');
        console.log('╠════════════════════════════════════════════════════════╣');
        console.log(`║ Customers:   ${importedCustomers.toString().padEnd(35)} ║`);
        console.log(`║ Invoices:    ${importedInvoices.toString().padEnd(35)} ║`);
        console.log(`║ Items:       ${importedItems.toString().padEnd(35)} ║`);
        console.log('╠════════════════════════════════════════════════════════╣');
        console.log('║ ✅ Next Steps:                                         ║');
        console.log('║    1. Restart server: npm start                        ║');
        console.log('║    2. Test API: http://localhost:3001/api/customers   ║');
        console.log('║    3. Verify data in UI                               ║');
        console.log('║      DATABASE MIGRATION COMPLETE!                      ║');
        console.log('╚════════════════════════════════════════════════════════╝\n');

      } else {
        console.error('❌ Import verification failed - data mismatch!');
        console.error(`Expected customers: ${exportData.tables.customers.count}, got: ${importedCustomers}`);
        console.error(`Expected invoices: ${exportData.tables.invoices.count}, got: ${importedInvoices}`);
        console.error(`Expected items: ${exportData.tables.invoice_items.count}, got: ${importedItems}`);
        process.exit(1);
      }

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

importData();

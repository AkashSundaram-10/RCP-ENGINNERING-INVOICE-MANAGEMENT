const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'rcp_invoices.db');
let db = null;

async function initializeDatabase() {
  const SQL = await initSqlJs();

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create customers table
  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT,
      gstin TEXT,
      phone TEXT,
      email TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Create invoices table
  db.run(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_no TEXT UNIQUE NOT NULL,
      date TEXT NOT NULL,
      customer_id INTEGER,
      subtotal REAL DEFAULT 0,
      sgst REAL DEFAULT 0,
      cgst REAL DEFAULT 0,
      grand_total REAL DEFAULT 0,
      payment_status TEXT DEFAULT 'pending',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);

  // Create invoice_items table
  db.run(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      hsn_code TEXT,
      qty REAL DEFAULT 1,
      rate REAL DEFAULT 0,
      amount REAL DEFAULT 0,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    )
  `);

  saveDatabase();
  console.log('Database initialized successfully!');
  return db;
}

// Save database to file
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// Get database instance
function getDb() {
  return db;
}

// Get the next invoice number
function getNextInvoiceNumber() {
  const result = db.exec(`
    SELECT invoice_no FROM invoices
    ORDER BY CAST(invoice_no AS INTEGER) DESC
    LIMIT 1
  `);

  if (result.length > 0 && result[0].values.length > 0) {
    const lastNo = result[0].values[0][0];
    const nextNum = parseInt(lastNo) + 1;
    return nextNum.toString().padStart(3, '0');
  }
  return '001';
}

// Helper functions for common operations
function runQuery(sql, params = []) {
  try {
    db.run(sql, params);
    saveDatabase();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function getOne(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

function getAll(sql, params = []) {
  const result = db.exec(sql);
  if (result.length === 0) return [];

  const columns = result[0].columns;
  const values = result[0].values;

  return values.map(row => {
    const obj = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj;
  });
}

function insert(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  stmt.step();
  stmt.free();
  saveDatabase();

  // Get the last inserted ID using a reliable method
  const idResult = db.exec('SELECT last_insert_rowid() as id');
  if (idResult && idResult[0] && idResult[0].values && idResult[0].values.length > 0) {
    const lastId = idResult[0].values[0][0];
    if (lastId && lastId > 0) return lastId;
  }

  // Fallback: query based on the INSERT statement table
  const tableMatch = sql.match(/INSERT INTO\s+(\w+)/i);
  if (tableMatch) {
    const tableName = tableMatch[1];
    const maxResult = db.exec(`SELECT MAX(id) as id FROM ${tableName}`);
    if (maxResult && maxResult[0] && maxResult[0].values && maxResult[0].values[0]) {
      return maxResult[0].values[0][0];
    }
  }
  return null;
}


module.exports = {
  initializeDatabase,
  getDb,
  getNextInvoiceNumber,
  saveDatabase,
  runQuery,
  getOne,
  getAll,
  insert
};

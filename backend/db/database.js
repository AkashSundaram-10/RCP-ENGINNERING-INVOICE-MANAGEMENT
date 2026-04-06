/**
 * PostgreSQL Database Layer
 * Maintains the same interface as sql.js version but uses PostgreSQL
 * All methods are async, queries use parameterized statements for security
 */

const { Pool } = require('pg');
require('dotenv').config();

let pool = null;

// Initialize database pool
async function initializeDatabase() {
  try {
    // Check if we're in a cloud environment and DATABASE_URL is missing
    if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
      throw new Error(
        'DATABASE_URL environment variable is required in production. ' +
        'Please set it in your Render dashboard under Environment variables.'
      );
    }

    // Support both DATABASE_URL and individual connection params
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

    console.log(`Attempting to connect to PostgreSQL...`);
    if (process.env.DATABASE_URL) {
      console.log('Using DATABASE_URL from environment');
    } else {
      console.log(`Attempting local connection to ${connectionConfig.host}:${connectionConfig.port}`);
    }

    pool = new Pool(connectionConfig);

    // Test connection
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    client.release();

    // Create tables if not exist
    await createTables();

    console.log('Database initialized successfully!');
    return pool;
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    throw error;
  }
}

// Create all tables
async function createTables() {
  try {
    const client = await pool.connect();

    // Customers table
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

    // Invoices table
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

    // Invoice items table
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

    client.release();
    console.log('Tables verified/created');
  } catch (error) {
    throw error;
  }
}

// Get database pool
function getDb() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializeDatabase() first.');
  }
  return pool;
}

// Get the next invoice number for a specific batch
async function getNextInvoiceNumber(batch = null) {
  try {
    let query, params;
    
    if (batch) {
      // Get next number for specific batch
      query = `
        SELECT batch_invoice_no FROM invoices
        WHERE batch = $1
        ORDER BY CAST(batch_invoice_no AS INTEGER) DESC
        LIMIT 1
      `;
      params = [batch];
    } else {
      // Get next number overall (for backward compatibility)
      query = `
        SELECT invoice_no FROM invoices
        ORDER BY CAST(invoice_no AS INTEGER) DESC
        LIMIT 1
      `;
      params = [];
    }

    const result = await pool.query(query, params);

    if (result.rows.length > 0) {
      const lastNo = batch ? result.rows[0].batch_invoice_no : result.rows[0].invoice_no;
      const nextNum = parseInt(lastNo) + 1;
      return nextNum.toString().padStart(3, '0');
    }
    return '001';
  } catch (error) {
    console.error('Error getting next invoice number:', error);
    return '001';
  }
}

// Get current active batch
async function getCurrentBatch() {
  try {
    // You can implement logic to determine current batch
    // For now, return Batch 2 for new financial year
    const result = await pool.query(`
      SELECT batch FROM invoices
      ORDER BY id DESC
      LIMIT 1
    `);
    
    if (result.rows.length > 0 && result.rows[0].batch) {
      return result.rows[0].batch;
    }
    return 'Batch 2'; // New batch for FY 2026-27
  } catch (error) {
    console.error('Error getting current batch:', error);
    return 'Batch 2';
  }
}

// Helper functions for common operations
async function runQuery(sql, params = []) {
  try {
    const result = await pool.query(sql, params);
    return { success: true, result };
  } catch (error) {
    console.error('Query error:', error.message);
    return { success: false, error: error.message };
  }
}

async function getOne(sql, params = []) {
  try {
    const result = await pool.query(sql, params);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Query error:', error.message);
    throw error;
  }
}

async function getAll(sql, params = []) {
  try {
    const result = await pool.query(sql, params);
    return result.rows || [];
  } catch (error) {
    console.error('Query error:', error.message);
    throw error;
  }
}

async function insert(sql, params = []) {
  try {
    const result = await pool.query(sql, params);
    // PostgreSQL RETURNING clause returns the inserted row
    if (result.rows.length > 0 && result.rows[0].id) {
      return result.rows[0].id;
    }
    return null;
  } catch (error) {
    console.error('Insert error:', error.message);
    throw error;
  }
}

// Save database (no-op for PostgreSQL, kept for compatibility)
async function saveDatabase() {
  // PostgreSQL auto-saves, this is just a placeholder for compatibility
  return Promise.resolve();
}

// Graceful shutdown
async function closeDatabase() {
  if (pool) {
    await pool.end();
    console.log('Database connection pool closed');
  }
}

module.exports = {
  initializeDatabase,
  getDb,
  getNextInvoiceNumber,
  getCurrentBatch,
  saveDatabase,
  runQuery,
  getOne,
  getAll,
  insert,
  closeDatabase
};

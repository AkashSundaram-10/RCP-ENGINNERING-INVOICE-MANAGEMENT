require('dotenv').config();
const { Pool } = require('pg');

async function testConnection() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (hidden for security)' : 'NOT SET');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Attempting to connect...');
    const client = await pool.connect();
    console.log('✓ Successfully connected to PostgreSQL!');
    
    const result = await client.query('SELECT NOW()');
    console.log('✓ Query test successful. Current time:', result.rows[0].now);
    
    client.release();
    await pool.end();
    console.log('✓ Connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testConnection();

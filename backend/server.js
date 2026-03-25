require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { initializeDatabase } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from project root
app.use(express.static(path.join(__dirname, '../')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RCP Invoice API is running' });
});

// Serve the main app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Initialize database and then set up routes
async function startServer() {
  try {
    await initializeDatabase();

    // Import routes after database is initialized
    const invoicesRouter = require('./routes/invoices');
    const customersRouter = require('./routes/customers');

    // API Routes
    app.use('/api/invoices', invoicesRouter);
    app.use('/api/customers', customersRouter);

    app.listen(PORT, () => {
      console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║     RAM CHINO PESAN ENGINEERING - Invoice System          ║
  ╠═══════════════════════════════════════════════════════════╣
  ║     Server running at: http://localhost:${PORT}              ║
  ║                                                           ║
  ║     API endpoints:                                        ║
  ║       - GET/POST    /api/invoices                         ║
  ║       - GET/PUT/DEL /api/invoices/:id                     ║
  ║       - GET/POST    /api/customers                        ║
  ║       - GET/PUT/DEL /api/customers/:id                    ║
  ║                                                           ║
  ║     Open http://localhost:${PORT} in your browser            ║
  ╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

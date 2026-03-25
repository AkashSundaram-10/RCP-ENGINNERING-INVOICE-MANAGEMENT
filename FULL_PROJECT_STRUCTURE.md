# RCP Invoice Management System - FULL PROJECT STRUCTURE

Complete documentation of the project architecture, all files, and their purposes.

---

## 📁 Complete Directory Tree

```
RCP ENGINNERING/
│
├── backend/                          # Backend Express.js server
│   ├── db/
│   │   ├── database.js              # SQLite initialization & CRUD operations
│   │   └── rcp_invoices.db          # SQLite database file
│   │
│   ├── routes/                      # API route handlers
│   │   ├── invoices.js              # Invoice CRUD & analytics endpoints
│   │   └── customers.js             # Customer CRUD & search endpoints
│   │
│   ├── invoices/                    # Extracted individual invoice PDFs
│   │   ├── invoice-1.pdf
│   │   ├── invoice-2.pdf
│   │   ├── ...
│   │   └── invoice-51.pdf           # 51 total invoice files
│   │
│   ├── scripts/                     # Utility & data import scripts
│   │   ├── import-invoices.js       # Main multi-PDF invoice importer
│   │   ├── split-invoices.js        # Split multi-page PDF into singles
│   │   ├── clear-database.js        # Reset database to empty state
│   │   │
│   │   ├── import-first-10.js       # Import invoices 1-10
│   │   ├── import-invoices-11-20.js # Import invoices 11-20
│   │   ├── import-invoices-21-29.js # Import invoices 21-29
│   │   ├── import-invoice-030.js    # Import invoice 30
│   │   ├── import-invoices-031-051.js # Import invoices 31-51
│   │   │
│   │   ├── analyze-first-10.js      # Analyze first 10 invoices
│   │   ├── check-current-dates.js   # Verify invoice dates
│   │   ├── check-items.js           # Verify item extraction
│   │   ├── debug-item-extraction.js # Debug item parsing
│   │   ├── debug-items.js           # Debug item details
│   │   ├── fix-missing-hsn.js       # Add missing HSN codes
│   │   │
│   │   ├── update-customer-details.js    # Update customer info
│   │   ├── update-hsn-codes.js           # Update HSN codes
│   │   ├── update-invoice-dates.js       # Update invoice dates
│   │   ├── update-invoices-030-051.js    # Batch update invoices 30-51
│   │   │
│   │   ├── verify-import.js              # Verify import completion
│   │   ├── verify-invoices-11-20.js      # Verify invoices 11-20
│   │   ├── verify-invoices-21-29.js      # Verify invoices 21-29
│   │   ├── final-report.js               # Generate final report
│   │   ├── final-verification-report.js  # Verification report
│   │   │
│   │   ├── test-pdf-extraction.js        # Test PDF text extraction
│   │   ├── test-multiple-pdfs.js         # Test multiple PDF processing
│   │   ├── show-items.js                 # Display all items
│   │   ├── report-desc-order.js          # Report by description
│   │   └── view-database.js              # View database contents
│   │
│   └── server.js                    # Main Express server entry point
│
├── frontend/                         # Frontend UI resources
│   ├── components/                  # HTML components (currently empty)
│   │   └── [component files]
│   │
│   └── styles/
│       └── app.css                  # Main stylesheet (176 lines)
│
├── assets/                          # Static files
│   └── logo.png                     # Company logo
│
├── Configuration & Metadata
│   ├── package.json                 # Node.js dependencies & scripts
│   ├── package-lock.json            # Dependency lock file
│   ├── .env                         # Environment variables
│   ├── .gitignore                   # Git ignore rules
│   │
│   ├── PROJECT_STRUCTURE.md         # Quick project structure guide
│   ├── FULL_PROJECT_STRUCTURE.md    # This file - comprehensive guide
│   │
│   ├── index.html                   # Main application HTML (72KB)
│   ├── dashboard.html               # Dashboard template (empty)
│   │
│   └── TAX INVOICE 1 TO 51.pdf      # Source PDF with all 51 invoices (1.3MB)
│
└── node_modules/                    # NPM dependencies (excluded from repo)
    └── [all installed packages]
```

---

## 📊 Database Schema

### SQLite Database: `backend/db/rcp_invoices.db`

#### Table: `customers`
```sql
CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT,
  gstin TEXT,                        -- GST Identification Number
  phone TEXT,
  email TEXT,
  created_at TEXT DEFAULT (datetime('now'))
)
```

#### Table: `invoices`
```sql
CREATE TABLE invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_no TEXT UNIQUE NOT NULL,   -- Invoice number (001, 002, etc)
  date TEXT NOT NULL,                -- Invoice date (DD-MM-YYYY format)
  customer_id INTEGER,               -- FK to customers table
  subtotal REAL DEFAULT 0,           -- Before tax
  sgst REAL DEFAULT 0,               -- State GST (9%)
  cgst REAL DEFAULT 0,               -- Central GST (9%)
  grand_total REAL DEFAULT 0,        -- Final total
  payment_status TEXT DEFAULT 'pending', -- 'pending' or 'paid'
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
)
```

#### Table: `invoice_items`
```sql
CREATE TABLE invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,       -- FK to invoices table
  description TEXT NOT NULL,         -- Item description
  hsn_code TEXT,                     -- HSN/SAC code for GST
  qty REAL DEFAULT 1,                -- Quantity
  rate REAL DEFAULT 0,               -- Unit rate
  amount REAL DEFAULT 0,             -- qty * rate
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
)
```

---

## 🔌 API Endpoints

### Base URL: `http://localhost:3001/api`

### INVOICES ENDPOINTS

#### GET `/invoices`
Get all invoices with customer details
```
Response: [
  {
    id: 1,
    invoice_no: "001",
    date: "25-03-2026",
    customer_id: 1,
    customer_name: "Company Name",
    customer_address: "...",
    customer_gstin: "...",
    subtotal: 10000,
    sgst: 900,
    cgst: 900,
    grand_total: 11800,
    payment_status: "pending",
    notes: "...",
    created_at: "2026-03-25..."
  },
  ...
]
```

#### POST `/invoices`
Create new invoice with items
```
Request Body: {
  invoice_no: "052",
  date: "25-03-2026",
  customer_id: 1,
  items: [
    {
      description: "Item 1",
      hsn_code: "1234",
      qty: 5,
      rate: 100
    },
    {
      description: "Item 2",
      hsn_code: "5678",
      qty: 2,
      rate: 250
    }
  ],
  notes: "Optional notes"
}

Response: {
  id: 52,
  invoice_no: "052",
  message: "Invoice created successfully"
}
```

#### GET `/invoices/:id`
Get single invoice with all items
```
Response: {
  id: 1,
  invoice_no: "001",
  date: "25-03-2026",
  customer_id: 1,
  customer_name: "...",
  subtotal: 10000,
  sgst: 900,
  cgst: 900,
  grand_total: 11800,
  payment_status: "pending",
  items: [
    {
      id: 1,
      invoice_id: 1,
      description: "Item 1",
      hsn_code: "1234",
      qty: 5,
      rate: 100,
      amount: 500
    }
  ]
}
```

#### PUT `/invoices/:id`
Update invoice and its items
```
Request Body: {
  date: "26-03-2026",
  customer_id: 2,
  items: [ ... ],
  notes: "Updated notes",
  payment_status: "paid"
}

Response: { message: "Invoice updated successfully" }
```

#### PATCH `/invoices/:id/status`
Update payment status only
```
Request Body: { payment_status: "paid" }
Response: { message: "Payment status updated" }
```

#### GET `/invoices/analytics/monthly`
Get monthly revenue analytics
```
Response: {
  months: ["Jan 2026", "Feb 2026", "Mar 2026"],
  revenue: [125000, 95000, 110000],
  paid: [100000, 50000, 0],
  pending: [25000, 45000, 110000],
  invoiceCount: [15, 12, 18]
}
```

#### GET `/invoices/next-number`
Get next invoice number to assign
```
Response: { invoice_no: "052" }
```

#### DELETE `/invoices/:id`
Delete invoice (cascades to items)
```
Response: { message: "Invoice deleted successfully" }
```

---

### CUSTOMERS ENDPOINTS

#### GET `/customers`
Get all customers (sorted by name)
```
Response: [
  {
    id: 1,
    name: "ABC Company Ltd",
    address: "123 Main Street",
    gstin: "27AABCU6201D1ZU",
    phone: "989-xxx-xxxx",
    email: "info@abc.com",
    created_at: "2026-03-25..."
  },
  ...
]
```

#### POST `/customers`
Create new customer
```
Request Body: {
  name: "New Company",
  address: "456 Park Ave",
  gstin: "27NEWCO6201D1ZU",
  phone: "989-123-4567",
  email: "contact@new.com"
}

Response: {
  id: 52,
  message: "Customer created successfully"
}
```

#### GET `/customers/:id`
Get single customer details
```
Response: {
  id: 1,
  name: "ABC Company Ltd",
  address: "...",
  gstin: "...",
  phone: "...",
  email: "...",
  created_at: "..."
}
```

#### GET `/customers/search?q=ABC`
Search customers by name (autocomplete)
```
Response: [
  { id: 1, name: "ABC Company Ltd", ... },
  { id: 2, name: "ABC Corporation", ... }
]
```

#### PUT `/customers/:id`
Update customer information
```
Request Body: {
  name: "Updated Name",
  address: "New Address",
  gstin: "...",
  phone: "...",
  email: "..."
}

Response: { message: "Customer updated successfully" }
```

#### DELETE `/customers/:id`
Delete customer (only if no invoices)
```
Response: { message: "Customer deleted successfully" }
Error if customer has invoices: {
  error: "Cannot delete customer with existing invoices"
}
```

---

## ⚙️ Key Files Description

### Backend Core

#### `backend/server.js` (65 lines)
- Express.js application setup
- Database initialization on startup
- CORS middleware configuration
- Static file serving from project root
- Route mounting for `/api/invoices` and `/api/customers`
- Server startup on port from `.env` or 3001
- Beautiful ASCII banner on startup

#### `backend/db/database.js` (174 lines)
- SQLite database initialization using sql.js
- Create all three tables (customers, invoices, invoice_items)
- Database persistence (save to file, load from file)
- Helper methods:
  - `runQuery()` - Execute SQL with auto-save
  - `getOne()` - Get single row result
  - `getAll()` - Get multiple rows as array
  - `insert()` - Insert and return ID
  - `getNextInvoiceNumber()` - Auto-increment helper
  - `saveDatabase()` - Manual save to disk

#### `backend/routes/invoices.js` (284 lines)
**GET Endpoints:**
- `GET /` - All invoices with customer details
- `GET /analytics/monthly` - Monthly revenue analytics
- `GET /next-number` - Next invoice number
- `GET /:id` - Single invoice with items

**POST Endpoints:**
- `POST /` - Create invoice with items (auto-calculates tax)
  - Calculates subtotal from items
  - Applies 9% SGST + 9% CGST
  - Computes grand_total

**PUT/PATCH Endpoints:**
- `PUT /:id` - Full update with items
- `PATCH /:id/status` - Update payment status only

**DELETE Endpoints:**
- `DELETE /:id` - Delete invoice and cascade delete items

#### `backend/routes/customers.js` (140 lines)
**GET Endpoints:**
- `GET /` - All customers (alphabetical)
- `GET /search?q=...` - Search by name (autocomplete)
- `GET /:id` - Single customer

**POST Endpoints:**
- `POST /` - Create new customer

**PUT Endpoints:**
- `PUT /:id` - Update customer info

**DELETE Endpoints:**
- `DELETE /:id` - Delete customer (with validation)
  - Prevents deletion if customer has invoices

### Frontend

#### `index.html` (72 KB)
- Main application HTML file
- Served from project root as static file
- Contains:
  - Dashboard layout
  - Invoice list and form
  - Customer management
  - Analytics charts
  - Interactive UI components

#### `dashboard.html`
- Template for dashboard page (currently empty)

#### `frontend/styles/app.css` (176 lines)
- Main stylesheet for the application
- Styles for:
  - Dashboard layout
  - Forms and inputs
  - Tables and lists
  - Charts and analytics
  - Responsive design

### Configuration

#### `package.json` (31 lines)
```json
{
  "name": "rcp-invoice-app",
  "version": "1.0.0",
  "main": "backend/server.js",
  "scripts": {
    "start": "node backend/server.js",
    "dev": "nodemon backend/server.js",
    "split-invoices": "node backend/scripts/split-invoices.js",
    "import-invoices": "node backend/scripts/import-invoices.js",
    "clear-db": "node backend/scripts/clear-database.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "pdf-lib": "^1.17.1",
    "pdf-parse": "^1.1.1",
    "sql.js": "^1.10.2",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

#### `.env` (3 lines)
```
PORT=3001
NODE_ENV=development
```

#### `.gitignore`
Excludes from git:
- `node_modules/` - Dependencies
- `*.db`, `*.sqlite` - Database files
- `.env` - Environment variables
- `logs/`, `*.log` - Log files
- `.vscode/`, `.idea/` - IDE files
- `dist/`, `build/` - Build outputs

---

## 🛠️ Utility Scripts

### Data Import Scripts

#### `backend/scripts/import-invoices.js`
- Main invoice import script
- Extracts text from PDF
- Parses customer & invoice details
- Extracts line items with amounts
- Inserts into database

#### `backend/scripts/split-invoices.js`
- Split multi-page PDF into individuals
- Each invoice → separate PDF file
- Stores in `backend/invoices/`
- Creates invoice-1.pdf, invoice-2.pdf, etc.

#### Batch Import Scripts
- `import-first-10.js` - Invoices 1-10
- `import-invoices-11-20.js` - Invoices 11-20
- `import-invoices-21-29.js` - Invoices 21-29
- `import-invoice-030.js` - Invoice 30
- `import-invoices-031-051.js` - Invoices 31-51

### Verification & Analysis Scripts
- `verify-import.js` - Check import completion
- `final-verification-report.js` - Generate verification report
- `analyze-first-10.js` - Analyze first 10 invoices
- `check-items.js` - Verify item extraction
- `debug-item-extraction.js` - Debug item parsing
- `show-items.js` - Display all items

### Update Scripts
- `update-hsn-codes.js` - Update HSN codes
- `update-invoice-dates.js` - Correct dates
- `update-customer-details.js` - Update customer info
- `update-invoices-030-051.js` - Batch update

### Database Utilities
- `clear-database.js` - Reset database
- `view-database.js` - View database contents
- `check-current-dates.js` - Verify dates

### Testing Scripts
- `test-pdf-extraction.js` - Test PDF parsing
- `test-multiple-pdfs.js` - Test batch processing

---

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.2 | Web server framework |
| cors | ^2.8.5 | Cross-origin request handling |
| dotenv | ^16.3.1 | Environment variable loading |
| sql.js | ^1.10.2 | SQLite database in JavaScript |
| pdf-parse | ^1.1.1 | Extract text from PDFs |
| pdf-lib | ^1.17.1 | PDF manipulation/creation |
| uuid | ^9.0.0 | Generate unique IDs |
| nodemon | ^3.0.2 | Auto-restart on file changes (dev) |

---

## 🚀 Running the Application

### Prerequisites
- Node.js v14+
- npm

### Installation
```bash
cd "d:/Projects/RCP ENGINNERING"
npm install
```

### Development
```bash
# Terminal 1: Start backend server
npm run dev          # Auto-reloads on changes

# Terminal 2: View logs (optional)
tail -f logs/app.log
```

### Production
```bash
npm start            # Start server on port from .env
```

### Data Operations
```bash
# Clear all data
npm run clear-db

# Import invoices from PDF
npm run import-invoices

# Split PDF into individual files
npm run split-invoices
```

### Access Application
Open browser: **http://localhost:3001**

---

## 📝 Workflow Examples

### Creating an Invoice
```javascript
POST http://localhost:3001/api/invoices
{
  "invoice_no": "052",
  "date": "25-03-2026",
  "customer_id": 1,
  "items": [
    {
      "description": "Engineering Services",
      "hsn_code": "9989",
      "qty": 10,
      "rate": 1000
    }
  ],
  "notes": "Monthly services"
}
```

### Creating a Customer
```javascript
POST http://localhost:3001/api/customers
{
  "name": "Tech Solutions Pvt Ltd",
  "address": "123 Tech Park, Bangalore",
  "gstin": "29AABCT6201D1ZU",
  "phone": "080-xxxx-xxxx",
  "email": "sales@techsol.com"
}
```

### Updating Invoice Status
```javascript
PATCH http://localhost:3001/api/invoices/1/status
{
  "payment_status": "paid"
}
```

### Getting Analytics
```javascript
GET http://localhost:3001/api/invoices/analytics/monthly
```

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| Total Files | 95+ |
| Backend Routes | 2 (invoices, customers) |
| API Endpoints | 15+ |
| Database Tables | 3 |
| Utility Scripts | 25+ |
| Main HTML Size | 72 KB |
| Stylesheets | 176 lines |
| Backend Code | 500+ lines |
| Invoices in Sample Data | 51 |
| Node Dependencies | 7 |
| Dev Dependencies | 1 |

---

## 🔒 Security Notes

- SQL injection: Uses parameterized queries with `?` placeholders
- CORS: Enabled for all origins (configure in production)
- Database: SQLite in-memory with file persistence
- Environment: Use `.env` for sensitive config
- Validation: Input validation on API endpoints

---

## 🐛 Debugging

### View Database Contents
```bash
node backend/scripts/view-database.js
```

### Check Invoice Extraction
```bash
node backend/scripts/debug-item-extraction.js
```

### Verify Import Status
```bash
node backend/scripts/verify-import.js
```

### Test API
```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/invoices
curl http://localhost:3001/api/customers
```

---

## 📚 Additional Resources

- API Documentation: See this file's API Endpoints section
- Database Schema: SQL CREATE statements above
- Environment Setup: `.env` file
- Dependencies: `package.json`
- Git Configuration: `.gitignore`


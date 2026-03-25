# RCP Invoice Management System - Project Structure

## 📁 Directory Organization

```
RCP ENGINNERING/
├── backend/
│   ├── db/
│   │   └── database.js          # SQLite database initialization & queries
│   ├── routes/
│   │   ├── invoices.js          # Invoice API endpoints
│   │   └── customers.js         # Customer API endpoints
│   ├── scripts/
│   │   ├── import-invoices.js   # Main PDF invoice importer
│   │   ├── clear-database.js    # Database cleanup
│   │   ├── split-invoices.js    # Split PDF into individual invoices
│   │   └── [other utilities]    # Analysis and debugging scripts
│   └── server.js                # Express server entry point
│
├── frontend/
│   ├── components/              # HTML components
│   └── styles/                  # CSS stylesheets
│
├── assets/                      # Static files (images, etc)
│
├── index.html                   # Main HTML file (served from root)
├── dashboard.html               # Dashboard template
├── package.json                 # Node dependencies
├── .env                         # Environment variables
├── .gitignore                   # Git ignore rules
└── TAX INVOICE 1 TO 51.pdf     # Sample invoice PDF
```

## 🚀 Running the Project

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
Check and configure `.env` file:
```
PORT=3001
DATABASE_PATH=./database.db
```

### 3. Start the Backend Server
```bash
npm start
# or with auto-reload during development:
npm run dev
```

The server will start on `http://localhost:3001`

### 4. Available API Endpoints

**Invoices:**
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/:id` - Get specific invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

**Customers:**
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create new customer
- `GET /api/customers/:id` - Get specific customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### 5. Import Data

```bash
# Clear existing data
npm run clear-db

# Import invoices from PDF
npm run import-invoices

# Split multi-page PDF into individual invoices
npm run split-invoices
```

## 📊 Key Files

| File | Purpose |
|------|---------|
| `backend/server.js` | Express app setup and route mounting |
| `backend/db/database.js` | SQLite initialization and database operations |
| `backend/routes/invoices.js` | Invoice CRUD operations |
| `backend/routes/customers.js` | Customer CRUD operations |
| `index.html` | Frontend UI (served as static file) |

## 🛠️ Dependencies

- **express** - Web server framework
- **cors** - Cross-origin request handling
- **dotenv** - Environment configuration
- **sql.js** - SQLite database in JavaScript
- **pdf-parse** - PDF text extraction
- **pdf-lib** - PDF manipulation
- **uuid** - Unique ID generation
- **nodemon** (dev) - Auto-restart on file changes

## 📝 Development Workflow

1. Make changes to backend files in `backend/`
2. Frontend changes in `frontend/` or `index.html`
3. Run with `npm run dev` for auto-reload
4. Test API endpoints using browser or Postman
5. Import test data using scripts as needed

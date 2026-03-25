const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { initializeDatabase, insert, getOne, getAll, saveDatabase } = require('../db/database');

// Configuration
const INVOICES_DIR = path.join(__dirname, '../invoices');
const SKIP_INVOICES = [14, 16];

/**
 * Extract text from PDF file
 */
async function extractTextFromPdf(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdf(dataBuffer);
  return data.text;
}

/**
 * Parse invoice number from text
 */
function parseInvoiceNumber(text) {
  // Look for patterns like "TAX INVOICE" followed by number
  const match = text.match(/TAX\s+INVOICE[:\s]*(\d+)/i) ||
                text.match(/INVOICE\s+(?:NO|NUMBER)[:\s#]*(\d+)/i) ||
                text.match(/Invoice[:\s#]*(\d+)/i);

  if (match) {
    return match[1].padStart(3, '0');
  }
  return null;
}

/**
 * Parse date from text
 */
function parseDate(text) {
  // Look for date in format DD-MM-YYYY or DD/MM/YYYY
  const match = text.match(/Date[:\s]*(\d{2})[-\/](\d{2})[-\/](\d{4})/i);

  if (match) {
    const [, day, month, year] = match;
    // Convert to YYYY-MM-DD format for database
    return `${year}-${month}-${day}`;
  }
  return null;
}

/**
 * Parse customer information from text
 */
function parseCustomer(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  let customerInfo = {
    name: '',
    address: '',
    gstin: ''
  };

  // Find customer GSTIN (may have spaces between characters like "3 3 B Q Q P S 9 2 3 6 R 1 Z N")
  const gstinMatch = text.match(/GSTIN:\s*([A-Z0-9\s]{15,30})/i);
  if (gstinMatch) {
    // Remove all spaces to get clean GSTIN
    customerInfo.gstin = gstinMatch[1].replace(/\s+/g, '');
  }

  // Find customer name after "Bill To:"
  const billToMatch = text.match(/Bill\s+To:\s+([A-Z][A-Z\s&.,\-()]+?)(?:\s{2,}|DATE:|INVOICE)/i);
  if (billToMatch) {
    customerInfo.name = billToMatch[1].trim();
  }

  // Extract address after "Address:"
  const addressMatch = text.match(/Address:\s+([\s\S]+?)(?=GSTIN:|Bank Details|Terms)/i);
  if (addressMatch) {
    let addressText = addressMatch[1].trim();
    // Clean up address - replace multiple newlines with comma
    addressText = addressText
      .replace(/\s*\n\s*/g, ', ')
      .replace(/,\s*,+/g, ',')
      .replace(/,\s*$/, '')
      .substring(0, 200);
    customerInfo.address = addressText;
  }

  return customerInfo;
}

/**
 * Parse invoice items from text
 */
function parseItems(text) {
  const items = [];

  // Try to extract the items section - between the table header and "Total"
  const itemsSectionMatch = text.match(/S\.No\s+Description[\s\S]+?(?=Total\s+₹|Subtotal|Grand Total)/i);

  if (!itemsSectionMatch) {
    return items;
  }

  const itemsText = itemsSectionMatch[0];
  const lines = itemsText.split('\n').map(line => line.trim()).filter(line => line);

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Check if this line starts with a serial number
    const serialMatch = line.match(/^(\d+)\s+(.*)$/);

    if (serialMatch) {
      const [, serialNo, restOfLine] = serialMatch;

      // Collect this lineand potentially next few lines until we find complete item data
      let combinedLines = [restOfLine];
      let lookAhead = 1;

      // Look at next lines (up to 5 lines) to find HSN code and complete item data
      while (lookAhead <= 5 && (i + lookAhead) < lines.length) {
        const nextLine = lines[i + lookAhead];

        // Stop if we hit another serial number
        if (/^\d+\s+/.test(nextLine)) {
          break;
        }

        combinedLines.push(nextLine);
        lookAhead++;
      }

      // Join all lines with space and try to match complete item pattern
      const combinedText = combinedLines.join(' ');

      // Try to extract: Description HSN Qty Rate ₹ Amount
      const itemMatch = combinedText.match(/^(.+?)\s+(\d{4,8})\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(?:₹|Rs\.?)?\s*(\d+(?:\.\d+)?)\s*$/);

      if (itemMatch) {
        const [, description, hsn, qty, rate, amount] = itemMatch;
        items.push({
          description: description.trim().replace(/\s+/g, ' '), // Normalize spaces
          hsn_code: hsn,
          qty: parseFloat(qty),
          rate: parseFloat(rate),
          amount: parseFloat(amount)
        });

        // Move past all the lines we just processed
        i += lookAhead;
      } else {
        // Couldn't parse this item, move to next line
        i++;
      }
    } else {
      i++;
    }
  }

  return items;
}

/**
 * Parse totals from text
 */
function parseTotals(text) {
  const totals = {
    subtotal: 0,
    sgst: 0,
    cgst: 0,
    grand_total: 0
  };

  // Look for subtotal - "Subtotal  ₹  19300"
  const subtotalMatch = text.match(/Subtotal\s+(?:₹|Rs\.?)?\s*([\d,]+(?:\.\d{2})?)/i);
  if (subtotalMatch) {
    totals.subtotal = parseFloat(subtotalMatch[1].replace(/,/g, ''));
  }

  // Look for SGST - "Add : SGST @ 9%  ₹  1737"
  const sgstMatch = text.match(/SGST\s*@\s*[\d.]+%\s+(?:₹|Rs\.?)?\s*([\d,]+(?:\.\d{2})?)/i);
  if (sgstMatch) {
    totals.sgst = parseFloat(sgstMatch[1].replace(/,/g, ''));
  }

  // Look for CGST - "Add : CGST @ 9%  ₹  1737"
  const cgstMatch = text.match(/CGST\s*@\s*[\d.]+%\s+(?:₹|Rs\.?)?\s*([\d,]+(?:\.\d{2})?)/i);
  if (cgstMatch) {
    totals.cgst = parseFloat(cgstMatch[1].replace(/,/g, ''));
  }

  // Look for grand total - "Grand Total  ₹  22774"
  const grandTotalMatch = text.match(/Grand\s+Total\s+(?:₹|Rs\.?)?\s*([\d,]+(?:\.\d{2})?)/i);
  if (grandTotalMatch) {
    totals.grand_total = parseFloat(grandTotalMatch[1].replace(/,/g, ''));
  }

  // If grand total not found, calculate it
  if (totals.grand_total === 0 && totals.subtotal > 0) {
    totals.grand_total = totals.subtotal + totals.sgst + totals.cgst;
  }

  return totals;
}

/**
 * Find or create customer
 */
function findOrCreateCustomer(customerInfo) {
  // Try to find existing customer by name
  const existing = getOne(
    'SELECT * FROM customers WHERE LOWER(name) = LOWER(?)',
    [customerInfo.name]
  );

  if (existing) {
    console.log(`    ✓ Found existing customer: ${customerInfo.name}`);
    return existing.id;
  }

  // Create new customer
  const customerId = insert(
    `INSERT INTO customers (name, address, gstin) VALUES (?, ?, ?)`,
    [customerInfo.name, customerInfo.address, customerInfo.gstin]
  );

  console.log(`    ✓ Created new customer: ${customerInfo.name}`);
  return customerId;
}

/**
 * Import a single invoice
 */
async function importInvoice(pdfPath, invoiceNumber) {
  console.log(`\n  Processing Invoice ${invoiceNumber}...`);

  try {
    // Extract text from PDF
    const text = await extractTextFromPdf(pdfPath);

    // Parse invoice data
    const invoiceNo = parseInvoiceNumber(text) || invoiceNumber.toString().padStart(3, '0');
    const date = parseDate(text) || new Date().toISOString().split('T')[0];
    const customerInfo = parseCustomer(text);
    const items = parseItems(text);
    const totals = parseTotals(text);

    console.log(`    Invoice No: ${invoiceNo}`);
    console.log(`    Date: ${date}`);
    console.log(`    Customer: ${customerInfo.name}`);
    console.log(`    Items: ${items.length}`);
    console.log(`    Grand Total: ₹${totals.grand_total}`);

    // Validate essential data
    if (!customerInfo.name) {
      console.log(`    ✗ Warning: Could not extract customer name, using default`);
      customerInfo.name = `Customer ${invoiceNo}`;
    }

    if (items.length === 0) {
      console.log(`    ✗ Warning: No items found in invoice`);
    }

    // Check if invoice already exists
    const existingInvoice = getOne('SELECT * FROM invoices WHERE invoice_no = ?', [invoiceNo]);
    if (existingInvoice) {
      console.log(`    ⊘ Invoice ${invoiceNo} already exists in database, skipping`);
      return { success: true, skipped: true };
    }

    // Find or create customer
    const customerId = findOrCreateCustomer(customerInfo);

    // Insert invoice
    const invoiceId = insert(
      `INSERT INTO invoices (invoice_no, date, customer_id, subtotal, sgst, cgst, grand_total, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [invoiceNo, date, customerId, totals.subtotal, totals.sgst, totals.cgst, totals.grand_total]
    );

    console.log(`    ✓ Created invoice record (ID: ${invoiceId})`);

    // Insert invoice items
    for (const item of items) {
      insert(
        `INSERT INTO invoice_items (invoice_id, description, hsn_code, qty, rate, amount)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [invoiceId, item.description, item.hsn_code, item.qty, item.rate, item.amount]
      );
    }

    if (items.length > 0) {
      console.log(`    ✓ Created ${items.length} invoice items`);
    }

    console.log(`    ✓ Invoice ${invoiceNo} imported successfully`);

    return { success: true, invoiceNo, invoiceId };

  } catch (error) {
    console.error(`    ✗ Error processing invoice ${invoiceNumber}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main import function
 */
async function importAllInvoices() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  INVOICE DATA IMPORT FROM PDFs');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Initialize database
  await initializeDatabase();

  // Get list of PDF files
  const files = fs.readdirSync(INVOICES_DIR)
    .filter(file => file.endsWith('.pdf') && file.startsWith('invoice-'))
    .sort();

  console.log(`Found ${files.length} invoice PDFs\n`);

  let stats = {
    total: 0,
    processed: 0,
    skipped: 0,
    errors: 0
  };

  const startTime = Date.now();

  // Process each invoice
  for (const file of files) {
    stats.total++;

    // Extract invoice number from filename
    const match = file.match(/invoice-(\d+)\.pdf/);
    if (!match) continue;

    const invoiceNumber = parseInt(match[1]);

    // Check if should skip
    if (SKIP_INVOICES.includes(invoiceNumber)) {
      console.log(`\n  Invoice ${invoiceNumber}... ⊘ Skipped (in skip list)`);
      stats.skipped++;
      continue;
    }

    const pdfPath = path.join(INVOICES_DIR, file);
    const result = await importInvoice(pdfPath, invoiceNumber);

    if (result.success) {
      if (result.skipped) {
        stats.skipped++;
      } else {
        stats.processed++;
      }
    } else {
      stats.errors++;
    }

    // Small delay to avoid overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Print summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  IMPORT SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Total PDFs found:       ${stats.total}`);
  console.log(`  Successfully imported:  ${stats.processed}`);
  console.log(`  Skipped:                ${stats.skipped}`);
  console.log(`  Errors:                 ${stats.errors}`);
  console.log(`  Duration:               ${duration}s`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Show database statistics
  const invoiceCount = getAll('SELECT COUNT(*) as count FROM invoices')[0].count;
  const customerCount = getAll('SELECT COUNT(*) as count FROM customers')[0].count;
  const itemCount = getAll('SELECT COUNT(*) as count FROM invoice_items')[0].count;

  console.log('  DATABASE STATISTICS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Total Invoices:         ${invoiceCount}`);
  console.log(`  Total Customers:        ${customerCount}`);
  console.log(`  Total Invoice Items:    ${itemCount}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('✓ Import completed successfully!\n');
}

// Run the import
importAllInvoices()
  .catch(error => {
    console.error('\n✗ Fatal error during import:');
    console.error(`  ${error.message}\n`);
    if (error.stack) {
      console.error('Stack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  });

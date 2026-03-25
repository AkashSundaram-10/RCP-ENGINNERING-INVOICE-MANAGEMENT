const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

// Configuration
const SOURCE_PDF = path.join(__dirname, '../../TAX INVOICE 1 TO 51.pdf');
const OUTPUT_DIR = path.join(__dirname, '../invoices');
const SKIP_INVOICES = [14, 16]; // Invoices to skip
const TOTAL_INVOICES = 51;

/**
 * Ensure output directory exists
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✓ Created output directory: ${dirPath}`);
  }
}

/**
 * Validate source PDF file exists
 */
function validateSourceFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Source PDF not found: ${filePath}`);
  }
  console.log(`✓ Source PDF found: ${filePath}`);
}

/**
 * Format bytes to readable file size
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Main function to split PDF by pages
 */
async function splitPdfByPage() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  PDF INVOICE SPLITTER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Validate source file
  validateSourceFile(SOURCE_PDF);

  // Ensure output directory exists
  ensureDirectoryExists(OUTPUT_DIR);

  console.log(`✓ Output directory: ${OUTPUT_DIR}`);
  console.log(`✓ Invoices to skip: ${SKIP_INVOICES.join(', ')}\n`);

  // Load the source PDF
  console.log('Loading source PDF...');
  const pdfBytes = fs.readFileSync(SOURCE_PDF);
  const sourcePdf = await PDFDocument.load(pdfBytes);
  const pageCount = sourcePdf.getPageCount();

  console.log(`✓ Source PDF loaded successfully`);
  console.log(`✓ Total pages: ${pageCount}\n`);

  // Verify page count matches expected
  if (pageCount !== TOTAL_INVOICES) {
    console.warn(`⚠ Warning: Expected ${TOTAL_INVOICES} pages but found ${pageCount} pages\n`);
  }

  // Statistics
  let processedCount = 0;
  let skippedCount = 0;
  const startTime = Date.now();

  console.log('Processing invoices...\n');

  // Split each page into separate PDF
  for (let invoiceNumber = 1; invoiceNumber <= TOTAL_INVOICES; invoiceNumber++) {
    // Check if this invoice should be skipped
    if (SKIP_INVOICES.includes(invoiceNumber)) {
      console.log(`  Invoice ${invoiceNumber.toString().padStart(2, ' ')}... ⊘ Skipped (as requested)`);
      skippedCount++;
      continue;
    }

    try {
      // Create a new PDF document
      const newPdf = await PDFDocument.create();

      // Copy the page from source PDF (page index is 0-based)
      const pageIndex = invoiceNumber - 1;

      // Check if page exists
      if (pageIndex >= pageCount) {
        console.log(`  Invoice ${invoiceNumber.toString().padStart(2, ' ')}... ✗ Page not found in source PDF`);
        continue;
      }

      const [copiedPage] = await newPdf.copyPages(sourcePdf, [pageIndex]);
      newPdf.addPage(copiedPage);

      // Save the new PDF
      const outputFileName = `invoice-${invoiceNumber}.pdf`;
      const outputPath = path.join(OUTPUT_DIR, outputFileName);
      const pdfBytes = await newPdf.save();
      fs.writeFileSync(outputPath, pdfBytes);

      const fileSize = formatFileSize(pdfBytes.length);
      console.log(`  Invoice ${invoiceNumber.toString().padStart(2, ' ')}... ✓ Created ${outputFileName} (${fileSize})`);
      processedCount++;
    } catch (error) {
      console.error(`  Invoice ${invoiceNumber.toString().padStart(2, ' ')}... ✗ Error: ${error.message}`);
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Print summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Total invoices:     ${TOTAL_INVOICES}`);
  console.log(`  Processed:          ${processedCount}`);
  console.log(`  Skipped:            ${skippedCount} (invoices ${SKIP_INVOICES.join(', ')})`);
  console.log(`  Duration:           ${duration}s`);
  console.log(`  Output directory:   ${OUTPUT_DIR}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✓ PDF splitting completed successfully!\n');
}

// Run the script
splitPdfByPage()
  .catch(error => {
    console.error('\n✗ Error during PDF splitting:');
    console.error(`  ${error.message}\n`);

    if (error.stack) {
      console.error('Stack trace:');
      console.error(error.stack);
    }

    process.exit(1);
  });

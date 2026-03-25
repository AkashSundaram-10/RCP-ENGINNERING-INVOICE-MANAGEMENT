const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

// Test PDF parsing
async function testPdfExtraction() {
  const pdfPath = path.join(__dirname, '../invoices/invoice-1.pdf');
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdf(dataBuffer);

  console.log('====== EXTRACTED TEXT FROM invoice-1.pdf ======');
  console.log(data.text);
  console.log('====== END OF TEXT ======');
  console.log(`\nTotal pages: ${data.numpages}`);
  console.log(`Total characters: ${data.text.length}`);
}

testPdfExtraction().catch(console.error);

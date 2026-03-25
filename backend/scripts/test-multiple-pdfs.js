const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

// Test extraction from multiple PDFs
async function testMultiplePdfs() {
  const testFiles = ['invoice-1.pdf', 'invoice-2.pdf', 'invoice-5.pdf', 'invoice-10.pdf'];

  for (const file of testFiles) {
    const pdfPath = path.join(__dirname, '../invoices', file);
    if (!fs.existsSync(pdfPath)) {
      console.log(`\n${file} not found, skipping...`);
      continue;
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(`FILE: ${file}`);
    console.log('='.repeat(70));

    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    const lines = data.text.split('\n').map(l => l.trim()).filter(l => l);

    // Find lines that start with digits (potential item lines)
    console.log('\nLines starting with digit 1-9:');
    lines.forEach((line, idx) => {
      if (/^[1-9]\s/.test(line)) {
        console.log(`  ${line}`);
      }
    });
  }
}

testMultiplePdfs().catch(console.error);

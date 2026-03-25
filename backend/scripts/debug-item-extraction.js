const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

async function debugItemExtraction() {
  const pdfPath = path.join(__dirname, '../invoices/invoice-2.pdf');
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdf(dataBuffer);
  const text = data.text;

  console.log('='.repeat(70));
  console.log('FULL TEXT');
  console.log('='.repeat(70));
  console.log(text);
  console.log('\n' + '='.repeat(70));

  // Try to extract items section
  const itemsSectionMatch = text.match(/S\.No\s+Description[\s\S]+?(?=Total\s+₹|Subtotal|Grand Total)/i);

  if (itemsSectionMatch) {
    console.log('ITEMS SECTION FOUND:');
    console.log('='.repeat(70));
    console.log(itemsSectionMatch[0]);
    console.log('='.repeat(70));
  } else {
    console.log('NO ITEMS SECTION FOUND!');
  }
}

debugItemExtraction().catch(console.error);

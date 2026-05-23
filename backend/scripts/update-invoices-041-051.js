const API_URL = 'http://localhost:3001/api';

const invoicesData = {
  '041': {
    items: [
      { description: 'Orfice block1', hsn_code: '998873', qty: 50, rate: 50 },
      { description: 'SAFETY VALVE GUARD', hsn_code: '998898', qty: 200, rate: 18 }
    ]
  },
  '042': {
    items: [
      { description: 'OIL NOZZLE ROD FOR DRILLING', hsn_code: '998873', qty: 36, rate: 50 },
      { description: 'SAFETY VALVE GUARD', hsn_code: '998898', qty: 40, rate: 18 }
    ]
  },
  '043': {
    items: [
      { description: 'MAHOGANY WOOD SAWN UNSIZE AND REAPERS', hsn_code: '4407', qty: 4.1, rate: 10500 }
    ]
  },
  '044': {
    items: [
      { description: 'SUPPORT ACTUATOR FOR DRILLING', hsn_code: '998873', qty: 500, rate: 4.5 },
      { description: 'SAFETY VALVE GUARD F5 P 50HZ', hsn_code: '998898', qty: 20, rate: 28 },
      { description: 'MOTOR COUPLING U21-15S SS316', hsn_code: '998898', qty: 86, rate: 30 },
      { description: 'HEAD RING', hsn_code: '998898', qty: 55, rate: 110 },
      { description: 'BEARING SPACER E022 MS', hsn_code: '998898', qty: 24, rate: 80 }
    ]
  },
  '045': {
    items: [
      { description: 'PCD HOLES', hsn_code: '998873', qty: 1, rate: 200 },
      { description: 'BIG PADDI', hsn_code: '998873', qty: 14, rate: 200 },
      { description: 'SMALL PADDI WITH WATERSLOT', hsn_code: '998873', qty: 2, rate: 150 },
      { description: 'SMALL PADDI', hsn_code: '998873', qty: 5, rate: 80 },
      { description: 'ROUGH TAPPER LABOUR', hsn_code: '998873', qty: 1, rate: 1500 },
      { description: 'SMALL PADDI', hsn_code: '998873', qty: 43, rate: 60 }
    ]
  },
  '046': {
    items: [
      { description: 'SUPPORT ACTUATOR IV 159', hsn_code: '998873', qty: 950, rate: 4.5 },
      { description: 'SHAFT CONNECTOR', hsn_code: '998898', qty: 510, rate: 23 }
    ]
  },
  '047': {
    items: [
      { description: 'SUPPORT ACTUATOR IV 159', hsn_code: '998873', qty: 425, rate: 4.5 },
      { description: 'SAFETY VALVE GUARD', hsn_code: '998898', qty: 192, rate: 25 }
    ]
  },
  '048': {
    items: [
      { description: 'DRAIN SHAFT HOUSING', hsn_code: '998873', qty: 100, rate: 15 },
      { description: 'GEAR ABB', hsn_code: '998898', qty: 293, rate: 35 },
      { description: 'SHAFT CONNECTOR', hsn_code: '998898', qty: 100, rate: 23 },
      { description: 'CLAMP RING', hsn_code: '998898', qty: 74, rate: 45 }
    ]
  },
  '049': {
    items: [
      { description: 'WIRE ROLLING MACHINE', hsn_code: '8463', qty: 1, rate: 25000 }
    ]
  },
  '050': {
    items: [
      { description: 'OD MACHINE SETTING LABOUR', hsn_code: '998873', qty: 1, rate: 10000 },
      { description: 'ROUGH TAPPER WORK', hsn_code: '998873', qty: 1, rate: 2100 },
      { description: 'SPINDLE LABOUR', hsn_code: '998873', qty: 1, rate: 500 }
    ]
  },
  '051': {
    items: [
      { description: 'SUPPORT ACTUATOR IV 159', hsn_code: '998873', qty: 740, rate: 4.5 },
      { description: 'SUPPORT ACTUATOR', hsn_code: '998898', qty: 210, rate: 4.5 },
      { description: 'SHAFT CONNECTOR', hsn_code: '998898', qty: 140, rate: 23 },
      { description: 'DISCHARGE FLANGE', hsn_code: '998898', qty: 24, rate: 190 }
    ]
  }
};

async function updateInvoice(invoiceNo, items) {
  try {
    // Get all invoices
    const response = await fetch(`${API_URL}/invoices`);
    const invoices = await response.json();
    
    // Find the invoice by invoice_no
    const invoice = invoices.find(inv => inv.invoice_no === invoiceNo);
    
    if (!invoice) {
      console.log(`❌ Invoice ${invoiceNo} not found`);
      return;
    }

    // Prepare update data
    const updateData = {
      date: invoice.date,
      customer_id: invoice.customer_id,
      items: items,
      notes: invoice.notes || '',
      payment_status: invoice.payment_status || 'pending'
    };

    // Update the invoice
    const updateResponse = await fetch(`${API_URL}/invoices/${invoice.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (updateResponse.ok) {
      // Calculate totals for display
      let subtotal = 0;
      items.forEach(item => {
        subtotal += item.qty * item.rate;
      });
      const sgst = subtotal * 0.09;
      const cgst = subtotal * 0.09;
      const grandTotal = subtotal + sgst + cgst;

      console.log(`✅ Invoice ${invoiceNo} updated successfully`);
      console.log(`   Subtotal: ₹${subtotal.toFixed(2)}, SGST: ₹${sgst.toFixed(2)}, CGST: ₹${cgst.toFixed(2)}, Grand Total: ₹${grandTotal.toFixed(2)}`);
    } else {
      const error = await updateResponse.json();
      console.log(`❌ Failed to update invoice ${invoiceNo}:`, error);
    }
  } catch (error) {
    console.log(`❌ Error updating invoice ${invoiceNo}:`, error.message);
  }
}

async function main() {
  console.log('🔄 Starting invoice updates (041-051)...\n');
  
  for (const [invoiceNo, data] of Object.entries(invoicesData)) {
    await updateInvoice(invoiceNo, data.items);
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n✨ All invoices updated successfully!');
}

main();

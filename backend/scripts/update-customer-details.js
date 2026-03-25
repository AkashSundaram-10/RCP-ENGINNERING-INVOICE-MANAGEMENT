const { initializeDatabase, getDb, saveDatabase } = require('../db/database');

async function updateCustomerDetails() {
  try {
    await initializeDatabase();
    const db = getDb();

    console.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
    console.log('║                   UPDATING CUSTOMER DETAILS                         ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

    const customersToUpdate = [
      {
        name: 'ARM AGENCIES',
        address: 'No. 546/2, Subbammal Nagar, Rajiv Gandhi Salai, Maniyakaranpalayam, Coimbatore – 641006',
        gstin: '33NRFPS0721D1ZX'
      },
      {
        name: 'K.S UNION',
        address: 'No. 1858/2, BKS Compound, BM Road, Yarabb Nagar, Division DGSTO-2, Channapatna, Ramanagara, Karnataka – 562160',
        gstin: '29GXZPS3735Q1ZU'
      },
      {
        name: 'GURU DHIYA FURNITURE',
        address: 'SF No:57, Rottikaarar Thottam, Edayarpalayam Road, Vadavalli, Coimbatore – 641041',
        gstin: '33HKBPK4416C1ZN'
      },
      {
        name: 'HIMALAYA TIMBERS AND CRAFTS',
        address: 'SF No:57, Rottikaarar Thottam, Edayarpalayam Road, Vadavalli, Coimbatore – 641041',
        gstin: '33HKBPK4416C1ZN'
      }
    ];

    let updatedCount = 0;

    for (const customer of customersToUpdate) {
      console.log(`📝 Updating ${customer.name}...`);

      // Update customer
      db.run(
        `UPDATE customers SET address = ?, gstin = ? WHERE name = ?`,
        [customer.address, customer.gstin, customer.name]
      );

      console.log(`   ✅ Updated with:`);
      console.log(`      Address: ${customer.address}`);
      console.log(`      GSTIN: ${customer.gstin}\n`);
      updatedCount++;
    }

    saveDatabase();

    console.log('╔═══════════════════════════════════════════════════════════════════════╗');
    console.log('║                     UPDATE COMPLETE                                  ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

    console.log(`✅ Updated ${updatedCount} customers\n`);

    // Display all customers with their details
    const allCustomers = db.exec(`
      SELECT id, name, address, gstin FROM customers ORDER BY name
    `);

    if (allCustomers.length > 0) {
      console.log('📋 All Customers in Database:\n');
      allCustomers[0].values.forEach((row, idx) => {
        const [id, name, address, gstin] = row;
        console.log(`${idx + 1}. ${name}`);
        console.log(`   GSTIN: ${gstin || 'Not Set'}`);
        console.log(`   Address: ${(address || 'Not Set').substring(0, 60)}...`);
        console.log('');
      });
    }

    console.log('✅ All customer details have been updated successfully!');
    console.log('🌐 Refresh your browser at http://localhost:3000 to see the updates.\n');

  } catch (error) {
    console.error('❌ Error updating customers:', error);
    process.exit(1);
  }
}

updateCustomerDetails();

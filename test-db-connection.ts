import 'dotenv/config';
import { db } from './server/db';
import { leads, users, branches, vehicleTypes } from './shared/schema';

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);

    // Test leads
    console.log('\n=== LEADS DATA ===');
    const allLeads = await db.select().from(leads);
    console.log(`Found ${allLeads.length} leads:`);
    allLeads.forEach(lead => {
      console.log(`- ${lead.fullName} (${lead.email}) - Status: ${lead.status}`);
    });

    // Test users
    console.log('\n=== USERS DATA ===');
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users:`);
    allUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
    });

    // Test branches
    console.log('\n=== BRANCHES DATA ===');
    const allBranches = await db.select().from(branches);
    console.log(`Found ${allBranches.length} branches:`);
    allBranches.forEach(branch => {
      console.log(`- ${branch.name} (${branch.email}) - Manager: ${branch.managerName}`);
    });

    // Test vehicle types
    console.log('\n=== VEHICLE TYPES DATA ===');
    const allVehicleTypes = await db.select().from(vehicleTypes);
    console.log(`Found ${allVehicleTypes.length} vehicle types:`);
    allVehicleTypes.forEach(type => {
      console.log(`- ${type.name}: ${type.description}`);
    });

    console.log('\n✅ Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
  }
}

testDatabaseConnection().then(() => {
  console.log('Test finished');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
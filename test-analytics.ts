import 'dotenv/config';
import { storage } from './server/storage';

async function testAnalytics() {
  try {
    console.log('Testing analytics data...');
    
    const analytics = await storage.getAnalytics('6m');
    
    console.log('\n=== STAFF PERFORMANCE DATA ===');
    console.log(`Found ${analytics.staffPerformance?.length || 0} staff members with performance data:`);
    
    if (analytics.staffPerformance && analytics.staffPerformance.length > 0) {
      analytics.staffPerformance.forEach((staff: any, index: number) => {
        console.log(`${index + 1}. ${staff.staffName} (${staff.branchName})`);
        console.log(`   - Captured Leads: ${staff.capturedLeads}`);
        console.log(`   - Contacted Leads: ${staff.contactedLeads}`);
        console.log(`   - Converted Leads: ${staff.convertedLeads}`);
        console.log(`   - Conversion Rate: ${staff.conversionRate}%`);
        console.log(`   - Response Time: ${staff.averageResponseTime}h`);
        console.log(`   - Type: ${staff.type}`);
        console.log('');
      });
    } else {
      console.log('No staff performance data found.');
      console.log('\nChecking staff and branch users...');
      
      // Check if there are any staff users
      const allUsers = await storage.getAllUsers();
      const staffUsers = allUsers.filter(user => user.role === 'staff');
      console.log(`Found ${staffUsers.length} staff users in users table`);
      
      const allBranchUsers = await storage.getAllBranchUsers();
      console.log(`Found ${allBranchUsers.length} branch users`);
      
      // Check leads and their creators
      const { leads } = await storage.getLeads({ limit: 100 });
      console.log(`Found ${leads.length} leads`);
      
      const leadCreators = [...new Set(leads.map(lead => lead.createdBy).filter(Boolean))];
      console.log(`Unique lead creators: ${leadCreators.length}`);
      leadCreators.forEach(creator => {
        const creatorLeads = leads.filter(lead => lead.createdBy === creator);
        console.log(`- ${creator}: ${creatorLeads.length} leads`);
      });
    }
    
    console.log('\n=== OTHER ANALYTICS DATA ===');
    console.log(`Total Leads: ${analytics.overview?.totalLeads || 0}`);
    console.log(`Branch Performance: ${analytics.branchPerformance?.length || 0} branches`);
    console.log(`Vehicle Analysis: ${analytics.vehicleAnalysis?.length || 0} vehicle types`);
    
  } catch (error) {
    console.error('Error testing analytics:', error);
  }
}

testAnalytics().then(() => {
  console.log('Analytics test completed');
  process.exit(0);
}).catch(error => {
  console.error('Analytics test failed:', error);
  process.exit(1);
});
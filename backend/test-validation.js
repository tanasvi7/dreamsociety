// Test file to verify validation system
const { User } = require('./models');

async function testValidation() {
  try {
    console.log('Testing validation system...');
    
    // Test 1: Check if email normalization works
    const testEmail1 = 'Test@Example.COM';
    const testEmail2 = 'test@example.com';
    
    console.log('Test 1: Email normalization');
    console.log('Original email 1:', testEmail1);
    console.log('Original email 2:', testEmail2);
    console.log('Normalized email 1:', testEmail1.toLowerCase().trim());
    console.log('Normalized email 2:', testEmail2.toLowerCase().trim());
    console.log('Are they equal?', testEmail1.toLowerCase().trim() === testEmail2.toLowerCase().trim());
    
    // Test 2: Check if phone normalization works
    const testPhone1 = ' 9876543210 ';
const testPhone2 = '9876543210';
    
    console.log('\nTest 2: Phone normalization');
    console.log('Original phone 1:', `"${testPhone1}"`);
    console.log('Original phone 2:', `"${testPhone2}"`);
    console.log('Normalized phone 1:', `"${testPhone1.trim()}"`);
    console.log('Normalized phone 2:', `"${testPhone2.trim()}"`);
    console.log('Are they equal?', testPhone1.trim() === testPhone2.trim());
    
    // Test 3: Check database queries
    console.log('\nTest 3: Database queries');
    
    // Check for existing users
    const existingUsers = await User.findAll({
      attributes: ['id', 'email', 'phone'],
      limit: 5
    });
    
    console.log('Existing users in database:');
    existingUsers.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Phone: ${user.phone}`);
    });
    
    console.log('\nValidation system test completed!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testValidation();
}

module.exports = { testValidation };

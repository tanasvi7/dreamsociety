const { User } = require('./models');

async function testDatabaseValidation() {
  try {
    console.log('🧪 Testing Database Validation System...\n');
    
    // Test 1: Check if we can connect to the database
    console.log('1️⃣ Testing database connection...');
    const userCount = await User.count();
    console.log(`✅ Database connected successfully. Total users: ${userCount}\n`);
    
    // Test 2: Check existing users in database
    console.log('2️⃣ Checking existing users in database...');
    const existingUsers = await User.findAll({
      attributes: ['id', 'email', 'phone'],
      limit: 5
    });
    
    if (existingUsers.length > 0) {
      console.log('📋 Existing users found:');
      existingUsers.forEach(user => {
        console.log(`   - ID: ${user.id}, Email: ${user.email}, Phone: ${user.phone}`);
      });
    } else {
      console.log('📋 No existing users found in database');
    }
    console.log('');
    
    // Test 3: Test email validation logic
    console.log('3️⃣ Testing email validation logic...');
    const testEmails = [
      'test@example.com',
      'TEST@EXAMPLE.COM',
      ' test@example.com ',
      'nonexistent@example.com'
    ];
    
    for (const testEmail of testEmails) {
      const normalizedEmail = testEmail.toLowerCase().trim();
      console.log(`   Testing email: "${testEmail}" -> normalized: "${normalizedEmail}"`);
      
      const existingUser = await User.findOne({ where: { email: normalizedEmail } });
      if (existingUser) {
        console.log(`   ❌ Email "${normalizedEmail}" EXISTS in database (User ID: ${existingUser.id})`);
      } else {
        console.log(`   ✅ Email "${normalizedEmail}" is AVAILABLE`);
      }
    }
    console.log('');
    
    // Test 4: Test phone validation logic
    console.log('4️⃣ Testing phone validation logic...');
    const testPhones = [
      '9876543210',
      ' 9876543210 ',
      '1234567890',
      'nonexistent-phone'
    ];
    
    for (const testPhone of testPhones) {
      const normalizedPhone = testPhone.trim();
      console.log(`   Testing phone: "${testPhone}" -> normalized: "${normalizedPhone}"`);
      
      const existingUser = await User.findOne({ where: { phone: normalizedPhone } });
      if (existingUser) {
        console.log(`   ❌ Phone "${normalizedPhone}" EXISTS in database (User ID: ${existingUser.id})`);
      } else {
        console.log(`   ✅ Phone "${normalizedPhone}" is AVAILABLE`);
      }
    }
    console.log('');
    
    // Test 5: Test the exact validation logic used in the controller
    console.log('5️⃣ Testing exact controller validation logic...');
    const testEmail = 'test@example.com';
    const testPhone = '9876543210';
    
    const normalizedEmail = testEmail.toLowerCase().trim();
    const normalizedPhone = testPhone.trim();
    
    console.log(`   Input email: "${testEmail}" -> Normalized: "${normalizedEmail}"`);
    console.log(`   Input phone: "${testPhone}" -> Normalized: "${normalizedPhone}"`);
    
    const existingEmail = await User.findOne({ where: { email: normalizedEmail } });
    const existingPhone = await User.findOne({ where: { phone: normalizedPhone } });
    
    console.log(`   Email check result: ${existingEmail ? 'EXISTS' : 'AVAILABLE'}`);
    console.log(`   Phone check result: ${existingPhone ? 'EXISTS' : 'AVAILABLE'}`);
    
    if (existingEmail && existingPhone) {
      console.log('   ❌ Both email and phone already exist');
    } else if (existingEmail) {
      console.log('   ❌ Email already exists');
    } else if (existingPhone) {
      console.log('   ❌ Phone already exists');
    } else {
      console.log('   ✅ Both email and phone are available');
    }
    
    console.log('\n✅ Database validation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDatabaseValidation();
}

module.exports = { testDatabaseValidation };

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test configuration
const testConfig = {
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
};

async function testSimplifiedRegistration() {
  console.log('🧪 Testing Simplified Registration Process...\n');

  try {
    // Test 1: Check availability endpoint
    console.log('1. Testing availability check...');
    const availabilityResponse = await axios.get(`${BASE_URL}/auth/check-availability?email=test@example.com&phone=+1234567890`, testConfig);
    console.log('✅ Availability check successful:', availabilityResponse.data);

    // Test 2: Register with minimal data
    console.log('\n2. Testing simplified registration...');
    const testUser = {
      full_name: 'Test User',
      email: 'simplifiedtest@example.com',
      phone: '+1234567892',
      password: 'password123', // Simple password
      working_type: 'student'
    };

    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser, testConfig);
    console.log('✅ Registration successful:', registerResponse.data);

    // Test 3: Try to register with same email (should fail)
    console.log('\n3. Testing duplicate email validation...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, testUser, testConfig);
      console.log('❌ Should have failed for duplicate email');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('already registered')) {
        console.log('✅ Duplicate email validation working');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    // Test 4: Try to register with same phone (should fail)
    console.log('\n4. Testing duplicate phone validation...');
    const duplicatePhoneUser = {
      ...testUser,
      email: 'different@example.com'
    };

    try {
      await axios.post(`${BASE_URL}/auth/register`, duplicatePhoneUser, testConfig);
      console.log('❌ Should have failed for duplicate phone');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('already registered')) {
        console.log('✅ Duplicate phone validation working');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    // Test 5: Test with invalid email format
    console.log('\n5. Testing invalid email format...');
    const invalidEmailUser = {
      ...testUser,
      email: 'invalid-email',
      phone: '+1234567893'
    };

    try {
      await axios.post(`${BASE_URL}/auth/register`, invalidEmailUser, testConfig);
      console.log('❌ Should have failed for invalid email');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('valid email')) {
        console.log('✅ Email format validation working');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    // Test 6: Test with missing fields
    console.log('\n6. Testing missing fields validation...');
    const incompleteUser = {
      full_name: 'Test User',
      email: 'incomplete@example.com'
      // Missing phone and password
    };

    try {
      await axios.post(`${BASE_URL}/auth/register`, incompleteUser, testConfig);
      console.log('❌ Should have failed for missing fields');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('required')) {
        console.log('✅ Required fields validation working');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    console.log('\n🎉 Simplified registration tests completed!');
    console.log('\n📝 Summary:');
    console.log('   - Removed complex password validations');
    console.log('   - Removed phone format validations');
    console.log('   - Kept only email/phone availability checks');
    console.log('   - Kept basic email format validation');
    console.log('   - Kept required fields validation');
    console.log('   - OTP flow remains intact');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  testSimplifiedRegistration().catch(console.error);
}

module.exports = { testSimplifiedRegistration };

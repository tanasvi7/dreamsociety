const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test configuration
const testConfig = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};

// Test data
const testUser = {
  full_name: 'Test User',
  email: 'test@example.com',
  phone: '+1234567890',
  password: 'TestPassword123',
  working_type: 'student'
};

// Admin test data
const adminUser = {
  email: 'admin@gmail.com',
  password: 'admin123'
};

async function testAuthEndpoints() {
  console.log('🧪 Testing Authentication Endpoints...\n');

  try {
    // Test 1: Check availability
    console.log('1. Testing availability check...');
    const availabilityResponse = await axios.get(`${BASE_URL}/auth/check-availability?email=${testUser.email}`, testConfig);
    console.log('✅ Availability check successful:', availabilityResponse.data);

    // Test 2: Register user
    console.log('\n2. Testing registration...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser, testConfig);
    console.log('✅ Registration successful:', registerResponse.data);

    // Test 3: Login
    console.log('\n3. Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    }, testConfig);
    console.log('✅ Login successful:', loginResponse.data);
    console.log('👤 User role:', loginResponse.data.user.role);

    // Test 4: Get user info
    console.log('\n4. Testing get user info...');
    const userResponse = await axios.get(`${BASE_URL}/auth/me`, {
      ...testConfig,
      headers: {
        ...testConfig.headers,
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    console.log('✅ Get user info successful:', userResponse.data);

    console.log('\n🎉 All authentication tests passed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

async function testAdminLogin() {
  console.log('\n👑 Testing Admin Login...\n');

  try {
    // Test admin login
    console.log('1. Testing admin login...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, adminUser, testConfig);
    console.log('✅ Admin login successful:', adminLoginResponse.data);
    console.log('👑 Admin role:', adminLoginResponse.data.user.role);
    
    if (adminLoginResponse.data.user.role === 'admin') {
      console.log('✅ Admin role verification successful');
    } else {
      console.log('❌ Admin role verification failed - user is not admin');
    }

    // Test admin user info
    console.log('\n2. Testing admin user info...');
    const adminUserResponse = await axios.get(`${BASE_URL}/auth/me`, {
      ...testConfig,
      headers: {
        ...testConfig.headers,
        'Authorization': `Bearer ${adminLoginResponse.data.token}`
      }
    });
    console.log('✅ Admin user info successful:', adminUserResponse.data);

    console.log('\n🎉 Admin authentication tests passed!');

  } catch (error) {
    console.error('\n❌ Admin test failed:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Test rate limiting
async function testRateLimiting() {
  console.log('\n🧪 Testing Rate Limiting...\n');

  try {
    // Make multiple rapid requests to test rate limiting
    const promises = [];
    for (let i = 0; i < 20; i++) {
      promises.push(
        axios.post(`${BASE_URL}/auth/login`, {
          email: 'test@example.com',
          password: 'wrongpassword'
        }, testConfig).catch(err => err.response)
      );
    }

    const responses = await Promise.all(promises);
    const rateLimited = responses.filter(r => r?.status === 429);
    
    console.log(`Made ${responses.length} requests`);
    console.log(`Rate limited: ${rateLimited.length} requests`);
    
    if (rateLimited.length === 0) {
      console.log('✅ No rate limiting detected - Unlimited requests allowed');
    } else {
      console.log('⚠️ Rate limiting is still active');
    }

  } catch (error) {
    console.error('❌ Rate limiting test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Authentication System Tests\n');
  
  await testAuthEndpoints();
  await testAdminLogin();
  await testRateLimiting();
  
  console.log('\n✨ Tests completed!');
}

// Run if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testAuthEndpoints, testAdminLogin, testRateLimiting };

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test configuration with slow connection simulation
const testConfig = {
  timeout: 30000, // 30 seconds timeout for slow connections
  headers: {
    'Content-Type': 'application/json'
  }
};

// Test data
const testUser = {
  full_name: 'Slow Connection Test User',
  email: 'slowtest@example.com',
  phone: '+1234567891',
  password: 'TestPassword123',
  working_type: 'student'
};

async function testSlowConnectionLogin() {
  console.log('🐌 Testing Login with Slow Connection Simulation...\n');

  try {
    // Simulate multiple rapid requests (like a slow connection would retry)
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(
        axios.post(`${BASE_URL}/auth/login`, {
          email: 'admin@gmail.com',
          password: 'admin123'
        }, testConfig).catch(err => ({
          status: err.response?.status,
          data: err.response?.data,
          error: err.message
        }))
      );
    }

    const responses = await Promise.all(promises);
    const successful = responses.filter(r => r.status === 200);
    const rateLimited = responses.filter(r => r.status === 429);
    const duplicates = responses.filter(r => r.data?.code === 'DUPLICATE_REQUEST');

    console.log(`📊 Results:`);
    console.log(`   Total requests: ${responses.length}`);
    console.log(`   Successful: ${successful.length}`);
    console.log(`   Rate limited: ${rateLimited.length}`);
    console.log(`   Duplicate requests: ${duplicates.length}`);

    if (rateLimited.length === 0) {
      console.log('✅ No rate limiting issues detected');
    } else {
      console.log('⚠️ Some requests were rate limited');
      rateLimited.forEach((r, i) => {
        console.log(`   Rate limited ${i + 1}: ${r.data?.code || 'Unknown'}`);
      });
    }

    if (duplicates.length > 0) {
      console.log('✅ Duplicate request detection working');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testSlowConnectionRegistration() {
  console.log('\n🐌 Testing Registration with Slow Connection Simulation...\n');

  try {
    // Test registration with multiple rapid requests
    const promises = [];
    for (let i = 0; i < 5; i++) {
      const userData = {
        ...testUser,
        email: `slowtest${i}@example.com`,
        phone: `+123456789${i}`
      };
      
      promises.push(
        axios.post(`${BASE_URL}/auth/register`, userData, testConfig).catch(err => ({
          status: err.response?.status,
          data: err.response?.data,
          error: err.message
        }))
      );
    }

    const responses = await Promise.all(promises);
    const successful = responses.filter(r => r.status === 200);
    const rateLimited = responses.filter(r => r.status === 429);
    const duplicates = responses.filter(r => r.data?.code === 'DUPLICATE_REQUEST');

    console.log(`📊 Results:`);
    console.log(`   Total requests: ${responses.length}`);
    console.log(`   Successful: ${successful.length}`);
    console.log(`   Rate limited: ${rateLimited.length}`);
    console.log(`   Duplicate requests: ${duplicates.length}`);

    if (rateLimited.length === 0) {
      console.log('✅ No rate limiting issues detected');
    } else {
      console.log('⚠️ Some requests were rate limited');
    }

    if (duplicates.length > 0) {
      console.log('✅ Duplicate request detection working');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testOTPRateLimit() {
  console.log('\n🐌 Testing OTP Rate Limiting...\n');

  try {
    // Test OTP requests with slow connection simulation
    const promises = [];
    for (let i = 0; i < 8; i++) {
      promises.push(
        axios.post(`${BASE_URL}/auth/forgot-password`, {
          email: 'test@example.com'
        }, testConfig).catch(err => ({
          status: err.response?.status,
          data: err.response?.data,
          error: err.message
        }))
      );
    }

    const responses = await Promise.all(promises);
    const successful = responses.filter(r => r.status === 200);
    const rateLimited = responses.filter(r => r.status === 429);
    const otpRateLimited = responses.filter(r => r.data?.error?.includes('Rate limit exceeded'));

    console.log(`📊 Results:`);
    console.log(`   Total requests: ${responses.length}`);
    console.log(`   Successful: ${successful.length}`);
    console.log(`   Rate limited: ${rateLimited.length}`);
    console.log(`   OTP rate limited: ${otpRateLimited.length}`);

    if (otpRateLimited.length < 3) {
      console.log('✅ OTP rate limiting is more lenient now');
    } else {
      console.log('⚠️ OTP rate limiting is still too strict');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testGlobalRateLimit() {
  console.log('\n🐌 Testing Global Rate Limiting...\n');

  try {
    // Test global rate limiting with various endpoints
    const promises = [];
    const endpoints = [
      '/health',
      '/env-check',
      '/cors-debug'
    ];

    for (let i = 0; i < 20; i++) {
      const endpoint = endpoints[i % endpoints.length];
      promises.push(
        axios.get(`${BASE_URL}${endpoint}`, testConfig).catch(err => ({
          status: err.response?.status,
          data: err.response?.data,
          error: err.message
        }))
      );
    }

    const responses = await Promise.all(promises);
    const successful = responses.filter(r => r.status === 200);
    const rateLimited = responses.filter(r => r.status === 429);

    console.log(`📊 Results:`);
    console.log(`   Total requests: ${responses.length}`);
    console.log(`   Successful: ${successful.length}`);
    console.log(`   Rate limited: ${rateLimited.length}`);

    if (rateLimited.length === 0) {
      console.log('✅ Global rate limiting is more lenient now');
    } else {
      console.log('⚠️ Some requests were still rate limited');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run all tests
async function runSlowConnectionTests() {
  console.log('🚀 Starting Slow Connection Rate Limiting Tests\n');
  console.log('This test simulates slow internet connections with multiple retry attempts\n');
  
  await testSlowConnectionLogin();
  await testSlowConnectionRegistration();
  await testOTPRateLimit();
  await testGlobalRateLimit();
  
  console.log('\n✨ Slow connection tests completed!');
  console.log('\n📝 Summary:');
  console.log('   - Global rate limit increased from 100 to 300 requests per 15 minutes');
  console.log('   - OTP rate limit increased from 5 to 15 requests per hour');
  console.log('   - Auth routes skip global rate limiting to prevent double limiting');
  console.log('   - Request deduplication prevents duplicate requests within 3 seconds');
}

// Run if this file is executed directly
if (require.main === module) {
  runSlowConnectionTests().catch(console.error);
}

module.exports = { 
  testSlowConnectionLogin, 
  testSlowConnectionRegistration, 
  testOTPRateLimit, 
  testGlobalRateLimit 
};

// test-error-handling.js
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test cases for different error scenarios
const testCases = [
  {
    name: 'Test 1: Invalid email format',
    data: { email: 'invalid-email', password: 'password123' },
    expectedStatus: 400,
    expectedError: 'Please enter a valid email address'
  },
  {
    name: 'Test 2: Missing password',
    data: { email: 'test@example.com' },
    expectedStatus: 400,
    expectedError: 'Email and password are required'
  },
  {
    name: 'Test 3: Password too short',
    data: { email: 'test@example.com', password: '123' },
    expectedStatus: 400,
    expectedError: 'Password must be at least 6 characters long'
  },
  {
    name: 'Test 4: Non-existent user',
    data: { email: 'nonexistent@example.com', password: 'password123' },
    expectedStatus: 400,
    expectedError: 'Invalid email or password'
  },
  {
    name: 'Test 5: Valid format but wrong credentials',
    data: { email: 'test@example.com', password: 'wrongpassword' },
    expectedStatus: 400,
    expectedError: 'Invalid email or password'
  }
];

async function runTests() {
  console.log('🧪 Testing Enhanced Error Handling...\n');
  
  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    try {
      console.log(`📋 ${testCase.name}`);
      
      const response = await axios.post(`${BASE_URL}/auth/login`, testCase.data);
      
      // If we get here, the test failed (we expected an error)
      console.log(`❌ FAILED: Expected error but got success`);
      console.log(`   Expected: ${testCase.expectedStatus} - ${testCase.expectedError}`);
      console.log(`   Got: ${response.status} - ${JSON.stringify(response.data)}`);
      
    } catch (error) {
      const status = error.response?.status;
      const errorMessage = error.response?.data?.error;
      
      if (status === testCase.expectedStatus && 
          errorMessage && 
          errorMessage.includes(testCase.expectedError)) {
        console.log(`✅ PASSED: ${status} - ${errorMessage}`);
        passedTests++;
      } else {
        console.log(`❌ FAILED: Status or message mismatch`);
        console.log(`   Expected: ${testCase.expectedStatus} - ${testCase.expectedError}`);
        console.log(`   Got: ${status} - ${errorMessage}`);
      }
    }
    
    console.log(''); // Empty line for readability
  }

  // Test rate limiting
  console.log('📋 Test 6: Rate Limiting (5 attempts)');
  let rateLimitHit = false;
  
  for (let i = 0; i < 6; i++) {
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'password123'
      });
    } catch (error) {
      if (error.response?.status === 429) {
        console.log(`✅ PASSED: Rate limiting working (attempt ${i + 1})`);
        rateLimitHit = true;
        break;
      }
    }
  }
  
  if (rateLimitHit) {
    passedTests++;
  } else {
    console.log(`❌ FAILED: Rate limiting not working`);
  }
  
  totalTests++;

  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Enhanced error handling is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the implementation.');
  }
}

// Test network error simulation
async function testNetworkErrors() {
  console.log('\n🌐 Testing Network Error Handling...\n');
  
  try {
    // Test with invalid URL to simulate network error
    await axios.post('http://invalid-url-that-does-not-exist.com/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
  } catch (error) {
    if (error.code === 'ERR_NETWORK' || error.code === 'ENOTFOUND') {
      console.log('✅ PASSED: Network error handling working');
      console.log(`   Error: ${error.code} - ${error.message}`);
    } else {
      console.log('❌ FAILED: Unexpected error type');
      console.log(`   Error: ${error.code} - ${error.message}`);
    }
  }
}

// Run all tests
async function runAllTests() {
  try {
    await runTests();
    await testNetworkErrors();
  } catch (error) {
    console.error('Test runner error:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runTests, testNetworkErrors }; 
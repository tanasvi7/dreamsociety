const axios = require('axios');

// Test CORS configuration
async function testCORS() {
  const baseURL = 'https://api.dreamssociety.in';
  
  console.log('Testing CORS configuration...\n');
  
  try {
    // Test 1: Health check endpoint
    console.log('1. Testing health check endpoint...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Health check passed:', healthResponse.status);
    
    // Test 2: CORS debug endpoint
    console.log('\n2. Testing CORS debug endpoint...');
    const corsResponse = await axios.get(`${baseURL}/cors-debug`, {
      headers: {
        'Origin': 'https://dreamssociety.in'
      }
    });
    console.log('✅ CORS debug response:', corsResponse.data);
    
    // Test 3: Preflight request simulation
    console.log('\n3. Testing preflight request...');
    const preflightResponse = await axios.options(`${baseURL}/auth/login`, {
      headers: {
        'Origin': 'https://dreamssociety.in',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    console.log('✅ Preflight request passed:', preflightResponse.status);
    console.log('CORS headers:', {
      'Access-Control-Allow-Origin': preflightResponse.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': preflightResponse.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': preflightResponse.headers['access-control-allow-headers']
    });
    
  } catch (error) {
    console.error('❌ CORS test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testCORS();

const axios = require('axios');

// Test backend connectivity and routes
async function testBackendConnectivity() {
  const baseURL = 'https://api.dreamssociety.in';
  
  console.log('🔍 Testing Backend Connectivity and Routes\n');
  console.log('Base URL:', baseURL);
  console.log('='.repeat(50));
  
  try {
    // Test 1: Basic connectivity
    console.log('\n1. Testing basic connectivity...');
    try {
      const healthResponse = await axios.get(`${baseURL}/health`);
      console.log('✅ Backend is accessible');
      console.log('   Status:', healthResponse.status);
      console.log('   Response:', healthResponse.data);
    } catch (error) {
      console.log('❌ Backend is not accessible');
      console.log('   Error:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
      return;
    }
    
    // Test 2: CORS debug endpoint
    console.log('\n2. Testing CORS configuration...');
    try {
      const corsResponse = await axios.get(`${baseURL}/cors-debug`);
      console.log('✅ CORS debug endpoint accessible');
      console.log('   Request Origin:', corsResponse.data.requestOrigin);
      console.log('   Allowed Origins:', corsResponse.data.allowedOrigins);
      console.log('   Is Allowed:', corsResponse.data.isAllowed);
    } catch (error) {
      console.log('❌ CORS debug endpoint failed');
      console.log('   Error:', error.message);
    }
    
    // Test 3: Environment check
    console.log('\n3. Testing environment configuration...');
    try {
      const envResponse = await axios.get(`${baseURL}/env-check`);
      console.log('✅ Environment check accessible');
      console.log('   NODE_ENV:', envResponse.data.environment.NODE_ENV);
      console.log('   CORS_ORIGIN:', envResponse.data.environment.CORS_ORIGIN);
    } catch (error) {
      console.log('❌ Environment check failed');
      console.log('   Error:', error.message);
    }
    
    // Test 4: Bulk upload route (should return 401 without auth)
    console.log('\n4. Testing bulk upload route...');
    try {
      const uploadResponse = await axios.post(`${baseURL}/admin/bulkUpload/upload/users`, {}, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('✅ Bulk upload route accessible (unexpected success)');
      console.log('   Status:', uploadResponse.status);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Bulk upload route exists (401 Unauthorized - expected)');
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data?.message || 'No message');
      } else if (error.response && error.response.status === 404) {
        console.log('❌ Bulk upload route not found (404)');
        console.log('   Expected: /admin/bulkUpload/upload/users');
        console.log('   Error:', error.response.data);
      } else {
        console.log('⚠️  Unexpected response from bulk upload route');
        console.log('   Status:', error.response?.status);
        console.log('   Error:', error.message);
      }
    }
    
    // Test 5: Check all admin routes
    console.log('\n5. Testing admin routes...');
    const adminRoutes = [
      '/admin/bulkUpload/upload/users',
      '/admin/bulkUpload/upload/logs',
      '/admin/bulkUpload/upload',
      '/admin/users',
      '/admin/dashboard'
    ];
    
    for (const route of adminRoutes) {
      try {
        const response = await axios.get(`${baseURL}${route}`);
        console.log(`✅ ${route} - Status: ${response.status}`);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.log(`✅ ${route} - Exists (401 Unauthorized)`);
        } else if (error.response && error.response.status === 404) {
          console.log(`❌ ${route} - Not found (404)`);
        } else {
          console.log(`⚠️  ${route} - Error: ${error.response?.status || error.message}`);
        }
      }
    }
    
    // Test 6: Check if server is running Node.js
    console.log('\n6. Checking server information...');
    try {
      const response = await axios.get(`${baseURL}/health`);
      if (response.data && response.data.environment) {
        console.log('✅ Server is running Node.js');
        console.log('   Database:', response.data.database);
        console.log('   Environment:', response.data.environment.NODE_ENV);
      }
    } catch (error) {
      console.log('❌ Could not get server information');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 Connectivity test completed');
}

// Run the test
testBackendConnectivity();

const axios = require('axios');

// Test bulk upload route
async function testBulkUploadRoute() {
  const baseURL = 'https://api.dreamssociety.in';
  
  console.log('Testing bulk upload route...\n');
  
  try {
    // Test 1: Check if the route exists (should return 401 for unauthorized)
    console.log('1. Testing bulk upload route existence...');
    try {
      const response = await axios.post(`${baseURL}/admin/bulkUpload/upload/users`, {}, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('✅ Route exists and responded:', response.status);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Route exists (401 Unauthorized - expected without token)');
      } else if (error.response && error.response.status === 404) {
        console.log('❌ Route not found (404)');
        console.log('Expected: /admin/bulkUpload/upload/users');
        console.log('Error:', error.response.data);
      } else {
        console.log('⚠️  Unexpected response:', error.response?.status, error.response?.data);
      }
    }
    
    // Test 2: Check bulk upload logs route
    console.log('\n2. Testing bulk upload logs route...');
    try {
      const logsResponse = await axios.get(`${baseURL}/admin/bulkUpload/upload/logs`);
      console.log('✅ Logs route exists and responded:', logsResponse.status);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Logs route exists (401 Unauthorized - expected without token)');
      } else if (error.response && error.response.status === 404) {
        console.log('❌ Logs route not found (404)');
        console.log('Expected: /admin/bulkUpload/upload/logs');
      } else {
        console.log('⚠️  Unexpected response:', error.response?.status, error.response?.data);
      }
    }
    
    // Test 3: Check general upload route
    console.log('\n3. Testing general upload route...');
    try {
      const uploadResponse = await axios.post(`${baseURL}/admin/bulkUpload/upload`, {}, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('✅ General upload route exists and responded:', uploadResponse.status);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ General upload route exists (401 Unauthorized - expected without token)');
      } else if (error.response && error.response.status === 404) {
        console.log('❌ General upload route not found (404)');
        console.log('Expected: /admin/bulkUpload/upload');
      } else {
        console.log('⚠️  Unexpected response:', error.response?.status, error.response?.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testBulkUploadRoute();

// OTP Debug Script
// This script helps debug OTP issues by testing the OTP service directly

const { sendOTP, verifyOTP, resendOTP, getOTPStatus, OTP_CONFIG } = require('./utils/otpService');

async function testOTPFlow() {
  const testEmail = 'test@example.com';
  
  console.log('🧪 Testing OTP Flow...\n');
  
  try {
    // Step 1: Send OTP
    console.log('📧 Step 1: Sending OTP...');
    const sendResult = await sendOTP(testEmail);
    console.log('✅ Send Result:', sendResult);
    
    // Step 2: Check OTP Status
    console.log('\n📊 Step 2: Checking OTP Status...');
    const status = getOTPStatus(testEmail);
    console.log('✅ OTP Status:', status);
    
    // Step 3: Try invalid OTP
    console.log('\n❌ Step 3: Testing invalid OTP...');
    try {
      const invalidResult = await verifyOTP(testEmail, '000000');
      console.log('❌ Invalid OTP Result:', invalidResult);
    } catch (error) {
      console.log('✅ Invalid OTP Error (expected):', error.message);
    }
    
    // Step 4: Check status after invalid attempt
    console.log('\n📊 Step 4: Checking OTP Status after invalid attempt...');
    const statusAfterInvalid = getOTPStatus(testEmail);
    console.log('✅ OTP Status after invalid:', statusAfterInvalid);
    
    // Step 5: Try to get the actual OTP (for testing purposes)
    console.log('\n🔍 Step 5: Getting actual OTP for testing...');
    // Note: In production, you wouldn't do this - it's just for debugging
    const otpStore = require('./utils/otpService').otpStore || new Map();
    const otpData = otpStore.get(testEmail);
    if (otpData) {
      console.log('✅ Actual OTP:', otpData.otp);
      console.log('✅ Attempts:', otpData.attempts);
      console.log('✅ Expires at:', new Date(otpData.expiresAt).toLocaleString());
    }
    
    // Step 6: Test correct OTP
    if (otpData) {
      console.log('\n✅ Step 6: Testing correct OTP...');
      try {
        const correctResult = await verifyOTP(testEmail, otpData.otp);
        console.log('✅ Correct OTP Result:', correctResult);
      } catch (error) {
        console.log('❌ Correct OTP Error:', error.message);
      }
    }
    
    // Step 7: Test resend
    console.log('\n🔄 Step 7: Testing resend OTP...');
    try {
      const resendResult = await resendOTP(testEmail);
      console.log('✅ Resend Result:', resendResult);
    } catch (error) {
      console.log('❌ Resend Error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testMaxAttempts() {
  const testEmail = 'maxattempts@example.com';
  
  console.log('\n🧪 Testing Max Attempts Scenario...\n');
  
  try {
    // Send OTP
    console.log('📧 Sending OTP...');
    await sendOTP(testEmail);
    
    // Try invalid OTP multiple times
    console.log('❌ Trying invalid OTP multiple times...');
    for (let i = 1; i <= OTP_CONFIG.MAX_ATTEMPTS + 1; i++) {
      try {
        const result = await verifyOTP(testEmail, '000000');
        console.log(`Attempt ${i}: ${result.message}`);
      } catch (error) {
        console.log(`Attempt ${i}: ${error.message}`);
        if (error.message.includes('Maximum verification attempts exceeded')) {
          console.log('✅ Max attempts reached as expected');
          break;
        }
      }
    }
    
    // Try to resend after max attempts
    console.log('\n🔄 Testing resend after max attempts...');
    try {
      const resendResult = await resendOTP(testEmail);
      console.log('✅ Resend after max attempts:', resendResult);
    } catch (error) {
      console.log('❌ Resend after max attempts error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Max attempts test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting OTP Debug Tests...\n');
  
  await testOTPFlow();
  await testMaxAttempts();
  
  console.log('\n✅ All tests completed!');
}

// Run if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testOTPFlow, testMaxAttempts };

const nodemailer = require('nodemailer');
require('dotenv').config();

// Test email service configuration
const testEmailService = async () => {
  console.log('🔍 Testing Email Service Configuration...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables Check:');
  console.log('GMAIL_USER:', process.env.GMAIL_USER ? '✅ Set' : '❌ Missing');
  console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✅ Set' : '❌ Missing');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log('');
  
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('❌ Missing required email configuration!');
    console.error('Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.');
    return false;
  }
  
  // Create transporter
  console.log('🔧 Creating Gmail transporter...');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    },
    secure: true,
    port: 465,
    tls: {
      rejectUnauthorized: false
    }
  });
  
  // Test connection
  console.log('🔗 Testing Gmail connection...');
  try {
    await transporter.verify();
    console.log('✅ Gmail connection successful!');
  } catch (error) {
    console.error('❌ Gmail connection failed:', error.message);
    console.error('This could be due to:');
    console.error('1. Invalid Gmail credentials');
    console.error('2. 2FA not enabled on Gmail account');
    console.error('3. App password not generated correctly');
    console.error('4. Gmail account security settings');
    return false;
  }
  
  // Test email sending
  console.log('\n📧 Testing email sending...');
  const testEmail = process.env.TEST_EMAIL || 'test@example.com';
  console.log('Sending test email to:', testEmail);
  
  const mailOptions = {
    from: `"DreamSociety Test" <${process.env.GMAIL_USER}>`,
    to: testEmail,
    subject: 'DreamSociety Email Service Test',
    html: `
      <h2>Email Service Test</h2>
      <p>This is a test email to verify that the DreamSociety email service is working correctly.</p>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
      <hr>
      <p>If you received this email, the email service is working properly!</p>
    `,
    text: `Email Service Test\n\nThis is a test email to verify that the DreamSociety email service is working correctly.\n\nTimestamp: ${new Date().toISOString()}\nEnvironment: ${process.env.NODE_ENV || 'development'}\n\nIf you received this email, the email service is working properly!`
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    return true;
  } catch (error) {
    console.error('❌ Test email sending failed:', error.message);
    console.error('Error details:', error);
    return false;
  }
};

// Test OTP service specifically
const testOTPService = async () => {
  console.log('\n🔐 Testing OTP Service...');
  
  try {
    const { sendOTP } = require('./utils/otpService');
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    
    console.log('Sending test OTP to:', testEmail);
    const result = await sendOTP(testEmail);
    
    console.log('✅ OTP service test successful!');
    console.log('Result:', result);
    return true;
  } catch (error) {
    console.error('❌ OTP service test failed:', error.message);
    return false;
  }
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting Email Service Tests...\n');
  
  const emailTest = await testEmailService();
  const otpTest = await testOTPService();
  
  console.log('\n📊 Test Results:');
  console.log('Email Service:', emailTest ? '✅ PASSED' : '❌ FAILED');
  console.log('OTP Service:', otpTest ? '✅ PASSED' : '❌ FAILED');
  
  if (emailTest && otpTest) {
    console.log('\n🎉 All tests passed! Email service is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the configuration.');
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('1. Ensure GMAIL_USER is your full Gmail address');
    console.log('2. Ensure GMAIL_APP_PASSWORD is a valid app password (not your regular password)');
    console.log('3. Enable 2FA on your Gmail account');
    console.log('4. Generate an app password from Google Account settings');
    console.log('5. Check if your Gmail account allows "less secure app access" (if not using app password)');
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testEmailService, testOTPService, runTests };

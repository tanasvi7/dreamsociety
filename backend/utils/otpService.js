const nodemailer = require('nodemailer');

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map();

// Email transporter configuration using existing Gmail setup
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // Gmail address
      pass: process.env.GMAIL_APP_PASSWORD  // Gmail app password
    }
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP with expiration
const storeOTP = (email, otp, purpose = 'registration') => {
  const key = `${email}:${purpose}`;
  const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes
  
  otpStore.set(key, {
    otp,
    expiresAt,
    attempts: 0,
    createdAt: Date.now(),
    verified: false
  });
  
  console.log(`📱 OTP stored for ${email} (${purpose}): ${otp}`);
  return expiresAt;
};

// Verify OTP
const verifyOTP = (email, otp, purpose = 'registration') => {
  const key = `${email}:${purpose}`;
  const stored = otpStore.get(key);
  
  if (!stored) {
    return {
      success: false,
      message: 'OTP not found or expired. Please request a new one.'
    };
  }
  
  // Check if OTP is expired
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    return {
      success: false,
      message: 'OTP has expired. Please request a new one.'
    };
  }
  
  // Check attempt limit
  if (stored.attempts >= 3) {
    otpStore.delete(key);
    return {
      success: false,
      message: 'Maximum verification attempts exceeded. Please request a new OTP.'
    };
  }
  
  // Verify OTP
  if (stored.otp === otp) {
    // Mark as verified instead of deleting
    stored.verified = true;
    otpStore.set(key, stored);
    return {
      success: true,
      message: 'OTP verified successfully'
    };
  } else {
    // Increment attempt count
    stored.attempts += 1;
    otpStore.set(key, stored);
    
    return {
      success: false,
      message: 'Invalid OTP. Please check and try again.'
    };
  }
};

// Send OTP via email
const sendOTP = async (email, purpose = 'registration') => {
  try {
    const otp = generateOTP();
    const expiresAt = storeOTP(email, otp, purpose);
    
    const transporter = createTransporter();
    
    // Verify Gmail connection
    await transporter.verify();
    console.log('✅ Gmail connection verified successfully');
    
    const mailOptions = {
      from: process.env.GMAIL_USER, // Use Gmail address as sender
      to: email,
      subject: purpose === 'registration' 
        ? 'Verify Your Email - Dream Society Registration'
        : 'Reset Your Password - Dream Society',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Dream Society</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">
              ${purpose === 'registration' ? 'Welcome to Dream Society!' : 'Password Reset Request'}
            </h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              ${purpose === 'registration' 
                ? 'Thank you for registering with Dream Society. To complete your registration, please verify your email address using the code below:'
                : 'You have requested to reset your password. Use the code below to proceed:'
              }
            </p>
            
            <div style="background: white; border: 2px solid #667eea; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
              <h1 style="color: #667eea; font-size: 36px; margin: 0; letter-spacing: 5px; font-family: monospace;">${otp}</h1>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              This code will expire in <strong>10 minutes</strong>.
            </p>
            
            <p style="color: #666; font-size: 14px;">
              If you didn't request this ${purpose === 'registration' ? 'registration' : 'password reset'}, please ignore this email.
            </p>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2024 Dream Society. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
        ${purpose === 'registration' ? 'Welcome to Dream Society!' : 'Password Reset Request'}
        
        ${purpose === 'registration' 
          ? 'Thank you for registering with Dream Society. To complete your registration, please verify your email address using the code below:'
          : 'You have requested to reset your password. Use the code below to proceed:'
        }
        
        Your verification code: ${otp}
        
        This code will expire in 10 minutes.
        
        If you didn't request this ${purpose === 'registration' ? 'registration' : 'password reset'}, please ignore this email.
        
        © 2024 Dream Society. All rights reserved.
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    console.log(`📧 OTP sent successfully to ${email} (${purpose})`);
    
    return {
      success: true,
      message: 'OTP sent successfully',
      expiresIn: Math.floor((expiresAt - Date.now()) / 1000) // seconds until expiration
    };
    
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    
    // Handle specific Gmail errors
    if (error.code === 'EAUTH') {
      return {
        success: false,
        message: 'Gmail authentication failed. Please check email credentials.'
      };
    } else if (error.code === 'ECONNECTION') {
      return {
        success: false,
        message: 'Failed to connect to Gmail. Please check internet connection.'
      };
    } else if (error.responseCode === 550) {
      return {
        success: false,
        message: 'Invalid email address. Please check the email format.'
      };
    }
    
    return {
      success: false,
      message: 'Failed to send OTP. Please try again.'
    };
  }
};

// Resend OTP
const resendOTP = async (email, purpose = 'registration') => {
  try {
    // Check if there's already a valid OTP
    const key = `${email}:${purpose}`;
    const existing = otpStore.get(key);
    
    if (existing && Date.now() < existing.expiresAt) {
      // If OTP is still valid, don't send a new one
      const timeLeft = Math.floor((existing.expiresAt - Date.now()) / 1000);
      return {
        success: false,
        message: `Please wait ${timeLeft} seconds before requesting a new OTP.`
      };
    }
    
    // Send new OTP
    return await sendOTP(email, purpose);
    
  } catch (error) {
    console.error('❌ Error resending OTP:', error);
    return {
      success: false,
      message: 'Failed to resend OTP. Please try again.'
    };
  }
};

// Get OTP status
const getOTPStatus = (email, purpose = 'registration') => {
  const key = `${email}:${purpose}`;
  const stored = otpStore.get(key);
  
  if (!stored) {
    return {
      exists: false,
      message: 'No OTP found'
    };
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    return {
      exists: false,
      message: 'OTP expired'
    };
  }
  
  return {
    exists: true,
    verified: stored.verified,
    attempts: stored.attempts,
    expiresAt: stored.expiresAt,
    timeLeft: Math.floor((stored.expiresAt - Date.now()) / 1000)
  };
};

// Check if OTP is verified (for password reset)
const isOTPVerified = (email, purpose = 'registration') => {
  const key = `${email}:${purpose}`;
  const stored = otpStore.get(key);
  
  if (!stored) {
    return {
      verified: false,
      message: 'No OTP found'
    };
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    return {
      verified: false,
      message: 'OTP expired'
    };
  }
  
  if (!stored.verified) {
    return {
      verified: false,
      message: 'OTP not verified'
    };
  }
  
  return {
    verified: true,
    message: 'OTP verified'
  };
};

// Debug function to view OTP store
const debugOTPStore = () => {
  console.log('🔍 OTP Store Debug:');
  for (const [key, value] of otpStore.entries()) {
    console.log(`  ${key}:`, {
      otp: value.otp,
      attempts: value.attempts,
      expiresAt: new Date(value.expiresAt).toISOString(),
      timeLeft: Math.floor((value.expiresAt - Date.now()) / 1000) + 's'
    });
  }
};

// Cleanup expired OTPs (run periodically)
const cleanupExpiredOTPs = () => {
  const now = Date.now();
  for (const [key, value] of otpStore.entries()) {
    if (now > value.expiresAt) {
      otpStore.delete(key);
      console.log(`🧹 Cleaned up expired OTP for: ${key}`);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);

// Test Gmail connection on startup
const testGmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Gmail OTP service initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Gmail OTP service initialization failed:', error.message);
    return false;
  }
};

// Test connection on module load
testGmailConnection();

module.exports = {
  sendOTP,
  verifyOTP,
  resendOTP,
  getOTPStatus,
  isOTPVerified,
  debugOTPStore,
  otpStore,
  cleanupExpiredOTPs,
  testGmailConnection
};

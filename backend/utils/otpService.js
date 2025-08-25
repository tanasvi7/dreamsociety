const crypto = require('crypto');
const nodemailer = require('nodemailer');

// In-memory storage for OTPs with expiration
const otpStore = new Map();
const rateLimitStore = new Map();

// OTP configuration
const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 10,
  MAX_ATTEMPTS: 3,
  RATE_LIMIT_MINUTES: 1,
  MAX_REQUESTS_PER_HOUR: 5
};

// Validate email service configuration
const validateEmailConfig = () => {
  const requiredVars = ['GMAIL_USER', 'GMAIL_APP_PASSWORD'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required email configuration: ${missing.join(', ')}`);
  }
};

// Gmail transporter configuration
const createTransporter = () => {
  validateEmailConfig();
  
  return nodemailer.createTransport({
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
};

// Clean up expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(key);
    }
  }
  // Clean up expired rate limit entries
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.expiresAt) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const checkRateLimit = (identifier) => {
  const now = Date.now();
  const key = `rate_limit_${identifier}`;
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, {
      count: 1,
      firstRequest: now,
      expiresAt: now + (OTP_CONFIG.RATE_LIMIT_MINUTES * 60 * 1000)
    });
    return true;
  }
  const rateLimit = rateLimitStore.get(key);
  if (now < rateLimit.expiresAt) {
    if (rateLimit.count >= OTP_CONFIG.MAX_REQUESTS_PER_HOUR) {
      return false;
    }
    rateLimit.count++;
    return true;
  } else {
    rateLimitStore.set(key, {
      count: 1,
      firstRequest: now,
      expiresAt: now + (OTP_CONFIG.RATE_LIMIT_MINUTES * 60 * 1000)
    });
    return true;
  }
};

const sendOTP = async (email, purpose = 'registration') => {
  try {
    if (!checkRateLimit(email)) {
      throw new Error('Rate limit exceeded. Please wait before requesting another OTP.');
    }
    
    const otp = generateOTP();
    const expiresAt = Date.now() + (OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);
    otpStore.set(email, {
      otp,
      expiresAt,
      attempts: 0,
      createdAt: Date.now(),
      purpose // Add purpose to distinguish between registration and forgot password
    });

    // Create HTML email template based on purpose
    const subject = purpose === 'forgot_password' 
      ? 'Your DreamSociety Password Reset Code'
      : 'Your DreamSociety Verification Code';
    
    const title = purpose === 'forgot_password' 
      ? 'Password Reset Code'
      : 'Email Verification Code';
    
    const description = purpose === 'forgot_password'
      ? 'To reset your password, please use the verification code below:'
      : 'To complete your registration, please use the verification code below:';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DreamSociety ${title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-code { background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-number { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>DreamSociety</h1>
            <p>${title}</p>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>${description}</p>
            
            <div class="otp-code">
              <div class="otp-number">${otp}</div>
            </div>
            
            <p><strong>This code will expire in ${OTP_CONFIG.EXPIRY_MINUTES} minutes.</strong></p>
            
            <div class="warning">
              <strong>Security Notice:</strong>
              <ul>
                <li>Never share this code with anyone</li>
                <li>DreamSociety will never ask for this code via phone or email</li>
                <li>If you didn't request this code, please ignore this email</li>
              </ul>
            </div>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <p>Best regards,<br>The DreamSociety Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>&copy; 2024 DreamSociety. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send OTP via Gmail
    const transporter = createTransporter();
    const mailOptions = {
      from: `"DreamSociety" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlContent,
      text: `Your DreamSociety ${title.toLowerCase()} is: ${otp}\n\nThis code will expire in ${OTP_CONFIG.EXPIRY_MINUTES} minutes.\n\nSecurity Notice:\n- Never share this code with anyone\n- DreamSociety will never ask for this code via phone or email\n- If you didn't request this code, please ignore this email\n\nBest regards,\nThe DreamSociety Team`
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`[OTP SERVICE] OTP sent to email: ${email} | OTP: ${otp} | Purpose: ${purpose}`);
      console.log(`[OTP SERVICE] Email sent successfully via Gmail`);
    } catch (err) {
      console.error('[OTP SERVICE] Email sending failed:', err.message);
      
      // Remove OTP from store if email fails
      otpStore.delete(email);
      
      // For development, still log the OTP even if email fails
      if (process.env.NODE_ENV === 'development') {
        console.log(`[OTP SERVICE] (Email send failed) OTP for ${email}: ${otp}`);
      }
      
      throw new Error('Failed to send OTP email. Please try again.');
    }

    return {
      success: true,
      message: 'OTP sent successfully to your email',
      expiresIn: OTP_CONFIG.EXPIRY_MINUTES
    };
  } catch (error) {
    console.error('[OTP SERVICE] Error sending OTP:', error);
    throw error;
  }
};

const verifyOTP = async (email, otp, purpose = 'registration') => {
  try {
    const otpData = otpStore.get(email);
    
    // Check if OTP exists
    if (!otpData) {
      throw new Error('OTP not found or expired');
    }
    
    // Check if OTP has expired
    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(email);
      throw new Error('OTP has expired');
    }
    
    // Check if maximum attempts already exceeded
    if (otpData.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
      // Don't delete immediately, let user know they need to request new OTP
      throw new Error('Maximum verification attempts exceeded. Please request a new OTP.');
    }
    
    // Increment attempts first
    otpData.attempts++;
    
    // Check if OTP is correct
    if (otpData.otp === otp) {
      // For forgot password flow, mark as verified but don't delete yet
      if (purpose === 'forgot_password') {
        otpData.verified = true;
        otpData.verifiedAt = Date.now();
        return {
          success: true,
          message: 'OTP verified successfully'
        };
      } else {
        // For registration flow, delete OTP immediately
        otpStore.delete(email);
        return {
          success: true,
          message: 'OTP verified successfully'
        };
      }
    } else {
      // Invalid OTP
      const remainingAttempts = OTP_CONFIG.MAX_ATTEMPTS - otpData.attempts;
      
      if (remainingAttempts <= 0) {
        // Max attempts reached - delete OTP and throw error
        otpStore.delete(email);
        throw new Error('Maximum verification attempts exceeded. Please request a new OTP.');
      } else {
        // Still have attempts left
        return {
          success: false,
          message: `Invalid OTP. ${remainingAttempts} attempts remaining`
        };
      }
    }
  } catch (error) {
    console.error('[OTP SERVICE] Error verifying OTP:', error);
    throw error;
  }
};

const resendOTP = async (email, purpose = 'registration') => {
  try {
    // Check if there's an existing OTP
    const existingOtpData = otpStore.get(email);
    
    if (existingOtpData) {
      // If OTP exists but max attempts exceeded, delete it and send new one
      if (existingOtpData.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
        console.log(`[OTP SERVICE] Max attempts exceeded for ${email}, deleting old OTP and sending new one`);
        otpStore.delete(email);
      } else {
        // If OTP exists and attempts not exceeded, just delete and send new one
        console.log(`[OTP SERVICE] Resending OTP for ${email}`);
        otpStore.delete(email);
      }
    } else {
      console.log(`[OTP SERVICE] No existing OTP found for ${email}, sending new OTP`);
    }
    
    // Send new OTP
    return await sendOTP(email, purpose);
  } catch (error) {
    console.error('[OTP SERVICE] Error resending OTP:', error);
    throw error;
  }
};

const getOTPStatus = (email) => {
  const otpData = otpStore.get(email);
  if (!otpData) {
    return { exists: false };
  }
  return {
    exists: true,
    attempts: otpData.attempts,
    expiresAt: new Date(otpData.expiresAt).toISOString(),
    isExpired: Date.now() > otpData.expiresAt
  };
};

module.exports = {
  sendOTP,
  verifyOTP,
  resendOTP,
  getOTPStatus,
  OTP_CONFIG,
  otpStore
}; 
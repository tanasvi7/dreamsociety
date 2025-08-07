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

// Gmail transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'dileeshsai007@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD || 'coan ggfz ypob dqsf'
  }
});

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

const sendOTP = async (email) => {
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
      createdAt: Date.now()
    });

    // Create HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DreamSociety OTP Verification</title>
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
            <p>Email Verification Code</p>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>Thank you for registering with DreamSociety. To complete your registration, please use the verification code below:</p>
            
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
    const mailOptions = {
      from: `"DreamSociety" <${process.env.GMAIL_USER || 'your-email@gmail.com'}>`,
      to: email,
      subject: 'Your DreamSociety Verification Code',
      html: htmlContent,
      text: `Your DreamSociety verification code is: ${otp}\n\nThis code will expire in ${OTP_CONFIG.EXPIRY_MINUTES} minutes.\n\nSecurity Notice:\n- Never share this code with anyone\n- DreamSociety will never ask for this code via phone or email\n- If you didn't request this code, please ignore this email\n\nBest regards,\nThe DreamSociety Team`
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`[OTP SERVICE] OTP sent to email: ${email} | OTP: ${otp}`);
      console.log(`[OTP SERVICE] Email sent successfully via Gmail`);
    } catch (err) {
      console.error('[OTP SERVICE] Email sending failed:', err.message);
      // For development, still log the OTP even if email fails
      console.log(`[OTP SERVICE] (Email send failed) OTP for ${email}: ${otp}`);
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

const verifyOTP = async (email, otp) => {
  try {
    const otpData = otpStore.get(email);
    if (!otpData) {
      throw new Error('OTP not found or expired');
    }
    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(email);
      throw new Error('OTP has expired');
    }
    if (otpData.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
      otpStore.delete(email);
      throw new Error('Maximum verification attempts exceeded');
    }
    otpData.attempts++;
    if (otpData.otp === otp) {
      otpStore.delete(email);
      return {
        success: true,
        message: 'OTP verified successfully'
      };
    } else {
      if (otpData.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
        otpStore.delete(email);
        throw new Error('Maximum verification attempts exceeded');
      }
      return {
        success: false,
        message: `Invalid OTP. ${OTP_CONFIG.MAX_ATTEMPTS - otpData.attempts} attempts remaining`
      };
    }
  } catch (error) {
    console.error('[OTP SERVICE] Error verifying OTP:', error);
    throw error;
  }
};

const resendOTP = async (email) => {
  try {
    otpStore.delete(email);
    return await sendOTP(email);
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
  OTP_CONFIG
}; 
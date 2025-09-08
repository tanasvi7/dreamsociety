const { User } = require('../models');
const { sequelize } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendOTP, verifyOTP, resendOTP, getOTPStatus, isOTPVerified, debugOTPStore, otpStore } = require('../utils/otpService');
const { ValidationError, NotFoundError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');

// Note: We now store users directly in database with is_verified: false
// No need for temporary storage since users are created immediately

// Generate JWT token with proper claims
const generateJWT = (user) => {
  const payload = {
    user_id: user.id,
    email: user.email,
    role: user.role,
    login_time: Date.now(),
    iat: Math.floor(Date.now() / 1000),
    iss: 'dreamsociety',
    aud: 'dreamsociety-users',
    sub: user.id.toString()
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    algorithm: 'HS256'
  });
};

// Check email/phone availability endpoint
exports.checkAvailability = async (req, res, next) => {
  try {
    const { email, phone } = req.query;
    console.log('🔍 Availability check requested:', { email: email ? 'provided' : 'not provided', phone: phone ? 'provided' : 'not provided' });
    
    const result = { available: true, conflicts: [] };
    
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      console.log('📧 Checking email in database:', normalizedEmail);
      
      const existingEmail = await User.findOne({ where: { email: normalizedEmail } });
      console.log('📧 Email database check result:', existingEmail ? 'FOUND - Email already exists' : 'NOT FOUND - Email is available');
      
      if (existingEmail) {
        result.available = false;
        result.conflicts.push('email');
        console.log('❌ Email conflict detected:', existingEmail.email);
      }
    }
    
    if (phone) {
      const normalizedPhone = phone.trim();
      console.log('📱 Checking phone in database:', normalizedPhone);
      
      const existingPhone = await User.findOne({ where: { phone: normalizedPhone } });
      console.log('📱 Phone database check result:', existingPhone ? 'FOUND - Phone already exists' : 'NOT FOUND - Phone is available');
      
      if (existingPhone) {
        result.available = false;
        result.conflicts.push('phone');
        console.log('❌ Phone conflict detected:', existingPhone.phone);
      }
    }
    
    console.log('✅ Final availability result:', result);
    res.json(result);
  } catch (err) {
    console.error('❌ Availability check error:', err);
    next(err);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { full_name, email, phone, password, working_type } = req.body;
    console.log('Registration attempt with:', { full_name, email, phone, working_type });
    
    // Basic required field validation
    if (!full_name || !email || !phone || !password) {
      throw new ValidationError('All fields are required');
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Please enter a valid email address');
    }
    
    // Normalize email and phone for consistent checking
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone.trim();
    
    // Check if email or phone already exists in database
    console.log('🔍 Checking database for existing user...');
    const existingEmail = await User.findOne({ where: { email: normalizedEmail } });
    const existingPhone = await User.findOne({ where: { phone: normalizedPhone } });
    
    if (existingEmail) {
      console.log('❌ Email already exists:', normalizedEmail);
      throw new ValidationError('Email address is already registered. Please try a different email address.');
    }
    
    if (existingPhone) {
      console.log('❌ Phone already exists:', normalizedPhone);
      throw new ValidationError('Phone number is already registered. Please try a different phone number.');
    }
    
    console.log('✅ Email and phone are available, proceeding with registration...');
    
    // Hash password
    const saltRounds = process.env.NODE_ENV === 'production' ? 12 : 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    // Create user in database with is_verified: false
    const user = await User.create({ 
      full_name,
      email: normalizedEmail,
      phone: normalizedPhone,
      password_hash,
      working_type,
      is_verified: false,  // User is not verified yet
      role: 'member',
      is_active: true
    });
    
    console.log('User created successfully with ID:', user.id, 'is_verified: false');
    
    // Send OTP to email for verification
    const otpResult = await sendOTP(normalizedEmail);
    
    console.log('OTP sent successfully, user needs to verify email');
    
    res.status(200).json({ 
      message: 'Registration successful! OTP sent to email. Please verify to activate your account.', 
      email: normalizedEmail,
      expiresIn: otpResult.expiresIn
    });
  } catch (err) { 
    console.error('Registration error:', err);
    next(err); 
  }
};

exports.login = async (req, res, next) => {
  try {
    console.log('[LOGIN] Login attempt started');
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Please enter a valid email address');
    }

    // Password length validation
    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long');
    }

    console.log('[LOGIN] Input validation passed, checking database connection...');
    
    // Check database connection
    try {
      await sequelize.authenticate();
      console.log('[LOGIN] Database connection successful');
    } catch (dbError) {
      console.error('[LOGIN] Database connection failed:', dbError);
      throw new Error('Database connection failed');
    }

    // Check environment variables
    if (!process.env.JWT_SECRET) {
      console.error('[LOGIN] JWT_SECRET environment variable is missing');
      throw new Error('JWT_SECRET environment variable is missing');
    }
    
    if (!process.env.JWT_EXPIRES_IN) {
      console.error('[LOGIN] JWT_EXPIRES_IN environment variable is missing');
      throw new Error('JWT_EXPIRES_IN environment variable is missing');
    }

    console.log('[LOGIN] Environment variables check passed');

    // Find user by email (case-insensitive)
    console.log('[LOGIN] Searching for user with email:', email.toLowerCase());
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    
    if (!user) {
      console.log('[LOGIN] User not found for email:', email);
      // Don't reveal if user exists or not for security
      throw new ValidationError('Invalid email or password');
    }

    console.log('[LOGIN] User found, verifying password...');

    // Verify password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      console.log('[LOGIN] Password verification failed for user:', user.email);
      throw new ValidationError('Invalid email or password');
    }

    console.log('[LOGIN] Password verified successfully');

    // Check if user is verified
    if (!user.is_verified) {
      console.log('[LOGIN] User not verified:', user.email);
      throw new ValidationError('Please verify your email address before logging in. Check your inbox for verification instructions.');
    }

    // Check if user account is active (you can add an is_active field)
    if (user.is_active === false) {
      console.log('[LOGIN] User account deactivated:', user.email);
      throw new ValidationError('Your account has been deactivated. Please contact support.');
    }

    console.log('[LOGIN] User verification and status checks passed, generating JWT...');

    // Generate JWT token with proper claims
    const token = generateJWT(user);

    console.log('[LOGIN] JWT token generated successfully');

    // Log successful login
    console.log(`[LOGIN] Successful login for user: ${user.email} (ID: ${user.id})`);

    // Return user data (exclude sensitive information)
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        full_name: user.full_name, 
        email: user.email, 
        phone: user.phone, 
        role: user.role 
      },
      message: 'Login successful'
    });

  } catch (err) {
    console.error('[LOGIN] Error occurred:', err);
    console.error('[LOGIN] Error stack:', err.stack);
    
    // Log failed login attempts
    if (err instanceof ValidationError) {
      console.log(`[LOGIN] Failed login attempt for email: ${req.body.email} - ${err.message}`);
    }
    
    // Handle specific error types
    if (err instanceof ValidationError) {
      return res.status(400).json({ 
        error: err.message,
        type: 'validation_error'
      });
    } else if (err instanceof NotFoundError) {
      return res.status(404).json({ 
        error: 'User not found',
        type: 'not_found'
      });
    } else {
      console.error('[LOGIN] Unexpected error:', err);
      return res.status(500).json({ 
        error: 'Internal server error. Please try again later.',
        type: 'server_error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      throw new ValidationError('Email and OTP are required');
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    console.log('OTP verification attempt for email:', normalizedEmail);
    
    // Find the user in database (should exist with is_verified: false)
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      throw new ValidationError('No registration found for this email. Please register first.');
    }
    
    // Check if user is already verified
    if (user.is_verified) {
      throw new ValidationError('Email is already verified. You can login directly.');
    }
    
    // Verify OTP with registration purpose
    const verifyResult = await verifyOTP(normalizedEmail, otp, 'registration');
    if (verifyResult.success) {
      console.log('OTP verified successfully, updating user verification status...');
      
      // Update user verification status
      await user.update({ is_verified: true });
      
      console.log('User verification updated successfully for ID:', user.id);
      
      // Generate JWT token with proper claims
      const token = generateJWT(user);
      
      res.json({ 
        message: 'Email verified successfully! Your account is now active.',
        token: token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          is_verified: true
        }
      });
    } else {
      throw new ValidationError(verifyResult.message);
    }
  } catch (err) { 
    console.error('OTP verification error:', err);
    next(err); 
  }
};

exports.resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new ValidationError('Email is required');
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    console.log('Resend OTP attempt for email:', normalizedEmail);
    
    // Find the user in database (should exist with is_verified: false)
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      throw new ValidationError('No registration found for this email. Please register first.');
    }
    
    // Check if user is already verified
    if (user.is_verified) {
      throw new ValidationError('Email is already verified. You can login directly.');
    }
    
    // Resend OTP with registration purpose
    const otpResult = await resendOTP(normalizedEmail, 'registration');
    
    console.log('OTP resent successfully');
    
    res.json({ 
      message: 'OTP resent successfully',
      expiresIn: otpResult.expiresIn
    });
  } catch (err) {
    console.error('Resend OTP error:', err);
    next(err);
  }
};

exports.getTokenInfo = async (req, res, next) => {
  try {
    res.json({
      user: req.user,
      is_impersonated: req.user.is_impersonated || false,
      impersonated_by: req.user.impersonated_by || null,
      impersonated_at: req.user.impersonated_at || null
    });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.user_id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    res.json({
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_subscribed: user.is_subscribed
      }
    });
  } catch (err) { next(err); }
}; 

// Test endpoint to check if admin user exists
exports.testAdminUser = async (req, res, next) => {
  try {
    console.log('[TEST] Checking if admin user exists...');
    
    // Check database connection
    await sequelize.authenticate();
    console.log('[TEST] Database connection successful');
    
    // Look for admin user
    const adminUser = await User.findOne({ 
      where: { 
        email: 'admin@gmail.com',
        role: 'admin'
      } 
    });
    
    if (adminUser) {
      console.log('[TEST] Admin user found:', adminUser.email);
      res.json({ 
        success: true, 
        message: 'Admin user exists',
        user: {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
          is_verified: adminUser.is_verified
        }
      });
    } else {
      console.log('[TEST] Admin user not found, creating one...');
      
      // Create admin user if it doesn't exist
      const adminPasswordHash = await bcrypt.hash('admin123', 10);
      const newAdminUser = await User.create({
        full_name: 'Admin User',
        email: 'admin@gmail.com',
        phone: '+1234567890',
        password_hash: adminPasswordHash,
        role: 'admin',
        is_verified: true
      });
      
      console.log('[TEST] Admin user created successfully:', newAdminUser.email);
      res.json({ 
        success: true, 
        message: 'Admin user created successfully',
        user: {
          id: newAdminUser.id,
          email: newAdminUser.email,
          role: newAdminUser.role,
          is_verified: newAdminUser.is_verified
        }
      });
    }
  } catch (error) {
    console.error('[TEST] Error checking/creating admin user:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}; 

exports.testEmailService = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new ValidationError('Email is required for testing');
    }
    
    console.log('Testing email service for:', email);
    
    // Test basic email sending
    const { sendOTP } = require('../utils/otpService');
    const result = await sendOTP(email);
    
    res.json({
      success: true,
      message: 'Email service test successful',
      email: email,
      result: result
    });
  } catch (err) {
    console.error('Email service test error:', err);
    next(err);
  }
};

// Clear pending registration endpoint
exports.clearPendingRegistration = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new ValidationError('Email is required');
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log('Clearing pending registration for:', normalizedEmail);
    
    // Check if there's a pending registration
    if (pendingRegistrations.has(normalizedEmail)) {
      pendingRegistrations.delete(normalizedEmail);
      console.log('Pending registration cleared for:', normalizedEmail);
      
      res.json({
        success: true,
        message: 'Pending registration cleared successfully',
        email: normalizedEmail
      });
    } else {
      console.log('No pending registration found for:', normalizedEmail);
      
      res.json({
        success: true,
        message: 'No pending registration found for this email',
        email: normalizedEmail
      });
    }
  } catch (err) {
    console.error('Clear pending registration error:', err);
    next(err);
  }
};

// Forgot password - send OTP
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log('🔐 Forgot password request for:', email);
    
    if (!email) {
      throw new ValidationError('Email is required');
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user exists
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      console.log('❌ User not found for forgot password:', normalizedEmail);
      return res.status(404).json({
        error: 'Email not found. Please check your email address.'
      });
    }

          // Send OTP for password reset
      const otpResult = await sendOTP(normalizedEmail, 'forgot_password');
    
    console.log('✅ Forgot password OTP sent successfully to:', normalizedEmail);
    
    res.json({
      message: 'Password reset code sent to your email',
      expiresIn: otpResult.expiresIn
    });
  } catch (err) {
    console.error('❌ Forgot password error:', err);
    next(err);
  }
};

// Verify forgot password OTP
exports.verifyForgotPasswordOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    console.log('🔐 Verifying forgot password OTP for:', email);
    
    if (!email || !otp) {
      throw new ValidationError('Email and OTP are required');
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user exists
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(404).json({
        error: 'Email not found. Please check your email address.'
      });
    }

          // Verify OTP
      const otpResult = await verifyOTP(normalizedEmail, otp, 'forgot_password');
    
    if (otpResult.success) {
      console.log('✅ Forgot password OTP verified successfully for:', normalizedEmail);
      res.json({
        message: 'OTP verified successfully. You can now reset your password.'
      });
    } else {
      res.status(400).json({
        error: otpResult.message
      });
    }
  } catch (err) {
    console.error('❌ Verify forgot password OTP error:', err);
    next(err);
  }
};

// Resend forgot password OTP
exports.resendForgotPasswordOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log('🔐 Resending forgot password OTP for:', email);
    
    if (!email) {
      throw new ValidationError('Email is required');
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user exists
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(404).json({
        error: 'Email not found. Please check your email address.'
      });
    }

          // Resend OTP
      const otpResult = await resendOTP(normalizedEmail, 'forgot_password');
    
    console.log('✅ Forgot password OTP resent successfully to:', normalizedEmail);
    
    res.json({
      message: 'Password reset code resent to your email',
      expiresIn: otpResult.expiresIn
    });
  } catch (err) {
    console.error('❌ Resend forgot password OTP error:', err);
    next(err);
  }
};

// Debug OTP endpoint (for development only)
exports.debugOTP = async (req, res, next) => {
  try {
    const { email } = req.query;
    
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ error: 'Debug endpoint only available in development' });
    }
    
    if (email) {
      const status = getOTPStatus(email);
      res.json({ email, status });
    } else {
      const allOtps = debugOTPStore();
      res.json({ allOtps });
    }
  } catch (err) {
    console.error('Debug OTP error:', err);
    next(err);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    console.log('🔐 Resetting password for:', email);
    
    if (!email || !otp || !newPassword) {
      throw new ValidationError('Email, OTP, and new password are required');
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user exists
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(404).json({
        error: 'Email not found. Please check your email address.'
      });
    }

    // Check if OTP is verified for forgot password
    const verificationCheck = isOTPVerified(normalizedEmail, 'forgot_password');
    if (!verificationCheck.verified) {
      return res.status(400).json({
        error: verificationCheck.message
      });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      throw new ValidationError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    }

    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update user's password
    await user.update({
      password_hash: hashedPassword
    });
    
    // Delete the verified OTP after successful password reset
    const key = `${normalizedEmail}:forgot_password`;
    otpStore.delete(key);
    
    console.log('✅ Password reset successfully for:', normalizedEmail);
    
    res.json({
      message: 'Password reset successfully. You can now log in with your new password.'
    });
  } catch (err) {
    console.error('❌ Reset password error:', err);
    next(err);
  }
};
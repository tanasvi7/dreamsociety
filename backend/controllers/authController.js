const { User } = require('../models');
const { sequelize } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendOTP, verifyOTP, resendOTP } = require('../utils/otpService');
const { ValidationError, NotFoundError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');

// Temporary storage for pending registrations (in production, use Redis or database)
const pendingRegistrations = new Map();

// Add this function at the top of the file
const cleanupExpiredRegistrations = () => {
  const now = Date.now();
  const tenMinutes = 10 * 60 * 1000;
  
  for (const [email, data] of pendingRegistrations.entries()) {
    if (now - data.timestamp > tenMinutes) {
      pendingRegistrations.delete(email);
      console.log(`Cleaned up expired registration for: ${email}`);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupExpiredRegistrations, 5 * 60 * 1000);

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
    const { full_name, email, phone, password } = req.body;
    console.log('Registration attempt with:', { full_name, email, phone });
    
    if (!full_name || !email || !phone || !password) {
      throw new ValidationError('All fields are required');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    // Check for common password patterns
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'user'];
    if (commonPasswords.includes(password.toLowerCase())) {
      throw new ValidationError('Password is too common. Please choose a stronger password');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Please enter a valid email address');
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone)) {
      throw new ValidationError('Please enter a valid phone number');
    }
    
    // Check if user already exists in database with precise error messages
    console.log('🔍 Registration validation: Checking database for existing user');
    console.log('📧 Input email:', email);
    console.log('📱 Input phone:', phone);
    
    // Normalize email and phone for consistent checking
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone.trim();
    console.log('📧 Normalized email for database check:', normalizedEmail);
    console.log('📱 Normalized phone for database check:', normalizedPhone);
    
    // Check email and phone separately for precise error messages
    console.log('🔍 Performing database query for email...');
    const existingEmail = await User.findOne({ where: { email: normalizedEmail } });
    console.log('📧 Email database query result:', existingEmail ? `FOUND - User ID: ${existingEmail.id}` : 'NOT FOUND - Email is available');
    
    console.log('🔍 Performing database query for phone...');
    const existingPhone = await User.findOne({ where: { phone: normalizedPhone } });
    console.log('📱 Phone database query result:', existingPhone ? `FOUND - User ID: ${existingPhone.id}` : 'NOT FOUND - Phone is available');
    
    if (existingEmail && existingPhone) {
      console.log('❌ VALIDATION FAILED: Both email and phone already exist in database');
      console.log('📧 Existing email user ID:', existingEmail.id);
      console.log('📱 Existing phone user ID:', existingPhone.id);
      throw new ValidationError('Email and phone number are already registered. Please use different credentials.');
    } else if (existingEmail) {
      console.log('❌ VALIDATION FAILED: Email already exists in database');
      console.log('📧 Existing email user ID:', existingEmail.id);
      throw new ValidationError('Email address is already registered. Please try a different email address.');
    } else if (existingPhone) {
      console.log('❌ VALIDATION FAILED: Phone already exists in database');
      console.log('📱 Existing phone user ID:', existingPhone.id);
      throw new ValidationError('Phone number is already registered. Please try a different phone number.');
    }
    
    // Clean up expired registrations first
    cleanupExpiredRegistrations();
    
    // Check if there's a pending registration
    if (pendingRegistrations.has(normalizedEmail)) {
      const registrationData = pendingRegistrations.get(normalizedEmail);
      const timeSinceRegistration = Date.now() - registrationData.timestamp;
      const tenMinutes = 10 * 60 * 1000;
      
      if (timeSinceRegistration > tenMinutes) {
        // Remove expired registration
        pendingRegistrations.delete(normalizedEmail);
        console.log('Removed expired registration for:', normalizedEmail);
      } else {
        console.log('❌ VALIDATION FAILED: Registration already in progress for this email');
        throw new ValidationError('Registration already in progress for this email. Please check your email for OTP or wait a few minutes before trying again.');
      }
    }
    
    console.log('✅ VALIDATION PASSED: No existing user found in database, proceeding with registration...');
    
    // Hash password with higher salt rounds for production
    const saltRounds = process.env.NODE_ENV === 'production' ? 12 : 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    // Store registration data temporarily (don't create user yet)
    const registrationData = {
      full_name,
      email: normalizedEmail,
      phone: normalizedPhone,
      password_hash,
      timestamp: Date.now()
    };
    
    pendingRegistrations.set(normalizedEmail, registrationData);
    
    // Send OTP to email
    const otpResult = await sendOTP(normalizedEmail);
    
    console.log('OTP sent successfully, registration pending verification');
    
    res.status(200).json({ 
      message: 'OTP sent to email. Please verify to complete registration.', 
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
    
    console.log('OTP verification attempt for email:', email);
    
    // Check if there's a pending registration
    const registrationData = pendingRegistrations.get(email);
    if (!registrationData) {
      throw new ValidationError('No pending registration found for this email');
    }
    
    // Verify OTP
    const verifyResult = await verifyOTP(email, otp);
    if (verifyResult.success) {
      console.log('OTP verified successfully, creating user...');
      
      // Create user in database
      const user = await User.create({ 
        full_name: registrationData.full_name,
        email: registrationData.email,
        phone: registrationData.phone,
        password_hash: registrationData.password_hash,
        is_verified: true,
        role: 'member',
        is_active: true
      });
      
      console.log('User created successfully with ID:', user.id);
      
      // Remove from pending registrations
      pendingRegistrations.delete(email);
      
      // Generate JWT token with proper claims
      const token = generateJWT(user);
      
      res.json({ 
        message: 'User verified and registered successfully',
        token: token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role
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
    
    console.log('Resend OTP attempt for email:', email);
    
    // Check if there's a pending registration
    const registrationData = pendingRegistrations.get(email);
    if (!registrationData) {
      throw new ValidationError('No pending registration found for this email');
    }
    
    // Check if OTP is not expired (e.g., within 10 minutes)
    const timeSinceRegistration = Date.now() - registrationData.timestamp;
    const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
    
    if (timeSinceRegistration > tenMinutes) {
      // Remove expired registration
      pendingRegistrations.delete(email);
      throw new ValidationError('Registration session expired. Please register again.');
    }
    
    // Resend OTP
    const otpResult = await resendOTP(email);
    
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
const { User } = require('../models');
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
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
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

    // Find user by email (case-insensitive)
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    
    if (!user) {
      // Don't reveal if user exists or not for security
      throw new ValidationError('Invalid email or password');
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new ValidationError('Invalid email or password');
    }

    // Check if user is verified
    if (!user.is_verified) {
      throw new ValidationError('Please verify your email address before logging in. Check your inbox for verification instructions.');
    }

    // Check if user account is active (you can add an is_active field)
    if (user.is_active === false) {
      throw new ValidationError('Your account has been deactivated. Please contact support.');
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        user_id: user.id, 
        email: user.email, 
        role: user.role,
        login_time: Date.now()
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

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
        type: 'server_error'
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
        role: 'member'
      });
      
      console.log('User created successfully with ID:', user.id);
      
      // Remove from pending registrations
      pendingRegistrations.delete(email);
      
      // Generate JWT token
      const token = jwt.sign(
        { user_id: user.id, email: user.email, role: user.role }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
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
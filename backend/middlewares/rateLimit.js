const rateLimit = require('express-rate-limit');

// Check if we're in development mode
// In development: More lenient rate limits for easier testing
// In production: Stricter rate limits for security
const isDevelopment = process.env.NODE_ENV === 'development';

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 15 * 60 * 1000, // 1 minute in dev, 15 minutes in production
  max: isDevelopment ? 30 : 5, // 30 attempts per minute in dev, 5 per 15 minutes in production
  message: {
    error: isDevelopment 
      ? 'Too many login attempts. Please wait 1 minute before trying again.'
      : 'Too many login attempts. Please wait 15 minutes before trying again.',
    type: 'rate_limit',
    code: 'LOGIN_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: isDevelopment 
        ? 'Too many login attempts. Please wait 1 minute before trying again.'
        : 'Too many login attempts. Please wait 15 minutes before trying again.',
      type: 'rate_limit',
      code: 'LOGIN_RATE_LIMIT_EXCEEDED'
    });
  },
  keyGenerator: (req) => {
    // Use IP address and user agent for better rate limiting
    return `${req.ip}-${req.get('User-Agent')}`;
  }
});

// Rate limiting for registration attempts
const registrationLimiter = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 15 * 60 * 1000, // 1 minute in dev, 15 minutes in production
  max: isDevelopment ? 50 : 10, // 50 attempts per minute in dev, 10 per 15 minutes in production
  message: {
    error: isDevelopment 
      ? 'Too many registration attempts. Please wait 1 minute before trying again.'
      : 'Too many registration attempts. Please wait 15 minutes before trying again.',
    type: 'rate_limit',
    code: 'REGISTRATION_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: isDevelopment 
        ? 'Too many registration attempts. Please wait 1 minute before trying again.'
        : 'Too many registration attempts. Please wait 15 minutes before trying again.',
      type: 'rate_limit',
      code: 'REGISTRATION_RATE_LIMIT_EXCEEDED'
    });
  },
  keyGenerator: (req) => {
    // Use IP address for registration rate limiting
    return req.ip;
  }
});

// Rate limiting for OTP requests
const otpLimiter = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 5 * 60 * 1000, // 1 minute in dev, 5 minutes in production
  max: isDevelopment ? 20 : 3, // 20 attempts per minute in dev, 3 per 5 minutes in production
  message: {
    error: isDevelopment 
      ? 'Too many OTP requests. Please wait 1 minute before trying again.'
      : 'Too many OTP requests. Please wait 5 minutes before trying again.',
    type: 'rate_limit',
    code: 'OTP_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: isDevelopment 
        ? 'Too many OTP requests. Please wait 1 minute before trying again.'
        : 'Too many OTP requests. Please wait 5 minutes before trying again.',
      type: 'rate_limit',
      code: 'OTP_RATE_LIMIT_EXCEEDED'
    });
  },
  keyGenerator: (req) => {
    // Use email for OTP rate limiting if available
    const email = req.body.email || req.query.email;
    return email ? `${req.ip}-${email}` : req.ip;
  }
});

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // 1000 requests per 15 minutes in dev, 100 in production
  message: {
    error: 'Too many requests. Please try again later.',
    type: 'rate_limit',
    code: 'API_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests. Please try again later.',
      type: 'rate_limit',
      code: 'API_RATE_LIMIT_EXCEEDED'
    });
  },
  keyGenerator: (req) => {
    // Use IP address and user agent for general API rate limiting
    return `${req.ip}-${req.get('User-Agent')}`;
  }
});

// Admin API rate limiting (stricter)
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 500 : 50, // 500 requests per 15 minutes in dev, 50 in production
  message: {
    error: 'Too many admin requests. Please try again later.',
    type: 'rate_limit',
    code: 'ADMIN_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many admin requests. Please try again later.',
      type: 'rate_limit',
      code: 'ADMIN_RATE_LIMIT_EXCEEDED'
    });
  },
  keyGenerator: (req) => {
    // Use user ID for admin rate limiting if authenticated
    const userId = req.user?.id;
    return userId ? `${req.ip}-${userId}` : req.ip;
  }
});

module.exports = {
  loginLimiter,
  registrationLimiter,
  otpLimiter,
  apiLimiter,
  adminLimiter
}; 
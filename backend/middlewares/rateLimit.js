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
    type: 'rate_limit'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: isDevelopment 
        ? 'Too many login attempts. Please wait 1 minute before trying again.'
        : 'Too many login attempts. Please wait 15 minutes before trying again.',
      type: 'rate_limit'
    });
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
    type: 'rate_limit'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: isDevelopment 
        ? 'Too many registration attempts. Please wait 1 minute before trying again.'
        : 'Too many registration attempts. Please wait 15 minutes before trying again.',
      type: 'rate_limit'
    });
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
    type: 'rate_limit'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: isDevelopment 
        ? 'Too many OTP requests. Please wait 1 minute before trying again.'
        : 'Too many OTP requests. Please wait 5 minutes before trying again.',
      type: 'rate_limit'
    });
  }
});

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: {
    error: 'Too many requests. Please try again later.',
    type: 'rate_limit'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests. Please try again later.',
      type: 'rate_limit'
    });
  }
});

module.exports = {
  loginLimiter,
  registrationLimiter,
  otpLimiter,
  apiLimiter
}; 
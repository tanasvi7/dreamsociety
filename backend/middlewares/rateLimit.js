const rateLimit = require('express-rate-limit');

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many login attempts. Please wait 15 minutes before trying again.',
    type: 'rate_limit'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many login attempts. Please wait 15 minutes before trying again.',
      type: 'rate_limit'
    });
  }
});

// Rate limiting for registration attempts
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: {
    error: 'Too many registration attempts. Please wait 1 hour before trying again.',
    type: 'rate_limit'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many registration attempts. Please wait 1 hour before trying again.',
      type: 'rate_limit'
    });
  }
});

// Rate limiting for OTP requests
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 OTP requests per 5 minutes
  message: {
    error: 'Too many OTP requests. Please wait 5 minutes before trying again.',
    type: 'rate_limit'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many OTP requests. Please wait 5 minutes before trying again.',
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
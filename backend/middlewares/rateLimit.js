const rateLimit = require('express-rate-limit');

// Check if we're in development mode
// In development: More lenient rate limits for easier testing
// In production: Stricter rate limits for security
const isDevelopment = process.env.NODE_ENV === 'development';

// Request deduplication for slow connections
const requestDeduplication = new Map();

const addDeduplicationMiddleware = (limiter) => {
  return (req, res, next) => {
    const key = `${req.ip}-${req.path}-${JSON.stringify(req.body)}`;
    const now = Date.now();
    
    // Check if same request was made within last 3 seconds (for slow connections)
    if (requestDeduplication.has(key)) {
      const lastRequest = requestDeduplication.get(key);
      if (now - lastRequest < 3000) { // 3 seconds
        return res.status(429).json({
          error: 'Duplicate request detected. Please wait before retrying.',
          type: 'duplicate_request',
          code: 'DUPLICATE_REQUEST'
        });
      }
    }
    
    requestDeduplication.set(key, now);
    
    // Clean up old entries every 5 minutes
    if (Math.random() < 0.01) { // 1% chance
      for (const [k, v] of requestDeduplication.entries()) {
        if (now - v > 300000) { // 5 minutes
          requestDeduplication.delete(k);
        }
      }
    }
    
    limiter(req, res, next);
  };
};

// Rate limiting for login attempts - with deduplication
const loginLimiter = addDeduplicationMiddleware(rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 1000, // Allow 1000 requests per minute (effectively unlimited)
  message: {
    error: 'Too many login attempts. Please try again later.',
    type: 'rate_limit',
    code: 'LOGIN_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many login attempts. Please try again later.',
      type: 'rate_limit',
      code: 'LOGIN_RATE_LIMIT_EXCEEDED'
    });
  },
  keyGenerator: (req) => {
    // Use IP address and user agent for better rate limiting
    return `${req.ip}-${req.get('User-Agent')}`;
  }
}));

// Rate limiting for registration attempts - with deduplication
const registrationLimiter = addDeduplicationMiddleware(rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 1000, // Allow 1000 requests per minute (effectively unlimited)
  message: {
    error: 'Too many registration attempts. Please try again later.',
    type: 'rate_limit',
    code: 'REGISTRATION_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many registration attempts. Please try again later.',
      type: 'rate_limit',
      code: 'REGISTRATION_RATE_LIMIT_EXCEEDED'
    });
  },
  keyGenerator: (req) => {
    // Use IP address for registration rate limiting
    return req.ip;
  }
}));

// Rate limiting for OTP requests - with deduplication
const otpLimiter = addDeduplicationMiddleware(rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 1000, // Allow 1000 requests per minute (effectively unlimited)
  message: {
    error: 'Too many OTP requests. Please try again later.',
    type: 'rate_limit',
    code: 'OTP_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many OTP requests. Please try again later.',
      type: 'rate_limit',
      code: 'OTP_RATE_LIMIT_EXCEEDED'
    });
  },
  keyGenerator: (req) => {
    // Use email for OTP rate limiting if available
    const email = req.body.email || req.query.email;
    return email ? `${req.ip}-${email}` : req.ip;
  }
}));

// General API rate limiting - More lenient
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 2000 : 500, // 2000 requests per 15 minutes in dev, 500 in production
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
  max: isDevelopment ? 1000 : 100, // 1000 requests per 15 minutes in dev, 100 in production
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
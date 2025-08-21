const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No token provided',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.substring(7);
    
    // Validate token format
    if (!token || token.split('.').length !== 3) {
      return res.status(401).json({ 
        error: 'Invalid token format',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Verify JWT with algorithm specification
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { 
      algorithms: ['HS256'],
      issuer: 'dreamsociety',
      audience: 'dreamsociety-users'
    });

    // Handle both regular tokens and impersonation tokens
    const userId = decoded.user_id || decoded.id;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Invalid token payload',
        code: 'INVALID_TOKEN_PAYLOAD'
      });
    }

    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if user is active
    if (user.is_active === false) {
      return res.status(401).json({ 
        error: 'Account deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Add user info to request
    req.user = {
      id: user.id,
      user_id: user.id, // Add this for compatibility with getMe controller
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      is_subscribed: user.is_subscribed // Add subscription status
    };

    // Add impersonation info if this is an impersonation token
    if (decoded.impersonated_by) {
      req.user.impersonated_by = decoded.impersonated_by;
      req.user.impersonated_at = decoded.impersonated_at;
      req.user.is_impersonated = true;
    }

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    if (err.name === 'NotBeforeError') {
      return res.status(401).json({ 
        error: 'Token not active',
        code: 'TOKEN_NOT_ACTIVE'
      });
    }
    
    console.error('JWT Authentication error:', err);
    return res.status(500).json({ 
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

exports.requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

exports.requireAdmin = exports.requireRole('admin');
exports.requireModerator = exports.requireRole(['admin', 'moderator']); 
const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Handle both regular tokens and impersonation tokens
    const userId = decoded.user_id || decoded.id;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Add user info to request
    req.user = {
      id: user.id,
      user_id: user.id, // Add this for compatibility with getMe controller
      email: user.email,
      role: user.role,
      full_name: user.full_name
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
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    next(err);
  }
};

exports.requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

exports.requireAdmin = exports.requireRole('admin');
exports.requireModerator = exports.requireRole(['admin', 'moderator']); 
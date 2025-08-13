class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
  }
}

const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: err.message,
      type: 'validation_error',
      code: 'VALIDATION_ERROR'
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      error: err.message,
      type: 'not_found',
      code: 'NOT_FOUND'
    });
  }

  if (err instanceof AuthenticationError) {
    return res.status(401).json({
      error: err.message,
      type: 'authentication_error',
      code: 'AUTHENTICATION_ERROR'
    });
  }

  if (err instanceof AuthorizationError) {
    return res.status(403).json({
      error: err.message,
      type: 'authorization_error',
      code: 'AUTHORIZATION_ERROR'
    });
  }

  // Handle Sequelize errors
  if (err.name === 'SequelizeValidationError') {
    const validationErrors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json({
      error: 'Validation failed',
      type: 'validation_error',
      code: 'VALIDATION_ERROR',
      details: validationErrors
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    return res.status(400).json({
      error: `${field} already exists`,
      type: 'validation_error',
      code: 'DUPLICATE_ENTRY'
    });
  }

  if (err.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      error: 'Database connection error',
      type: 'database_error',
      code: 'DATABASE_CONNECTION_ERROR'
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      type: 'authentication_error',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      type: 'authentication_error',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Handle rate limit errors
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Too many requests',
      type: 'rate_limit_error',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(statusCode).json({
    error: message,
    type: 'server_error',
    code: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.message
    })
  });
};

module.exports = {
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  errorHandler
}; 
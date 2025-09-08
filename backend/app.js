require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { errorHandler, NotFoundError } = require('./middlewares/errorHandler');
const { sequelize } = require('./models');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerConfig = require('./config/swagger');
const swaggerSpec = swaggerJsdoc(swaggerConfig);
const adminProfilesRouter = require('./routes/adminProfiles');
const adminEducationRouter = require('./routes/adminEducation');
const adminEmploymentRouter = require('./routes/adminEmployment');
const adminFamilyRouter = require('./routes/adminFamily');
const adminDashboardRouter = require('./routes/adminDashboard');
const memberDashboardRouter = require('./routes/memberDashboard');
const notificationsRouter = require('./routes/notifications');

// Validate required environment variables
const validateEnvironment = () => {
  const requiredVars = [
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    process.exit(1);
  }

  // Validate JWT secret strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.error('❌ JWT_SECRET must be at least 32 characters long');
    process.exit(1);
  }

  console.log('✅ Environment validation passed');
};

// Run environment validation
validateEnvironment();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if CORS_ORIGIN environment variable is set
    if (process.env.CORS_ORIGIN) {
      const allowedOrigins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
    }
    
    // Default allowed origins - Cleaned up
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [
          'http://dreamssociety.in',
          'https://dreamssociety.in',
          'http://localhost:8080'
        ]

      : [
          'http://localhost:3000', 
          'http://localhost:5173', 
          'http://127.0.0.1:5173'
        ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Length', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiting - More lenient for slow connections
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 300 : 2000, // Increased from 100 to 300 for slow connections
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for auth routes to prevent double limiting
  skip: (req) => {
    return req.path.startsWith('/auth/');
  }
});

app.use(globalLimiter);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await sequelize.authenticate();
    
    // Check environment variables
    const envCheck = {
      JWT_SECRET: !!process.env.JWT_SECRET,
      JWT_EXPIRES_IN: !!process.env.JWT_EXPIRES_IN,
      NODE_ENV: process.env.NODE_ENV || 'development',
      GMAIL_USER: !!process.env.GMAIL_USER,
      GMAIL_APP_PASSWORD: !!process.env.GMAIL_APP_PASSWORD
    };
    
    res.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: envCheck,
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Environment check endpoint (for debugging)
app.get('/env-check', (req, res) => {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'MISSING',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || 'MISSING',
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER ? 'SET' : 'MISSING',
    GMAIL_USER: process.env.GMAIL_USER ? 'SET' : 'MISSING',
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? 'SET' : 'MISSING',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'NOT_SET'
  };
  
  res.json({
    environment: envVars,
    timestamp: new Date().toISOString()
  });
});

// CORS debug endpoint - Cleaned up
app.get('/cors-debug', (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? [
        'http://dreamssociety.in',
        'https://dreamssociety.in',
        'http://localhost:8080'
      ]
    : [
        'http://localhost:8080', 
        'http://localhost:5173', 
        'http://127.0.0.1:5173'
      ];
  
  res.json({
    requestOrigin: origin,
    allowedOrigins: allowedOrigins,
    corsOrigin: process.env.CORS_ORIGIN || 'NOT_SET',
    nodeEnv: process.env.NODE_ENV,
    isAllowed: allowedOrigins.includes(origin),
    timestamp: new Date().toISOString()
  });
});

// API Documentation
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Auth routes
app.use('/auth', require('./routes/auth'));
// User routes
app.use('/users', require('./routes/users'));
// Profile routes
app.use('/profiles', require('./routes/profiles'));
// Profile photo routes
app.use('/profile-photo', require('./routes/profilePhoto'));
// Family routes
app.use('/family', require('./routes/family'));
// Education routes
app.use('/education', require('./routes/education'));
// Employment routes
app.use('/employment', require('./routes/employment'));
// Jobs routes
app.use('/jobs', require('./routes/jobs'));
// Skills routes
app.use('/skills', require('./routes/skills'));
// Payments routes
app.use('/payments', require('./routes/payments'));
// Search routes
app.use('/search', require('./routes/search'));
// Admin routes
app.use('/admin', require('./routes/adminLogs'));
app.use('/admin', require('./routes/bulkUpload'));
app.use('/admin', require('./routes/adminUsers'));
app.use('/admin', require('./routes/adminExport'));
app.use('/admin/subscriptions', require('./routes/adminSubscriptions'));
app.use('/admin/dashboard', adminDashboardRouter);
app.use('/member/dashboard', memberDashboardRouter);
app.use('/admin/profiles', adminProfilesRouter);
app.use('/admin/education', adminEducationRouter);
app.use('/admin/employment', adminEmploymentRouter);
app.use('/admin/family', adminFamilyRouter);
app.use('/notifications', notificationsRouter);

// 404 handler
app.use((req, res, next) => {
  next(new NotFoundError('Route not found'));
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Start server
sequelize.authenticate()
  .then(() => {
    console.log('Database connected');
    
    app.listen(PORT, () => {
      console.log(`HTTP Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Unable to connect to DB:', err);
    process.exit(1);
  });
// Production Configuration Guide
// This file contains the recommended settings for production deployment

export const productionConfig = {
  // API Configuration
  api: {
    // Update the production URL in apiService.ts to your actual backend domain
    baseURL: 'https://your-production-backend-domain.com', // Update this in apiService.ts
    timeout: 15000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Security Settings
  security: {
    enableHTTPSOnly: true,
    enableCSP: true,
    enableHSTS: true,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxLoginAttempts: 5,
    maxRegistrationAttempts: 3,
    maxOTPAttempts: 5,
  },

  // Email Configuration
  email: {
    enableFallback: true,
    maxRetries: 3,
    retryDelay: 2000,
  },

  // Performance Settings
  performance: {
    enableServiceWorker: true,
    enablePWA: true,
    enableCaching: true,
    cacheMaxAge: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Error Handling
  errorHandling: {
    enableErrorReporting: true,
    enableUserFeedback: true,
    logLevel: 'error', // 'debug', 'info', 'warn', 'error'
  },

  // Feature Flags
  features: {
    enableDebugLogging: false,
    enableAnalytics: true,
    enableRealTimeValidation: true,
    enableAutoSave: false,
  },
};

// Configuration checklist for production deployment
export const deploymentChecklist = [
  'Update production URL in apiService.ts to your actual backend domain',
  'Configure HTTPS for all API endpoints',
  'Set up proper CORS configuration on backend',
  'Configure email service with fallback providers',
  'Set up monitoring and error reporting',
  'Configure rate limiting on backend',
  'Set up database connection pooling',
  'Configure Redis for session storage',
  'Set up SSL certificates',
  'Configure CDN for static assets',
  'Set up backup and recovery procedures',
  'Configure logging and monitoring',
  'Test all registration flows in staging',
  'Verify email delivery in production',
  'Test OTP verification with real devices',
  'Configure proper error pages',
  'Set up health checks',
  'Configure auto-scaling if needed',
];

// Quick setup guide
export const quickSetup = {
  step1: 'Update the production URL in apiService.ts',
  step2: 'Deploy your backend to production',
  step3: 'Build and deploy frontend',
  step4: 'Test registration flow',
  step5: 'Monitor logs and errors',
};

export default productionConfig;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
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

const app = express();

app.use(cors({
  origin: '*', // Allow all origins
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

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
app.use('/bulkUpload', require('./routes/bulkUpload'));
app.use('/admin', require('./routes/adminUsers'));
app.use('/admin', require('./routes/adminExport'));
app.use('/admin/dashboard', adminDashboardRouter);
app.use('/member/dashboard', memberDashboardRouter);
app.use('/admin/profiles', adminProfilesRouter);
app.use('/admin/education', adminEducationRouter);
app.use('/admin/employment', adminEmploymentRouter);
app.use('/admin/family', adminFamilyRouter);
app.use('/notifications', notificationsRouter);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
      console.log(`API available at: http://103.127.146.54:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Unable to connect to DB:', err);
    process.exit(1);
  });
  
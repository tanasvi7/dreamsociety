# 🚀 Production Deployment Guide - DreamSociety

## 📋 Pre-Deployment Checklist

### ✅ Environment Variables Setup

Create a `.env` file in the backend directory with the following variables:

```bash
# Application Configuration
NODE_ENV=production
PORT=3000

# JWT Configuration (CRITICAL - Generate a strong secret)
JWT_SECRET=your-super-secure-jwt-secret-key-at-least-32-characters-long
JWT_EXPIRES_IN=24h

# Database Configuration
DB_HOST=your-production-database-host
DB_PORT=3306
DB_NAME=your-production-database-name
DB_USER=your-production-database-user
DB_PASSWORD=your-production-database-password

# Email Configuration (Gmail)
GMAIL_USER=your-gmail-address@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password

# AWS S3 Configuration (for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=your-aws-region
AWS_S3_BUCKET=your-s3-bucket-name

# Security Configuration
CORS_ORIGIN=https://your-frontend-domain.com
```

### 🔐 Security Requirements

1. **JWT Secret**: Must be at least 32 characters long
2. **Database**: Use SSL/TLS connections
3. **HTTPS**: Frontend and backend must use HTTPS
4. **Email**: Use Gmail App Password (not regular password)
5. **Environment Variables**: Never commit `.env` files to version control

## 🛠️ Backend Deployment

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

```bash
# Run migrations
npm run migrate

# Seed initial data
npm run seed
```

### 3. Environment Validation

The application will automatically validate required environment variables on startup. If any are missing, the application will exit with an error.

### 4. Start Production Server

```bash
# Using PM2 (recommended)
npm install -g pm2
pm2 start app.js --name "dreamsociety-api"

# Or using Node directly
NODE_ENV=production node app.js
```

## 🌐 Frontend Deployment

### 1. Update API Configuration

In `frontend/src/services/apiService.ts`, update the production URL:

```typescript
const API_CONFIG = {
  development: 'http://localhost:3000',
  production: 'https://your-api-domain.com' // Update this
};
```

### 2. Build for Production

```bash
cd frontend
npm run build
```

### 3. Deploy to Web Server

Deploy the `dist` folder to your web server (Nginx, Apache, or CDN).

## 🔒 Security Enhancements Implemented

### Backend Security

1. **JWT Security**:
   - Algorithm specification (HS256)
   - Proper claims (issuer, audience, subject)
   - Token format validation
   - Account status checking

2. **Rate Limiting**:
   - Login attempts: 5 per 15 minutes
   - Registration: 10 per 15 minutes
   - OTP requests: 3 per 5 minutes
   - General API: 100 per 15 minutes

3. **Input Validation**:
   - Password strength requirements (8+ characters)
   - Email format validation
   - Phone number validation
   - Common password detection

4. **Security Headers**:
   - Helmet.js for security headers
   - CORS configuration
   - Content Security Policy

5. **Database Security**:
   - SSL/TLS connections
   - Connection pooling
   - Retry logic with exponential backoff

6. **Error Handling**:
   - Structured error responses
   - No sensitive information in production errors
   - Proper HTTP status codes

### Frontend Security

1. **HTTPS Enforcement**:
   - Automatic HTTPS validation
   - Secure token storage
   - Request/response encryption

2. **Token Management**:
   - Secure token storage utilities
   - Automatic token validation
   - Token expiration handling

3. **Error Handling**:
   - Comprehensive error handling
   - User-friendly error messages
   - Automatic logout on authentication errors

## 📊 Monitoring & Logging

### Health Check Endpoint

```bash
GET /health
```

Returns:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected",
  "environment": {
    "JWT_SECRET": true,
    "JWT_EXPIRES_IN": true,
    "NODE_ENV": "production",
    "GMAIL_USER": true,
    "GMAIL_APP_PASSWORD": true
  },
  "version": "1.0.0"
}
```

### Environment Check Endpoint

```bash
GET /env-check
```

Returns environment variable status (for debugging).

## 🚨 Critical Security Notes

### 1. JWT Secret Generation

Generate a strong JWT secret:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

### 2. Database Security

- Use a managed database service (AWS RDS, Google Cloud SQL, etc.)
- Enable SSL/TLS connections
- Use strong passwords
- Restrict database access to application servers only

### 3. Email Configuration

- Use Gmail App Passwords (not regular passwords)
- Enable 2-factor authentication on Gmail account
- Consider using a dedicated email service (SendGrid, Mailgun, etc.)

### 4. SSL/TLS Certificates

- Use Let's Encrypt for free SSL certificates
- Configure automatic certificate renewal
- Force HTTPS redirects

## 🔧 Performance Optimization

### Backend

1. **Database Optimization**:
   - Connection pooling configured
   - Query optimization
   - Index creation

2. **Caching**:
   - Response compression enabled
   - Consider Redis for session storage

3. **Rate Limiting**:
   - IP-based rate limiting
   - User-based rate limiting for authenticated requests

### Frontend

1. **Build Optimization**:
   - Code splitting
   - Tree shaking
   - Asset compression

2. **Caching**:
   - Static asset caching
   - API response caching

## 📝 Troubleshooting

### Common Issues

1. **Environment Variables Missing**:
   - Check `.env` file exists
   - Verify all required variables are set
   - Restart application after changes

2. **Database Connection Issues**:
   - Verify database credentials
   - Check network connectivity
   - Ensure SSL configuration

3. **Email Sending Issues**:
   - Verify Gmail credentials
   - Check Gmail App Password
   - Ensure 2FA is enabled

4. **CORS Issues**:
   - Update CORS_ORIGIN in environment
   - Check frontend domain configuration
   - Verify HTTPS/HTTP protocol matching

### Logs

Check application logs for detailed error information:

```bash
# PM2 logs
pm2 logs dreamsociety-api

# Direct logs
tail -f logs/app.log
```

## 🔄 Maintenance

### Regular Tasks

1. **Security Updates**:
   - Keep dependencies updated
   - Monitor security advisories
   - Regular security audits

2. **Backup**:
   - Database backups
   - Configuration backups
   - Log rotation

3. **Monitoring**:
   - Health check monitoring
   - Performance monitoring
   - Error rate monitoring

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review application logs
3. Verify environment configuration
4. Contact development team

---

**⚠️ Important**: This application is now production-ready with comprehensive security measures. Ensure all environment variables are properly configured before deployment.

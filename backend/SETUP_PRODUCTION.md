# 🚀 Quick Production Setup Guide

## 1. Generate JWT Secret ✅
You've already generated a JWT secret:
```
JWT_SECRET=010223472562f3b4bf4f3f1a5b426bc00486c9ce9a53a9f1ec6c081f8aa488e9
```

## 2. Create Your .env File

Copy the example and update with your values:

```bash
cp env.example .env
```

Then edit `.env` with your actual values:

```bash
# Application Configuration
NODE_ENV=production
PORT=3000

# JWT Configuration (Use the generated secret)
JWT_SECRET=010223472562f3b4bf4f3f1a5b426bc00486c9ce9a53a9f1ec6c081f8aa488e9
JWT_EXPIRES_IN=24h

# Database Configuration (Update these)
DB_HOST=your-actual-database-host
DB_PORT=3306
DB_NAME=your-actual-database-name
DB_USER=your-actual-database-user
DB_PASSWORD=your-actual-database-password

# Email Configuration (Update these)
GMAIL_USER=your-actual-gmail@gmail.com
GMAIL_APP_PASSWORD=your-actual-gmail-app-password

# Frontend URL (Update this)
CORS_ORIGIN=https://your-frontend-domain.com
```

## 3. SSL/HTTPS Configuration

### Option A: Using a Reverse Proxy (Recommended)
Most production deployments use Nginx or Apache as a reverse proxy:

```nginx
# Nginx configuration example
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Option B: Direct HTTPS in Node.js (Advanced)
If you want to run HTTPS directly in Node.js, uncomment these lines in `.env`:
```bash
SSL_KEY_PATH=/path/to/ssl/key.pem
SSL_CERT_PATH=/path/to/ssl/cert.pem
```

## 4. Install Dependencies & Setup Database

```bash
# Install dependencies
npm install

# Run database migrations
npm run migrate

# Seed initial data
npm run seed
```

## 5. Start the Application

```bash
# Development
npm run dev

# Production (using PM2)
npm install -g pm2
pm2 start app.js --name "dreamsociety-api"

# Or direct Node.js
NODE_ENV=production node app.js
```

## 6. Test Your Setup

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test environment check
curl http://localhost:3000/env-check
```

## 🔒 Security Checklist

- ✅ JWT secret generated and configured
- ✅ Database credentials set
- ✅ Email credentials configured
- ✅ CORS origin set to your frontend domain
- ✅ HTTPS/SSL configured (via reverse proxy or direct)
- ✅ Environment variables validated on startup

## 📝 Important Notes

1. **SSL/HTTPS**: You don't need the SSL_KEY_PATH and SSL_CERT_PATH unless you're running HTTPS directly in Node.js
2. **Reverse Proxy**: Most production setups use Nginx/Apache for SSL termination
3. **Environment Variables**: The app will validate all required variables on startup
4. **Database**: Use a managed database service (AWS RDS, Google Cloud SQL, etc.) for production

## 🚨 Common Issues

1. **Missing Environment Variables**: The app will exit with clear error messages
2. **Database Connection**: Ensure your database is accessible and credentials are correct
3. **Email Configuration**: Use Gmail App Password, not regular password
4. **CORS Issues**: Make sure CORS_ORIGIN matches your frontend domain exactly

## 📞 Need Help?

1. Check the application logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test database connectivity
4. Ensure your frontend domain is accessible

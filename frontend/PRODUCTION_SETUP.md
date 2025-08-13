# 🌐 Frontend Production Setup Guide

## 📋 Required Changes for Production

### 1. **Update API URL (CRITICAL)**

**File:** `src/services/apiService.ts`

**Current Configuration:**
```typescript
const API_CONFIG = {
  development: 'http://localhost:3000',
  production: 'https://api.dreamsociety.in'  // ← UPDATE THIS!
};
```

**Action Required:**
```typescript
const API_CONFIG = {
  development: 'http://localhost:3000',
  production: 'https://your-actual-backend-domain.com'  // ← Your real backend URL
};
```

### 2. **Environment Variables (Optional but Recommended)**

Create `.env.production` file in the frontend root:

```bash
# Frontend Environment Variables
VITE_API_URL=https://your-actual-backend-domain.com
VITE_APP_NAME=DreamSociety
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
```

### 3. **Build Configuration**

**File:** `vite.config.ts` - Already production-ready ✅

**Current settings are good:**
- ✅ Production build optimization
- ✅ Asset compression
- ✅ Code splitting
- ✅ Tree shaking

### 4. **Security Headers (Optional)**

Add to your web server (Nginx/Apache) configuration:

```nginx
# Security Headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;" always;
```

## 🚀 Production Deployment Steps

### Step 1: Update API URL
```bash
# Edit the file
nano src/services/apiService.ts

# Update the production URL to your actual backend domain
production: 'https://your-actual-backend-domain.com'
```

### Step 2: Build for Production
```bash
# Install dependencies (if not done)
npm install

# Build for production
npm run build

# This creates a 'dist' folder with optimized files
```

### Step 3: Deploy to Web Server

**Option A: Static File Server (Nginx)**
```nginx
server {
    listen 80;
    server_name your-frontend-domain.com;
    root /path/to/your/dist;
    index index.html;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Option B: CDN (Cloudflare, AWS CloudFront, etc.)**
- Upload `dist` folder contents to your CDN
- Configure custom domain
- Set up caching rules

**Option C: Vercel/Netlify**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🔒 Security Checklist

### ✅ Frontend Security
- [ ] HTTPS enforced in production
- [ ] API URL updated to production domain
- [ ] Debug logging disabled
- [ ] Error messages don't expose sensitive info
- [ ] CORS properly configured on backend
- [ ] Security headers configured

### ✅ Token Management
- [ ] Secure token storage (localStorage with HTTPS)
- [ ] Automatic token expiration handling
- [ ] Automatic logout on 401 errors
- [ ] Token validation on app startup

### ✅ Error Handling
- [ ] User-friendly error messages
- [ ] Network error handling
- [ ] Timeout handling
- [ ] Graceful degradation

## 📊 Performance Optimization

### ✅ Already Implemented
- [ ] Code splitting
- [ ] Tree shaking
- [ ] Asset compression
- [ ] Lazy loading
- [ ] Image optimization

### 🔧 Additional Optimizations (Optional)
```bash
# Install compression middleware for your web server
# Enable gzip/brotli compression
# Configure CDN caching
# Set up service worker for offline support
```

## 🧪 Testing Production Build

### Local Testing
```bash
# Build and preview locally
npm run build
npm run preview

# Test on http://localhost:4173
```

### Production Testing Checklist
- [ ] Registration flow works
- [ ] Login/logout works
- [ ] OTP verification works
- [ ] All API calls succeed
- [ ] Error handling works
- [ ] Mobile responsiveness
- [ ] Loading states work
- [ ] Token expiration handling

## 🚨 Common Issues & Solutions

### Issue 1: CORS Errors
**Solution:** Ensure backend CORS_ORIGIN matches your frontend domain exactly

### Issue 2: API Calls Failing
**Solution:** Verify API URL is correct and backend is accessible

### Issue 3: Token Issues
**Solution:** Check HTTPS enforcement and token storage

### Issue 4: Build Errors
**Solution:** Check for TypeScript errors and fix before building

## 📝 Quick Deployment Commands

```bash
# 1. Update API URL
sed -i 's|https://api.dreamsociety.in|https://your-actual-backend-domain.com|g' src/services/apiService.ts

# 2. Build
npm run build

# 3. Deploy (example with rsync)
rsync -avz dist/ user@server:/var/www/html/

# 4. Test
curl -I https://your-frontend-domain.com
```

## 🔄 Environment-Specific Configurations

### Development
```typescript
// Uses localhost:3000 backend
// Debug logging enabled
// Longer timeouts
```

### Production
```typescript
// Uses your production backend
// Debug logging disabled
// Shorter timeouts
// HTTPS enforcement
```

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify API URL is correct
3. Test backend connectivity
4. Check CORS configuration
5. Verify HTTPS setup

---

**⚠️ Important**: The main change needed is updating the production API URL in `src/services/apiService.ts`. Everything else is already production-ready!

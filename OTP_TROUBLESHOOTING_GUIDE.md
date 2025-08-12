# OTP Verification Troubleshooting Guide

## 🚨 Common OTP Issues and Solutions

### Issue 1: "OTP not found or expired" Error

**Symptoms:**
- User enters correct OTP but gets "OTP not found or expired" error
- Error occurs even with valid OTP codes

**Root Causes:**
1. **Maximum attempts exceeded** - OTP was deleted after too many failed attempts
2. **Session timeout** - OTP expired (10 minutes)
3. **Server restart** - In-memory OTP store was cleared
4. **Email mismatch** - Email case sensitivity issues

**Solutions:**

#### For Maximum Attempts Exceeded:
```javascript
// Backend: OTP service now handles this better
// Frontend: Automatically enables resend button when max attempts reached
```

**Steps to Fix:**
1. **Request new OTP** - Click "Resend verification code" button
2. **Clear browser cache** - Clear localStorage and try again
3. **Check email case** - Ensure email matches exactly (case-sensitive)

#### For Session Timeout:
```javascript
// OTP expires after 10 minutes
// Solution: Request new OTP
```

#### For Server Restart:
```javascript
// In-memory storage lost on restart
// Solution: Request new OTP
```

### Issue 2: "Maximum verification attempts exceeded"

**Symptoms:**
- User gets locked out after 3-5 failed attempts
- Cannot verify OTP even with correct code

**Solutions:**
1. **Automatic resend** - System now automatically enables resend button
2. **Manual resend** - Click "Resend verification code"
3. **Clear session** - Go back to registration and start over

### Issue 3: OTP Not Received in Email

**Symptoms:**
- No email received after registration
- Email in spam folder
- Email delivery delays

**Solutions:**

#### Check Email Configuration:
```bash
# Backend environment variables
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

#### Email Service Issues:
1. **Gmail App Password** - Ensure app password is correct and not expired
2. **Rate Limiting** - Gmail has sending limits
3. **Spam Filters** - Check spam/junk folder
4. **Email Provider** - Some providers block automated emails

### Issue 4: Frontend-Backend Communication Issues

**Symptoms:**
- Network errors during OTP verification
- Timeout errors
- CORS issues

**Solutions:**

#### Check API Configuration:
```javascript
// In frontend/src/services/apiService.ts
const API_CONFIG = {
  development: 'http://localhost:3000',
  production: 'https://your-production-backend-domain.com', // Update this
  staging: 'https://your-staging-backend-domain.com'
};
```

#### Network Issues:
1. **Check backend server** - Ensure backend is running
2. **Check CORS** - Verify CORS configuration
3. **Check firewall** - Ensure ports are open
4. **Check DNS** - Verify domain resolution

## 🔧 Debugging Steps

### Step 1: Check Backend Logs
```bash
# Look for these log messages:
[OTP SERVICE] OTP sent to email: user@example.com | OTP: 123456
[OTP SERVICE] Error verifying OTP: Error: Maximum verification attempts exceeded
OTP verification attempt for email: user@example.com
```

### Step 2: Test OTP Service Directly
```bash
# Run the debug script
cd backend
node test-otp-debug.js
```

### Step 3: Check Frontend Console
```javascript
// Look for these console messages:
API Request: POST /auth/verify-otp
API Error: { status: 400, message: "Invalid OTP" }
```

### Step 4: Verify Email Delivery
```bash
# Check backend email logs
# Look for successful email delivery messages
```

## 🛠️ Quick Fixes

### Fix 1: Reset OTP for User
```javascript
// In backend, clear OTP for specific email
const otpStore = require('./utils/otpService').otpStore;
otpStore.delete('user@example.com');
```

### Fix 2: Clear Frontend Session
```javascript
// In browser console
localStorage.removeItem('pendingRegistrationEmail');
localStorage.removeItem('registrationTimestamp');
// Then go back to registration
```

### Fix 3: Restart Backend Server
```bash
# Restart the backend server
npm restart
# or
node app.js
```

## 📋 Testing Checklist

### Pre-Production Testing:
- [ ] Test OTP sending with valid email
- [ ] Test OTP verification with correct code
- [ ] Test OTP verification with incorrect code
- [ ] Test maximum attempts scenario
- [ ] Test OTP expiration (wait 10 minutes)
- [ ] Test resend functionality
- [ ] Test session expiration (wait 30 minutes)
- [ ] Test network error scenarios

### Production Testing:
- [ ] Test with real email addresses
- [ ] Test with different email providers
- [ ] Test with mobile devices
- [ ] Test with different browsers
- [ ] Test with slow network connections
- [ ] Test with concurrent users

## 🚀 Prevention Measures

### 1. **Use Persistent Storage**
```javascript
// Consider using Redis or database for OTP storage
// Instead of in-memory storage
```

### 2. **Implement Email Fallbacks**
```javascript
// Use multiple email providers
// SendGrid, AWS SES, etc.
```

### 3. **Add Monitoring**
```javascript
// Monitor OTP success/failure rates
// Alert on high failure rates
```

### 4. **Improve Error Messages**
```javascript
// Provide clear, actionable error messages
// Guide users to next steps
```

## 📞 Emergency Procedures

### If OTP System is Down:
1. **Temporary Disable** - Disable OTP requirement temporarily
2. **Manual Verification** - Use admin panel to verify users manually
3. **Alternative Flow** - Implement SMS OTP as backup
4. **Support Contact** - Provide support contact for manual verification

### If Email Service is Down:
1. **Switch Provider** - Use backup email service
2. **SMS OTP** - Implement SMS-based OTP
3. **Manual Process** - Admin manual verification
4. **Status Page** - Update status page with current issues

## 🎯 Success Metrics

### Monitor These Metrics:
- **OTP Delivery Rate**: >95%
- **OTP Verification Success Rate**: >90%
- **Average Verification Time**: <2 minutes
- **Support Tickets**: <5% of registrations
- **User Abandonment Rate**: <10%

### Alert Thresholds:
- **OTP Delivery Rate**: <90%
- **Verification Success Rate**: <80%
- **Error Rate**: >5%
- **Response Time**: >10 seconds

---

## 🏆 Best Practices

1. **Always provide clear error messages**
2. **Implement automatic retry mechanisms**
3. **Use persistent storage for production**
4. **Monitor and alert on failures**
5. **Have fallback verification methods**
6. **Test thoroughly before deployment**
7. **Document all error scenarios**
8. **Provide user support channels**

This guide should help resolve most OTP-related issues. If problems persist, check the backend logs and run the debug script for detailed diagnostics.

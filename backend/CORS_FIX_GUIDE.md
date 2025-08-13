# CORS Fix Guide for Dream Society API

## Problem
You're experiencing a CORS error when your frontend at `https://dreamssociety.in` tries to access your backend API at `https://api.dreamssociety.in/auth/login`.

## Solution Applied

### 1. Enhanced CORS Configuration
The CORS configuration in `app.js` has been updated with:
- Dynamic origin checking with better error logging
- Support for `CORS_ORIGIN` environment variable
- Additional CORS headers for preflight requests
- More comprehensive allowed headers and methods

### 2. Environment Variable Support
You can now set the `CORS_ORIGIN` environment variable to specify allowed origins:
```bash
CORS_ORIGIN=https://dreamssociety.in,https://www.dreamssociety.in
```

### 3. Debug Endpoints Added
- `/cors-debug` - Shows CORS configuration and request details
- `/env-check` - Shows environment variables including CORS settings

## Testing Steps

### 1. Restart Your Backend Server
```bash
# Stop your current server and restart it
npm start
# or
node app.js
```

### 2. Test CORS Configuration
Run the test script:
```bash
node test-cors.js
```

### 3. Manual Testing
Visit these URLs in your browser:
- `https://api.dreamssociety.in/health`
- `https://api.dreamssociety.in/cors-debug`
- `https://api.dreamssociety.in/env-check`

### 4. Check Environment Variables
Make sure your `.env` file has:
```bash
NODE_ENV=production
CORS_ORIGIN=https://dreamssociety.in,https://www.dreamssociety.in
```

## Common Issues and Solutions

### Issue 1: Still getting CORS errors
**Solution**: Check if your server is actually running the updated code. Restart the server completely.

### Issue 2: Frontend still can't connect
**Solution**: 
1. Check browser console for exact error message
2. Verify the API URL is correct in your frontend
3. Test with the debug endpoints

### Issue 3: Preflight requests failing
**Solution**: The updated configuration handles OPTIONS requests properly. If still failing, check if there's a reverse proxy (Nginx/Apache) blocking OPTIONS requests.

## Verification Commands

### Test from command line:
```bash
# Test health endpoint
curl -H "Origin: https://dreamssociety.in" https://api.dreamssociety.in/health

# Test preflight request
curl -X OPTIONS -H "Origin: https://dreamssociety.in" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  https://api.dreamssociety.in/auth/login
```

### Expected Response Headers:
```
Access-Control-Allow-Origin: https://dreamssociety.in
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization
Access-Control-Allow-Credentials: true
```

## If Problems Persist

1. **Check server logs** for CORS-related messages
2. **Verify domain names** are exactly correct (no typos)
3. **Check for reverse proxy** configuration that might be interfering
4. **Test with a simple curl request** to isolate the issue
5. **Check if your hosting provider** has any CORS restrictions

## Additional Debugging

If you're still having issues, you can temporarily enable more verbose CORS logging by adding this to your `.env` file:
```bash
DEBUG=cors:*
```

This will show detailed CORS processing information in your server logs.

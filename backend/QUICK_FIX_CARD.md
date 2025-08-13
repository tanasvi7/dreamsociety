# 🚨 QUICK FIX: cPanel Lock Issue

## Immediate Steps (Do These First)

### 1. Clear cPanel Cache
- Go to **Software** → **Node.js Selector**
- If you see your app, click **Delete**
- Wait 2-3 minutes

### 2. Remove Lock Files (File Manager)
Navigate to `/public_html/dreamssociety_backend/backend/` and delete:
- `.lock`
- `package-lock.json.lock`
- `npm-debug.log`
- `.npm-debug.log`
- Any `.pid` files

### 3. Set File Permissions
Right-click folders/files in File Manager:
- **Folders**: 755
- **Files**: 644
- **app.js**: 755

### 4. Wait 10-15 Minutes
Sometimes cPanel needs time to clear internal locks.

### 5. Create New Node.js App
- **Software** → **Node.js Selector** → **Create Application**
- **Node.js version**: 18.x or 20.x
- **Application root**: `/public_html/dreamssociety_backend/backend`
- **Startup file**: `app.js`
- **Environment**: Production

## Environment Variables to Add
```
NODE_ENV=production
CORS_ORIGIN=https://dreamssociety.in,https://www.dreamssociety.in
JWT_SECRET=your-secret
DB_HOST=your-host
DB_USER=your-user
DB_PASSWORD=your-password
DB_NAME=your-database
```

## If Still Locked
1. **Contact hosting provider** - Ask them to clear the lock
2. **Try different browser** - Clear cache and cookies
3. **Wait 30 minutes** - Let cPanel auto-clear
4. **Delete and re-upload** - Fresh file upload

## Test After Deployment
Visit these URLs:
- `https://yourdomain.com/health`
- `https://yourdomain.com/cors-debug`

---
**Need more help?** See `CPANEL_LOCK_FIX.md` for detailed steps.

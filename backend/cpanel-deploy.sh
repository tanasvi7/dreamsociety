#!/bin/bash

echo "🚀 cPanel Deployment Script for Dream Society Backend"
echo "=================================================="

# Configuration
APP_NAME="dreamsociety-backend"
APP_ROOT="/public_html/dreamssociety_backend/backend"
NODE_VERSION="18"

echo "📋 Step 1: Checking current directory..."
if [ ! -f "app.js" ]; then
    echo "❌ Error: app.js not found. Please run this script from the backend directory."
    exit 1
fi

echo "✅ Found app.js in current directory"

echo "📋 Step 2: Checking for existing processes..."
# Check if any Node.js processes are running
if pgrep -f "node.*app.js" > /dev/null; then
    echo "⚠️  Found running Node.js processes. Stopping them..."
    pkill -f "node.*app.js"
    sleep 3
fi

echo "📋 Step 3: Cleaning up lock files..."
# Remove common lock files
rm -f .lock package-lock.json.lock npm-debug.log .npm-debug.log
rm -f *.pid

echo "📋 Step 4: Clearing npm cache..."
npm cache clean --force

echo "📋 Step 5: Installing dependencies..."
# Remove existing node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Install dependencies
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error: npm install failed"
    exit 1
fi

echo "📋 Step 6: Setting file permissions..."
# Set proper permissions for cPanel
chmod 755 app.js
chmod -R 755 node_modules
chmod 644 package.json
chmod 644 .env

echo "📋 Step 7: Creating .cpanel.yml for deployment..."
# Create .cpanel.yml file for automated deployment
cat > .cpanel.yml << EOF
---
deployment:
  tasks:
    - export DEPLOYPATH=$APP_ROOT/
    - /bin/cp -R * \$DEPLOYPATH
    - /bin/chmod 755 \$DEPLOYPATH/app.js
    - /bin/chmod -R 755 \$DEPLOYPATH/node_modules
    - /bin/chmod 644 \$DEPLOYPATH/package.json
    - /bin/chmod 644 \$DEPLOYPATH/.env
EOF

echo "📋 Step 8: Creating startup script..."
# Create a startup script for cPanel
cat > start-app.sh << EOF
#!/bin/bash
cd $APP_ROOT
export NODE_ENV=production
export CORS_ORIGIN=https://dreamssociety.in,https://www.dreamssociety.in
node app.js
EOF

chmod +x start-app.sh

echo "📋 Step 9: Creating environment template..."
# Create environment template if .env doesn't exist
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating template..."
    cat > .env.template << EOF
# Application Configuration
NODE_ENV=production
PORT=3000

# JWT Configuration
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=24h

# Database Configuration
DB_HOST=your-database-host
DB_PORT=3306
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password

# CORS Configuration
CORS_ORIGIN=https://dreamssociety.in,https://www.dreamssociety.in

# Email Configuration
GMAIL_USER=your-gmail-address@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password

# AWS S3 Configuration (if using)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=your-aws-region
AWS_S3_BUCKET=your-s3-bucket-name
EOF
    echo "✅ Created .env.template - Please copy to .env and fill in your values"
fi

echo ""
echo "✅ Deployment preparation completed!"
echo ""
echo "📋 Next steps in cPanel:"
echo "1. Go to Software → Node.js Selector"
echo "2. Click 'Create Application'"
echo "3. Set the following:"
echo "   - Node.js version: $NODE_VERSION"
echo "   - Application mode: Production"
echo "   - Application root: $APP_ROOT"
echo "   - Application startup file: app.js"
echo "   - Passenger environment: Production"
echo ""
echo "4. Add environment variables in Node.js Selector:"
echo "   - NODE_ENV=production"
echo "   - CORS_ORIGIN=https://dreamssociety.in,https://www.dreamssociety.in"
echo "   - Add your database and other environment variables"
echo ""
echo "5. Click 'Create' to deploy your application"
echo ""
echo "🔍 Debug endpoints after deployment:"
echo "   - https://yourdomain.com/health"
echo "   - https://yourdomain.com/cors-debug"
echo "   - https://yourdomain.com/env-check"
echo ""
echo "📄 For troubleshooting, see: CPANEL_LOCK_FIX.md"

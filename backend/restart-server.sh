#!/bin/bash

echo "🔄 Restarting Dream Society API Server with updated CORS configuration..."

# Kill any existing Node.js processes (be careful with this in production)
echo "📋 Stopping existing server processes..."
pkill -f "node.*app.js" || true
pkill -f "npm.*start" || true

# Wait a moment for processes to stop
sleep 2

# Check if .env file exists and has CORS configuration
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Creating one with basic CORS configuration..."
    cat > .env << EOF
NODE_ENV=production
CORS_ORIGIN=https://dreamssociety.in,https://www.dreamssociety.in
# Add other required environment variables here
EOF
    echo "✅ Created .env file with CORS configuration"
fi

# Check if CORS_ORIGIN is set in .env
if ! grep -q "CORS_ORIGIN" .env; then
    echo "⚠️  Adding CORS_ORIGIN to .env file..."
    echo "CORS_ORIGIN=https://dreamssociety.in,https://www.dreamssociety.in" >> .env
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the server
echo "🚀 Starting server with updated CORS configuration..."
echo "📊 Server will be available at: https://api.dreamssociety.in"
echo "🔍 Debug endpoints:"
echo "   - https://api.dreamssociety.in/health"
echo "   - https://api.dreamssociety.in/cors-debug"
echo "   - https://api.dreamssociety.in/env-check"

# Start the server in the background
nohup node app.js > server.log 2>&1 &

# Wait a moment for server to start
sleep 3

# Check if server started successfully
if pgrep -f "node.*app.js" > /dev/null; then
    echo "✅ Server started successfully!"
    echo "📋 Process ID: $(pgrep -f 'node.*app.js')"
    echo "📄 Logs are being written to: server.log"
    echo ""
    echo "🧪 To test CORS configuration, run:"
    echo "   node test-cors.js"
else
    echo "❌ Failed to start server. Check server.log for details."
    exit 1
fi

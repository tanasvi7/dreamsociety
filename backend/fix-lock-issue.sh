#!/bin/bash

echo "🔧 Fixing lock issue for Dream Society Backend..."

# Function to check if a process is running
check_process() {
    local process_name=$1
    if pgrep -f "$process_name" > /dev/null; then
        return 0  # Process is running
    else
        return 1  # Process is not running
    fi
}

# Function to kill process gracefully
kill_process_gracefully() {
    local process_name=$1
    local pid=$(pgrep -f "$process_name")
    if [ ! -z "$pid" ]; then
        echo "🔄 Stopping $process_name (PID: $pid)..."
        kill -TERM $pid
        sleep 3
        
        # Check if process is still running
        if check_process "$process_name"; then
            echo "⚠️  Process still running, force killing..."
            kill -KILL $pid
            sleep 2
        fi
    fi
}

# Function to kill process forcefully
kill_process_forcefully() {
    local process_name=$1
    local pids=$(pgrep -f "$process_name")
    if [ ! -z "$pids" ]; then
        echo "💥 Force killing all $process_name processes..."
        echo $pids | xargs kill -KILL
        sleep 2
    fi
}

echo "📋 Step 1: Checking for running Node.js processes..."

# Check for various Node.js processes
if check_process "node.*app.js"; then
    echo "Found node app.js process"
    kill_process_gracefully "node.*app.js"
fi

if check_process "npm.*start"; then
    echo "Found npm start process"
    kill_process_gracefully "npm.*start"
fi

if check_process "node.*backend"; then
    echo "Found node backend process"
    kill_process_gracefully "node.*backend"
fi

if check_process "pm2"; then
    echo "Found PM2 process"
    kill_process_gracefully "pm2"
fi

echo "📋 Step 2: Force killing any remaining Node.js processes..."
kill_process_forcefully "node"
kill_process_forcefully "npm"

echo "📋 Step 3: Checking for file locks..."

# Check for common lock files and remove them
lock_files=(
    ".lock"
    "package-lock.json.lock"
    "yarn.lock.lock"
    "npm-debug.log"
    ".npm-debug.log"
    "*.pid"
)

for lock_file in "${lock_files[@]}"; do
    if ls $lock_file 2>/dev/null; then
        echo "🗑️  Removing lock file: $lock_file"
        rm -f $lock_file
    fi
done

echo "📋 Step 4: Clearing npm cache..."
npm cache clean --force

echo "📋 Step 5: Checking for port conflicts..."

# Check if port 3000 is in use
if lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️  Port 3000 is in use. Killing processes using this port..."
    lsof -ti :3000 | xargs kill -KILL
fi

# Check if port 8080 is in use
if lsof -i :8080 > /dev/null 2>&1; then
    echo "⚠️  Port 8080 is in use. Killing processes using this port..."
    lsof -ti :8080 | xargs kill -KILL
fi

echo "📋 Step 6: Verifying no Node.js processes are running..."

# Final check
if check_process "node"; then
    echo "❌ Node.js processes are still running. Attempting final cleanup..."
    pkill -9 -f "node"
    sleep 2
fi

if check_process "npm"; then
    echo "❌ NPM processes are still running. Attempting final cleanup..."
    pkill -9 -f "npm"
    sleep 2
fi

echo "📋 Step 7: Final verification..."

# Final verification
if ! check_process "node" && ! check_process "npm"; then
    echo "✅ All Node.js processes have been stopped successfully!"
    echo "✅ Lock issue should be resolved."
    echo ""
    echo "🚀 You can now restart your server with:"
    echo "   npm start"
    echo "   or"
    echo "   node app.js"
else
    echo "❌ Some processes are still running. Manual intervention may be required."
    echo "Running processes:"
    ps aux | grep -E "(node|npm)" | grep -v grep
fi

echo ""
echo "📋 Additional troubleshooting steps if issues persist:"
echo "1. Restart your server/container completely"
echo "2. Check if you have multiple terminal sessions running the server"
echo "3. Verify no other applications are using the same ports"
echo "4. Check your hosting provider's process management"

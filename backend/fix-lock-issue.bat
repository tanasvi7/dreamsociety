@echo off
echo 🔧 Fixing lock issue for Dream Society Backend (Windows)...

echo 📋 Step 1: Checking for running Node.js processes...

REM Check for Node.js processes
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Found Node.js processes running
    echo 🔄 Stopping Node.js processes...
    taskkill /F /IM node.exe
    timeout /t 3 /nobreak > NUL
)

REM Check for NPM processes
tasklist /FI "IMAGENAME eq npm.cmd" 2>NUL | find /I /N "npm.cmd">NUL
if "%ERRORLEVEL%"=="0" (
    echo Found NPM processes running
    echo 🔄 Stopping NPM processes...
    taskkill /F /F /IM npm.cmd
    timeout /t 3 /nobreak > NUL
)

echo 📋 Step 2: Checking for port conflicts...

REM Check if port 3000 is in use
netstat -ano | findstr :3000
if "%ERRORLEVEL%"=="0" (
    echo ⚠️  Port 3000 is in use. Killing processes using this port...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        taskkill /F /PID %%a
    )
)

REM Check if port 8080 is in use
netstat -ano | findstr :8080
if "%ERRORLEVEL%"=="0" (
    echo ⚠️  Port 8080 is in use. Killing processes using this port...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do (
        taskkill /F /PID %%a
    )
)

echo 📋 Step 3: Checking for file locks...

REM Remove common lock files
if exist ".lock" (
    echo 🗑️  Removing .lock file
    del /F .lock
)

if exist "package-lock.json.lock" (
    echo 🗑️  Removing package-lock.json.lock
    del /F package-lock.json.lock
)

if exist "npm-debug.log" (
    echo 🗑️  Removing npm-debug.log
    del /F npm-debug.log
)

if exist ".npm-debug.log" (
    echo 🗑️  Removing .npm-debug.log
    del /F .npm-debug.log
)

echo 📋 Step 4: Clearing npm cache...
npm cache clean --force

echo 📋 Step 5: Final verification...

REM Final check for Node.js processes
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ❌ Node.js processes are still running. Attempting final cleanup...
    taskkill /F /IM node.exe
    timeout /t 2 /nobreak > NUL
) else (
    echo ✅ No Node.js processes are running
)

echo.
echo ✅ Lock issue should be resolved.
echo.
echo 🚀 You can now restart your server with:
echo    npm start
echo    or
echo    node app.js
echo.
echo 📋 Additional troubleshooting steps if issues persist:
echo 1. Restart your computer completely
echo 2. Check if you have multiple terminal sessions running the server
echo 3. Verify no other applications are using the same ports
echo 4. Check your hosting provider's process management
echo 5. Try running as Administrator if permission issues occur

pause

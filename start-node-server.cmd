@echo off
echo ====================================================
echo  NexusGov - Starting Node.js Express Server
echo ====================================================
echo.

cd /d "%~dp0server"

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installing server dependencies...
    npm install
)

echo.
echo Starting Node.js / Express Server on port 5000...
echo Health Check: http://localhost:5000/api/health
echo.
npm start

pause

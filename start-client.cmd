@echo off
echo ====================================================
echo  NexusGov - Starting React Frontend (Client)
echo ====================================================
echo.

cd /d "%~dp0client"

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js / npm is not installed.
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo Installing dependencies (if needed)...
if not exist "node_modules" (
    npm install
)

echo.
echo Starting React dev server on http://localhost:5173 ...
echo.
npm run dev

pause

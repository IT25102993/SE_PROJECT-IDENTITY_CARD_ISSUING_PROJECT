@echo off
title NexusGov - National Identity Card Issuing System
color 0B

echo ======================================================================
echo    NEXUSGOV IDENTITY ISSUANCE SYSTEM — INSTANT LAUNCHER
echo    Department of Registration of Persons • Democratic Socialist Republic of Sri Lanka
echo ======================================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not installed or not found in PATH.
    echo Please install Node.js 18+ from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Ensure server dependencies exist
if not exist "%~dp0server\node_modules" (
    echo [1/3] Installing Server dependencies...
    cd /d "%~dp0server"
    call npm install --silent
)

:: Ensure client dependencies exist
if not exist "%~dp0client\node_modules" (
    echo [2/3] Installing Client dependencies...
    cd /d "%~dp0client"
    call npm install --silent
)

echo [1/2] Starting Node.js Backend API (Port 5000)...
start "NexusGov - Backend Server (Port 5000)" cmd /k "color 0A && cd /d "%~dp0server" && npm start"

:: Quick 1.5-second warm-up before launching frontend
timeout /t 2 /nobreak >nul

echo [2/2] Starting React Vite Frontend (Port 5173)...
start "NexusGov - Frontend Client (Port 5173)" cmd /k "color 0B && cd /d "%~dp0client" && npm run dev"

:: Open default browser directly to application
timeout /t 2 /nobreak >nul
start http://localhost:5173

echo.
echo ======================================================================
echo   ALL SERVICES RUNNING SUCCESSFULLY!
echo ======================================================================
echo.
echo   Citizen Portal:       http://localhost:5173
echo   Online Application:   http://localhost:5173/apply
echo   Live Card Tracking:   http://localhost:5173/track
echo   Verification Officer: http://localhost:5173/officer
echo   Senior Approver:      http://localhost:5173/officer?view=approver
echo   Production / Print:   http://localhost:5173/print-queue
echo   Executive Admin:      http://localhost:5173/admin
echo.
echo   Backend REST API:     http://localhost:5000
echo   API Health Check:     http://localhost:5000/api/health
echo.
echo ----------------------------------------------------------------------
echo   DEFAULT CREDENTIALS (All passwords: password123 or #Thilina2005):
echo     * Admin:    admin@nexusgov.lk  /  thilinasakalasooriya@gmail.com
echo     * Officer:  officer@nexusgov.lk
echo     * Approver: approver@nexusgov.lk
echo ======================================================================
echo.
echo  Keep the server windows open. Close them when you want to stop the servers.
echo.
pause

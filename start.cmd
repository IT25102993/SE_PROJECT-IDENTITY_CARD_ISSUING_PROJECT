@echo off
title NexusGov - National Identity Card Issuing System
color 0B

echo ======================================================================
echo    NEXUSGOV IDENTITY ISSUANCE SYSTEM — INSTANT LAUNCHER
echo    Department of Registration of Persons
echo    Democratic Socialist Republic of Sri Lanka
echo ======================================================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not installed or not found in PATH.
    echo Please install Node.js 18+ from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Free port 5000 if already in use (kill any leftover node/java processes)
echo [INFO] Checking if port 5000 is free...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5000 " ^| findstr LISTENING') do (
    echo [INFO] Freeing port 5000 (PID %%a)...
    taskkill /PID %%a /F >nul 2>nul
)
timeout /t 1 /nobreak >nul

:: Free port 5173 if already in use
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5173 " ^| findstr LISTENING') do (
    echo [INFO] Freeing port 5173 (PID %%a)...
    taskkill /PID %%a /F >nul 2>nul
)
timeout /t 1 /nobreak >nul

:: Check MySQL (warning only — server works in In-Memory mode without it)
powershell -NoProfile -Command "$c = [System.Net.Sockets.TcpClient]::new(); $ok = $c.ConnectAsync('localhost',3306).Wait(1500); $c.Close(); if($ok){exit 0}else{exit 1}" >nul 2>nul
if %errorlevel% neq 0 (
    color 0E
    echo [WARNING] MySQL is not running on localhost:3306.
    echo           Server will operate in In-Memory mode (data will not persist).
    echo           Start MySQL (XAMPP/WAMP) for full database functionality.
    color 0B
    echo.
)

:: Ensure server dependencies exist
if not exist "%~dp0server\node_modules" (
    echo [SETUP] Installing server dependencies...
    cd /d "%~dp0server"
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] Failed to install server dependencies.
        pause
        exit /b 1
    )
)

:: Ensure client dependencies exist
if not exist "%~dp0client\node_modules" (
    echo [SETUP] Installing client dependencies...
    cd /d "%~dp0client"
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] Failed to install client dependencies.
        pause
        exit /b 1
    )
)

echo.
echo [1/2] Starting Node.js Express Backend API (Port 5000)...
start "NexusGov - Backend API (Port 5000)" cmd /k "color 0A && cd /d "%~dp0server" && echo Starting NexusGov API Server... && npm start || (color 0C && echo. && echo [ERROR] Server failed to start. Check the error above. && pause)"

:: Give server 4 seconds to bind the port
timeout /t 4 /nobreak >nul

echo [2/2] Starting React Vite Frontend (Port 5173)...
start "NexusGov - Frontend Client (Port 5173)" cmd /k "color 0B && cd /d "%~dp0client" && echo Starting NexusGov Frontend... && npm run dev || (color 0C && echo. && echo [ERROR] Client failed to start. Check the error above. && pause)"

:: Open default browser
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo ======================================================================
echo   ALL SERVICES LAUNCHED SUCCESSFULLY!
echo ======================================================================
echo.
echo   Citizen Portal:       http://localhost:5173
echo   Online Application:   http://localhost:5173/apply
echo   Live Card Tracking:   http://localhost:5173/track
echo   Form Officer Pool:     http://localhost:5173/officer-jobpool
echo   Document Officer Pool: http://localhost:5173/document-jobpool
echo   Senior Approver Pool:  http://localhost:5173/approver-jobpool
echo   Print Queue:          http://localhost:5173/print-queue
echo   Admin Dashboard:      http://localhost:5173/admin
echo.
echo   Backend REST API:     http://localhost:5000
echo   API Health Check:     http://localhost:5000/api/health
echo.
echo ----------------------------------------------------------------------
echo   DEFAULT CREDENTIALS (password: #Thilina2005):
echo     Admin:              admin@nexusgov.lk
echo     Admin (Dev):        thilinasakalasooriya@gmail.com
echo     Form Officer:       form-officer@nexusgov.lk
echo     Document Officer:   document-officer@nexusgov.lk
echo     Approver:           approver@nexusgov.lk
echo     Operational:        operational@nexusgov.lk
echo ======================================================================
echo.
echo  Keep the two server windows open. Close them to stop all services.
echo.
pause
@echo off
title NexusGov - Server Backend (Nodemon)
echo ===================================================
echo   Starting NexusGov Backend Server (Nodemon Dev)
echo ===================================================
cd /d "%~dp0server"
npm run dev
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Server stopped with error code %ERRORLEVEL%
    pause
)

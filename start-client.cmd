@echo off
title NexusGov - Client Dev Server
echo ===================================================
echo   Starting NexusGov Frontend Client (Vite Dev)
echo ===================================================
cd /d "%~dp0client"
npm run dev
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Server stopped with error code %ERRORLEVEL%
    pause
)

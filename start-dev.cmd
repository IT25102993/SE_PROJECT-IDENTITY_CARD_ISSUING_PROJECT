@echo off
echo ====================================================
echo  NexusGov Identity Card System - Full Stack Dev
echo  Java Spring Boot Backend + React Frontend
echo ====================================================
echo.
echo Starting both servers...
echo.
echo [1/2] Starting Java Spring Boot Server (port 5000)...
start "NexusGov-Backend" cmd /k "cd /d "%~dp0backend" && (where mvn >nul 2>nul && mvn spring-boot:run || mvnw.cmd spring-boot:run)"

timeout /t 8 /nobreak >nul

echo [2/2] Starting React Client (port 5173)...
start "NexusGov-Client" cmd /k "cd /d "%~dp0client" && (if not exist node_modules npm install) && npm run dev"

echo.
echo ====================================================
echo  Backend API:    http://localhost:5000
echo  Health Check:   http://localhost:5000/api/health
echo  React App:      http://localhost:5173
echo ====================================================
echo.
echo Both servers are running. Close this window to stop.
pause

@echo off
title NexusGov - Dev Launcher
echo ===================================================
echo   Starting NexusGov Full-Stack Application
echo ===================================================
echo.
echo Launching Server and Client in separate windows...

start "NexusGov Server" cmd /c "%~dp0start-server.cmd"
start "NexusGov Client" cmd /c "%~dp0start-client.cmd"

echo Both services launched successfully!
timeout /t 3 /nobreak >nul
exit

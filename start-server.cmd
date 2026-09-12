@echo off
echo ====================================================
echo  NexusGov Backend - Java Spring Boot Server
echo ====================================================
echo.
echo Starting Java Spring Boot server on port 5000...
echo.

cd /d "%~dp0backend"

where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Java is not installed or not in PATH.
    echo Please install Java 17+ from https://adoptium.net/
    pause
    exit /b 1
)

where mvn >nul 2>nul
if %errorlevel% == 0 (
    echo Using system Maven...
    mvn spring-boot:run
) else (
    echo Using Maven Wrapper (mvnw.cmd)...
    call mvnw.cmd spring-boot:run
)

pause

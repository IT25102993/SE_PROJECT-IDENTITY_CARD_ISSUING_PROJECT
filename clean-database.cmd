@echo off
title NexusGov - Database Cleaner
color 0B
echo ======================================================================
echo    NEXUSGOV IDENTITY ISSUANCE SYSTEM — DATABASE CLEANER
echo ======================================================================
echo.
echo  This tool will clean and reset the project database:
echo    [x] Delete all citizen applications and uploaded documents
echo    [x] Delete all printed identity cards and tracking records
echo    [x] Delete all citizen user accounts
echo    [x] Reset all auto-increment counters to 1
echo.
echo  PRESERVED ACCOUNTS (WILL NOT BE DELETED):
echo    [OK] Form Officer Accounts     (e.g., form-officer@nexusgov.lk)
echo    [OK] Document Officer Accounts (e.g., document-officer@nexusgov.lk)
echo    [OK] Approver Accounts (e.g., approver@nexusgov.lk)
echo    [OK] Admin Accounts    (e.g., admin@nexusgov.lk, thilinasakalasooriya@gmail.com)
echo.
echo ======================================================================
echo.

set /p CONFIRM="Are you sure you want to proceed with database cleanup? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo.
    echo Cleanup cancelled by user.
    echo.
    pause
    exit /b 0
)

echo.
echo Verifying Node.js environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not found in your system PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

cd /d "%~dp0server"

if not exist "node_modules" (
    echo Installing required server modules...
    call npm install --silent
)

echo Running database purge script...
echo.
node scripts/cleanDatabase.js

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [WARNING] Database purge encountered an issue. Check the error log above.
) else (
    color 0A
    echo.
    echo [SUCCESS] Database cleanup finished! All staff accounts are active.
)

echo.
pause

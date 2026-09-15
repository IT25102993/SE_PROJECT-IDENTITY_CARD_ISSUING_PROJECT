@echo off
setlocal enabledelayedexpansion

title NexusGov - Reset System Data (Preserve Staff Emails)

echo ====================================================================
echo  NexusGov Identity Card System - System Data Cleaner
echo  (Clears all applicants, applications, cards, logs, citizen accounts)
echo  (Preserves Staff Accounts and Staff Emails intact)
echo ====================================================================
echo.

:: ----------------------------------------------------------------------
:: 1. Auto-detect MySQL Executable
:: ----------------------------------------------------------------------
set "MYSQL_CMD="

:: Check PATH first
where mysql.exe >nul 2>nul
if %errorlevel% equ 0 (
    set "MYSQL_CMD=mysql.exe"
    goto :mysql_found
)

:: Check User's XAMPP installation
if exist "D:\files\xampp_files\mysql\bin\mysql.exe" (
    set "MYSQL_CMD=D:\files\xampp_files\mysql\bin\mysql.exe"
    goto :mysql_found
)

:: Check standard XAMPP paths
if exist "C:\xampp\mysql\bin\mysql.exe" (
    set "MYSQL_CMD=C:\xampp\mysql\bin\mysql.exe"
    goto :mysql_found
)
if exist "D:\xampp\mysql\bin\mysql.exe" (
    set "MYSQL_CMD=D:\xampp\mysql\bin\mysql.exe"
    goto :mysql_found
)
if exist "E:\xampp\mysql\bin\mysql.exe" (
    set "MYSQL_CMD=E:\xampp\mysql\bin\mysql.exe"
    goto :mysql_found
)

:: Check Program Files MySQL Server
for /d %%D in ("C:\Program Files\MySQL\MySQL Server *") do (
    if exist "%%D\bin\mysql.exe" (
        set "MYSQL_CMD=%%D\bin\mysql.exe"
        goto :mysql_found
    )
)
for /d %%D in ("C:\Program Files (x86)\MySQL\MySQL Server *") do (
    if exist "%%D\bin\mysql.exe" (
        set "MYSQL_CMD=%%D\bin\mysql.exe"
        goto :mysql_found
    )
)

:: Check WampServer
for /d %%D in ("C:\wamp64\bin\mysql\mysql*") do (
    if exist "%%D\bin\mysql.exe" (
        set "MYSQL_CMD=%%D\bin\mysql.exe"
        goto :mysql_found
    )
)

:: Query Windows Registry for running MySQL service path
for /f "usebackq tokens=*" %%P in (`powershell -NoProfile -Command "(Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Services\mysql' -ErrorAction SilentlyContinue).ImagePath"`) do (
    set "SVC_PATH=%%P"
    for /f "tokens=1 delims= " %%B in ("!SVC_PATH!") do (
        set "BIN_DIR=%%~dpB"
        if exist "!BIN_DIR!mysql.exe" (
            set "MYSQL_CMD=!BIN_DIR!mysql.exe"
            goto :mysql_found
        )
    )
)

:: If still not found, prompt user
echo [WARNING] mysql.exe was not automatically detected in standard locations.
set /p "MYSQL_CMD=Please enter full path to mysql.exe (e.g. C:\xampp\mysql\bin\mysql.exe): "
if not exist "%MYSQL_CMD%" (
    echo [ERROR] Specified mysql.exe was not found: "%MYSQL_CMD%"
    echo Please make sure MySQL / XAMPP is installed.
    pause
    exit /b 1
)

:mysql_found
echo [OK] MySQL client found: "%MYSQL_CMD%"
echo.

:: ----------------------------------------------------------------------
:: 2. Database Connection Settings
:: ----------------------------------------------------------------------
set "DB_HOST=127.0.0.1"
set "DB_PORT=3306"
set "DB_USER=root"
set "DB_PASS="
set "DB_NAME=identity_card_system"

:: Test connection with blank password
"%MYSQL_CMD%" -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -e "USE %DB_NAME%;" >nul 2>nul
if %errorlevel% neq 0 (
    echo Database connection with blank password failed.
    set /p "DB_PASS=Enter password for MySQL user '%DB_USER%' (press Enter if none): "
    set "PASS_ARG=-p!DB_PASS!"
    "%MYSQL_CMD%" -h %DB_HOST% -P %DB_PORT% -u %DB_USER% !PASS_ARG! -e "USE %DB_NAME%;" >nul 2>nul
    if !errorlevel! neq 0 (
        echo.
        echo [ERROR] Could not connect to database '%DB_NAME%' on %DB_HOST%:%DB_PORT%.
        echo Please ensure MySQL is running in XAMPP and credentials are correct.
        echo.
        pause
        exit /b 1
    )
) else (
    set "PASS_ARG="
)

echo [OK] Connected to database: '%DB_NAME%' on %DB_HOST%:%DB_PORT%
echo.

:: ----------------------------------------------------------------------
:: 3. Preview: Staff Accounts that will be PRESERVED
:: ----------------------------------------------------------------------
echo ====================================================================
echo  STAFF ACCOUNTS TO PRESERVE (Emails, Passwords and Logins Kept Safe)
echo ====================================================================
"%MYSQL_CMD%" -h %DB_HOST% -P %DB_PORT% -u %DB_USER% %PASS_ARG% -D %DB_NAME% -t -e "SELECT user_id AS 'User ID', username AS 'Username', email AS 'Staff Email', role AS 'Role' FROM users WHERE (role IN ('Admin', 'Officer', 'Approver') AND username NOT LIKE 'Citizen%%') ORDER BY user_id ASC;"
echo.

:: ----------------------------------------------------------------------
:: 4. Preview: Data Records that will be REMOVED
:: ----------------------------------------------------------------------
echo ====================================================================
echo  DETAILS TO BE REMOVED FROM SYSTEM
echo ====================================================================
"%MYSQL_CMD%" -h %DB_HOST% -P %DB_PORT% -u %DB_USER% %PASS_ARG% -D %DB_NAME% -t -e "SELECT (SELECT COUNT(*) FROM applicants) AS 'Applicants', (SELECT COUNT(*) FROM applications) AS 'Applications', (SELECT COUNT(*) FROM identity_cards) AS 'Identity Cards', (SELECT COUNT(*) FROM audit_logs) AS 'Audit Logs', (SELECT COUNT(*) FROM users WHERE role = 'Citizen' OR username LIKE 'Citizen%%' OR role NOT IN ('Admin', 'Officer', 'Approver')) AS 'Citizen Accounts';"
echo.

:: ----------------------------------------------------------------------
:: 5. Confirmation Prompt
:: ----------------------------------------------------------------------
echo ====================================================================
echo  WARNING: All applicant personal records, application forms,
echo           issued identity cards, and audit logs will be DELETED.
echo           ONLY STAFF EMAILS AND ACCOUNTS WILL REMAIN.
echo ====================================================================
set /p "CONFIRM=Are you sure you want to proceed? Type Y to proceed, or N to cancel (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo.
    echo [CANCELLED] Operation aborted by user. No data was changed.
    echo.
    pause
    exit /b 0
)

echo.
echo Cleaning system data now...

:: ----------------------------------------------------------------------
:: 6. Execute SQL Reset Script
:: ----------------------------------------------------------------------
set "SQL_FILE=%~dp0reset-system-data.sql"
if not exist "%SQL_FILE%" (
    echo [ERROR] SQL reset script not found at: "%SQL_FILE%"
    pause
    exit /b 1
)

"%MYSQL_CMD%" -h %DB_HOST% -P %DB_PORT% -u %DB_USER% %PASS_ARG% -D %DB_NAME% < "%SQL_FILE%"
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] An error occurred while executing the cleanup script.
    pause
    exit /b 1
)

echo.
echo ====================================================================
echo  CLEANUP COMPLETE - REMAINING PRESERVED USERS
echo ====================================================================
"%MYSQL_CMD%" -h %DB_HOST% -P %DB_PORT% -u %DB_USER% %PASS_ARG% -D %DB_NAME% -t -e "SELECT user_id AS 'User ID', username AS 'Username', email AS 'Staff Email', role AS 'Role', created_at AS 'Created At' FROM users ORDER BY user_id ASC;"
echo.

echo ====================================================================
echo  VERIFICATION OF CLEARED SYSTEM DATA
echo ====================================================================
"%MYSQL_CMD%" -h %DB_HOST% -P %DB_PORT% -u %DB_USER% %PASS_ARG% -D %DB_NAME% -t -e "SELECT (SELECT COUNT(*) FROM applicants) AS 'Applicants (Should be 0)', (SELECT COUNT(*) FROM applications) AS 'Applications (Should be 0)', (SELECT COUNT(*) FROM identity_cards) AS 'Identity Cards (Should be 0)', (SELECT COUNT(*) FROM audit_logs) AS 'Audit Logs (Should be 0)';"
echo.

echo [SUCCESS] All system details have been successfully removed!
echo All staff emails and staff accounts have been preserved.
echo.
pause

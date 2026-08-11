@echo off
title Script Execution Tool
color 0A

echo ===================================================
echo             NEXUS GOV RUNNER
echo ===================================================
echo.

:: 1. Run standard Command Prompt commands
echo [1/3] Checking system information...
echo Current Date/Time: %date% %time%
echo Current Directory: %cd%
echo.

:: 2. Execute external tools or scripts (e.g., Python / Node / PowerShell)
echo [2/3] Executing inline commands...
:: Example: Running a quick PowerShell inline script
powershell -Command "Write-Host 'Hello from PowerShell!' -ForegroundColor Cyan"
echo.

:: 3. Ask user for input and perform actions based on choice
echo [3/3] Choose an action to perform:
echo [1] Run NEXUS GOV
echo [2] Create a Backup Folder (not assigned)
echo [3] Exit (not assigned)
echo.

set /p choice="Enter option (1, 2, or 3): "

if "%choice%"=="1" goto Run-Project
if "%choice%"=="2" goto MAKE_FOLDER
if "%choice%"=="3" goto END

:Run-Project
echo.
echo Running ping test...
cd "UI Designs"
npm run dev
goto END

:MAKE_FOLDER
echo.
echo Creating folder named 'TestFolder'...
if not exist "TestFolder" mkdir TestFolder
echo Folder created successfully!
goto END

:END
echo.
echo ===================================================
echo Processing complete. Press any key to exit.
echo ===================================================
pause > nul



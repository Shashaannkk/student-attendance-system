@echo off
title FRONTEND WEBSITE
cd /d "%~dp0frontend"

echo Checking for node_modules...
if not exist "node_modules" (
    echo node_modules not found. Installing dependencies...
    call npm install
)

echo Starting Frontend...
call npm run dev -- --host
echo.
echo ====================================================
echo FRONTEND STOPPED UNEXPECTEDLY.
echo Please read the error message above.
echo ====================================================
pause

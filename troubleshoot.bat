@echo off
echo ==========================================
echo STUDENT ATTENDANCE SYSTEM DIAGNOSTICS
echo ==========================================

echo [1] Checking Python Version...
python --version
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in PATH!
    goto :error
)
echo [OK] Python found.

echo.
echo [2] Checking Required Packages...
python -c "import fastapi; import uvicorn; import sqlalchemy; import sqlmodel; print('Modules ok')"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Missing python dependencies!
    echo Please run: pip install -r requirements.txt
    goto :error
)
echo [OK] Dependencies found.

echo.
echo [3] Checking Port 8000...
netstat -an | findstr ":8000"
if %ERRORLEVEL% EQU 0 (
    echo [WARNING] Port 8000 seems to be in use. Is the server already running?
) else (
    echo [OK] Port 8000 is free.
)

echo.
echo [4] Attempting to Start Server...
echo The server will attempt to start now. 
echo If it crashes, read the error message below.
echo.
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

goto :end

:error
echo.
echo ==========================================
echo DIAGNOSTICS FAILED
echo Please report the error message above.
echo ==========================================
pause
exit /b 1

:end
pause

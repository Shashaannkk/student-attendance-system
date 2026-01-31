@echo off
echo ==============================================
echo  FORCE RESET & DIAGNOSE
echo ==============================================

echo [1] Killing any stuck Python processes...
taskkill /F /IM python.exe /T 2>nul
echo Done.

echo.
echo [2] Resetting Teacher Password...
python create_teacher.py
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to run create_teacher.py
    pause
    exit /b
)

echo.
echo [3] Starting Server (Background)...
start /B python -m uvicorn main:app --host 0.0.0.0 --port 8000 > server_log.txt 2>&1
echo Server starting... waiting 5 seconds...
timeout /t 5 /nobreak >nul

echo.
echo [4] Testing Login...
python verify_login.py
echo.
echo [RESULT] Check 'login_test_result.txt' below:
type login_test_result.txt

echo.
echo ==============================================
echo If you see "Status 200" above, LOGIN IS WORKING.
echo You can now go to http://localhost:5173 and log in.
echo.
echo IMPORTANT: Do NOT close this window if the server is running here.
echo ==============================================
pause

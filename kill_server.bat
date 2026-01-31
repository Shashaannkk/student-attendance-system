@echo off
echo Killing any process using port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /f /pid %%a
echo Done.
echo You can now run run_backend.bat
pause

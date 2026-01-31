@echo off
echo ==========================================
echo RESETTING PASSWORD FOR 'teacher1'
echo ==========================================

python create_teacher.py

echo.
echo ==========================================
echo If "IMMEDIATE VERIFICATION" says True above:
echo 1. Close the running backend server window.
echo 2. Run 'troubleshoot.bat' again to restart it.
echo 3. Try logging in.
echo ==========================================
pause

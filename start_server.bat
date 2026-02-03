@echo off
echo Starting Student Attendance System Backend...
cd /d "c:\Users\Shashank Poojari\Documents\student-attendance-system"
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
pause

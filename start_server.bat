@echo off
echo Starting Student Attendance System Backend...
cd /d "c:\Users\Shashank Poojari\Documents\student-attendance-system"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause

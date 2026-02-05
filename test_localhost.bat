@echo off
echo Starting Backend and Frontend for Localhost Testing...

:: Start Backend in a new window
start "Backend Server" cmd /k "python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

:: Wait for backend to initialize (approx 3 seconds)
timeout /t 3 /nobreak >nul

:: Start Frontend in a new window
cd frontend
start "Frontend Client" cmd /k "npm run dev"

echo.
echo Both services started!
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173 (usually)
echo.

@echo off
title BACKEND SERVER (Do not close)
echo Starting Backend...
cd /d "%~dp0"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
echo.
echo SERVER CRASHED OR STOPPED.
pause

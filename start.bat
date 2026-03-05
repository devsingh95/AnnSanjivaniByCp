@echo off
title Ann-Sanjivani AI - Starting Servers...
echo ============================================
echo   Ann-Sanjivani AI - Food Rescue Platform
echo ============================================
echo.

echo [1/2] Starting Backend (FastAPI on port 8000)...
start "Backend - FastAPI" cmd /k "cd /d C:\Users\devsi\Downloads\Stack Sprint Hackathon\food-rescue-platform\backend && C:\Users\devsi\Downloads\Stack Sprint Hackathon\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend (Vite on port 5173)...
start "Frontend - Vite" cmd /k "cd /d C:\Users\devsi\Downloads\Stack Sprint Hackathon\food-rescue-platform\frontend && npm run dev"

timeout /t 4 /nobreak >nul

echo.
echo ============================================
echo   Servers started! Opening browser...
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000/docs
echo ============================================
start http://localhost:5173

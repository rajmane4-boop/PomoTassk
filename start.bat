@echo off
title Launching Django + Shadcn UI Pomodoro App
echo ===================================================
echo   Starting PomoTask (Django + Shadcn UI)
echo ===================================================
echo.

echo [1/2] Starting Django REST Backend on http://127.0.0.1:8000 ...
start "PomoTask Django Backend" cmd /k "cd /d %~dp0backend && .venv\Scripts\activate.bat && python manage.py runserver"

echo [2/2] Starting Vite React Frontend on http://localhost:5173 ...
start "PomoTask Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers are launching in separate windows!
echo Backend:  http://127.0.0.1:8000/api/tasks/
echo Frontend: http://localhost:5173
echo.
pause

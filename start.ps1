Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Starting PomoTask (Django + Shadcn UI)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/2] Starting Django Backend on http://127.0.0.1:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\backend'; .\.venv\Scripts\Activate.ps1; python manage.py runserver"

Write-Host "[2/2] Starting Vite Frontend on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\frontend'; npm run dev"

Write-Host ""
Write-Host "Both servers started in separate terminal windows!" -ForegroundColor Green
Write-Host "Backend API:  http://127.0.0.1:8000/api/tasks/" -ForegroundColor White
Write-Host "Frontend App: http://localhost:5173" -ForegroundColor White
Write-Host ""

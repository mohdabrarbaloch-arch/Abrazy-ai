# 🇵🇰 Teamily AI Pakistan - Quick Setup Script

Write-Host "================================================" -ForegroundColor Green
Write-Host "   Teamily AI - Pakistan Version Setup" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

$currentPath = Get-Location

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found! Please install from nodejs.org" -ForegroundColor Red
    exit 1
}

# Check Python
Write-Host "Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "✓ Python $pythonVersion found" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found! Please install Python 3.11+" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Step 1: Frontend Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

Set-Location frontend

Write-Host "Cleaning old installations..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules, package-lock.json, .next -ErrorAction SilentlyContinue

Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host "(This may take 2-3 minutes)" -ForegroundColor Gray
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend setup complete!" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend setup failed" -ForegroundColor Red
    exit 1
}

Set-Location $currentPath

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Step 2: Backend Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

Set-Location backend

Write-Host "Checking virtual environment..." -ForegroundColor Yellow
if (-Not (Test-Path ".venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
}

Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .venv\Scripts\Activate.ps1

Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt -q

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend setup complete!" -ForegroundColor Green
} else {
    Write-Host "✗ Backend setup failed" -ForegroundColor Red
    exit 1
}

Write-Host "Creating database..." -ForegroundColor Yellow
python -c "from app.core.db import engine, Base; from app.models import *; Base.metadata.create_all(bind=engine)"

Set-Location $currentPath

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "   ✓ Setup Complete! 🎉" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Terminal 1 - Backend:" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  .venv\Scripts\activate" -ForegroundColor White
Write-Host "  uvicorn app.main:app --reload" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 2 - Frontend:" -ForegroundColor Yellow
Write-Host "  cd frontend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Then open: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Read TEAMILY_PAKISTAN_SETUP.md for complete guide!" -ForegroundColor Green
Write-Host ""

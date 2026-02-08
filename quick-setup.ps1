# Quick Start Script for Windows
# Run this after installing PostgreSQL

Write-Host "[INFO] Algerie Poste E-Commerce - Quick Setup" -ForegroundColor Green
Write-Host ""

# Check if PostgreSQL is installed
Write-Host "[INFO] Checking PostgreSQL installation..." -ForegroundColor Yellow
$pgVersion = psql --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] PostgreSQL not found!" -ForegroundColor Red
    Write-Host "   Please install from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}
Write-Host "[SUCCESS] PostgreSQL installed: $pgVersion" -ForegroundColor Green

# Create database
Write-Host ""
Write-Host "[INFO] Creating database..." -ForegroundColor Yellow
Write-Host "   Please enter your PostgreSQL password when prompted" -ForegroundColor Cyan

$createDb = "CREATE DATABASE algerie_post_ecom;"

$createDb | psql -U postgres 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[SUCCESS] Database 'algerie_post_ecom' created successfully!" -ForegroundColor Green
}
else {
    Write-Host "[WARN] Database might already exist (this is OK)" -ForegroundColor Yellow
}

# Navigate to backend
Write-Host ""
Write-Host "[INFO] Installing Backend dependencies..." -ForegroundColor Yellow
Set-Location "C:\Users\Samir Guenchi\Desktop\ap-e-com\ap-e-com\Backend"

if (!(Test-Path "node_modules")) {
    npm install
    Write-Host "[SUCCESS] Backend dependencies installed" -ForegroundColor Green
}
else {
    Write-Host "[SUCCESS] Backend dependencies already installed" -ForegroundColor Green
}

# Run seed
Write-Host ""
Write-Host "[INFO] Seeding database with demo data..." -ForegroundColor Yellow
npx ts-node src/seed.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[SUCCESS] Setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "[INFO] Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Terminal 1: cd Backend; npm run dev" -ForegroundColor White
    Write-Host "   2. Terminal 2: cd Storefront; npm run dev" -ForegroundColor White
    Write-Host "   3. Open: http://localhost:5173/?domain=demo" -ForegroundColor White
    Write-Host ""
    Write-Host "[INFO] Demo Login:" -ForegroundColor Cyan
    Write-Host "   Email: demo@algeriepost.dz" -ForegroundColor White
    Write-Host "   Password: demo123" -ForegroundColor White
    Write-Host ""
}
else {
    Write-Host ""
    Write-Host "[ERROR] Setup failed. Please check the error messages above." -ForegroundColor Red
    Write-Host "[INFO] Common fixes:" -ForegroundColor Yellow
    Write-Host "   - Update password in Backend/.env" -ForegroundColor White
    Write-Host "   - Make sure PostgreSQL service is running" -ForegroundColor White
    Write-Host "   - Check DATABASE_SETUP.md for detailed instructions" - ForegroundColor White
}

# ============================================
# Algerie Poste E-Commerce - Database Setup (No Docker)
# For local MySQL installation (XAMPP, WAMP, or standalone MySQL)
# ============================================
# Usage: .\setup-mysql.ps1
# Requirements: MySQL installed and running
# ============================================

param(
    [string]$MySQLPath = "mysql",
    [string]$MySQLUser = "root",
    [string]$MySQLPassword = "",
    [string]$MySQLHost = "localhost",
    [string]$MySQLPort = "3306",
    [switch]$Help
)

# Show help
if ($Help) {
    Write-Host "============================================"
    Write-Host "Algerie Poste E-Commerce - Database Setup"
    Write-Host "============================================"
    Write-Host ""
    Write-Host "USAGE:"
    Write-Host "    .\setup-mysql.ps1"
    Write-Host "    .\setup-mysql.ps1 -MySQLPassword 'yourpassword'"
    Write-Host ""
    Write-Host "FOR XAMPP:"
    Write-Host "    .\setup-mysql.ps1 -MySQLPath 'C:\xampp\mysql\bin\mysql.exe'"
    Write-Host ""
    Write-Host "OPTIONS:"
    Write-Host "    -MySQLPath      Path to mysql.exe (default: mysql)"
    Write-Host "    -MySQLUser      MySQL username (default: root)"
    Write-Host "    -MySQLPassword  MySQL password (default: empty)"
    Write-Host "    -MySQLHost      MySQL host (default: localhost)"
    Write-Host "    -MySQLPort      MySQL port (default: 3306)"
    Write-Host ""
    exit 0
}

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$MigrationsDir = Join-Path $ProjectRoot "migrations"
$SeedsDir = Join-Path $ProjectRoot "seeds"

Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "  Algerie Poste E-Commerce Database Setup  " -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""

# Build MySQL connection args
$mysqlArgs = @("-u$MySQLUser", "-h$MySQLHost", "-P$MySQLPort")
if ($MySQLPassword -ne "") {
    $mysqlArgs += "-p$MySQLPassword"
}

# Test MySQL connection
Write-Host "[INFO] Testing MySQL connection..." -ForegroundColor Cyan
try {
    $testResult = & $MySQLPath @mysqlArgs -e "SELECT 1" 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Connection failed"
    }
    Write-Host "[OK] MySQL connection successful" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Cannot connect to MySQL" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible solutions:" -ForegroundColor Yellow
    Write-Host "  1. Make sure MySQL is running"
    Write-Host "  2. For XAMPP: Start MySQL from XAMPP Control Panel"
    Write-Host "  3. Specify the path to mysql.exe:"
    Write-Host "     .\setup-mysql.ps1 -MySQLPath 'C:\xampp\mysql\bin\mysql.exe'"
    Write-Host ""
    Write-Host "  4. If MySQL has a password:"
    Write-Host "     .\setup-mysql.ps1 -MySQLPassword 'yourpassword'"
    Write-Host ""
    exit 1
}

# Run initial schema migration
Write-Host "[INFO] Running initial schema migration..." -ForegroundColor Cyan
$migration1 = Join-Path $MigrationsDir "001_initial_schema.sql"

if (Test-Path $migration1) {
    Get-Content $migration1 -Raw | & $MySQLPath @mysqlArgs
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to run initial schema migration" -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Initial schema created" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Migration file not found: $migration1" -ForegroundColor Red
    exit 1
}

# Run enhanced tracking migration
Write-Host "[INFO] Running enhanced tracking migration..." -ForegroundColor Cyan
$migration2 = Join-Path $MigrationsDir "002_enhanced_tracking.sql"

$mysqlArgsDb = $mysqlArgs + @("ap_ecommerce")

if (Test-Path $migration2) {
    Get-Content $migration2 -Raw | & $MySQLPath @mysqlArgsDb
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARN] Enhanced tracking migration may have issues" -ForegroundColor Yellow
    } else {
        Write-Host "[OK] Enhanced tracking schema created" -ForegroundColor Green
    }
} else {
    Write-Host "[WARN] Migration file not found: $migration2 (skipping)" -ForegroundColor Yellow
}

# Run seed data
Write-Host "[INFO] Inserting seed data..." -ForegroundColor Cyan
$seedFile = Join-Path $SeedsDir "001_initial_data.sql"

if (Test-Path $seedFile) {
    Get-Content $seedFile -Raw | & $MySQLPath @mysqlArgsDb
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARN] Seed data may have failed (possibly already exists)" -ForegroundColor Yellow
    } else {
        Write-Host "[OK] Seed data inserted" -ForegroundColor Green
    }
} else {
    Write-Host "[WARN] Seed file not found: $seedFile (skipping)" -ForegroundColor Yellow
}

# Verify setup
Write-Host ""
Write-Host "[INFO] Verifying database setup..." -ForegroundColor Cyan
Write-Host ""

# Show tables
Write-Host "Database Tables:" -ForegroundColor Yellow
& $MySQLPath @mysqlArgsDb -e "SHOW TABLES;"

# Show user count  
Write-Host ""
Write-Host "Users in database:" -ForegroundColor Yellow
& $MySQLPath @mysqlArgsDb -e "SELECT id, email, account_type, account_status FROM users;"

# Final summary
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Database Setup Complete!                 " -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Connection Details:" -ForegroundColor Cyan
Write-Host "  Host:     $MySQLHost"
Write-Host "  Port:     $MySQLPort"
Write-Host "  Database: ap_ecommerce"
Write-Host "  User:     $MySQLUser"
Write-Host ""
Write-Host "Demo Accounts:" -ForegroundColor Cyan
Write-Host "  Admin:  admin@algerie-poste.dz / Test123!"
Write-Host "  Seller: seller@example.com / Test123!"
Write-Host "  Buyer:  buyer@example.com / Test123!"
Write-Host ""

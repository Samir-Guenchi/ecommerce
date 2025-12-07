# ============================================
# Algerie Poste E-Commerce - Database Setup (No Docker)
# For local PostgreSQL installation
# ============================================
# Usage: .\setup-postgres.ps1
# Requirements: PostgreSQL installed and running
# ============================================

param(
    [string]$PsqlPath = "psql",
    [string]$PostgresUser = "postgres",
    [string]$PostgresPassword = "",
    [string]$PostgresHost = "localhost",
    [string]$PostgresPort = "5432",
    [switch]$Help
)

# Show help
if ($Help) {
    Write-Host "============================================"
    Write-Host "Algerie Poste E-Commerce - Database Setup"
    Write-Host "PostgreSQL Version (No Docker)"
    Write-Host "============================================"
    Write-Host ""
    Write-Host "USAGE:"
    Write-Host "    .\setup-postgres.ps1"
    Write-Host "    .\setup-postgres.ps1 -PostgresPassword 'yourpassword'"
    Write-Host ""
    Write-Host "OPTIONS:"
    Write-Host "    -PsqlPath          Path to psql.exe (default: psql)"
    Write-Host "    -PostgresUser      PostgreSQL username (default: postgres)"
    Write-Host "    -PostgresPassword  PostgreSQL password (default: empty)"
    Write-Host "    -PostgresHost      PostgreSQL host (default: localhost)"
    Write-Host "    -PostgresPort      PostgreSQL port (default: 5432)"
    Write-Host ""
    Write-Host "EXAMPLES:"
    Write-Host "    .\setup-postgres.ps1 -PostgresPassword 'mypass'"
    Write-Host "    .\setup-postgres.ps1 -PsqlPath 'C:\Program Files\PostgreSQL\16\bin\psql.exe'"
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
Write-Host "  PostgreSQL Version                       " -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""

# Set PGPASSWORD environment variable for authentication
if ($PostgresPassword -ne "") {
    $env:PGPASSWORD = $PostgresPassword
}

# Build psql connection args
$psqlArgs = @("-U", $PostgresUser, "-h", $PostgresHost, "-p", $PostgresPort)

# Test PostgreSQL connection
Write-Host "[INFO] Testing PostgreSQL connection..." -ForegroundColor Cyan
try {
    $testResult = & $PsqlPath @psqlArgs -c "SELECT 1" 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Connection failed"
    }
    Write-Host "[OK] PostgreSQL connection successful" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Cannot connect to PostgreSQL" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible solutions:" -ForegroundColor Yellow
    Write-Host "  1. Make sure PostgreSQL is running"
    Write-Host "  2. Check your credentials and try again"
    Write-Host "  3. Specify the path to psql.exe:"
    Write-Host "     .\setup-postgres.ps1 -PsqlPath 'C:\Program Files\PostgreSQL\16\bin\psql.exe'"
    Write-Host ""
    Write-Host "  4. If PostgreSQL has a password:"
    Write-Host "     .\setup-postgres.ps1 -PostgresPassword 'yourpassword'"
    Write-Host ""
    exit 1
}

# Create database if it doesn't exist
Write-Host "[INFO] Creating database ap_ecommerce..." -ForegroundColor Cyan
& $PsqlPath @psqlArgs -c "CREATE DATABASE ap_ecommerce;" 2>&1 | Out-Null
Write-Host "[OK] Database ready" -ForegroundColor Green

# Connect to ap_ecommerce database
$psqlArgsDb = $psqlArgs + @("-d", "ap_ecommerce")

# Run initial schema migration
Write-Host "[INFO] Running initial schema migration..." -ForegroundColor Cyan
$migration1 = Join-Path $MigrationsDir "001_initial_schema.sql"

if (Test-Path $migration1) {
    & $PsqlPath @psqlArgsDb -f $migration1
    
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

if (Test-Path $migration2) {
    & $PsqlPath @psqlArgsDb -f $migration2
    
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
    & $PsqlPath @psqlArgsDb -f $seedFile
    
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
& $PsqlPath @psqlArgsDb -c "\dt"

# Show user count  
Write-Host ""
Write-Host "Users in database:" -ForegroundColor Yellow
& $PsqlPath @psqlArgsDb -c "SELECT id, email, account_type, account_status FROM users;"

# Final summary
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Database Setup Complete!                 " -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Connection Details:" -ForegroundColor Cyan
Write-Host "  Host:     $PostgresHost"
Write-Host "  Port:     $PostgresPort"
Write-Host "  Database: ap_ecommerce"
Write-Host "  User:     $PostgresUser"
Write-Host ""
Write-Host "Demo Accounts:" -ForegroundColor Cyan
Write-Host "  Admin:  admin@algerie-poste.dz / Test123!"
Write-Host "  Seller: seller@example.com / Test123!"
Write-Host "  Buyer:  buyer@example.com / Test123!"
Write-Host ""

# Clear password from environment
$env:PGPASSWORD = ""

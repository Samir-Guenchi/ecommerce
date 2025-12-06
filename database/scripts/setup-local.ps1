# ============================================
# Algerie Poste E-Commerce - Database Setup Script
# Run this script to set up and test the database locally
# ============================================
# Usage: .\setup-local.ps1
# Requirements: Docker Desktop installed and running
# ============================================

param(
    [string]$MySQLPassword = "root123",
    [string]$ContainerName = "ap-ecommerce-mysql",
    [switch]$Clean,
    [switch]$SeedOnly,
    [switch]$Help
)

# Colors for output
function Write-Success { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Info { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Warn { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }

# Show help
if ($Help) {
    Write-Host "============================================"
    Write-Host "Algerie Poste E-Commerce - Database Setup"
    Write-Host "============================================"
    Write-Host ""
    Write-Host "USAGE:"
    Write-Host "    .\setup-local.ps1              # Full setup"
    Write-Host "    .\setup-local.ps1 -Clean       # Remove existing container"
    Write-Host "    .\setup-local.ps1 -SeedOnly    # Only run seed data"
    Write-Host ""
    Write-Host "OPTIONS:"
    Write-Host "    -MySQLPassword    MySQL root password (default: root123)"
    Write-Host "    -ContainerName    Docker container name"
    Write-Host "    -Clean            Remove existing container before setup"
    Write-Host "    -SeedOnly         Only insert seed data"
    Write-Host "    -Help             Show this help message"
    Write-Host ""
    Write-Host "REQUIREMENTS:"
    Write-Host "    Docker Desktop installed and running"
    Write-Host "    PowerShell 5.1+"
    Write-Host ""
    Write-Host "AFTER SETUP:"
    Write-Host "    Connection: mysql://root:root123@localhost:3306/ap_ecommerce"
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

# Check Docker is running
Write-Info "Checking Docker..."
$null = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Err "Docker is not running. Please start Docker Desktop and try again."
    exit 1
}
Write-Success "Docker is running"

# Clean option - remove existing container
if ($Clean) {
    Write-Info "Cleaning up existing container..."
    $null = docker stop $ContainerName 2>&1
    $null = docker rm $ContainerName 2>&1
    Write-Success "Cleaned up"
}

# Check if container exists
$containerExists = docker ps -a --format "{{.Names}}" | Where-Object { $_ -eq $ContainerName }

if (-not $containerExists) {
    Write-Info "Creating MySQL container..."
    
    docker run --name $ContainerName -e MYSQL_ROOT_PASSWORD=$MySQLPassword -p 3306:3306 -d mysql:8.0
    
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Failed to create MySQL container"
        exit 1
    }
    
    Write-Success "MySQL container created"
    
    # Wait for MySQL to be ready
    Write-Info "Waiting for MySQL to initialize (this takes about 30 seconds)..."
    $attempts = 0
    $maxAttempts = 60
    
    do {
        Start-Sleep -Seconds 2
        $attempts++
        $null = docker exec $ContainerName mysqladmin ping -uroot -p$MySQLPassword 2>&1
        Write-Host "." -NoNewline
    } while ($LASTEXITCODE -ne 0 -and $attempts -lt $maxAttempts)
    
    Write-Host ""
    
    if ($attempts -ge $maxAttempts) {
        Write-Err "MySQL failed to start within timeout"
        exit 1
    }
    
    Write-Success "MySQL is ready"
} else {
    # Check if container is running
    $containerRunning = docker ps --format "{{.Names}}" | Where-Object { $_ -eq $ContainerName }
    
    if (-not $containerRunning) {
        Write-Info "Starting existing container..."
        docker start $ContainerName
        Start-Sleep -Seconds 5
    }
    
    Write-Success "MySQL container is running"
}

# Skip migrations if SeedOnly
if (-not $SeedOnly) {
    # Run initial schema migration
    Write-Info "Running initial schema migration..."
    $migration1 = Join-Path $MigrationsDir "001_initial_schema.sql"
    
    if (Test-Path $migration1) {
        Get-Content $migration1 -Raw | docker exec -i $ContainerName mysql -uroot -p$MySQLPassword
        
        if ($LASTEXITCODE -ne 0) {
            Write-Err "Failed to run initial schema migration"
            exit 1
        }
        Write-Success "Initial schema created"
    } else {
        Write-Err "Migration file not found: $migration1"
        exit 1
    }

    # Run enhanced tracking migration
    Write-Info "Running enhanced tracking migration..."
    $migration2 = Join-Path $MigrationsDir "002_enhanced_tracking.sql"
    
    if (Test-Path $migration2) {
        Get-Content $migration2 -Raw | docker exec -i $ContainerName mysql -uroot -p$MySQLPassword ap_ecommerce
        
        if ($LASTEXITCODE -ne 0) {
            Write-Err "Failed to run enhanced tracking migration"
            exit 1
        }
        Write-Success "Enhanced tracking schema created"
    } else {
        Write-Warn "Migration file not found: $migration2 (skipping)"
    }
}

# Run seed data
Write-Info "Inserting seed data..."
$seedFile = Join-Path $SeedsDir "001_initial_data.sql"

if (Test-Path $seedFile) {
    Get-Content $seedFile -Raw | docker exec -i $ContainerName mysql -uroot -p$MySQLPassword ap_ecommerce
    
    if ($LASTEXITCODE -ne 0) {
        Write-Warn "Seed data may have failed (possibly already exists)"
    } else {
        Write-Success "Seed data inserted"
    }
} else {
    Write-Warn "Seed file not found: $seedFile (skipping)"
}

# Verify setup
Write-Host ""
Write-Info "Verifying database setup..."
Write-Host ""

# Show tables
Write-Host "Database Tables:" -ForegroundColor Yellow
docker exec $ContainerName mysql -uroot -p$MySQLPassword -e "USE ap_ecommerce; SHOW TABLES;"

# Show user count
Write-Host ""
Write-Host "Users in database:" -ForegroundColor Yellow
docker exec $ContainerName mysql -uroot -p$MySQLPassword -e "USE ap_ecommerce; SELECT id, email, account_type, account_status FROM users;"

# Show delivery zones
Write-Host ""
Write-Host "Delivery Zones:" -ForegroundColor Yellow
docker exec $ContainerName mysql -uroot -p$MySQLPassword -e "USE ap_ecommerce; SELECT id, name, wilaya, base_fee FROM delivery_zones LIMIT 5;"

# Final summary
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Database Setup Complete!                 " -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Connection Details:" -ForegroundColor Cyan
Write-Host "  Host:     localhost"
Write-Host "  Port:     3306"
Write-Host "  Database: ap_ecommerce"
Write-Host "  User:     root"
Write-Host "  Password: $MySQLPassword"
Write-Host ""
Write-Host "Connection String:" -ForegroundColor Cyan
Write-Host "  mysql://root:$MySQLPassword@localhost:3306/ap_ecommerce"
Write-Host ""
Write-Host "Test Commands:" -ForegroundColor Cyan
Write-Host "  docker exec -it $ContainerName mysql -uroot -p$MySQLPassword ap_ecommerce"
Write-Host ""
Write-Host "Demo Accounts:" -ForegroundColor Cyan
Write-Host "  Admin:  admin@algerie-poste.dz / Test123!"
Write-Host "  Seller: seller@example.com / Test123!"
Write-Host "  Buyer:  buyer@example.com / Test123!"
Write-Host ""

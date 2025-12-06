<# 
.SYNOPSIS
    Git workflow commands for the database module.

.DESCRIPTION
    Common git operations for managing database schema changes.
    Uses conventional commits and the gh CLI for PRs.

.NOTES
    Requires: git, gh (GitHub CLI)
    Install gh: winget install --id GitHub.cli
#>

# ═══════════════════════════════════════════════════════════════════════════════
# Configuration
# ═══════════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"
$RepoRoot = "c:\Users\Samir Guenchi\OneDrive\Desktop\algerie poste\ap-e-com"
$DatabaseDir = "$RepoRoot\database"

# ═══════════════════════════════════════════════════════════════════════════════
# Helper Functions
# ═══════════════════════════════════════════════════════════════════════════════

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor White
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param([string]$Message)
    Write-Host "[*] $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "    $Message" -ForegroundColor Gray
}

# ═══════════════════════════════════════════════════════════════════════════════
# Git Commands
# ═══════════════════════════════════════════════════════════════════════════════

function Show-Status {
    <#
    .SYNOPSIS
        Show current git status with branch info
    #>
    Write-Header "Git Status"
    Set-Location $RepoRoot
    
    $branch = git branch --show-current
    Write-Step "Current branch: $branch"
    Write-Host ""
    
    git status --short
    Write-Host ""
    
    $ahead = git rev-list --count "@{u}..HEAD" 2>$null
    $behind = git rev-list --count "HEAD..@{u}" 2>$null
    
    if ($ahead -and $behind) {
        Write-Info "Ahead: $ahead | Behind: $behind"
    }
}

function New-FeatureBranch {
    <#
    .SYNOPSIS
        Create a new feature branch from dev
    .PARAMETER Name
        Branch name (without prefix)
    #>
    param(
        [Parameter(Mandatory)]
        [string]$Name
    )
    
    Write-Header "Creating Feature Branch"
    Set-Location $RepoRoot
    
    $branchName = "feature/$Name"
    
    Write-Step "Switching to dev..."
    git checkout dev
    
    Write-Step "Pulling latest changes..."
    git pull origin dev
    
    Write-Step "Creating branch: $branchName"
    git checkout -b $branchName
    
    Write-Info "Ready to work! Make your changes and use Commit-Migration."
}

function New-MigrationBranch {
    <#
    .SYNOPSIS
        Create a new migration branch from dev
    .PARAMETER Name
        Migration name (e.g., "add-product-variants")
    #>
    param(
        [Parameter(Mandatory)]
        [string]$Name
    )
    
    Write-Header "Creating Migration Branch"
    Set-Location $RepoRoot
    
    $branchName = "migration/$Name"
    
    Write-Step "Switching to dev..."
    git checkout dev
    
    Write-Step "Pulling latest changes..."
    git pull origin dev
    
    Write-Step "Creating branch: $branchName"
    git checkout -b $branchName
    
    # Get next migration number
    $migrations = Get-ChildItem "$DatabaseDir\migrations\*.sql" | 
        Where-Object { $_.Name -match "^\d+" } |
        Sort-Object Name -Descending
    
    if ($migrations) {
        $lastNum = [int]($migrations[0].Name -replace "^(\d+).*", '$1')
        $nextNum = $lastNum + 1
        $nextNum = $nextNum.ToString("000")
    } else {
        $nextNum = "001"
    }
    
    $migrationFile = "${nextNum}_${Name}.sql"
    Write-Info "Next migration file: $migrationFile"
    Write-Info "Create it at: database/migrations/$migrationFile"
}

function Commit-DatabaseChange {
    <#
    .SYNOPSIS
        Commit database changes with conventional commit format
    .PARAMETER Type
        Commit type: feat, fix, docs, chore, refactor
    .PARAMETER Scope
        Scope: schema, migration, seed, scripts, docs
    .PARAMETER Message
        Commit message
    #>
    param(
        [Parameter(Mandatory)]
        [ValidateSet("feat", "fix", "docs", "chore", "refactor")]
        [string]$Type,
        
        [Parameter(Mandatory)]
        [ValidateSet("schema", "migration", "seed", "scripts", "docs")]
        [string]$Scope,
        
        [Parameter(Mandatory)]
        [string]$Message
    )
    
    Write-Header "Committing Changes"
    Set-Location $RepoRoot
    
    $commitMessage = "${Type}(${Scope}): $Message"
    
    Write-Step "Staging database changes..."
    git add database/
    
    Write-Step "Committing: $commitMessage"
    git commit -m $commitMessage
    
    Write-Info "Changes committed locally. Use Push-Branch to push."
}

function Push-Branch {
    <#
    .SYNOPSIS
        Push current branch to origin
    #>
    Write-Header "Pushing Branch"
    Set-Location $RepoRoot
    
    $branch = git branch --show-current
    
    Write-Step "Pushing $branch to origin..."
    git push -u origin $branch
    
    Write-Info "Branch pushed. Use New-PullRequest to create PR."
}

function New-PullRequest {
    <#
    .SYNOPSIS
        Create a pull request using gh CLI
    .PARAMETER Title
        PR title
    .PARAMETER Base
        Base branch (default: dev)
    #>
    param(
        [Parameter(Mandatory)]
        [string]$Title,
        
        [string]$Base = "dev"
    )
    
    Write-Header "Creating Pull Request"
    Set-Location $RepoRoot
    
    $branch = git branch --show-current
    
    Write-Step "Creating PR: $branch -> $Base"
    
    gh pr create `
        --title $Title `
        --base $Base `
        --body "## Summary`n`nDescribe your changes here.`n`n## Checklist`n`n- [ ] Migration tested locally`n- [ ] Seed data still works`n- [ ] Docs updated"
    
    Write-Info "PR created! Review at GitHub."
}

function Sync-Dev {
    <#
    .SYNOPSIS
        Sync current branch with latest dev
    #>
    Write-Header "Syncing with Dev"
    Set-Location $RepoRoot
    
    $currentBranch = git branch --show-current
    
    if ($currentBranch -eq "main" -or $currentBranch -eq "dev") {
        Write-Step "Pulling latest $currentBranch..."
        git pull origin $currentBranch
    } else {
        Write-Step "Fetching latest dev..."
        git fetch origin dev
        
        Write-Step "Merging dev into $currentBranch..."
        git merge origin/dev
    }
    
    Write-Info "Sync complete."
}

function Complete-Feature {
    <#
    .SYNOPSIS
        Merge current feature branch to dev and cleanup
    #>
    Write-Header "Completing Feature"
    Set-Location $RepoRoot
    
    $currentBranch = git branch --show-current
    
    if ($currentBranch -eq "main" -or $currentBranch -eq "dev") {
        Write-Host "Cannot complete from $currentBranch. Switch to a feature branch." -ForegroundColor Red
        return
    }
    
    Write-Step "Switching to dev..."
    git checkout dev
    
    Write-Step "Pulling latest dev..."
    git pull origin dev
    
    Write-Step "Merging $currentBranch..."
    git merge $currentBranch
    
    Write-Step "Pushing dev..."
    git push origin dev
    
    Write-Step "Deleting local branch $currentBranch..."
    git branch -d $currentBranch
    
    Write-Info "Feature completed and merged to dev."
}

# ═══════════════════════════════════════════════════════════════════════════════
# Database Commands
# ═══════════════════════════════════════════════════════════════════════════════

function Test-Migration {
    <#
    .SYNOPSIS
        Test migrations against Docker MySQL
    #>
    Write-Header "Testing Migrations"
    
    Write-Step "Running all migrations..."
    
    $migrations = Get-ChildItem "$DatabaseDir\migrations\*.sql" | Sort-Object Name
    
    foreach ($migration in $migrations) {
        Write-Info "Applying: $($migration.Name)"
        Get-Content $migration.FullName | docker exec -i ap-ecommerce-mysql mysql -u root -proot123 ap_ecommerce
    }
    
    Write-Step "Verifying tables..."
    docker exec -i ap-ecommerce-mysql mysql -u root -proot123 -e "SELECT COUNT(*) AS table_count FROM information_schema.tables WHERE table_schema = 'ap_ecommerce';"
    
    Write-Info "Migration test complete."
}

function Test-Seeds {
    <#
    .SYNOPSIS
        Apply seed data to Docker MySQL
    #>
    Write-Header "Applying Seed Data"
    
    $seeds = Get-ChildItem "$DatabaseDir\seeds\*.sql" | Sort-Object Name
    
    foreach ($seed in $seeds) {
        Write-Step "Applying: $($seed.Name)"
        Get-Content $seed.FullName | docker exec -i ap-ecommerce-mysql mysql -u root -proot123 ap_ecommerce
    }
    
    Write-Info "Seed data applied."
}

# ═══════════════════════════════════════════════════════════════════════════════
# Export Functions
# ═══════════════════════════════════════════════════════════════════════════════

Export-ModuleMember -Function @(
    'Show-Status',
    'New-FeatureBranch',
    'New-MigrationBranch',
    'Commit-DatabaseChange',
    'Push-Branch',
    'New-PullRequest',
    'Sync-Dev',
    'Complete-Feature',
    'Test-Migration',
    'Test-Seeds'
)

# ═══════════════════════════════════════════════════════════════════════════════
# Quick Reference (when run directly)
# ═══════════════════════════════════════════════════════════════════════════════

if ($MyInvocation.InvocationName -ne '.') {
    Write-Header "Database Git Workflow Commands"
    
    Write-Host "BRANCH MANAGEMENT" -ForegroundColor Yellow
    Write-Host "  Show-Status                          Check current status"
    Write-Host "  New-FeatureBranch -Name 'my-feature' Create feature branch"
    Write-Host "  New-MigrationBranch -Name 'add-xyz'  Create migration branch"
    Write-Host "  Sync-Dev                             Sync with latest dev"
    Write-Host ""
    
    Write-Host "COMMIT & PUSH" -ForegroundColor Yellow
    Write-Host "  Commit-DatabaseChange -Type feat -Scope schema -Message 'add users table'"
    Write-Host "  Push-Branch                          Push to origin"
    Write-Host "  New-PullRequest -Title 'Add users'   Create PR via gh CLI"
    Write-Host ""
    
    Write-Host "TESTING" -ForegroundColor Yellow
    Write-Host "  Test-Migration                       Run migrations on Docker"
    Write-Host "  Test-Seeds                           Apply seed data"
    Write-Host ""
    
    Write-Host "COMPLETE" -ForegroundColor Yellow
    Write-Host "  Complete-Feature                     Merge to dev and cleanup"
    Write-Host ""
    
    Write-Host "USAGE" -ForegroundColor Cyan
    Write-Host "  Import as module:  Import-Module .\git-workflow.ps1"
    Write-Host "  Or run directly:   . .\git-workflow.ps1"
    Write-Host ""
}

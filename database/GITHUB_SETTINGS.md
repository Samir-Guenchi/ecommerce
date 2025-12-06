# GitHub Repository Settings

Recommended configuration for the `database` module on GitHub.

---

## Branch Protection Rules

### Main Branch (`main`)

Navigate to: **Settings** > **Branches** > **Add rule**

**Branch name pattern:** `main`

| Setting | Value |
|---------|-------|
| Require pull request before merging | On |
| Required approving reviews | 1 |
| Dismiss stale PR reviews | On |
| Require review from code owners | Off |
| Require status checks to pass | On |
| Require branches to be up to date | On |
| Require signed commits | Off |
| Require linear history | Off |
| Include administrators | On |
| Allow force pushes | Off |
| Allow deletions | Off |

---

### Dev Branch (`dev`)

**Branch name pattern:** `dev`

| Setting | Value |
|---------|-------|
| Require pull request before merging | Off |
| Require status checks to pass | On |
| Allow force pushes | On (from maintainers only) |
| Allow deletions | Off |

---

## Labels

Create these labels for database-related issues and PRs:

| Label | Color | Description |
|-------|-------|-------------|
| `schema` | `#0052CC` | Schema changes (tables, columns, constraints) |
| `migration` | `#5319E7` | Migration scripts |
| `seed-data` | `#FBCA04` | Demo or reference data |
| `bug` | `#D73A4A` | Something isn't working |
| `documentation` | `#0075CA` | Docs, diagrams, comments |
| `performance` | `#F9D0C4` | Indexing, query optimization |
| `breaking` | `#B60205` | Breaking change (requires coordination) |
| `priority:high` | `#D93F0B` | High priority |
| `priority:low` | `#C5DEF5` | Low priority |
| `needs-review` | `#FFDD00` | Awaiting review |
| `ready-to-merge` | `#0E8A16` | Approved and ready |

---

## Repository Settings

Navigate to: **Settings** > **General**

### Features
- [ ] Wikis (disable - use /docs instead)
- [x] Issues
- [x] Projects
- [ ] Discussions (optional)

### Pull Requests
- [x] Allow merge commits
- [x] Allow squash merging (default)
- [ ] Allow rebase merging
- [x] Automatically delete head branches

### Merge Button
- Default: **Squash and merge**
- Allow: **Create a merge commit**

---

## Secrets

Add these repository secrets for CI/CD:

Navigate to: **Settings** > **Secrets and variables** > **Actions**

| Secret Name | Description |
|-------------|-------------|
| `MYSQL_ROOT_PASSWORD` | MySQL root password for CI |
| `MYSQL_DATABASE` | Database name (ap_ecommerce) |
| `DOCKER_USERNAME` | Docker Hub username (if pushing images) |
| `DOCKER_PASSWORD` | Docker Hub password |

---

## Environments

Create these environments for controlled deployments:

Navigate to: **Settings** > **Environments**

### `development`
- No protection rules
- Used for feature testing

### `staging`
- Required reviewers: 1
- Wait timer: 5 minutes
- Used for pre-production testing

### `production`
- Required reviewers: 2
- Wait timer: 10 minutes
- Deployment branches: `main` only

---

## Code Owners

Create `.github/CODEOWNERS` file:

```text
# Database module owners
/migrations/   @database-team
/seeds/        @database-team
/scripts/      @devops-team
/docs/         @documentation-team
*.sql          @database-team
```

---

## Quick Setup Commands

```powershell
# Using GitHub CLI (gh)

# Add labels
gh label create "schema" --color "0052CC" --description "Schema changes"
gh label create "migration" --color "5319E7" --description "Migration scripts"
gh label create "seed-data" --color "FBCA04" --description "Demo or reference data"
gh label create "breaking" --color "B60205" --description "Breaking change"
gh label create "documentation" --color "0075CA" --description "Docs, diagrams, comments"
gh label create "performance" --color "F9D0C4" --description "Indexing, query optimization"
gh label create "priority:high" --color "D93F0B" --description "High priority"
gh label create "priority:low" --color "C5DEF5" --description "Low priority"
gh label create "needs-review" --color "FFDD00" --description "Awaiting review"
gh label create "ready-to-merge" --color "0E8A16" --description "Approved and ready"
```

---

## Branch Naming Convention

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features | `feature/product-variants` |
| `fix/` | Bug fixes | `fix/shipment-status-enum` |
| `migration/` | Schema migrations | `migration/003-add-couriers` |
| `hotfix/` | Production fixes | `hotfix/cascade-delete` |
| `docs/` | Documentation only | `docs/update-er-diagram` |

---

## Recommended GitHub Actions

For CI/CD automation, consider adding:

1. **SQL Syntax Check** - Validate SQL files on PR
2. **Migration Test** - Run migrations against fresh MySQL
3. **Schema Diff** - Show table changes in PR comments
4. **Backup Reminder** - Weekly reminder to backup production

See `.github/workflows/` for example workflow files.

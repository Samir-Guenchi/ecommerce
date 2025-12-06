# Contributing to the Database Module

Thank you for contributing to the Algérie Poste E-Commerce database. This guide will help you make meaningful contributions while keeping our data layer stable and secure.

---

## Table of Contents

1. [Branching Strategy](#branching-strategy)
2. [Commit Message Convention](#commit-message-convention)
3. [Running Migrations Locally](#running-migrations-locally)
4. [Testing with Seed Data](#testing-with-seed-data)
5. [Opening Pull Requests](#opening-pull-requests)
6. [Reviewer Checklist](#reviewer-checklist)
7. [Handling Sensitive Data](#handling-sensitive-data)

---

## Branching Strategy

We follow a structured branching model to ensure stability:

```
main          ← Production-ready, protected
  │
  └── dev     ← Integration branch for testing
       │
       ├── feature/db-docs-*        ← Documentation changes
       ├── feature/db-migration-*   ← Schema migrations
       ├── feature/db-seed-*        ← Seed data updates
       └── feature/db-script-*      ← Utility scripts
```

### Branch Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/db-{module}-{description}` | `feature/db-migration-add-courier-zones` |
| Bugfix | `fix/db-{description}` | `fix/db-shipment-fk-constraint` |
| Hotfix | `hotfix/db-{description}` | `hotfix/db-escrow-status-enum` |
| Release | `release/db-v{version}` | `release/db-v1.2.0` |

### Rules

- Never push directly to `main` or `dev`
- All changes require a Pull Request with at least one approval
- Feature branches are deleted after merging

---

## Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for clear history:

```
<type>(scope): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New table, column, or feature |
| `fix` | Bug fix in schema or migration |
| `docs` | Documentation only |
| `refactor` | Schema refactoring without new features |
| `perf` | Performance improvements (indexes) |
| `chore` | Maintenance tasks |

### Examples

```bash
feat(migration): add product_variants table for SKU tracking
fix(seed): correct category parent_id references
docs(er-diagram): update shipments entity with GPS fields
refactor(schema): normalize courier-zone relationship to M:N
perf(index): add composite index on orders(buyer_id, status)
```

---

## Running Migrations Locally

### Using Docker (Recommended)

```powershell
# Start MySQL container
docker run -d --name ap-mysql -e MYSQL_ROOT_PASSWORD=root123 -e MYSQL_DATABASE=ap_ecommerce -p 3306:3306 mysql:8.0

# Wait for MySQL to initialize (30 seconds)
Start-Sleep -Seconds 30

# Run migrations in order
Get-Content .\migrations\001_initial_schema.sql -Raw | docker exec -i ap-mysql mysql -uroot -proot123
Get-Content .\migrations\002_enhanced_tracking.sql -Raw | docker exec -i ap-mysql mysql -uroot -proot123 ap_ecommerce
```

### Using Local MySQL

```powershell
# Run the setup script
.\scripts\setup-mysql.ps1

# Or manually
mysql -u root -p < migrations\001_initial_schema.sql
mysql -u root -p ap_ecommerce < migrations\002_enhanced_tracking.sql
```

### Verify Tables

```powershell
docker exec ap-mysql mysql -uroot -proot123 ap_ecommerce -e "SHOW TABLES;"
```

---

## Testing with Seed Data

After running migrations, populate test data:

```powershell
# Docker
Get-Content .\seeds\001_initial_data.sql -Raw | docker exec -i ap-mysql mysql -uroot -proot123 ap_ecommerce

# Local MySQL
mysql -u root -p ap_ecommerce < seeds\001_initial_data.sql
```

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@algerie-poste.dz | Test123! |
| Seller | seller@example.com | Test123! |
| Buyer | buyer@example.com | Test123! |

---

## Opening Pull Requests

1. Create a feature branch from `dev`:
   ```powershell
   git checkout dev
   git pull origin dev
   git checkout -b feature/db-migration-your-feature
   ```

2. Make your changes and commit:
   ```powershell
   git add migrations/003_your_migration.sql
   git commit -m "feat(migration): add your feature description"
   ```

3. Push and open PR:
   ```powershell
   git push origin feature/db-migration-your-feature
   
   # Using GitHub CLI
   gh pr create --base dev --title "feat(db): your feature" --body "Description"
   ```

4. Fill out the PR template completely

---

## Reviewer Checklist

When reviewing database PRs, verify:

### Schema Changes
- [ ] Migration is idempotent (can run multiple times safely)
- [ ] Includes rollback/down migration if needed
- [ ] Foreign keys have appropriate ON DELETE actions
- [ ] Indexes are added for frequently queried columns

### Data Safety
- [ ] No destructive changes without backup plan
- [ ] Backwards compatible with current application
- [ ] Estimated downtime documented (if any)

### Seed Data
- [ ] Test data is realistic but not real customer data
- [ ] No sensitive information (real emails, passwords)
- [ ] Relationships are valid (FK references exist)

### Snapshots
- [ ] Order addresses stored as JSON snapshots (not FK to user_addresses)
- [ ] Product prices stored in order_items (not FK to products)
- [ ] Immutable transaction data preserved

---

## Handling Sensitive Data

### NEVER Commit

- `.env` files with credentials
- Database connection strings with passwords
- Real customer data
- API keys or secrets
- Production database dumps

### Use Environment Variables

```powershell
# Set locally, never commit
$env:DB_PASSWORD = "your-password"
```

### Credential Templates

Create `.env.example` with placeholder values:

```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=<your-password-here>
DB_DATABASE=ap_ecommerce
```

---

## Questions?

Contact the database team:
- Open an issue with the `db: question` label
- Tag `@db-reviewers` in your PR

Thank you for keeping our data layer rock solid!

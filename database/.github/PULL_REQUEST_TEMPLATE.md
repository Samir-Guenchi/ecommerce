## Description

<!-- Briefly describe what this PR does -->


---

## Type of Change

- [ ] **Schema change** - New tables, columns, or constraints
- [ ] **Migration fix** - Corrects an existing migration
- [ ] **Seed data** - Adds or updates demo/test data
- [ ] **Documentation** - Updates docs, diagrams, or comments
- [ ] **Scripts** - New or updated utility scripts
- [ ] **Hotfix** - Critical production fix

---

## Migration Details

<!-- Complete this section for any schema changes -->

**Migration file:** `migrations/XXX_description.sql`

**Tables affected:**
- [ ] Creates new table(s): `table_name`
- [ ] Modifies existing table(s): `table_name`
- [ ] Drops table(s): `table_name`

**Data impact:**
- [ ] Non-destructive (additive only)
- [ ] Requires data migration
- [ ] May cause data loss (document backup steps)

---

## Pre-Merge Checklist

### Schema Quality
- [ ] Migration is idempotent (can re-run safely)
- [ ] Foreign keys have appropriate ON DELETE/UPDATE actions
- [ ] Indexes added for frequently queried columns
- [ ] Column naming follows `snake_case` convention
- [ ] ENUMs documented with allowed values

### Backwards Compatibility
- [ ] Existing queries will not break
- [ ] Application code changes are coordinated
- [ ] Rollback migration provided (if destructive)

### Testing
- [ ] Tested on fresh database (`001_initial_schema.sql` up)
- [ ] Tested on existing database (migration applied)
- [ ] Seed data still works after migration
- [ ] No MySQL syntax errors
- [ ] Verified with Docker container locally

### Documentation
- [ ] ER diagram updated (if schema changed)
- [ ] CHANGELOG.md updated with version entry
- [ ] README.md updated (if new features)
- [ ] LaTeX documentation updated (if required)

---

## Testing Steps

<!-- How can reviewers verify this works? -->

```bash
# 1. Start fresh database
docker exec -i ap-ecommerce-mysql mysql -u root -proot123 ap_ecommerce < migrations/001_initial_schema.sql

# 2. Apply this migration
docker exec -i ap-ecommerce-mysql mysql -u root -proot123 ap_ecommerce < migrations/XXX_your_migration.sql

# 3. Verify tables
docker exec -i ap-ecommerce-mysql mysql -u root -proot123 -e "SHOW TABLES FROM ap_ecommerce;"
```

---

## Screenshots

<!-- Add any relevant screenshots of schema changes, ER diagrams, etc. -->


---

## Related Issues

<!-- Link to any related issues -->
Closes #

---

## Reviewer Notes

<!-- Any specific areas you want reviewers to focus on? -->


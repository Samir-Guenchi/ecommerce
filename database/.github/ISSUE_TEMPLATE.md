---
name: Bug Report
about: Report a database issue or unexpected behavior
title: "[BUG] "
labels: bug, database
assignees: ''
---

## Bug Description

<!-- A clear description of what the bug is -->


---

## Environment

- **MySQL Version:** 8.0
- **Docker Image:** `mysql:8.0`
- **Migration Version:** <!-- e.g., 002_enhanced_tracking.sql -->
- **Operating System:** 

---

## Steps to Reproduce

1. 
2. 
3. 

---

## Expected Behavior

<!-- What should happen? -->


---

## Actual Behavior

<!-- What actually happens? -->


---

## Error Messages

```sql
-- Paste any SQL errors here
```

---

## Relevant Tables

<!-- Which tables are affected? -->

- [ ] `users`
- [ ] `orders`
- [ ] `shipments`
- [ ] Other: 

---

## Additional Context

<!-- Any other information that might help -->


---
---

---
name: Schema Change Request
about: Propose a new table, column, or constraint
title: "[SCHEMA] "
labels: enhancement, database
assignees: ''
---

## Schema Change Description

<!-- What change do you want to make? -->


---

## Business Justification

<!-- Why is this change needed? What problem does it solve? -->


---

## Proposed Schema

```sql
-- Example: New table or ALTER statement
CREATE TABLE example (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Tables Affected

<!-- List existing tables that will be modified or referenced -->

- 

---

## Impact Assessment

### Data
- [ ] This is additive (no existing data affected)
- [ ] This modifies existing data
- [ ] This removes data (requires backup)

### Performance
- [ ] Adds indexes (may slow inserts)
- [ ] Adds foreign keys (may slow deletes)
- [ ] No performance impact expected

### Application
- [ ] Requires backend code changes
- [ ] No application changes needed

---

## Alternatives Considered

<!-- What other approaches did you consider? -->


---

## Additional Context

<!-- Diagrams, mockups, or references -->


---
---

---
name: Data Issue
about: Report incorrect or missing seed/reference data
title: "[DATA] "
labels: data, database
assignees: ''
---

## Data Issue Description

<!-- Describe the data problem -->


---

## Affected Table(s)

- 

---

## Current Data

```sql
-- Query showing the current state
SELECT * FROM table_name WHERE condition;
```

---

## Expected Data

<!-- What should the data look like? -->


---

## Suggested Fix

```sql
-- INSERT, UPDATE, or DELETE statement to fix
```

---

## Additional Context

<!-- Any other relevant information -->


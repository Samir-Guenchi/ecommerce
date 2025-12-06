# 📚 Database Technical Documentation

This folder contains comprehensive technical documentation for the Algérie Poste E-Commerce database schema.

> **Location:** `database/docs/` - Documentation is now co-located with the database schema files.

## Documents

| Document | Description | Format |
|----------|-------------|--------|
| [ER_DIAGRAM.md](./ER_DIAGRAM.md) | Entity-Relationship diagrams using Mermaid | Markdown |
| [NORMALIZATION.md](./NORMALIZATION.md) | Normal form analysis (1NF, 2NF, 3NF) | Markdown |
| [DATABASE_DOCUMENTATION.tex](./DATABASE_DOCUMENTATION.tex) | Complete technical documentation | LaTeX |

## Related Files

| File | Location | Description |
|------|----------|-------------|
| Schema | `../migrations/001_initial_schema.sql` | Core database tables |
| Tracking | `../migrations/002_enhanced_tracking.sql` | Last-mile delivery tables |
| Seeds | `../seeds/001_initial_data.sql` | Test data |
| README | `../README.md` | Database folder overview |

## Quick Links

### ER Diagram
The `ER_DIAGRAM.md` file contains:
- Complete ER diagram with all 24 tables
- Module-specific diagrams (Users, Commerce, Orders, Logistics)
- Cardinality summary
- Mermaid syntax for GitHub/GitLab rendering

### Normalization Analysis
The `NORMALIZATION.md` file contains:
- 1NF, 2NF, 3NF compliance analysis for each table
- Intentional denormalization decisions with justifications
- Functional dependencies documentation
- Recommendations for future improvements

### LaTeX Documentation
The `DATABASE_DOCUMENTATION.tex` file contains:
- Complete 9-chapter technical document
- Data dictionary with DDL
- Data flow diagrams
- Index strategy
- Security considerations
- Backup/recovery procedures

## Compiling LaTeX

To compile the LaTeX document to PDF:

```bash
# Using pdflatex
pdflatex DATABASE_DOCUMENTATION.tex
pdflatex DATABASE_DOCUMENTATION.tex  # Run twice for TOC

# Using latexmk (recommended)
latexmk -pdf DATABASE_DOCUMENTATION.tex
```

### Online Compilation
Use [Overleaf](https://www.overleaf.com) for online LaTeX compilation:
1. Create new project
2. Upload `DATABASE_DOCUMENTATION.tex`
3. Compile to PDF

## Rendering Mermaid Diagrams

### GitHub/GitLab
Mermaid diagrams render automatically in `.md` files.

### VS Code
Install: **Markdown Preview Mermaid Support** extension

### Export to Image
```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i ER_DIAGRAM.md -o er-diagram.png
```

### Online Editor
Use [Mermaid Live Editor](https://mermaid.live/)

## Related Documentation

- [../README.md](../../database/README.md) - Database setup instructions
- [../../ARCHITECTURE.md](../../ARCHITECTURE.md) - System architecture
- [../../DATABASE_SCHEMA.md](../../DATABASE_SCHEMA.md) - Quick schema reference

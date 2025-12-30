# Database Schema

This directory contains the database schema implementation for the Algerie Post E-Commerce Platform.

## Files

- **DATABASE_SCHEMA.md** - Complete schema documentation (original MySQL specification)
- **schema.sql** - PostgreSQL SQL schema file with all tables, indexes, and triggers

## Quick Start

### Option 1: Direct SQL Execution

Run the PostgreSQL schema directly:

```bash
psql -U postgres -d algerie_post -f schema.sql
```

### Option 2: Using TypeORM (Recommended)

The TypeScript entities are located in `../Backend/src/entities/`. Use TypeORM migrations for production:

```bash
cd ../Backend
npm run migration:generate -- src/migrations/InitialSchema
npm run migration:run
```

## Database Features

- **18 Tables** covering all aspects of the e-commerce platform
- **PostgreSQL ENUMs** for type safety
- **Automatic timestamps** with triggers for `updated_at` fields
- **Full-text search** indexes on products
- **Foreign key constraints** with appropriate cascade behaviors
- **JSONB fields** for flexible data storage

## Schema Conversion Notes

The schema has been converted from MySQL to PostgreSQL with the following changes:

1. `AUTO_INCREMENT` → `SERIAL`
2. `ENUM` types → PostgreSQL `ENUM` types
3. `JSON` → `JSONB` (better performance in PostgreSQL)
4. `ON UPDATE CURRENT_TIMESTAMP` → PostgreSQL triggers
5. `FULLTEXT INDEX` → PostgreSQL GIN indexes with `to_tsvector`

## Table Relationships

See `DATABASE_SCHEMA.md` for detailed relationship documentation.











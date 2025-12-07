# Algerie Poste E-Commerce Database

<p align="center">
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql&logoColor=white" alt="PostgreSQL 16">
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker&logoColor=white" alt="Docker Ready">
  <img src="https://img.shields.io/badge/Status-Production--Ready-success?style=flat" alt="Status">
  <img src="https://img.shields.io/badge/Tables-24-blue?style=flat" alt="24 Tables">
</p>

---

## What This Is

This is the database layer for a **multi-vendor e-commerce platform** built specifically for the Algerian market, with deep integration into **Algerie Poste** shipping services.

We designed it to handle the unique challenges of e-commerce in Algeria:

- **Multi-vendor marketplace** — Sellers get their own stores, buyers get one unified shopping experience
- **Escrow payments** — Money is held safely until the package is delivered (CCP, Baridi Mob, Edahabia)
- **Hybrid shipping** — Bureau-to-bureau via Algerie Poste, then last-mile with local couriers
- **Real GPS tracking** — Know exactly where your package is, not just "in transit"
- **OTP verification** — The package doesn't get handed over without a code

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [Schema Overview](#schema-overview)
4. [Tables at a Glance](#tables-at-a-glance)
5. [How Things Flow](#how-things-flow)
6. [Documentation](#documentation)
7. [Development](#development)
8. [Testing](#testing)

---

## Quick Start

### Using Docker (Recommended)

The fastest way to get the database running locally:

```powershell
cd ap-e-com
.\database\scripts\setup-local.ps1
```

This spins up a PostgreSQL 16 container, runs all migrations, and seeds it with demo data. Done in under a minute.

### Manual Setup

If you prefer to use your own PostgreSQL installation:

```bash
psql -U postgres -c "CREATE DATABASE ap_ecommerce;"
psql -U postgres -d ap_ecommerce -f database/migrations/001_initial_schema.sql
psql -U postgres -d ap_ecommerce -f database/migrations/002_enhanced_tracking.sql
psql -U postgres -d ap_ecommerce -f database/seeds/001_initial_data.sql
```

### Connection Details

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `ap_ecommerce` |
| Username | `postgres` |
| Password | `postgres123` |

**Connection string:** `postgresql://postgres:postgres123@localhost:5432/ap_ecommerce`

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@algerie-poste.dz | Test123! |
| Seller | seller@example.com | Test123! |
| Buyer | buyer@example.com | Test123! |

---

## Project Structure

```
database/
│
├── migrations/                 Schema versions (run in order)
│   ├── 001_initial_schema.sql  Core tables: users, products, orders
│   └── 002_enhanced_tracking.sql  Last-mile: couriers, GPS tracking
│
├── seeds/                      Demo data for development
│   └── 001_initial_data.sql    Users, products, categories, wilayas
│
├── scripts/                    Automation helpers
│   ├── setup-local.ps1         Docker setup (Windows)
│   ├── setup-postgres.ps1      Local PostgreSQL setup
│   ├── git-workflow.ps1        Git workflow commands
│   ├── backup.sh               Database backup
│   └── restore.sh              Database restore
│
├── docs/                       Technical documentation
│   ├── DATABASE_DOCUMENTATION.tex   Full LaTeX docs (50+ pages)
│   ├── ER_DIAGRAM.md               Entity-relationship diagrams
│   ├── NORMALIZATION.md            Normal form analysis
│   └── README.md                   Documentation index
│
├── .github/                    GitHub templates
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE.md
│
├── .gitignore                  Git ignore rules
├── .pre-commit-config.yaml     Pre-commit hooks
├── CHANGELOG.md                Version history
├── CONTRIBUTING.md             Contribution guidelines
├── GITHUB_SETTINGS.md          Repository configuration
└── README.md                   You are here
```

---

## Schema Overview

We organized the database into **six logical modules**. Each one handles a specific part of the business:

```
┌───────────────────────────────────────────────────────────────────────┐
│                        AP E-COMMERCE DATABASE                          │
├───────────────────┬───────────────────┬───────────────────────────────┤
│      USERS        │     COMMERCE      │          LOGISTICS            │
├───────────────────┼───────────────────┼───────────────────────────────┤
│ users             │ stores            │ shipments                     │
│ seller_regs       │ products          │ tracking_events               │
│ user_addresses    │ categories        │ couriers                      │
│                   │ orders            │ courier_assignments           │
│                   │ order_items       │ delivery_zones                │
│                   │ reviews           │ delivery_ratings              │
├───────────────────┼───────────────────┼───────────────────────────────┤
│     PAYMENTS      │      CONFIG       │          REFERENCE            │
├───────────────────┼───────────────────┼───────────────────────────────┤
│ payments          │ themes            │ wilayas (58 provinces)        │
│ escrow_accounts   │ plans             │                               │
│ disputes          │ subscriptions     │                               │
│                   │ notifications     │                               │
│                   │ audit_logs        │                               │
└───────────────────┴───────────────────┴───────────────────────────────┘
```

### Technology Choices

| Choice | Why |
|--------|-----|
| **PostgreSQL 16** | Powerful open-source RDBMS with excellent JSON, full-text search, and extension support |
| **UTF-8** | Full Arabic and French character support |
| **JSONB columns** | Flexible storage for images, addresses, settings with indexing capability |
| **Custom ENUM types** | Type-safe status fields with database-level validation |
| **GIN indexes** | Fast full-text search for products and content |

---

## Tables at a Glance

### Users Module

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | All accounts (buyers, sellers, admins) | email, account_type, phone |
| `user_addresses` | Shipping/billing addresses | wilaya, commune, street_address |
| `seller_registrations` | Seller verification (CNRC, business ID) | cnrc_number, verification_status |

### Commerce Module

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `stores` | Seller storefronts | name, status, trust_score |
| `products` | Product catalog | price, stock, category_id |
| `categories` | Hierarchical categories | parent_id, slug |
| `orders` | Customer orders | order_number, status, total_amount |
| `order_items` | Line items with price snapshots | quantity, unit_price |
| `reviews` | Product ratings | rating (1-5), comment |

### Payments Module

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `payments` | Payment transactions | method (ccp, baridi_mob, etc), status |
| `escrow_accounts` | Buyer protection fund holding | amount, releasable_at |
| `disputes` | Payment disputes | reason, status, resolved_at |

### Logistics Module

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `shipments` | Shipping with GPS tracking | tracking_number, courier_id, delivery_otp |
| `tracking_events` | Complete tracking history | source, location, event_time |
| `couriers` | Delivery personnel | zone_id, current_lat/lng, rating |
| `courier_assignments` | Shipment-to-courier mapping | status, completed_at |
| `delivery_zones` | Geographic zones | communes (JSON), base_fee |
| `delivery_ratings` | Courier feedback | rating, comment |

### Reference & Config

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `wilayas` | 58 Algerian provinces | code, name_ar, name_fr |
| `themes` | Store visual templates | css_config |
| `plans` | Subscription tiers | price, features |
| `subscriptions` | Store subscriptions | plan_id, expires_at |
| `notifications` | User notifications | type, is_read |
| `audit_logs` | System audit trail | action, old_values, new_values |

---

## How Things Flow

### Order Lifecycle

This is what happens when someone places an order:

```
Customer adds items to cart
            │
            ▼
┌────────────────────────┐
│ orders (pending)       │
│ order_items created    │
└────────────────────────┘
            │
            ▼
   Customer chooses payment
   (CCP, Baridi Mob, etc.)
            │
            ▼
┌────────────────────────┐
│ payments (pending)     │
└────────────────────────┘
            │
            ▼
   Payment confirmed
   (receipt uploaded or API callback)
            │
            ▼
┌────────────────────────┐
│ escrow_accounts        │
│ (money held safely)    │
└────────────────────────┘
            │
            ▼
   Seller ships the order
```

### Shipping Lifecycle

The interesting part — how a package gets from seller to buyer:

```
Seller creates shipping label
            │
            ▼
┌───────────────────────────┐
│ shipments (pending)       │
│ tracking_number generated │
└───────────────────────────┘
            │
            ▼
   Package handed to Algerie Poste
   (bureau-to-bureau transport)
            │
            ▼
┌───────────────────────────┐
│ shipments (in_transit)    │
│ tracking_events logged    │
└───────────────────────────┘
            │
            ▼
   Package arrives at destination bureau
            │
            ▼
┌───────────────────────────┐
│ shipments (at_bureau)     │
└───────────────────────────┘
            │
            ▼
   Courier assigned for last-mile
            │
            ▼
┌───────────────────────────┐
│ courier_assignments       │
│ shipments.courier_id set  │
└───────────────────────────┘
            │
            ▼
   Courier picks up, starts delivery
   (GPS tracking begins)
            │
            ▼
┌──────────────────────────────┐
│ shipments (out_for_delivery) │
│ current_lat/lng updating     │
└──────────────────────────────┘
            │
            ▼
   At customer's door
   OTP verification required
            │
            ▼
┌───────────────────────────┐
│ shipments (delivered)     │
│ delivery_signature saved  │
└───────────────────────────┘
            │
            ▼
   Escrow released to seller
```

---

## Documentation

We put a lot of effort into documenting this database properly. You'll find everything in the `docs/` folder:

| Document | What's Inside |
|----------|---------------|
| [DATABASE_DOCUMENTATION.tex](docs/DATABASE_DOCUMENTATION.tex) | The complete technical spec — 50+ pages covering everything |
| [ER_DIAGRAM.md](docs/ER_DIAGRAM.md) | Visual entity-relationship diagrams (Mermaid format) |
| [NORMALIZATION.md](docs/NORMALIZATION.md) | Why the schema is in 3NF and what trade-offs we made |

### Building the PDF

```bash
pdflatex docs/DATABASE_DOCUMENTATION.tex
pdflatex docs/DATABASE_DOCUMENTATION.tex   # run twice for table of contents
```

---

## Development

### Adding a New Migration

When you need to change the schema:

1. Create a new file: `migrations/003_your_feature.sql`
2. Use the naming convention: `NNN_description.sql`
3. Test it locally before pushing

Example:

```sql
-- 003_add_wishlist.sql

CREATE TABLE wishlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) 
    REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT unique_wishlist UNIQUE (user_id, product_id)
);
```

### Git Workflow

We've included a PowerShell module to make git operations easier:

```powershell
# Import the module
Import-Module .\database\scripts\git-workflow.ps1

# Create a feature branch
New-FeatureBranch -Name "add-wishlist"

# Commit with conventional format
Commit-DatabaseChange -Type feat -Scope schema -Message "add wishlist table"

# Test migrations
Test-Migration

# Push and create PR
Push-Branch
New-PullRequest -Title "Add wishlist feature"
```

### Environment Variables

For the backend application:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_DATABASE=ap_ecommerce
DB_SYNCHRONIZE=false   # NEVER true in production
```

---

## Testing

### Verify Tables Exist

```powershell
docker exec ap-ecommerce-postgres psql -U postgres -d ap_ecommerce -c "\dt"
```

You should see 24 tables.

### Quick Data Check

```sql
SELECT 
  (SELECT COUNT(*) FROM users) AS users,
  (SELECT COUNT(*) FROM stores) AS stores,
  (SELECT COUNT(*) FROM products) AS products,
  (SELECT COUNT(*) FROM wilayas) AS wilayas;
```

Expected: 3 users, 1 store, 5 products, 58 wilayas.

### Common Test Queries

```sql
-- Store with its products
SELECT s.name AS store, p.name AS product, p.price 
FROM stores s 
JOIN products p ON p.store_id = s.id;

-- Orders with customer names
SELECT o.order_number, u.full_name, o.total_amount, o.status
FROM orders o
JOIN users u ON o.buyer_id = u.id;

-- Delivery zones in Alger
SELECT name, base_fee 
FROM delivery_zones 
WHERE wilaya = 'Alger';
```

### Reset Everything

Start fresh with a clean database:

```powershell
.\database\scripts\setup-local.ps1 -Clean
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- Branching strategy (feature/, fix/, migration/)
- Commit message conventions
- Testing requirements
- How to handle sensitive data

---

## Resources

- [PostgreSQL 16 Documentation](https://www.postgresql.org/docs/16/)
- [NestJS TypeORM Docs](https://docs.nestjs.com/techniques/database)
- [Algerie Poste EMS](https://www.poste.dz/services/ems)

---

<p align="center">
  <strong>Last Updated:</strong> December 2025
  <br>
  <strong>Version:</strong> 2.0.0 (PostgreSQL Migration)
</p>

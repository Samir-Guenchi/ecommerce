# Database Normalization Analysis

## Algérie Poste E-Commerce Database

This document analyzes the database schema against normal forms (1NF, 2NF, 3NF, BCNF) and documents the normalization decisions.

---

## Table of Contents

1. [Normal Forms Overview](#normal-forms-overview)
2. [Normalization Analysis by Table](#normalization-analysis-by-table)
3. [Denormalization Decisions](#denormalization-decisions)
4. [Summary](#summary)

---

## Normal Forms Overview

### First Normal Form (1NF)
- ✅ All tables have a primary key
- ✅ All columns contain atomic (indivisible) values
- ✅ No repeating groups

### Second Normal Form (2NF)
- ✅ Must be in 1NF
- ✅ All non-key columns depend on the entire primary key
- ✅ No partial dependencies

### Third Normal Form (3NF)
- ✅ Must be in 2NF
- ✅ No transitive dependencies (non-key columns depend only on the primary key)

### Boyce-Codd Normal Form (BCNF)
- ✅ Must be in 3NF
- ✅ Every determinant is a candidate key

---

## Normalization Analysis by Table

### 1. USERS Table

```sql
users (
    id PK,
    email UK,
    password_hash,
    full_name,
    phone,
    bio,
    account_type,
    account_status,
    language_preference,
    last_login,
    created_at,
    updated_at
)
```

| Normal Form | Status | Analysis |
|-------------|--------|----------|
| 1NF | ✅ Pass | All atomic values, single PK |
| 2NF | ✅ Pass | No composite key, no partial dependencies |
| 3NF | ✅ Pass | All attributes depend directly on `id` |
| BCNF | ✅ Pass | `email` is a candidate key, properly handled |

**Functional Dependencies:**
- `id` → `email`, `password_hash`, `full_name`, `phone`, `bio`, `account_type`, `account_status`, `language_preference`, `last_login`
- `email` → `id` (candidate key)

---

### 2. USER_ADDRESSES Table

```sql
user_addresses (
    id PK,
    user_id FK,
    name,
    full_name,
    phone,
    wilaya,
    commune,
    street,
    postal_code,
    is_default,
    address_type
)
```

| Normal Form | Status | Analysis |
|-------------|--------|----------|
| 1NF | ✅ Pass | All atomic values |
| 2NF | ✅ Pass | Single column PK |
| 3NF | ⚠️ Note | `commune` → `wilaya` transitive dependency exists in real world, but stored separately for flexibility |

**Decision:** Kept denormalized because:
1. Users may enter invalid commune/wilaya combinations
2. Validation happens at application layer
3. Historical addresses shouldn't change if wilaya/commune data updates

---

### 3. PRODUCTS Table

```sql
products (
    id PK,
    store_id FK,
    category_id FK,
    name,
    slug UK,
    description,
    price,
    compare_price,
    stock,
    sku,
    status,
    images JSON,
    attributes JSON,
    weight,
    dimensions JSON,
    total_sold,
    rating,
    review_count
)
```

| Normal Form | Status | Analysis |
|-------------|--------|----------|
| 1NF | ⚠️ Note | `images`, `attributes`, `dimensions` are JSON (multi-valued) |
| 2NF | ✅ Pass | All non-key attributes depend on `id` |
| 3NF | ⚠️ Note | `rating` and `review_count` are derived from `reviews` table |

**JSON Fields Analysis:**

| Field | Justification |
|-------|---------------|
| `images` | Array of image URLs - would require separate table for strict 1NF |
| `attributes` | Key-value pairs (color, size, etc.) - variable schema |
| `dimensions` | Object `{length, width, height}` - always 3 values together |

**Decision:** JSON fields are acceptable because:
1. They are always read/written as a unit
2. No need to query individual array elements
3. Schema flexibility for different product types

**Derived Fields:**
- `rating` = AVG(reviews.rating)
- `review_count` = COUNT(reviews)

**Decision:** Kept denormalized for performance:
1. Avoid expensive JOINs on every product listing
2. Updated via triggers or application logic when reviews change

---

### 4. ORDERS Table

```sql
orders (
    id PK,
    buyer_id FK,
    store_id FK,
    order_number UK,
    status,
    subtotal,
    shipping_fee,
    discount,
    total_amount,
    shipping_address JSON,
    billing_address JSON,
    notes
)
```

| Normal Form | Status | Analysis |
|-------------|--------|----------|
| 1NF | ⚠️ Note | `shipping_address`, `billing_address` are JSON |
| 2NF | ✅ Pass | No partial dependencies |
| 3NF | ⚠️ Note | `total_amount` = `subtotal` + `shipping_fee` - `discount` |

**Address JSON Decision:**
```json
{
    "full_name": "Mohamed Ali",
    "phone": "+213555000001",
    "wilaya": "Alger",
    "commune": "Alger Centre",
    "street": "123 Rue Didouche Mourad",
    "postal_code": "16000"
}
```

**Justification:**
1. **Snapshot requirement**: Address at order time must be preserved
2. User may change or delete their address later
3. Historical orders must show original delivery address
4. This is a common e-commerce pattern (Amazon, Shopify use same approach)

**Alternative (Normalized):**
```sql
-- Would require
order_shipping_addresses (
    id, order_id, full_name, phone, wilaya, commune, street, postal_code
)
order_billing_addresses (
    id, order_id, full_name, phone, wilaya, commune, street, postal_code
)
```

**Decision:** JSON snapshot preferred for simplicity and immutability.

---

### 5. ORDER_ITEMS Table

```sql
order_items (
    id PK,
    order_id FK,
    product_id FK,
    product_name,
    product_price,
    quantity,
    subtotal,
    product_snapshot JSON
)
```

| Normal Form | Status | Analysis |
|-------------|--------|----------|
| 1NF | ⚠️ Note | `product_snapshot` is JSON |
| 2NF | ✅ Pass | All attributes depend on `id` |
| 3NF | ⚠️ Note | `subtotal` = `product_price` × `quantity` (derived) |
| 3NF | ⚠️ Note | `product_name`, `product_price` duplicated from `products` |

**Duplication Justification:**

| Field | Reason |
|-------|--------|
| `product_name` | Product may be renamed or deleted |
| `product_price` | Price may change after order |
| `product_snapshot` | Complete product state at purchase time |

**This is intentional denormalization for:**
1. Order history accuracy
2. Legal/tax requirements (must show original price)
3. Product deletion shouldn't break order history

---

### 6. SHIPMENTS Table

```sql
shipments (
    id PK,
    order_id FK,
    tracking_number UK,
    last_mile_tracking UK,
    provider,
    status,
    delivery_type,
    courier_id FK,
    courier_name,        -- Denormalized
    courier_phone,       -- Denormalized
    current_latitude,
    current_longitude,
    ...
)
```

| Normal Form | Status | Analysis |
|-------------|--------|----------|
| 1NF | ✅ Pass | All atomic values |
| 2NF | ✅ Pass | Single PK |
| 3NF | ⚠️ Note | `courier_name`, `courier_phone` depend on `courier_id` |

**Denormalization Decision:**
```
courier_id → courier_name, courier_phone
```

**Kept denormalized because:**
1. Quick access for SMS/notifications without JOIN
2. Courier may change phone number, but shipment record shouldn't update
3. Snapshot of courier at assignment time

---

### 7. TRACKING_EVENTS Table

```sql
tracking_events (
    id PK,
    shipment_id FK,
    status,
    location,
    latitude,
    longitude,
    source,
    description,
    event_time
)
```

| Normal Form | Status | Analysis |
|-------------|--------|----------|
| 1NF | ✅ Pass | All atomic |
| 2NF | ✅ Pass | Single PK |
| 3NF | ✅ Pass | All attributes depend only on `id` |
| BCNF | ✅ Pass | No overlapping candidate keys |

**Fully normalized.** No changes needed.

---

### 8. CATEGORIES Table (Self-Referencing)

```sql
categories (
    id PK,
    name,
    slug UK,
    parent_id FK → categories.id,
    description,
    image_path,
    is_active,
    sort_order
)
```

| Normal Form | Status | Analysis |
|-------------|--------|----------|
| 1NF | ✅ Pass | Atomic values |
| 2NF | ✅ Pass | Single PK |
| 3NF | ✅ Pass | Self-reference is valid |

**Hierarchy Pattern:** Adjacency List Model

**Alternative patterns:**
1. **Nested Set Model** - Better for read-heavy, complex for writes
2. **Closure Table** - Best for deep hierarchies, requires extra table
3. **Path Enumeration** - Stores full path as string

**Decision:** Adjacency List chosen for:
- Simple structure
- Easy insertions/updates
- Max 2-3 levels expected (Main → Sub → Sub-sub)

---

### 9. ESCROW_ACCOUNTS Table

```sql
escrow_accounts (
    id PK,
    order_id FK UK,
    payment_id FK,
    amount,
    status,
    locked_at,
    releasable_at,
    released_at
)
```

| Normal Form | Status | Analysis |
|-------------|--------|----------|
| 1NF | ✅ Pass | All atomic |
| 2NF | ✅ Pass | Single PK |
| 3NF | ✅ Pass | All attributes depend on `id` |
| BCNF | ✅ Pass | Clean |

**Fully normalized.** Critical financial table - no denormalization.

---

### 10. WILAYAS Table (Reference Data)

```sql
wilayas (
    id PK,
    code UK,
    name_ar,
    name_fr,
    shipping_zone
)
```

| Normal Form | Status | Analysis |
|-------------|--------|----------|
| 1NF | ✅ Pass | Atomic |
| 2NF | ✅ Pass | Single PK |
| 3NF | ✅ Pass | All attributes depend on `id` |

**Reference table - fully normalized.**

---

### 11. DELIVERY_ZONES Table

```sql
delivery_zones (
    id PK,
    name,
    wilaya,
    communes JSON,
    base_fee,
    per_km_fee,
    estimated_time_minutes,
    is_active
)
```

| Normal Form | Status | Analysis |
|-------------|--------|----------|
| 1NF | ⚠️ Note | `communes` is JSON array |
| 2NF | ✅ Pass | Single PK |
| 3NF | ✅ Pass | No transitive dependencies |

**JSON Array Justification:**
```json
["Alger Centre", "Sidi M'Hamed", "Hussein Dey", "Kouba"]
```

**Alternative (Normalized):**
```sql
zone_communes (
    id PK,
    zone_id FK,
    commune_name
)
```

**Decision:** JSON preferred because:
1. Communes are only used for zone matching
2. No need to query individual communes
3. Simpler administration

---

## Denormalization Decisions

### Summary of Intentional Denormalizations

| Table | Field(s) | Reason | Impact |
|-------|----------|--------|--------|
| `products` | `rating`, `review_count` | Performance | Updated on review changes |
| `products` | `images`, `attributes` | Flexibility | JSON for variable schema |
| `orders` | `shipping_address`, `billing_address` | Historical snapshot | Immutable after creation |
| `order_items` | `product_name`, `product_price` | Historical snapshot | Immutable |
| `order_items` | `product_snapshot` | Legal/audit | Complete product state |
| `shipments` | `courier_name`, `courier_phone` | Quick access | Snapshot at assignment |
| `delivery_zones` | `communes` | Simplicity | JSON array for grouping |

### Denormalization Triggers/Procedures

For derived fields, these should be maintained:

```sql
-- Update product rating when review is added
DELIMITER //
CREATE TRIGGER update_product_rating
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE products 
    SET 
        rating = (SELECT AVG(rating) FROM reviews WHERE product_id = NEW.product_id),
        review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id)
    WHERE id = NEW.product_id;
END//
DELIMITER ;
```

---

## Summary

### Normalization Status by Table

| Table | 1NF | 2NF | 3NF | Notes |
|-------|-----|-----|-----|-------|
| users | ✅ | ✅ | ✅ | Fully normalized |
| user_addresses | ✅ | ✅ | ✅ | Fully normalized |
| seller_registrations | ✅ | ✅ | ✅ | Fully normalized |
| stores | ✅ | ✅ | ✅ | Fully normalized |
| themes | ✅ | ✅ | ✅ | Fully normalized |
| categories | ✅ | ✅ | ✅ | Self-referencing OK |
| products | ⚠️ | ✅ | ⚠️ | JSON + derived fields |
| reviews | ✅ | ✅ | ✅ | Fully normalized |
| orders | ⚠️ | ✅ | ⚠️ | JSON address snapshots |
| order_items | ⚠️ | ✅ | ⚠️ | Product snapshots |
| payments | ✅ | ✅ | ✅ | Fully normalized |
| escrow_accounts | ✅ | ✅ | ✅ | Fully normalized (critical) |
| disputes | ✅ | ✅ | ✅ | Fully normalized |
| shipments | ✅ | ✅ | ⚠️ | Courier name/phone cached |
| tracking_events | ✅ | ✅ | ✅ | Fully normalized |
| couriers | ✅ | ✅ | ✅ | Fully normalized |
| courier_assignments | ✅ | ✅ | ✅ | Fully normalized |
| delivery_zones | ⚠️ | ✅ | ✅ | JSON communes array |
| delivery_ratings | ✅ | ✅ | ✅ | Fully normalized |
| wilayas | ✅ | ✅ | ✅ | Reference data |
| plans | ✅ | ✅ | ✅ | Fully normalized |
| subscriptions | ✅ | ✅ | ✅ | Fully normalized |
| notifications | ✅ | ✅ | ✅ | Fully normalized |
| audit_logs | ✅ | ✅ | ✅ | Fully normalized |

### Key Principles Applied

1. **Financial tables are fully normalized** (escrow, payments) - data integrity is critical
2. **Historical snapshots use JSON** - immutability over normalization
3. **Performance caching** - derived fields maintained by triggers
4. **Reference data normalized** - wilayas, plans, themes
5. **Audit logs fully normalized** - compliance and debugging

---

## Recommendations for Future

1. **If query performance degrades:**
   - Add materialized views for complex reports
   - Consider read replicas

2. **If product attributes become complex:**
   - Consider EAV (Entity-Attribute-Value) pattern
   - Or dedicated attribute tables per category

3. **If category hierarchy deepens:**
   - Consider Closure Table pattern
   - Or path enumeration with LIKE queries

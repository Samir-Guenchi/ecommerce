# Changelog

All notable changes to the database module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Product variants table for SKU/size/color tracking
- Payment transactions table for refund history
- Courier-zone M:N relationship

---

## [1.1.0] - 2025-12-06

### Added
- Enhanced last-mile tracking system
  - `couriers` table for delivery personnel
  - `courier_assignments` table for shipment assignments
  - `delivery_zones` table for geographic coverage
  - `delivery_ratings` table for courier feedback
- GPS tracking fields on `shipments` table
  - `current_latitude`, `current_longitude`
  - `last_mile_tracking` internal tracking number
- OTP verification for secure delivery
  - `delivery_otp` and `otp_expires_at` fields
- Delivery attempt tracking
  - `delivery_attempts`, `max_delivery_attempts`

### Changed
- `shipments.status` enum expanded with new statuses:
  - `at_bureau`, `out_for_delivery`, `delivery_attempted`
- Added `delivery_type` enum: `bureau_pickup`, `home_delivery`, `relay_point`

### Migration
- File: `002_enhanced_tracking.sql`

---

## [1.0.0] - 2025-12-01

### Added
- Initial database schema with 24 tables
- **Users Module**
  - `users` - Central user accounts
  - `user_addresses` - Shipping/billing addresses
  - `seller_registrations` - Seller verification
- **Commerce Module**
  - `stores` - Seller storefronts
  - `products` - Product catalog
  - `categories` - Hierarchical categories
  - `themes` - Store visual themes
  - `reviews` - Product reviews
- **Orders Module**
  - `orders` - Customer orders
  - `order_items` - Order line items with snapshots
- **Payments Module**
  - `payments` - Payment transactions
  - `escrow_accounts` - Buyer protection
  - `disputes` - Payment disputes
- **Logistics Module**
  - `shipments` - Shipping records
  - `tracking_events` - Tracking history
- **Reference Data**
  - `wilayas` - 58 Algerian provinces
  - `plans` - Subscription plans
  - `subscriptions` - Store subscriptions
  - `notifications` - User notifications
  - `audit_logs` - System audit trail

### Migration
- File: `001_initial_schema.sql`

### Seed Data
- File: `001_initial_data.sql`
- 3 test users (admin, seller, buyer)
- 1 demo store with 5 products
- 16 product categories
- 58 wilayas reference data
- 10 delivery zones

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.1.0 | 2025-12-06 | Enhanced last-mile tracking |
| 1.0.0 | 2025-12-01 | Initial schema release |

---

## Tagging Convention

```bash
# Format
git tag -a db-v{MAJOR}.{MINOR}.{PATCH} -m "Database version {version}"

# Examples
git tag -a db-v1.0.0 -m "Database version 1.0.0 - Initial schema"
git tag -a db-v1.1.0 -m "Database version 1.1.0 - Enhanced tracking"
```

---

[Unreleased]: https://github.com/Samir-Guenchi/ecommerce/compare/db-v1.1.0...HEAD
[1.1.0]: https://github.com/Samir-Guenchi/ecommerce/compare/db-v1.0.0...db-v1.1.0
[1.0.0]: https://github.com/Samir-Guenchi/ecommerce/releases/tag/db-v1.0.0

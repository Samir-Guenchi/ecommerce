# MySQL Database Schema for Algerie Post E-Commerce Platform

## Overview
This document describes the complete MySQL database schema for the Algerie Post e-commerce platform, including all tables, relationships, and data types based on the application screens and functionality.

---

## Core Tables

### 1. `users`
Stores user account information and authentication data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email address (login) |
| `password_hash` | VARCHAR(255) | NOT NULL | Hashed password |
| `full_name` | VARCHAR(255) | | User's full name |
| `phone` | VARCHAR(20) | | Phone number |
| `bio` | TEXT | | User biography/description |
| `account_type` | ENUM('buyer', 'seller', 'both') | DEFAULT 'buyer' | Account type selection |
| `account_status` | ENUM('active', 'inactive', 'pending', 'suspended') | DEFAULT 'pending' | Account status |
| `language_preference` | VARCHAR(10) | DEFAULT 'en' | Preferred language code |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation date |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |
| `last_login` | TIMESTAMP | NULL | Last login timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE INDEX (`email`)
- INDEX (`account_type`)
- INDEX (`account_status`)

---

### 2. `seller_registrations`
Stores seller registration information and verification documents.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique registration ID |
| `user_id` | INT | FOREIGN KEY (users.id), NOT NULL | Reference to user |
| `full_name` | VARCHAR(255) | NOT NULL | Seller's full name |
| `ssid` | VARCHAR(50) | NOT NULL | Social Security ID |
| `business_id` | VARCHAR(100) | NOT NULL | Business registration ID |
| `document1_path` | VARCHAR(500) | | Path to document 1 |
| `document2_path` | VARCHAR(500) | | Path to document 2 |
| `document3_path` | VARCHAR(500) | | Path to document 3 |
| `verification_status` | ENUM('pending', 'approved', 'rejected') | DEFAULT 'pending' | Verification status |
| `verified_at` | TIMESTAMP | NULL | Verification completion date |
| `verified_by` | INT | FOREIGN KEY (users.id), NULL | Admin who verified |
| `rejection_reason` | TEXT | NULL | Reason for rejection if applicable |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Registration date |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
- FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
- INDEX (`verification_status`)

---

### 3. `stores`
Stores information about seller stores.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique store ID |
| `user_id` | INT | FOREIGN KEY (users.id), NOT NULL | Store owner |
| `name` | VARCHAR(255) | NOT NULL | Store name |
| `status` | ENUM('active', 'draft', 'suspended') | DEFAULT 'draft' | Store status |
| `location` | VARCHAR(255) | | Store location/city |
| `description` | TEXT | | Store description |
| `theme_id` | INT | FOREIGN KEY (themes.id), NULL | Selected theme |
| `domain` | VARCHAR(255) | UNIQUE, NULL | Custom domain |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Store creation date |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
- FOREIGN KEY (`theme_id`) REFERENCES `themes`(`id`) ON DELETE SET NULL
- INDEX (`status`)
- UNIQUE INDEX (`domain`)

---

### 4. `products`
Stores product information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique product ID |
| `store_id` | INT | FOREIGN KEY (stores.id), NOT NULL | Store that owns the product |
| `name` | VARCHAR(255) | NOT NULL | Product name |
| `description` | TEXT | | Product description |
| `price` | DECIMAL(10,2) | NOT NULL | Product price |
| `stock` | INT | DEFAULT 0 | Available stock quantity |
| `status` | ENUM('active', 'draft', 'out_of_stock') | DEFAULT 'draft' | Product status |
| `category` | VARCHAR(100) | | Product category |
| `image_path` | VARCHAR(500) | NULL | Product image path |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Product creation date |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE
- INDEX (`status`)
- INDEX (`category`)
- FULLTEXT INDEX (`name`, `description`)

---

### 5. `orders`
Stores order information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique order ID |
| `order_number` | VARCHAR(50) | UNIQUE, NOT NULL | Human-readable order number |
| `user_id` | INT | FOREIGN KEY (users.id), NOT NULL | Customer who placed order |
| `store_id` | INT | FOREIGN KEY (stores.id), NOT NULL | Store receiving order |
| `total_amount` | DECIMAL(10,2) | NOT NULL | Total order amount |
| `status` | ENUM('processing', 'shipped', 'delivered', 'cancelled') | DEFAULT 'processing' | Order status |
| `shipping_address_id` | INT | FOREIGN KEY (addresses.id), NULL | Shipping address |
| `tracking_number` | VARCHAR(100) | NULL | Delivery tracking number |
| `order_date` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Order placement date |
| `shipped_date` | TIMESTAMP | NULL | Shipment date |
| `delivered_date` | TIMESTAMP | NULL | Delivery completion date |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation date |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE INDEX (`order_number`)
- FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
- FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE
- FOREIGN KEY (`shipping_address_id`) REFERENCES `addresses`(`id`) ON DELETE SET NULL
- INDEX (`status`)
- INDEX (`order_date`)

---

### 6. `order_items`
Stores individual items within an order.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique order item ID |
| `order_id` | INT | FOREIGN KEY (orders.id), NOT NULL | Parent order |
| `product_id` | INT | FOREIGN KEY (products.id), NOT NULL | Product ordered |
| `quantity` | INT | NOT NULL, DEFAULT 1 | Quantity ordered |
| `unit_price` | DECIMAL(10,2) | NOT NULL | Price per unit at time of order |
| `subtotal` | DECIMAL(10,2) | NOT NULL | Line item total (quantity × unit_price) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation date |

**Indexes:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
- FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT
- INDEX (`order_id`)

---

### 7. `addresses`
Stores user addresses for shipping and billing.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique address ID |
| `user_id` | INT | FOREIGN KEY (users.id), NOT NULL | Address owner |
| `name` | VARCHAR(255) | | Address label (e.g., "Main Warehouse") |
| `address_line1` | VARCHAR(255) | NOT NULL | Street address |
| `address_line2` | VARCHAR(255) | | Additional address info |
| `city` | VARCHAR(100) | NOT NULL | City |
| `state_province` | VARCHAR(100) | | State or province |
| `postal_code` | VARCHAR(20) | | Postal/ZIP code |
| `country` | VARCHAR(100) | NOT NULL | Country |
| `is_default` | BOOLEAN | DEFAULT FALSE | Default address flag |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation date |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
- INDEX (`user_id`, `is_default`)

---

### 8. `payment_methods`
Stores user payment methods.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique payment method ID |
| `user_id` | INT | FOREIGN KEY (users.id), NOT NULL | Payment method owner |
| `type` | ENUM('credit_card', 'debit_card', 'bank_account') | NOT NULL | Payment method type |
| `card_last4` | VARCHAR(4) | NULL | Last 4 digits of card |
| `card_expiry` | VARCHAR(7) | NULL | Card expiry (MM/YYYY) |
| `is_default` | BOOLEAN | DEFAULT FALSE | Default payment method flag |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation date |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
- INDEX (`user_id`, `is_default`)

---

### 9. `subscriptions`
Stores user subscription/plan information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique subscription ID |
| `user_id` | INT | FOREIGN KEY (users.id), NOT NULL | Subscriber |
| `plan_id` | INT | FOREIGN KEY (plans.id), NOT NULL | Subscription plan |
| `status` | ENUM('active', 'cancelled', 'expired', 'pending') | DEFAULT 'pending' | Subscription status |
| `start_date` | DATE | NOT NULL | Subscription start date |
| `end_date` | DATE | NULL | Subscription end date |
| `next_billing_date` | DATE | NULL | Next billing date |
| `auto_renew` | BOOLEAN | DEFAULT TRUE | Auto-renewal flag |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation date |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
- FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE RESTRICT
- INDEX (`status`)
- INDEX (`next_billing_date`)

---

### 10. `plans`
Stores available subscription plans.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique plan ID |
| `name` | VARCHAR(100) | NOT NULL | Plan name (e.g., "Premium") |
| `description` | TEXT | | Plan description |
| `price` | DECIMAL(10,2) | NOT NULL | Monthly price |
| `billing_period` | ENUM('monthly', 'yearly') | DEFAULT 'monthly' | Billing period |
| `features` | JSON | | Plan features (stored as JSON array) |
| `is_active` | BOOLEAN | DEFAULT TRUE | Plan availability |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation date |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`is_active`)

---

### 11. `themes`
Stores available store themes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique theme ID |
| `name` | VARCHAR(100) | NOT NULL | Theme name |
| `description` | TEXT | | Theme description |
| `preview_image` | VARCHAR(500) | NULL | Theme preview image path |
| `is_active` | BOOLEAN | DEFAULT TRUE | Theme availability |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation date |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`is_active`)

---

### 12. `notifications`
Stores user notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique notification ID |
| `user_id` | INT | FOREIGN KEY (users.id), NOT NULL | Notification recipient |
| `title` | VARCHAR(255) | NOT NULL | Notification title |
| `message` | TEXT | NOT NULL | Notification message |
| `type` | ENUM('info', 'warning', 'success', 'error') | DEFAULT 'info' | Notification type |
| `is_read` | BOOLEAN | DEFAULT FALSE | Read status |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Notification creation date |

**Indexes:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
- INDEX (`user_id`, `is_read`)
- INDEX (`created_at`)

---

### 13. `events`
Stores events/analytics events for tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique event ID |
| `user_id` | INT | FOREIGN KEY (users.id), NULL | Event user (nullable for system events) |
| `store_id` | INT | FOREIGN KEY (stores.id), NULL | Related store |
| `event_type` | VARCHAR(100) | NOT NULL | Event type (e.g., 'order_placed', 'product_viewed') |
| `event_data` | JSON | NULL | Additional event data |
| `status` | ENUM('active', 'completed', 'cancelled') | DEFAULT 'active' | Event status |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Event creation date |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
- FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE SET NULL
- INDEX (`event_type`)
- INDEX (`status`)
- INDEX (`created_at`)

---

### 14. `tracking_systems`
Stores tracking system configurations. Each store has one tracking system API.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique tracking ID |
| `store_id` | INT | FOREIGN KEY (stores.id), NOT NULL | Store that owns this tracking system |
| `system_name` | VARCHAR(100) | NOT NULL | Tracking system name |
| `api_key` | VARCHAR(255) | NULL | API key for tracking system |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |
| `settings` | JSON | NULL | Additional settings |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation date |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE
- INDEX (`store_id`, `is_active`)

---

### 15. `tax_settings`
Stores tax and duty configurations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique tax setting ID |
| `user_id` | INT | FOREIGN KEY (users.id), NOT NULL | Tax setting owner |
| `tax_rate` | DECIMAL(5,2) | DEFAULT 0.00 | Tax rate percentage |
| `duty_rate` | DECIMAL(5,2) | DEFAULT 0.00 | Duty rate percentage |
| `tax_included` | BOOLEAN | DEFAULT FALSE | Tax included in price |
| `settings` | JSON | NULL | Additional tax settings |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation date |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
- UNIQUE INDEX (`user_id`)

---

### 16. `delivery_settings`
Stores delivery/shipping configurations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique delivery setting ID |
| `user_id` | INT | FOREIGN KEY (users.id), NOT NULL | Delivery setting owner |
| `default_shipping_method` | VARCHAR(100) | | Default shipping method |
| `shipping_cost` | DECIMAL(10,2) | DEFAULT 0.00 | Default shipping cost |
| `free_shipping_threshold` | DECIMAL(10,2) | NULL | Minimum order for free shipping |
| `settings` | JSON | NULL | Additional delivery settings |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation date |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
- UNIQUE INDEX (`user_id`)

---

### 17. `user_permissions`
Stores user permissions and roles (for multi-user accounts).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique permission ID |
| `user_id` | INT | FOREIGN KEY (users.id), NOT NULL | User with permission |
| `store_id` | INT | FOREIGN KEY (stores.id), NULL | Store-specific permission |
| `permission_type` | VARCHAR(100) | NOT NULL | Permission type |
| `can_edit` | BOOLEAN | DEFAULT FALSE | Edit permission |
| `can_delete` | BOOLEAN | DEFAULT FALSE | Delete permission |
| `can_view` | BOOLEAN | DEFAULT TRUE | View permission |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation date |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
- FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE
- INDEX (`user_id`, `store_id`)

---

### 18. `transactions`
Stores payment transactions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique transaction ID |
| `user_id` | INT | FOREIGN KEY (users.id), NOT NULL | Transaction user |
| `order_id` | INT | FOREIGN KEY (orders.id), NULL | Related order |
| `payment_method_id` | INT | FOREIGN KEY (payment_methods.id), NULL | Payment method used |
| `amount` | DECIMAL(10,2) | NOT NULL | Transaction amount |
| `currency` | VARCHAR(3) | DEFAULT 'DZD' | Currency code |
| `status` | ENUM('pending', 'completed', 'failed', 'refunded') | DEFAULT 'pending' | Transaction status |
| `transaction_type` | ENUM('payment', 'refund', 'subscription') | DEFAULT 'payment' | Transaction type |
| `transaction_reference` | VARCHAR(100) | UNIQUE, NULL | External transaction reference |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Transaction date |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
- FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE SET NULL
- FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON DELETE SET NULL
- INDEX (`status`)
- INDEX (`transaction_type`)
- UNIQUE INDEX (`transaction_reference`)

---

## Relationships Summary

### Primary Relationships:
1. **Users → Seller Registrations**: One-to-One (user can have one registration)
2. **Users → Stores**: One-to-Many (user can own multiple stores)
3. **Users → Orders**: One-to-Many (user can place multiple orders)
4. **Users → Addresses**: One-to-Many (user can have multiple addresses)
5. **Users → Payment Methods**: One-to-Many (user can have multiple payment methods)
6. **Users → Subscriptions**: One-to-Many (user can have subscription history)
7. **Stores → Products**: One-to-Many (store can have multiple products)
8. **Stores → Orders**: One-to-Many (store can receive multiple orders)
9. **Orders → Order Items**: One-to-Many (order contains multiple items)
10. **Products → Order Items**: One-to-Many (product can be in multiple orders)
11. **Plans → Subscriptions**: One-to-Many (plan can have multiple subscribers)
12. **Themes → Stores**: One-to-Many (theme can be used by multiple stores)

### Foreign Key Constraints:
- All foreign keys use `ON DELETE CASCADE` for dependent records (e.g., deleting a user deletes their stores)
- Some use `ON DELETE SET NULL` for optional references (e.g., deleting a theme sets store theme to NULL)
- Some use `ON DELETE RESTRICT` for critical references (e.g., cannot delete a plan with active subscriptions)

---

## Additional Notes

1. **Password Security**: Store only hashed passwords (use bcrypt or similar)
2. **Payment Data**: Store only last 4 digits and expiry. Full card data should be handled by payment gateway (PCI compliance)
3. **File Storage**: Document and image paths should reference cloud storage (S3, etc.)
4. **JSON Fields**: Use JSON type for flexible data storage (MySQL 5.7+)
5. **Timestamps**: All tables include `created_at` and `updated_at` for audit trails
6. **Soft Deletes**: Consider adding `deleted_at` timestamp for soft delete functionality
7. **Indexing**: Additional indexes may be needed based on query patterns
8. **Partitioning**: Consider partitioning large tables (events, transactions) by date

---

## Sample Data Types Reference

- **VARCHAR**: Variable-length strings
- **TEXT**: Long text fields
- **INT**: Integer values
- **DECIMAL(10,2)**: Currency and precise decimal values
- **BOOLEAN**: True/false flags
- **ENUM**: Predefined value sets
- **TIMESTAMP**: Date and time values
- **DATE**: Date-only values
- **JSON**: Structured JSON data (MySQL 5.7+)

---

## Database Initialization

Recommended initialization order:
1. `users`
2. `plans`
3. `themes`
4. `seller_registrations` (depends on users)
5. `stores` (depends on users, themes)
6. `products` (depends on stores)
7. `addresses` (depends on users)
8. `payment_methods` (depends on users)
9. `subscriptions` (depends on users, plans)
10. All other tables


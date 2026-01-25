-- PostgreSQL Schema for Algerie Post E-Commerce Platform
-- Generated from DATABASE_SCHEMA.md
-- Converted from MySQL to PostgreSQL

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS user_permissions CASCADE;
DROP TABLE IF EXISTS delivery_settings CASCADE;
DROP TABLE IF EXISTS tax_settings CASCADE;
DROP TABLE IF EXISTS tracking_systems CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS seller_registrations CASCADE;
DROP TABLE IF EXISTS themes CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create ENUM types
CREATE TYPE account_type_enum AS ENUM ('buyer', 'seller', 'both');
CREATE TYPE account_status_enum AS ENUM ('active', 'inactive', 'pending', 'suspended');
CREATE TYPE verification_status_enum AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE store_status_enum AS ENUM ('active', 'draft', 'suspended');
CREATE TYPE product_status_enum AS ENUM ('active', 'draft', 'out_of_stock');
CREATE TYPE order_status_enum AS ENUM ('processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_method_type_enum AS ENUM ('credit_card', 'debit_card', 'bank_account');
CREATE TYPE subscription_status_enum AS ENUM ('active', 'cancelled', 'expired', 'pending');
CREATE TYPE billing_period_enum AS ENUM ('monthly', 'yearly');
CREATE TYPE notification_type_enum AS ENUM ('info', 'warning', 'success', 'error');
CREATE TYPE event_status_enum AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE transaction_status_enum AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE transaction_type_enum AS ENUM ('payment', 'refund', 'subscription');

-- 1. users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  bio TEXT,
  account_type account_type_enum NOT NULL DEFAULT 'buyer',
  account_status account_status_enum NOT NULL DEFAULT 'pending',
  language_preference VARCHAR(10) NOT NULL DEFAULT 'en',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

CREATE INDEX ix_users_account_type ON users(account_type);
CREATE INDEX ix_users_account_status ON users(account_status);

-- 2. plans
CREATE TABLE plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  billing_period billing_period_enum NOT NULL DEFAULT 'monthly',
  features JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_plans_is_active ON plans(is_active);

-- 3. themes
CREATE TABLE themes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  preview_image VARCHAR(500),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_themes_is_active ON themes(is_active);

-- 4. seller_registrations
CREATE TABLE seller_registrations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  ssid VARCHAR(50) NOT NULL,
  business_id VARCHAR(100) NOT NULL,
  document1_path VARCHAR(500),
  document2_path VARCHAR(500),
  document3_path VARCHAR(500),
  verification_status verification_status_enum NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMP,
  verified_by INTEGER,
  rejection_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_seller_registrations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_seller_registrations_verified_by FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX ix_seller_registrations_verification_status ON seller_registrations(verification_status);

-- 5. stores
CREATE TABLE stores (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  status store_status_enum NOT NULL DEFAULT 'draft',
  location VARCHAR(255),
  description TEXT,
  theme_id INTEGER,
  domain VARCHAR(255) UNIQUE,
  metapixleid VARCHAR(255),
  tiktokpixleid VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_stores_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_stores_theme FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE SET NULL
);

CREATE INDEX ix_stores_status ON stores(status);
CREATE INDEX ix_stores_user_id ON stores(user_id);

-- 6. products
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  status product_status_enum NOT NULL DEFAULT 'draft',
  category VARCHAR(100),
  image_path VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE INDEX ix_products_status ON products(status);
CREATE INDEX ix_products_category ON products(category);
CREATE INDEX ix_products_store_id ON products(store_id);

-- Add full-text search index (PostgreSQL uses GIN indexes for full-text)
CREATE INDEX ft_products_name_description ON products USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- 7. addresses
CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name VARCHAR(255),
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state_province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX ix_addresses_user_default ON addresses(user_id, is_default);

-- 8. orders
-- tracking_history structure: Array of tracking events
-- [
--   {
--     "wilaya": "Algiers",
--     "wilayaCode": "16",
--     "timestamp": "2024-01-15T10:30:00Z",
--     "status": "in_transit|arrived|departed|delivered",
--     "description": "Optional description"
--   }
-- ]
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  user_id INTEGER NOT NULL,
  store_id INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status order_status_enum NOT NULL DEFAULT 'processing',
  shipping_address_id INTEGER,
  tracking_number VARCHAR(100),
  tracking_history JSONB DEFAULT '[]'::jsonb,
  order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  shipped_date TIMESTAMP,
  delivered_date TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_orders_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  CONSTRAINT fk_orders_shipping_address FOREIGN KEY (shipping_address_id) REFERENCES addresses(id) ON DELETE SET NULL
);

CREATE INDEX ix_orders_status ON orders(status);
CREATE INDEX ix_orders_order_date ON orders(order_date);
CREATE INDEX ix_orders_user_id ON orders(user_id);
CREATE INDEX ix_orders_store_id ON orders(store_id);
CREATE INDEX ix_orders_tracking_history ON orders USING GIN(tracking_history);

-- 9. order_items
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE INDEX ix_order_items_order_id ON order_items(order_id);

-- 10. payment_methods
CREATE TABLE payment_methods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type payment_method_type_enum NOT NULL,
  card_last4 VARCHAR(4),
  card_expiry VARCHAR(7),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_methods_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX ix_payment_methods_user_default ON payment_methods(user_id, is_default);

-- 11. subscriptions
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  plan_id INTEGER NOT NULL,
  status subscription_status_enum NOT NULL DEFAULT 'pending',
  start_date DATE NOT NULL,
  end_date DATE,
  next_billing_date DATE,
  auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_subscriptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_subscriptions_plan FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT
);

CREATE INDEX ix_subscriptions_status ON subscriptions(status);
CREATE INDEX ix_subscriptions_next_billing_date ON subscriptions(next_billing_date);

-- 12. notifications
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type notification_type_enum NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX ix_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX ix_notifications_created_at ON notifications(created_at);

-- 13. events
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  store_id INTEGER,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  status event_status_enum NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_events_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL
);

CREATE INDEX ix_events_event_type ON events(event_type);
CREATE INDEX ix_events_status ON events(status);
CREATE INDEX ix_events_created_at ON events(created_at);

-- 14. tracking_systems
CREATE TABLE tracking_systems (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL,
  system_name VARCHAR(100) NOT NULL,
  api_key VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  settings JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tracking_systems_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE INDEX ix_tracking_systems_store_active ON tracking_systems(store_id, is_active);

-- 15. tax_settings
CREATE TABLE tax_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  duty_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  tax_included BOOLEAN NOT NULL DEFAULT FALSE,
  settings JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tax_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 16. delivery_settings
CREATE TABLE delivery_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  default_shipping_method VARCHAR(100),
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  free_shipping_threshold DECIMAL(10,2),
  settings JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_delivery_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 17. user_permissions
CREATE TABLE user_permissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  store_id INTEGER,
  permission_type VARCHAR(100) NOT NULL,
  can_edit BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete BOOLEAN NOT NULL DEFAULT FALSE,
  can_view BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_permissions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_permissions_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE INDEX ix_user_permissions_user_store ON user_permissions(user_id, store_id);

-- 18. transactions
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  order_id INTEGER,
  payment_method_id INTEGER,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'DZD',
  status transaction_status_enum NOT NULL DEFAULT 'pending',
  transaction_type transaction_type_enum NOT NULL DEFAULT 'payment',
  transaction_reference VARCHAR(100) UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_transactions_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  CONSTRAINT fk_transactions_payment_method FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE SET NULL
);

CREATE INDEX ix_transactions_status ON transactions(status);
CREATE INDEX ix_transactions_transaction_type ON transactions(transaction_type);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seller_registrations_updated_at BEFORE UPDATE ON seller_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tracking_systems_updated_at BEFORE UPDATE ON tracking_systems FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_settings_updated_at BEFORE UPDATE ON tax_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_settings_updated_at BEFORE UPDATE ON delivery_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_permissions_updated_at BEFORE UPDATE ON user_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

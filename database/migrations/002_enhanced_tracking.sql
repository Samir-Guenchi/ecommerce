-- ============================================
-- Enhanced Tracking System Migration
-- Last-Mile Delivery & Home Tracking
-- PostgreSQL Version
-- ============================================

-- ============================================
-- NEW ENUM TYPES FOR ENHANCED TRACKING
-- ============================================

DO $$ BEGIN
  CREATE TYPE vehicle_type AS ENUM ('bicycle', 'motorcycle', 'car', 'van');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE courier_status AS ENUM ('available', 'busy', 'offline', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE delivery_type AS ENUM ('bureau_pickup', 'home_delivery', 'relay_point');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE tracking_source AS ENUM ('ap_api', 'courier_app', 'customer_app', 'system');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE assignment_status AS ENUM ('assigned', 'accepted', 'rejected', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- UPDATE SHIPMENT STATUS ENUM
-- ============================================

-- Add new values to shipment_status enum
ALTER TYPE shipment_status ADD VALUE IF NOT EXISTS 'at_bureau';
ALTER TYPE shipment_status ADD VALUE IF NOT EXISTS 'delivery_attempted';

-- ============================================
-- COURIER TABLE FOR LAST-MILE DELIVERY
-- ============================================

CREATE TABLE IF NOT EXISTS couriers (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  wilaya VARCHAR(100) NOT NULL,
  commune VARCHAR(100) NOT NULL,
  vehicle_type vehicle_type DEFAULT 'motorcycle',
  license_number VARCHAR(50),
  status courier_status DEFAULT 'offline',
  current_latitude DECIMAL(10,7),
  current_longitude DECIMAL(10,7),
  last_location_update TIMESTAMP,
  total_deliveries INT DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 5.0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_couriers_wilaya_status ON couriers(wilaya, status);
CREATE INDEX IF NOT EXISTS idx_couriers_active ON couriers(is_active);

-- ============================================
-- ALTER SHIPMENTS TABLE FOR ENHANCED TRACKING
-- ============================================

-- Add last-mile tracking columns
ALTER TABLE shipments
  ADD COLUMN IF NOT EXISTS last_mile_tracking VARCHAR(100),
  ADD COLUMN IF NOT EXISTS delivery_type delivery_type DEFAULT 'home_delivery',
  ADD COLUMN IF NOT EXISTS courier_id INT REFERENCES couriers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS courier_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS courier_phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS current_latitude DECIMAL(10,7),
  ADD COLUMN IF NOT EXISTS current_longitude DECIMAL(10,7),
  ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMP,
  ADD COLUMN IF NOT EXISTS destination_bureau VARCHAR(100),
  ADD COLUMN IF NOT EXISTS bureau_arrival_time TIMESTAMP,
  ADD COLUMN IF NOT EXISTS recipient_name_confirmed VARCHAR(100),
  ADD COLUMN IF NOT EXISTS delivery_attempts INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_delivery_attempts INT DEFAULT 3,
  ADD COLUMN IF NOT EXISTS preferred_time_slot JSONB,
  ADD COLUMN IF NOT EXISTS delivery_otp VARCHAR(6),
  ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP;

-- Add indexes for courier and delivery type
CREATE INDEX IF NOT EXISTS idx_shipments_courier ON shipments(courier_id);
CREATE INDEX IF NOT EXISTS idx_shipments_delivery_type_status ON shipments(delivery_type, status);
CREATE INDEX IF NOT EXISTS idx_shipments_last_mile ON shipments(last_mile_tracking);

-- ============================================
-- ALTER TRACKING EVENTS FOR SOURCE TRACKING
-- ============================================

ALTER TABLE tracking_events
  ADD COLUMN IF NOT EXISTS source tracking_source DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7),
  ADD COLUMN IF NOT EXISTS actor_id INT,
  ADD COLUMN IF NOT EXISTS actor_type VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_tracking_source ON tracking_events(source);

-- ============================================
-- DELIVERY ZONES FOR COURIER ASSIGNMENT
-- ============================================

CREATE TABLE IF NOT EXISTS delivery_zones (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  wilaya VARCHAR(100) NOT NULL,
  communes JSONB,
  base_fee DECIMAL(10,2) NOT NULL DEFAULT 200.00,
  per_km_fee DECIMAL(10,2) DEFAULT 50.00,
  estimated_time_minutes INT DEFAULT 60,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_delivery_zones_wilaya ON delivery_zones(wilaya);
CREATE INDEX IF NOT EXISTS idx_delivery_zones_active ON delivery_zones(is_active);

-- ============================================
-- COURIER ASSIGNMENTS (DISPATCH LOG)
-- ============================================

CREATE TABLE IF NOT EXISTS courier_assignments (
  id SERIAL PRIMARY KEY,
  shipment_id INT NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  courier_id INT NOT NULL REFERENCES couriers(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by INT REFERENCES users(id) ON DELETE SET NULL,
  status assignment_status DEFAULT 'assigned',
  accepted_at TIMESTAMP,
  completed_at TIMESTAMP,
  rejection_reason TEXT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_courier_assignments_courier ON courier_assignments(courier_id, status);
CREATE INDEX IF NOT EXISTS idx_courier_assignments_shipment ON courier_assignments(shipment_id);

-- ============================================
-- DELIVERY FEEDBACK/RATING
-- ============================================

CREATE TABLE IF NOT EXISTS delivery_ratings (
  id SERIAL PRIMARY KEY,
  shipment_id INT NOT NULL UNIQUE REFERENCES shipments(id) ON DELETE CASCADE,
  courier_id INT NOT NULL REFERENCES couriers(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_delivery_ratings_courier ON delivery_ratings(courier_id);

-- ============================================
-- UPDATE USER ADDRESSES WITH GPS COORDINATES
-- ============================================

ALTER TABLE user_addresses
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7),
  ADD COLUMN IF NOT EXISTS delivery_instructions TEXT;

-- ============================================
-- TRIGGERS FOR NEW TABLES
-- ============================================

DROP TRIGGER IF EXISTS update_couriers_updated_at ON couriers;
CREATE TRIGGER update_couriers_updated_at BEFORE UPDATE ON couriers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_delivery_zones_updated_at ON delivery_zones;
CREATE TRIGGER update_delivery_zones_updated_at BEFORE UPDATE ON delivery_zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INSERT DEFAULT DELIVERY ZONES
-- ============================================

INSERT INTO delivery_zones (name, wilaya, communes, base_fee, per_km_fee, estimated_time_minutes) VALUES
('Alger Centre', 'Alger', '["Alger Centre", "Sidi M''Hamed", "Hussein Dey", "Kouba", "Bir Mourad Raïs"]', 200.00, 40.00, 45),
('Alger Est', 'Alger', '["Dar El Beïda", "Bab Ezzouar", "Bordj El Kiffan", "El Harrach", "Oued Smar"]', 250.00, 45.00, 60),
('Alger Ouest', 'Alger', '["Bab El Oued", "Casbah", "Bologhine", "Aïn Benian", "Staoueli"]', 250.00, 45.00, 60),
('Oran Centre', 'Oran', '["Oran", "Bir El Djir", "Es Senia", "Sidi Chahmi"]', 200.00, 40.00, 45),
('Constantine', 'Constantine', '["Constantine", "El Khroub", "Hamma Bouziane", "Didouche Mourad"]', 200.00, 40.00, 45),
('Annaba', 'Annaba', '["Annaba", "El Bouni", "Sidi Amar", "El Hadjar"]', 200.00, 40.00, 45),
('Sétif', 'Sétif', '["Sétif", "El Eulma", "Ain Oulmene", "Bougaa"]', 200.00, 40.00, 50),
('Blida', 'Blida', '["Blida", "Boufarik", "El Affroun", "Beni Mered"]', 200.00, 40.00, 45),
('Tizi Ouzou', 'Tizi Ouzou', '["Tizi Ouzou", "Draa Ben Khedda", "Azazga", "Ouaguenoun"]', 250.00, 45.00, 55),
('Béjaïa', 'Béjaïa', '["Béjaïa", "Akbou", "El Kseur", "Tichy"]', 250.00, 45.00, 55)
ON CONFLICT DO NOTHING;

-- ============================================
-- END OF ENHANCED TRACKING
-- ============================================

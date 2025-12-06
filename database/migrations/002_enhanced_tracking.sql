-- ============================================
-- Enhanced Tracking System Migration
-- Last-Mile Delivery & Home Tracking
-- ============================================
-- This migration extends the Algérie Poste tracking
-- to support home delivery beyond bureau-to-bureau

CREATE DATABASE IF NOT EXISTS ap_ecommerce 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE ap_ecommerce;
-- ============================================
-- ADD COURIER TABLE FOR LAST-MILE DELIVERY
-- ============================================

CREATE TABLE couriers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  wilaya VARCHAR(100) NOT NULL,
  commune VARCHAR(100) NOT NULL,
  vehicle_type ENUM('bicycle', 'motorcycle', 'car', 'van') DEFAULT 'motorcycle',
  license_number VARCHAR(50),
  status ENUM('available', 'busy', 'offline', 'suspended') DEFAULT 'offline',
  current_latitude DECIMAL(10,7),
  current_longitude DECIMAL(10,7),
  last_location_update TIMESTAMP NULL,
  total_deliveries INT DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 5.0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_wilaya_status (wilaya, status),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ALTER SHIPMENTS TABLE FOR ENHANCED TRACKING
-- ============================================

-- Add new shipment status values
ALTER TABLE shipments 
  MODIFY COLUMN status ENUM(
    'pending', 
    'label_created', 
    'picked_up', 
    'in_transit', 
    'at_bureau',           -- NEW: Package at destination bureau (AP API limit)
    'out_for_delivery',    -- Courier assigned for home delivery
    'delivery_attempted',  -- NEW: Attempted but recipient not home
    'delivered', 
    'failed_delivery', 
    'returned'
  ) DEFAULT 'pending';

-- Add last-mile tracking columns
ALTER TABLE shipments
  ADD COLUMN last_mile_tracking VARCHAR(100) AFTER tracking_number,
  ADD COLUMN delivery_type ENUM('bureau_pickup', 'home_delivery', 'relay_point') DEFAULT 'home_delivery' AFTER status,
  ADD COLUMN courier_id INT NULL AFTER delivery_type,
  ADD COLUMN courier_name VARCHAR(100) AFTER courier_id,
  ADD COLUMN courier_phone VARCHAR(20) AFTER courier_name,
  ADD COLUMN current_latitude DECIMAL(10,7) AFTER courier_phone,
  ADD COLUMN current_longitude DECIMAL(10,7) AFTER current_latitude,
  ADD COLUMN last_location_update TIMESTAMP NULL AFTER current_longitude,
  ADD COLUMN destination_bureau VARCHAR(100) AFTER recipient_address,
  ADD COLUMN bureau_arrival_time TIMESTAMP NULL AFTER destination_bureau,
  ADD COLUMN recipient_name_confirmed VARCHAR(100) AFTER delivery_photo,
  ADD COLUMN delivery_attempts INT DEFAULT 0 AFTER recipient_name_confirmed,
  ADD COLUMN max_delivery_attempts INT DEFAULT 3 AFTER delivery_attempts,
  ADD COLUMN preferred_time_slot JSON AFTER max_delivery_attempts,
  ADD COLUMN delivery_otp VARCHAR(6) AFTER preferred_time_slot,
  ADD COLUMN otp_expires_at TIMESTAMP NULL AFTER delivery_otp;

-- Add indexes for courier and delivery type
ALTER TABLE shipments
  ADD INDEX idx_courier_id (courier_id),
  ADD INDEX idx_delivery_type_status (delivery_type, status),
  ADD INDEX idx_last_mile_tracking (last_mile_tracking);

-- Add foreign key for courier
ALTER TABLE shipments
  ADD CONSTRAINT fk_shipments_courier
  FOREIGN KEY (courier_id) REFERENCES couriers(id) ON DELETE SET NULL;

-- ============================================
-- ALTER TRACKING EVENTS FOR SOURCE TRACKING
-- ============================================

-- Add tracking source to differentiate AP API vs our tracking
ALTER TABLE tracking_events
  MODIFY COLUMN status ENUM(
    'pending', 
    'label_created', 
    'picked_up', 
    'in_transit', 
    'at_bureau',
    'out_for_delivery',
    'delivery_attempted',
    'delivered', 
    'failed_delivery', 
    'returned'
  ) NOT NULL;

ALTER TABLE tracking_events
  ADD COLUMN source ENUM('ap_api', 'courier_app', 'customer_app', 'system') DEFAULT 'system' AFTER status,
  ADD COLUMN latitude DECIMAL(10,7) AFTER wilaya,
  ADD COLUMN longitude DECIMAL(10,7) AFTER latitude,
  ADD COLUMN actor_id INT AFTER longitude,
  ADD COLUMN actor_type VARCHAR(50) AFTER actor_id;

ALTER TABLE tracking_events
  ADD INDEX idx_source (source);

-- ============================================
-- DELIVERY ZONES FOR COURIER ASSIGNMENT
-- ============================================

CREATE TABLE delivery_zones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  wilaya VARCHAR(100) NOT NULL,
  communes JSON, -- Array of communes covered
  base_fee DECIMAL(10,2) NOT NULL DEFAULT 200.00,
  per_km_fee DECIMAL(10,2) DEFAULT 50.00,
  estimated_time_minutes INT DEFAULT 60,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_wilaya (wilaya),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- COURIER ASSIGNMENTS (DISPATCH LOG)
-- ============================================

CREATE TABLE courier_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shipment_id INT NOT NULL,
  courier_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by INT NULL, -- Admin/dispatcher who assigned
  status ENUM('assigned', 'accepted', 'rejected', 'completed', 'cancelled') DEFAULT 'assigned',
  accepted_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  rejection_reason TEXT,
  notes TEXT,
  
  FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
  FOREIGN KEY (courier_id) REFERENCES couriers(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_courier_status (courier_id, status),
  INDEX idx_shipment (shipment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DELIVERY FEEDBACK/RATING
-- ============================================

CREATE TABLE delivery_ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shipment_id INT NOT NULL UNIQUE,
  courier_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
  FOREIGN KEY (courier_id) REFERENCES couriers(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_courier (courier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- UPDATE USER ADDRESSES WITH GPS COORDINATES
-- ============================================

ALTER TABLE user_addresses
  ADD COLUMN latitude DECIMAL(10,7) AFTER postal_code,
  ADD COLUMN longitude DECIMAL(10,7) AFTER latitude,
  ADD COLUMN delivery_instructions TEXT AFTER longitude;

-- ============================================
-- INSERT DEFAULT DELIVERY ZONES (58 WILAYAS)
-- ============================================

INSERT INTO delivery_zones (name, wilaya, communes, base_fee, per_km_fee, estimated_time_minutes) VALUES
('Alger Centre', 'Alger', '["Alger Centre", "Sidi M''Hamed", "Hussein Dey", "Kouba", "Bir Mourad Raïs"]', 200.00, 40.00, 45),
('Alger Est', 'Alger', '["Dar El Beïda", "Bab Ezzouar", "Bordj El Kiffan", "El Harrach", "Oued Smar"]', 250.00, 45.00, 60),
('Alger Ouest', 'Alger', '["Bab El Oued", "Casbah", "Bologhine", "Aïn Benian", "Staoueli"]', 250.00, 45.00, 60),
('Oran Centre', 'Oran', '["Oran", "Bir El Djir", "Es Senia", "Sidi Chahmi"]', 200.00, 40.00, 45),
('Constantine', 'Constantine', '["Constantine", "El Khroub", "Hamma Bouziane", "Didouche Mourad"]', 200.00, 40.00, 45),
('Annaba', 'Annaba', '["Annaba", "El Bouni", "Sidi Amar", "El Hadjar"]', 200.00, 40.00, 45),
('Blida', 'Blida', '["Blida", "Boufarik", "Ouled Yaïch", "Beni Mered"]', 200.00, 40.00, 45),
('Sétif', 'Sétif', '["Sétif", "El Eulma", "Aïn Arnat", "Aïn Oulmene"]', 200.00, 40.00, 45),
('Batna', 'Batna', '["Batna", "Barika", "Aïn Touta", "N''Gaous"]', 200.00, 40.00, 45),
('Tizi Ouzou', 'Tizi Ouzou', '["Tizi Ouzou", "Azazga", "Draa El Mizan", "Tigzirt"]', 200.00, 40.00, 45);

-- ============================================
-- TRIGGERS FOR COURIER RATING UPDATE
-- ============================================

DELIMITER //

CREATE TRIGGER update_courier_rating
AFTER INSERT ON delivery_ratings
FOR EACH ROW
BEGIN
  UPDATE couriers c
  SET c.rating = (
    SELECT AVG(rating) 
    FROM delivery_ratings 
    WHERE courier_id = NEW.courier_id
  ),
  c.total_deliveries = c.total_deliveries + 1
  WHERE c.id = NEW.courier_id;
END//

DELIMITER ;

-- ============================================
-- INDEX OPTIMIZATION
-- ============================================

-- Add composite index for common queries (pending home deliveries)
-- Note: MySQL doesn't support partial indexes, so we use a regular composite index
CREATE INDEX idx_shipments_pending_home ON shipments (status, delivery_type, courier_id);

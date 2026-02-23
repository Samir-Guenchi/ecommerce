-- Fix seller_registrations table to make ssid and business_id nullable
-- This allows sellers to upload documents without providing these fields

-- Make ssid nullable
ALTER TABLE seller_registrations 
ALTER COLUMN ssid DROP NOT NULL;

-- Make business_id nullable
ALTER TABLE seller_registrations 
ALTER COLUMN business_id DROP NOT NULL;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'seller_registrations' 
AND column_name IN ('ssid', 'business_id');

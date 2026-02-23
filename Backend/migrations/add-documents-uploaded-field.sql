-- Add documents_uploaded field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS documents_uploaded BOOLEAN DEFAULT FALSE;

-- Update existing users who have seller registrations with pending status
UPDATE users 
SET documents_uploaded = TRUE 
WHERE id IN (
  SELECT user_id 
  FROM seller_registrations 
  WHERE verification_status = 'pending'
);

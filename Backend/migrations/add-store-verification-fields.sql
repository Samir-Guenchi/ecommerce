-- Add carte_id and commercial_license columns to stores table
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS carte_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS commercial_license VARCHAR(255);

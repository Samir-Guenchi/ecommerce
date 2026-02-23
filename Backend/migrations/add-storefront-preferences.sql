-- Add storefront theme and language preferences to stores table
ALTER TABLE stores 
ADD COLUMN storefront_theme VARCHAR(50) DEFAULT 'auto',
ADD COLUMN storefront_language VARCHAR(10) DEFAULT 'auto';

-- Update existing stores to have default values
UPDATE stores 
SET storefront_theme = 'auto', storefront_language = 'auto' 
WHERE storefront_theme IS NULL OR storefront_language IS NULL;

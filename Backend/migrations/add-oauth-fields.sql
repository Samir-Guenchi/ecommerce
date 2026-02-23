-- Add OAuth provider fields to users table
-- Run this migration to add Google and Facebook ID columns

-- Check if columns exist before adding them
DO $$ 
BEGIN
    -- Add google_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'google_id'
    ) THEN
        ALTER TABLE users ADD COLUMN google_id VARCHAR(255) NULL;
        CREATE INDEX idx_users_google_id ON users(google_id);
        RAISE NOTICE 'Added google_id column and index';
    ELSE
        RAISE NOTICE 'google_id column already exists';
    END IF;

    -- Add facebook_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'facebook_id'
    ) THEN
        ALTER TABLE users ADD COLUMN facebook_id VARCHAR(255) NULL;
        CREATE INDEX idx_users_facebook_id ON users(facebook_id);
        RAISE NOTICE 'Added facebook_id column and index';
    ELSE
        RAISE NOTICE 'facebook_id column already exists';
    END IF;
END $$;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('google_id', 'facebook_id');

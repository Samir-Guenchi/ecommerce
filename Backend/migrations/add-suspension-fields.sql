-- Add suspension and deletion reason fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS suspended_by_id INTEGER,
ADD COLUMN IF NOT EXISTS deletion_reason TEXT,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS deleted_by_id INTEGER;

-- Add foreign key constraints
ALTER TABLE users 
ADD CONSTRAINT fk_users_suspended_by 
FOREIGN KEY (suspended_by_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE users 
ADD CONSTRAINT fk_users_deleted_by 
FOREIGN KEY (deleted_by_id) REFERENCES users(id) ON DELETE SET NULL;

-- Add index for suspended users
CREATE INDEX IF NOT EXISTS idx_users_suspended ON users(account_status) WHERE account_status = 'suspended';

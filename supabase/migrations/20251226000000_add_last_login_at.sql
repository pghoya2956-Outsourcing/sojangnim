-- Add last_login_at column to admin_users table
ALTER TABLE admin_users ADD COLUMN last_login_at TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN admin_users.last_login_at IS 'Timestamp of last successful login for session expiry check';

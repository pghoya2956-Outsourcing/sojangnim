-- Create admin_users table
CREATE TABLE admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster email lookup
CREATE INDEX idx_admin_users_email ON admin_users(email);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Authenticated users can read admin_users
CREATE POLICY "Authenticated users can read admin_users"
    ON admin_users FOR SELECT
    TO authenticated
    USING (true);

-- Insert first admin (change this email to your admin email)
INSERT INTO admin_users (email, role) VALUES
    ('admin@example.com', 'super_admin');

-- Add comment
COMMENT ON TABLE admin_users IS 'Stores admin user emails for authorization';

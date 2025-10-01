-- Create admin user function
-- Note: You'll need to create the actual user through Supabase Auth UI or API
-- This script is just for reference

-- After creating a user in Supabase Auth, you can optionally create an admin profile table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read their own profile
CREATE POLICY "Admins can read own profile"
  ON admin_users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Admins can update their own profile
CREATE POLICY "Admins can update own profile"
  ON admin_users
  FOR UPDATE
  USING (auth.uid() = id);

-- Insert admin user (replace with actual user ID after creating in Supabase Auth)
-- INSERT INTO admin_users (id, email, full_name)
-- VALUES ('your-user-id-here', 'admin@hongwei.com', 'Admin HongWei');

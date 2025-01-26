/*
  # Admin User and Roles Setup

  1. Tables
    - Create user_roles table if not exists
    - Add role constraints and unique index

  2. Security
    - Enable RLS
    - Add policies for role management
    - Create admin user management functions

  Note: Includes safety checks to prevent duplicate policy creation
*/

-- Create user roles table if not exists
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'staff')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and create new ones
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can read their own roles" ON user_roles;
  DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
  
  -- Create new policies
  CREATE POLICY "Users can read their own roles"
    ON user_roles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Admins can manage roles"
    ON user_roles
    FOR ALL
    TO authenticated
    USING (
      auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'admin'
      )
    );
END $$;
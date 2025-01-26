/*
  # Fix User Roles Policies

  1. Changes
    - Drop existing policies that cause infinite recursion
    - Create new policies with proper checks
    - Add helper function for admin check
  
  2. Security
    - Enable RLS
    - Add policies for reading and managing roles
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;

-- Drop existing admin check function if it exists
DROP FUNCTION IF EXISTS check_is_admin;

-- Create a new admin check function that doesn't use recursion
CREATE OR REPLACE FUNCTION check_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Create new policies
CREATE POLICY "Allow users to read their own roles"
ON user_roles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

CREATE POLICY "Allow admins to manage all roles"
ON user_roles
FOR ALL
TO authenticated
USING (
  check_is_admin()
);

-- Ensure RLS is enabled
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
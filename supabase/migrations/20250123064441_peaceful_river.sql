/*
  # Update Members Table Policies
  
  1. Changes
    - Drop existing policies
    - Create new comprehensive policies for full data access
    - Ensure all fields are accessible
  
  2. Security
    - Maintain RLS protection
    - Allow admins full access
    - Allow authenticated users to read all fields
*/

-- Drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admins can manage members" ON members;
  DROP POLICY IF EXISTS "Users can read members" ON members;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new comprehensive policies
CREATE POLICY "Admins can manage all member data"
  ON members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can read all member data"
  ON members
  FOR SELECT
  TO authenticated
  USING (true);

-- Add comments for documentation
COMMENT ON TABLE members IS 'Stores complete member information including personal details, membership status, and insurance data';
COMMENT ON COLUMN members.gender IS 'Member''s gender (male, female, other)';
COMMENT ON COLUMN members.birth_date IS 'Member''s date of birth';
COMMENT ON COLUMN members.address IS 'Member''s physical address';
COMMENT ON COLUMN members.company_name IS 'Company name for corporate memberships';
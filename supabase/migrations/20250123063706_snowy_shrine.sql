/*
  # Database Schema Update
  
  1. Tables
    - Create members table if not exists
    - Skip user_roles table (already exists)
    - Add indexes for performance
  
  2. Security
    - Enable RLS
    - Add policies for data access
    - Add validation constraints
*/

-- Create extension for text search if not exists
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create members table if not exists
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone_number text,
  membership_type text NOT NULL,
  has_insurance boolean DEFAULT false,
  subscription jsonb,
  registration_date timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'inactive',
  created_at timestamptz DEFAULT now(),
  profile_image text,
  gender text,
  birth_date date,
  address text,
  insurance_provider text,
  insurance_member_id text,
  company_name text,
  CONSTRAINT valid_membership_type CHECK (membership_type IN ('single', 'couple', 'corporate')),
  CONSTRAINT valid_gender CHECK (gender IN ('male', 'female', 'other')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive')),
  CONSTRAINT insurance_fields_check CHECK (
    (has_insurance = false) OR 
    (has_insurance = true AND insurance_provider IS NOT NULL AND insurance_member_id IS NOT NULL)
  ),
  CONSTRAINT corporate_fields_check CHECK (
    (membership_type != 'corporate') OR 
    (membership_type = 'corporate' AND company_name IS NOT NULL)
  )
);

-- Create indexes for better performance
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'members_full_name_idx') THEN
    CREATE INDEX members_full_name_idx ON members USING gin (full_name gin_trgm_ops);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'members_email_idx') THEN
    CREATE INDEX members_email_idx ON members USING btree (email);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'members_status_idx') THEN
    CREATE INDEX members_status_idx ON members(status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'members_membership_type_idx') THEN
    CREATE INDEX members_membership_type_idx ON members(membership_type);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'members_has_insurance_idx') THEN
    CREATE INDEX members_has_insurance_idx ON members(has_insurance);
  END IF;
END $$;

-- Enable RLS on members table
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Create or replace admin check function
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

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admins can manage members" ON members;
  DROP POLICY IF EXISTS "Users can read members" ON members;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create policies for members table
CREATE POLICY "Admins can manage members"
  ON members
  FOR ALL
  TO authenticated
  USING (check_is_admin());

CREATE POLICY "Users can read members"
  ON members
  FOR SELECT
  TO authenticated
  USING (true);

-- Add comments for documentation
COMMENT ON TABLE members IS 'Stores member information including personal details, membership, and insurance';
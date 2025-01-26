/*
  # Create members table and policies

  1. New Tables
    - members
      - Basic info: id, name, email, phone
      - Membership: type, insurance, subscription
      - Personal: gender, birth date, address
      - Insurance: provider, member ID
      - Corporate: company name
      - Profile: image URL
      - Metadata: registration date, status, created at

  2. Security
    - Enable RLS
    - Policies for admin management
    - Policies for user read access

  3. Performance
    - Index on full name for search
    - Index on email for lookups
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
  profile_image_url text,
  gender text,
  birth_date date,
  address text,
  insurance_provider text,
  insurance_member_id text,
  company_name text,
  CONSTRAINT valid_membership_type CHECK (membership_type IN ('single', 'couple', 'corporate')),
  CONSTRAINT valid_gender CHECK (gender IN ('male', 'female', 'other')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive'))
);

-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Admins can manage members" ON members;
    DROP POLICY IF EXISTS "Users can read members" ON members;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

-- Create policies
CREATE POLICY "Admins can manage members"
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

CREATE POLICY "Users can read members"
  ON members
  FOR SELECT
  TO authenticated
  USING (true);

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS members_full_name_idx;
DROP INDEX IF EXISTS members_email_idx;

-- Create indexes for better performance
CREATE INDEX members_full_name_idx ON members USING gin (full_name gin_trgm_ops);
CREATE INDEX members_email_idx ON members USING btree (email);
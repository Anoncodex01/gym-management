/*
  # Update members table schema

  1. Changes
    - Drop and recreate members table with correct schema
    - Recreate indexes and policies
    - Ensure all columns match the TypeScript types

  2. Security
    - Maintain RLS policies
    - Keep existing security constraints
*/

-- Drop existing table and its dependencies
DROP TABLE IF EXISTS members CASCADE;

-- Create extension for text search if not exists
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create members table with correct schema
CREATE TABLE members (
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

-- Create indexes for better performance
CREATE INDEX members_full_name_idx ON members USING gin (full_name gin_trgm_ops);
CREATE INDEX members_email_idx ON members USING btree (email);
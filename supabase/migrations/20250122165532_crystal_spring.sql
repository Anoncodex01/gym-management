/*
  # Members Table Setup

  1. New Tables
    - `members`
      - `id` (uuid, primary key)
      - `full_name` (text)
      - `email` (text, unique)
      - `phone_number` (text)
      - `membership_type` (text)
      - `has_insurance` (boolean)
      - `subscription` (jsonb)
      - `registration_date` (timestamptz)
      - `status` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `members` table
    - Add policies for authenticated users and admins
*/

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone_number text,
  membership_type text NOT NULL,
  has_insurance boolean DEFAULT false,
  subscription jsonb,
  registration_date timestamptz NOT NULL,
  status text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read members"
  ON members
  FOR SELECT
  TO authenticated
  USING (true);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = user_id 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies using the is_admin function
CREATE POLICY "Admins can insert members"
  ON members
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update members"
  ON members
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));
/*
  # Fix Members Table Schema

  1. Changes
    - Add missing columns if not present
    - Set proper data types and constraints
    - Add indexes for performance
  
  2. Validation
    - Check existing data
    - Add proper constraints
*/

-- First, let's check if all required columns exist and add them if missing
DO $$ 
BEGIN
  -- Add gender column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'members' AND column_name = 'gender') THEN
    ALTER TABLE members ADD COLUMN gender text;
  END IF;

  -- Add birth_date column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'members' AND column_name = 'birth_date') THEN
    ALTER TABLE members ADD COLUMN birth_date date;
  END IF;

  -- Add address column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'members' AND column_name = 'address') THEN
    ALTER TABLE members ADD COLUMN address text;
  END IF;

  -- Add insurance_provider column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'members' AND column_name = 'insurance_provider') THEN
    ALTER TABLE members ADD COLUMN insurance_provider text;
  END IF;

  -- Add insurance_member_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'members' AND column_name = 'insurance_member_id') THEN
    ALTER TABLE members ADD COLUMN insurance_member_id text;
  END IF;

  -- Add company_name column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'members' AND column_name = 'company_name') THEN
    ALTER TABLE members ADD COLUMN company_name text;
  END IF;
END $$;

-- Add or update constraints
DO $$ 
BEGIN
  -- Drop existing constraints if they exist
  ALTER TABLE members DROP CONSTRAINT IF EXISTS valid_membership_type;
  ALTER TABLE members DROP CONSTRAINT IF EXISTS valid_gender;
  ALTER TABLE members DROP CONSTRAINT IF EXISTS valid_status;

  -- Add constraints
  ALTER TABLE members ADD CONSTRAINT valid_membership_type 
    CHECK (membership_type IN ('single', 'couple', 'corporate'));
  
  ALTER TABLE members ADD CONSTRAINT valid_gender 
    CHECK (gender IS NULL OR gender IN ('male', 'female', 'other'));
  
  ALTER TABLE members ADD CONSTRAINT valid_status 
    CHECK (status IN ('active', 'inactive'));
END $$;

-- Add indexes for better query performance
DO $$ 
BEGIN
  -- Drop existing indexes if they exist
  DROP INDEX IF EXISTS idx_members_insurance;
  DROP INDEX IF EXISTS idx_members_membership_type;
  DROP INDEX IF EXISTS idx_members_status;

  -- Create new indexes
  CREATE INDEX IF NOT EXISTS idx_members_insurance ON members(has_insurance);
  CREATE INDEX IF NOT EXISTS idx_members_membership_type ON members(membership_type);
  CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
END $$;

-- Add comments for better documentation
COMMENT ON TABLE members IS 'Stores member information including personal details, membership, and insurance';
COMMENT ON COLUMN members.gender IS 'Member''s gender (male, female, other)';
COMMENT ON COLUMN members.birth_date IS 'Member''s date of birth';
COMMENT ON COLUMN members.address IS 'Member''s physical address';
COMMENT ON COLUMN members.insurance_provider IS 'Name of the insurance provider if member has insurance';
COMMENT ON COLUMN members.insurance_member_id IS 'Insurance member ID if member has insurance';
COMMENT ON COLUMN members.company_name IS 'Company name for corporate memberships';
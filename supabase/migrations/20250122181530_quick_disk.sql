/*
  # Fix Member Data and Constraints

  1. Changes
    - Update existing data to comply with constraints
    - Add constraints safely
    - Add triggers for created_at
    - Fix registration_date handling
*/

-- First update any NULL values or invalid data
UPDATE members 
SET 
  insurance_provider = NULL,
  insurance_member_id = NULL
WHERE has_insurance = false;

-- Add created_at trigger
CREATE OR REPLACE FUNCTION set_created_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = COALESCE(NEW.created_at, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS set_created_at_trigger ON members;

-- Create trigger
CREATE TRIGGER set_created_at_trigger
  BEFORE INSERT ON members
  FOR EACH ROW
  EXECUTE FUNCTION set_created_at();

-- Fix registration_date default and constraints
ALTER TABLE members 
  ALTER COLUMN registration_date SET DEFAULT now(),
  ALTER COLUMN registration_date SET NOT NULL;

-- Add validation for insurance-related fields with DO block to handle existing data
DO $$ 
BEGIN
  -- First ensure existing data complies with the constraint
  UPDATE members 
  SET has_insurance = false 
  WHERE has_insurance = true 
    AND (insurance_provider IS NULL OR insurance_member_id IS NULL);

  -- Then add the constraint
  ALTER TABLE members 
    DROP CONSTRAINT IF EXISTS insurance_provider_required;
    
  ALTER TABLE members 
    ADD CONSTRAINT insurance_provider_required 
    CHECK (
      (has_insurance = false) OR 
      (has_insurance = true AND insurance_provider IS NOT NULL AND insurance_member_id IS NOT NULL)
    );
END $$;

-- Add validation for corporate membership with DO block to handle existing data
DO $$ 
BEGIN
  -- First ensure existing data complies with the constraint
  UPDATE members 
  SET membership_type = 'single' 
  WHERE membership_type = 'corporate' 
    AND company_name IS NULL;

  -- Then add the constraint
  ALTER TABLE members 
    DROP CONSTRAINT IF EXISTS corporate_company_required;
    
  ALTER TABLE members 
    ADD CONSTRAINT corporate_company_required 
    CHECK (
      (membership_type != 'corporate') OR 
      (membership_type = 'corporate' AND company_name IS NOT NULL)
    );
END $$;
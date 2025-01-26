/*
  # Fix Member Creation System

  1. Changes
    - Remove existing constraints that are causing issues
    - Add new constraints with proper validation
    - Update column defaults and nullability
  
  2. Security
    - Maintain existing RLS policies
*/

-- First, drop existing constraints that are causing issues
ALTER TABLE members 
DROP CONSTRAINT IF EXISTS insurance_provider_required,
DROP CONSTRAINT IF EXISTS corporate_company_required;

-- Update column definitions to be more flexible
ALTER TABLE members
ALTER COLUMN insurance_provider DROP NOT NULL,
ALTER COLUMN insurance_member_id DROP NOT NULL,
ALTER COLUMN company_name DROP NOT NULL;

-- Add new constraints with proper validation
ALTER TABLE members
ADD CONSTRAINT insurance_fields_check
  CHECK (
    (has_insurance = false) OR
    (has_insurance = true AND insurance_provider IS NOT NULL AND insurance_member_id IS NOT NULL)
  ),
ADD CONSTRAINT corporate_fields_check
  CHECK (
    (membership_type != 'corporate') OR
    (membership_type = 'corporate' AND company_name IS NOT NULL)
  );

-- Add trigger for validation
CREATE OR REPLACE FUNCTION validate_member_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate insurance fields
  IF NEW.has_insurance = true AND (NEW.insurance_provider IS NULL OR NEW.insurance_member_id IS NULL) THEN
    RAISE EXCEPTION 'Insurance provider and member ID are required when has_insurance is true';
  END IF;

  -- Validate corporate membership
  IF NEW.membership_type = 'corporate' AND NEW.company_name IS NULL THEN
    RAISE EXCEPTION 'Company name is required for corporate membership';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS validate_member_fields_trigger ON members;
CREATE TRIGGER validate_member_fields_trigger
  BEFORE INSERT OR UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION validate_member_fields();
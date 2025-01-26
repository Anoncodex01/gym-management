-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'members'
ORDER BY ordinal_position;

-- Check sample data
SELECT 
  id,
  full_name,
  email,
  phone_number,
  membership_type,
  has_insurance,
  gender,
  birth_date,
  address,
  insurance_provider,
  insurance_member_id,
  company_name,
  profile_image,
  subscription,
  status,
  registration_date
FROM members
ORDER BY created_at DESC
LIMIT 5;

-- Check for null values
SELECT 
  COUNT(*) as total_members,
  COUNT(gender) as gender_count,
  COUNT(birth_date) as birth_date_count,
  COUNT(address) as address_count,
  COUNT(insurance_provider) as insurance_provider_count,
  COUNT(insurance_member_id) as insurance_member_id_count,
  COUNT(company_name) as company_name_count,
  COUNT(profile_image) as profile_image_count
FROM members;
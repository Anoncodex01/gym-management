/*
  # Add Initial Instructors

  1. New Data
    - Add three initial instructors:
      - Alvin
      - Salvatory
      - Sayuni

  2. Changes
    - Insert instructor records into class_instructors table
*/

-- Insert initial instructors
INSERT INTO class_instructors (full_name, email, phone_number, specialties, status)
VALUES
  (
    'Alvin',
    'alvin@gym.com',
    '+255123456789',
    ARRAY['yoga', 'pilates', 'strength'],
    'active'
  ),
  (
    'Salvatory',
    'salvatory@gym.com',
    '+255123456790',
    ARRAY['hiit', 'cardio', 'strength'],
    'active'
  ),
  (
    'Sayuni',
    'sayuni@gym.com',
    '+255123456791',
    ARRAY['zumba', 'cardio', 'yoga'],
    'active'
  )
ON CONFLICT (email) DO UPDATE
SET
  full_name = EXCLUDED.full_name,
  phone_number = EXCLUDED.phone_number,
  specialties = EXCLUDED.specialties,
  status = EXCLUDED.status;
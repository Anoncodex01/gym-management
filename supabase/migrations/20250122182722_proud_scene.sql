/*
  # Fix Member Attendance System

  1. Changes
    - Add missing indexes for member attendance queries
    - Add trigger for updated_at timestamp
    - Add function to validate check-in/out times
    - Add constraint for check-out time validation
  
  2. Security
    - Update RLS policies for better access control
*/

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_member_attendance_updated_at ON member_attendance;
CREATE TRIGGER update_member_attendance_updated_at
    BEFORE UPDATE ON member_attendance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add index for active check-ins
CREATE INDEX IF NOT EXISTS idx_member_attendance_active_checkin 
ON member_attendance(member_id) 
WHERE check_out_time IS NULL;

-- Add function to validate check-in/out times
CREATE OR REPLACE FUNCTION validate_check_times()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.check_out_time IS NOT NULL AND NEW.check_out_time <= NEW.check_in_time THEN
        RAISE EXCEPTION 'Check-out time must be after check-in time';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for time validation
DROP TRIGGER IF EXISTS validate_check_times_trigger ON member_attendance;
CREATE TRIGGER validate_check_times_trigger
    BEFORE INSERT OR UPDATE ON member_attendance
    FOR EACH ROW
    EXECUTE FUNCTION validate_check_times();

-- Update RLS policies
DROP POLICY IF EXISTS "Members can view their own attendance" ON member_attendance;
DROP POLICY IF EXISTS "Admins can manage attendance" ON member_attendance;

CREATE POLICY "Members can view their own attendance"
ON member_attendance FOR SELECT
TO authenticated
USING (
    member_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = auth.uid()
        AND role = 'admin'
    )
);

CREATE POLICY "Admins can manage attendance"
ON member_attendance FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = auth.uid()
        AND role = 'admin'
    )
);
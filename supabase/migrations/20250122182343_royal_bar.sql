/*
  # Member Sign-in System

  1. New Tables
    - `member_attendance`
      - Tracks member check-ins and check-outs
      - Records attendance type (gym, class)
      - Stores duration and timestamps
    - `attendance_settings`
      - Stores gym operating hours
      - Configures attendance rules

  2. Changes
    - Adds attendance tracking functionality
    - Links with existing members table
    - Enables reporting capabilities
*/

-- Create attendance_settings table
CREATE TABLE attendance_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opening_time time NOT NULL DEFAULT '06:00',
  closing_time time NOT NULL DEFAULT '22:00',
  max_daily_visits integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create member_attendance table
CREATE TABLE member_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id) NOT NULL,
  check_in_time timestamptz NOT NULL DEFAULT now(),
  check_out_time timestamptz,
  attendance_type text NOT NULL CHECK (attendance_type IN ('gym', 'class')),
  duration interval,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX idx_member_attendance_member_id ON member_attendance(member_id);
CREATE INDEX idx_member_attendance_check_in_time ON member_attendance(check_in_time);
CREATE INDEX idx_member_attendance_attendance_type ON member_attendance(attendance_type);

-- Enable RLS
ALTER TABLE member_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for member_attendance
CREATE POLICY "Members can view their own attendance"
  ON member_attendance
  FOR SELECT
  TO authenticated
  USING (
    member_id IN (
      SELECT id FROM members WHERE id = auth.uid()
    ) OR 
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage attendance"
  ON member_attendance
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create policies for attendance_settings
CREATE POLICY "Anyone can view settings"
  ON attendance_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON attendance_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Function to calculate duration on check-out
CREATE OR REPLACE FUNCTION calculate_attendance_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.check_out_time IS NOT NULL AND OLD.check_out_time IS NULL THEN
    NEW.duration = NEW.check_out_time - NEW.check_in_time;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for duration calculation
CREATE TRIGGER set_attendance_duration
  BEFORE UPDATE ON member_attendance
  FOR EACH ROW
  EXECUTE FUNCTION calculate_attendance_duration();

-- Insert default attendance settings
INSERT INTO attendance_settings (opening_time, closing_time, max_daily_visits)
VALUES ('06:00', '22:00', 1)
ON CONFLICT DO NOTHING;
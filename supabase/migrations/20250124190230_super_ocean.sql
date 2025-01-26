/*
  # Class and Schedule Management Schema

  1. New Tables
    - `class_templates`
      - Base class definitions with details like name, instructor, duration
    - `class_schedules`
      - Scheduled instances of classes with specific dates/times
    - `class_availability`
      - Days of the week when classes are available
    - `class_instructors`
      - Instructor information for classes

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
*/

-- Create class_instructors table
CREATE TABLE class_instructors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE,
  phone_number text,
  specialties text[],
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create class_templates table
CREATE TABLE class_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  instructor_id uuid REFERENCES class_instructors(id),
  duration integer NOT NULL CHECK (duration > 0), -- in minutes
  capacity integer NOT NULL CHECK (capacity > 0),
  room text NOT NULL,
  class_type text NOT NULL CHECK (class_type IN ('yoga', 'hiit', 'strength', 'cardio', 'pilates', 'zumba')),
  price decimal NOT NULL CHECK (price >= 0),
  insurance_accepted boolean DEFAULT false,
  insurance_providers text[],
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create class_availability table
CREATE TABLE class_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_template_id uuid REFERENCES class_templates(id) ON DELETE CASCADE,
  day_of_week text NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  start_time time NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(class_template_id, day_of_week, start_time)
);

-- Create class_schedules table
CREATE TABLE class_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_template_id uuid REFERENCES class_templates(id) ON DELETE CASCADE,
  scheduled_date date NOT NULL,
  start_time time NOT NULL,
  instructor_id uuid REFERENCES class_instructors(id),
  room text NOT NULL,
  capacity integer NOT NULL CHECK (capacity > 0),
  current_enrollment integer DEFAULT 0 CHECK (current_enrollment >= 0),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'completed')),
  cancellation_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(class_template_id, scheduled_date, start_time)
);

-- Create class_enrollments table
CREATE TABLE class_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_schedule_id uuid REFERENCES class_schedules(id) ON DELETE CASCADE,
  member_id uuid REFERENCES members(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'cancelled', 'attended', 'no_show')),
  insurance_used boolean DEFAULT false,
  check_in_time timestamptz,
  check_out_time timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(class_schedule_id, member_id)
);

-- Add indexes for better query performance
CREATE INDEX idx_class_templates_status ON class_templates(status);
CREATE INDEX idx_class_schedules_date ON class_schedules(scheduled_date);
CREATE INDEX idx_class_schedules_status ON class_schedules(status);
CREATE INDEX idx_class_enrollments_member ON class_enrollments(member_id);
CREATE INDEX idx_class_enrollments_status ON class_enrollments(status);

-- Enable RLS
ALTER TABLE class_instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage class instructors"
  ON class_instructors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can view class instructors"
  ON class_instructors
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage class templates"
  ON class_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can view active class templates"
  ON class_templates
  FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Admins can manage class availability"
  ON class_availability
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can view class availability"
  ON class_availability
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage class schedules"
  ON class_schedules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can view scheduled classes"
  ON class_schedules
  FOR SELECT
  TO authenticated
  USING (status != 'cancelled');

CREATE POLICY "Members can view their own enrollments"
  ON class_enrollments
  FOR SELECT
  TO authenticated
  USING (
    member_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage enrollments"
  ON class_enrollments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create function to update enrollment count
CREATE OR REPLACE FUNCTION update_class_enrollment()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'enrolled' THEN
    UPDATE class_schedules
    SET current_enrollment = current_enrollment + 1
    WHERE id = NEW.class_schedule_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'enrolled' AND NEW.status = 'cancelled' THEN
    UPDATE class_schedules
    SET current_enrollment = current_enrollment - 1
    WHERE id = NEW.class_schedule_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for enrollment count
CREATE TRIGGER update_class_enrollment_trigger
  AFTER INSERT OR UPDATE ON class_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_class_enrollment();

-- Create function to validate enrollment
CREATE OR REPLACE FUNCTION validate_class_enrollment()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if class is full
  IF EXISTS (
    SELECT 1 FROM class_schedules
    WHERE id = NEW.class_schedule_id
    AND current_enrollment >= capacity
  ) THEN
    RAISE EXCEPTION 'Class is full';
  END IF;

  -- Check if member is already enrolled
  IF EXISTS (
    SELECT 1 FROM class_enrollments
    WHERE class_schedule_id = NEW.class_schedule_id
    AND member_id = NEW.member_id
    AND status = 'enrolled'
  ) THEN
    RAISE EXCEPTION 'Member is already enrolled in this class';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for enrollment validation
CREATE TRIGGER validate_class_enrollment_trigger
  BEFORE INSERT ON class_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION validate_class_enrollment();

-- Add comments for documentation
COMMENT ON TABLE class_templates IS 'Stores base class definitions with details like name, instructor, duration';
COMMENT ON TABLE class_schedules IS 'Stores scheduled instances of classes with specific dates/times';
COMMENT ON TABLE class_availability IS 'Stores the days of the week when classes are available';
COMMENT ON TABLE class_enrollments IS 'Stores member enrollments in scheduled classes';
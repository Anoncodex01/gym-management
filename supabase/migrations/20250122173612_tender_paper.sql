-- Rename profile_image_url column to profile_image
ALTER TABLE members RENAME COLUMN profile_image_url TO profile_image;

-- Add comment to explain the column
COMMENT ON COLUMN members.profile_image IS 'URL or path to the member''s profile image';

-- Update existing policies to reflect the new column name
DO $$ 
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Admins can manage members" ON members;
    DROP POLICY IF EXISTS "Users can read members" ON members;

    -- Recreate policies
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
END $$;
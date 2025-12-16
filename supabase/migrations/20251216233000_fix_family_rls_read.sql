-- Fix RLS policy to allow family API to read family data through family_members relationship
-- Drop existing policies
DROP POLICY IF EXISTS "Allow family creation for authenticated users" ON families;
DROP POLICY IF EXISTS "No direct read access to families" ON families;
DROP POLICY IF EXISTS "No direct update access to families" ON families;
DROP POLICY IF EXISTS "No direct delete access to families" ON families;

-- Allow authenticated users to create families (for onboarding)
CREATE POLICY "Allow family creation for authenticated users" ON families
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to read families they are members of
CREATE POLICY "Allow users to read their families" ON families
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE family_members.family_id = families.id 
      AND family_members.user_id = auth.uid()
    )
  );

-- Prevent direct update access
CREATE POLICY "No direct update access to families" ON families
  FOR UPDATE USING (false);

-- Prevent direct delete access
CREATE POLICY "No direct delete access to families" ON families
  FOR DELETE USING (false);

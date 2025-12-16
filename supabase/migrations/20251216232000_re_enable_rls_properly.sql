-- Re-enable RLS for families table with proper policies that work with Server Actions
ALTER TABLE families ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow family creation for authenticated users" ON families;
DROP POLICY IF EXISTS "No direct read access to families" ON families;
DROP POLICY IF EXISTS "No direct update access to families" ON families;
DROP POLICY IF EXISTS "No direct delete access to families" ON families;

-- Create proper RLS policies for families table
-- Allow authenticated users to create families (for onboarding)
CREATE POLICY "Allow family creation for authenticated users" ON families
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Prevent direct read access - families should only be accessed through family_members
CREATE POLICY "No direct read access to families" ON families
  FOR SELECT USING (false);

-- Prevent direct update access
CREATE POLICY "No direct update access to families" ON families
  FOR UPDATE USING (false);

-- Prevent direct delete access
CREATE POLICY "No direct delete access to families" ON families
  FOR DELETE USING (false);

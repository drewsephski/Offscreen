-- Update families RLS policy to allow authenticated users to create families during onboarding
DROP POLICY IF EXISTS "No direct access to families" ON families;

-- Allow authenticated users to create families (for onboarding)
CREATE POLICY "Allow family creation for authenticated users" ON families
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Still no direct select/update/delete access - only through proper channels
CREATE POLICY "No direct read access to families" ON families
  FOR SELECT USING (false);

CREATE POLICY "No direct update access to families" ON families
  FOR UPDATE USING (false);

CREATE POLICY "No direct delete access to families" ON families
  FOR DELETE USING (false);
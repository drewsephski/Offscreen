-- Fix coaching_sessions RLS policy to allow parents to create sessions for their children
-- Created: 2025-12-16 23:40:00

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Insert coaching sessions" ON coaching_sessions;

-- Create new policy that allows parents to create sessions for their children
CREATE POLICY "Insert coaching sessions" ON coaching_sessions
  FOR INSERT WITH CHECK (
    -- Allow parents to create sessions for their children
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE family_members.family_id = coaching_sessions.family_id 
      AND family_members.user_id = auth.uid() 
      AND family_members.role = 'parent'
    )
    OR
    -- Allow children to create their own sessions (if needed)
    (auth.uid() = child_id AND
     EXISTS (
       SELECT 1 FROM family_members 
       WHERE family_members.family_id = coaching_sessions.family_id 
       AND family_members.user_id = auth.uid() 
       AND family_members.role = 'child'
     ))
  );

-- Add missing UPDATE RLS policy for coaching_sessions
-- This policy allows session participants (parents and children) to update session status
-- Created: 2025-12-16 to fix session ending errors

CREATE POLICY "Parents can update family sessions" ON coaching_sessions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE family_members.family_id = coaching_sessions.family_id 
      AND family_members.user_id = auth.uid() 
      AND family_members.role = 'parent'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE family_members.family_id = coaching_sessions.family_id 
      AND family_members.user_id = auth.uid() 
      AND family_members.role = 'parent'
    )
  );

CREATE POLICY "Children can update own sessions" ON coaching_sessions
  FOR UPDATE USING (auth.uid() = child_id)
  WITH CHECK (auth.uid() = child_id);

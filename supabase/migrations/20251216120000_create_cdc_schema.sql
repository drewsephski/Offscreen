-- Migration: Create Child Development Coach (CDC) Schema
-- Created: 2025-12-16 12:00:00
-- Core Design Principles: Parents sovereign, Children never see analytics, Sessions ephemeral, Patterns ≠ diagnoses

-- 1. Family Types
CREATE TYPE family_role AS ENUM ('parent', 'child');
CREATE TYPE session_status AS ENUM ('active', 'completed', 'abandoned');
CREATE TYPE pattern_type AS ENUM (
  'avoidance_loop',
  'impulsivity_overrun', 
  'perfection_paralysis'
);

-- 2. Families (Tenancy Root)
CREATE TABLE families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Family Members (Role Enforcement)
CREATE TABLE family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role family_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (family_id, user_id)
);

-- 4. Child Profiles (Minimal, Non-Diagnostic)
CREATE TABLE child_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  age_range text CHECK (age_range IN ('6-8', '9-11', '12-14', '15-17')),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (family_id, user_id)
);

-- 5. Coaching Sessions (Ephemeral Interaction)
CREATE TABLE coaching_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  status session_status DEFAULT 'active',
  started_at timestamp with time zone DEFAULT now(),
  ended_at timestamp with time zone,
  summary text
);

-- 6. Pattern Taxonomy (Static, Controlled)
CREATE TABLE pattern_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES coaching_sessions(id) ON DELETE CASCADE,
  pattern pattern_type NOT NULL,
  confidence smallint CHECK (confidence BETWEEN 1 AND 5),
  created_at timestamp with time zone DEFAULT now()
);

-- 7. Offline Action Commitments (Outcome Engine)
CREATE TABLE offline_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES coaching_sessions(id) ON DELETE CASCADE,
  action_text text NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamp with time zone
);

-- 8. Parent Controls (Hard Power)
CREATE TABLE parent_controls (
  family_id uuid PRIMARY KEY REFERENCES families(id) ON DELETE CASCADE,
  ai_enabled boolean DEFAULT true,
  daily_session_limit integer DEFAULT 1,
  notes text,
  updated_at timestamp with time zone DEFAULT now()
);

-- 9. Audit & Safety Events (Non-Optional)
CREATE TABLE safety_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES families(id),
  event_type text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Families: Only accessible through family_members
CREATE POLICY "No direct access to families" ON families
  FOR ALL USING (false);

-- Family Members: Users can see their own family memberships
CREATE POLICY "View own family memberships" ON family_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Insert family memberships" ON family_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Child Profiles: Parents can view all children in family, children only their own
CREATE POLICY "Parents view all family children" ON child_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE family_members.family_id = child_profiles.family_id 
      AND family_members.user_id = auth.uid() 
      AND family_members.role = 'parent'
    )
  );

CREATE POLICY "Children view own profile" ON child_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Insert child profiles" ON child_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE family_members.family_id = child_profiles.family_id 
      AND family_members.user_id = auth.uid() 
      AND family_members.role = 'parent'
    )
  );

-- Coaching Sessions: Parents see all family sessions, children only their own active sessions
CREATE POLICY "Parents view all family sessions" ON coaching_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE family_members.family_id = coaching_sessions.family_id 
      AND family_members.user_id = auth.uid() 
      AND family_members.role = 'parent'
    )
  );

CREATE POLICY "Children view own sessions" ON coaching_sessions
  FOR SELECT USING (auth.uid() = child_id);

CREATE POLICY "Insert coaching sessions" ON coaching_sessions
  FOR INSERT WITH CHECK (
    auth.uid() = child_id AND
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE family_members.family_id = coaching_sessions.family_id 
      AND family_members.user_id = auth.uid() 
      AND family_members.role = 'child'
    )
  );

-- Pattern Events: Parents only (aggregated trends), children never see
CREATE POLICY "Parents view pattern events" ON pattern_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE family_members.family_id = pattern_events.family_id 
      AND family_members.user_id = auth.uid() 
      AND family_members.role = 'parent'
    )
  );

CREATE POLICY "Insert pattern events" ON pattern_events
  FOR INSERT WITH CHECK (true); -- System-inserted only

-- Offline Actions: Parents view all family actions, children view their own
CREATE POLICY "Parents view all family actions" ON offline_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM coaching_sessions
      JOIN family_members ON coaching_sessions.family_id = family_members.family_id
      WHERE coaching_sessions.id = offline_actions.session_id
      AND family_members.user_id = auth.uid() 
      AND family_members.role = 'parent'
    )
  );

CREATE POLICY "Children view own session actions" ON offline_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM coaching_sessions
      WHERE coaching_sessions.id = offline_actions.session_id
      AND coaching_sessions.child_id = auth.uid()
    )
  );

CREATE POLICY "Insert offline actions" ON offline_actions
  FOR INSERT WITH CHECK (true); -- System-inserted only

-- Parent Controls: Parents only
CREATE POLICY "Parents manage controls" ON parent_controls
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE family_members.family_id = parent_controls.family_id 
      AND family_members.user_id = auth.uid() 
      AND family_members.role = 'parent'
    )
  );

-- Safety Events: Parents only
CREATE POLICY "Parents view safety events" ON safety_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE family_members.family_id = safety_events.family_id 
      AND family_members.user_id = auth.uid() 
      AND family_members.role = 'parent'
    )
  );

CREATE POLICY "Insert safety events" ON safety_events
  FOR INSERT WITH CHECK (true); -- System-inserted only

-- Performance Indexes
CREATE INDEX idx_family_members_family_user ON family_members(family_id, user_id);
CREATE INDEX idx_family_members_user_role ON family_members(user_id, role);
CREATE INDEX idx_child_profiles_family ON child_profiles(family_id);
CREATE INDEX idx_child_profiles_user ON child_profiles(user_id);
CREATE INDEX idx_coaching_sessions_family ON coaching_sessions(family_id);
CREATE INDEX idx_coaching_sessions_child ON coaching_sessions(child_id);
CREATE INDEX idx_coaching_sessions_status ON coaching_sessions(status);
CREATE INDEX idx_pattern_events_family ON pattern_events(family_id);
CREATE INDEX idx_pattern_events_session ON pattern_events(session_id);
CREATE INDEX idx_offline_actions_session ON offline_actions(session_id);
CREATE INDEX idx_safety_events_family ON safety_events(family_id);

-- Insert default parent_controls for new families
CREATE OR REPLACE FUNCTION create_parent_controls_for_family()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO parent_controls (family_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_parent_controls_trigger
  AFTER INSERT ON families
  FOR EACH ROW EXECUTE FUNCTION create_parent_controls_for_family();

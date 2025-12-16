-- Add family invitations table for email-based child invites
CREATE TABLE IF NOT EXISTS family_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  role family_role NOT NULL DEFAULT 'child',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, expired, cancelled
  invitation_token TEXT UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,

  UNIQUE(family_id, invitee_email, role)
);

-- Enable RLS
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;

-- Policies for family_invitations
CREATE POLICY "Family members can view invitations for their family"
ON family_invitations FOR SELECT
USING (
  family_id IN (
    SELECT family_id FROM family_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Family members can create invitations for their family"
ON family_invitations FOR INSERT
WITH CHECK (
  family_id IN (
    SELECT family_id FROM family_members
    WHERE user_id = auth.uid() AND role = 'parent'
  ) AND
  inviter_id = auth.uid()
);

CREATE POLICY "Users can update invitations they sent"
ON family_invitations FOR UPDATE
USING (inviter_id = auth.uid());

-- Function to generate secure invitation tokens
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate token on insert
CREATE OR REPLACE FUNCTION set_invitation_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invitation_token IS NULL THEN
    NEW.invitation_token := generate_invitation_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invitation_token_trigger
  BEFORE INSERT ON family_invitations
  FOR EACH ROW EXECUTE FUNCTION set_invitation_token();
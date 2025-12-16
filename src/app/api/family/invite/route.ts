import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/supabase-clients/server';
import { z } from 'zod';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['child', 'parent']).default('child'),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const body = await request.json();

    const { email, role } = inviteSchema.parse(body);

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's family
    const { data: member } = await supabase
      .from('family_members')
      .select('family_id, role')
      .eq('user_id', user.id)
      .single();

    if (!member || member.role !== 'parent') {
      return NextResponse.json(
        { error: 'Only parents can send invitations' },
        { status: 403 }
      );
    }

    // Check if invitation already exists
    const { data: existingInvite } = await supabase
      .from('family_invitations')
      .select('id')
      .eq('family_id', member.family_id)
      .eq('invitee_email', email)
      .eq('status', 'pending')
      .single();

    if (existingInvite) {
      return NextResponse.json(
        { error: 'Invitation already sent to this email' },
        { status: 400 }
      );
    }

    // Create invitation
    const { data: invitation, error } = await supabase
      .from('family_invitations')
      .insert({
        family_id: member.family_id,
        inviter_id: user.id,
        invitee_email: email,
        role: role,
      })
      .select()
      .single();

    if (error) {
      console.error('Invitation creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      );
    }

    // TODO: Send email invitation
    // For now, just return the invitation details
    // In production, integrate with email service like Resend, SendGrid, etc.

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.invitee_email,
        token: invitation.invitation_token,
        expiresAt: invitation.expires_at,
      },
    });
  } catch (error) {
    console.error('Invitation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

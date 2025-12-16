import { createSupabaseClient } from '@/supabase-clients/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const endSessionSchema = z.object({
  sessionId: z.string().uuid(),
  summary: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, summary } = endSessionSchema.parse(body);

    const supabase = await createSupabaseClient();

    // Get session to verify permissions
    const { data: session, error: sessionError } = await supabase
      .from('coaching_sessions')
      .select('id, family_id, child_id, status')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is the child in this session or parent in the family
    const { data: memberCheck } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', session.family_id)
      .eq('user_id', user.id)
      .single();

    // Also check if user is the child by looking up child profile
    const { data: childProfile } = await supabase
      .from('child_profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('family_id', session.family_id)
      .single();

    const isParent = memberCheck?.role === 'parent';
    const isChild = childProfile?.id === session.child_id;

    if (!isParent && !isChild) {
      return NextResponse.json(
        { error: 'Unauthorized: Only session participants can end session' },
        { status: 403 }
      );
    }

    // End the session
    const { data: updatedSession, error: updateError } = await supabase
      .from('coaching_sessions')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        summary: summary || 'Session completed'
      })
      .eq('id', sessionId)
      .eq('status', 'active')
      .select('id, status, ended_at, summary')
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to end session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      session: updatedSession
    });

  } catch (error) {
    console.error('End session error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage || 'Internal server error' },
      { status: 500 }
    );
  }
}

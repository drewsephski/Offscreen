import { createSupabaseClient } from '@/supabase-clients/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const completeActionSchema = z.object({
  actionId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { actionId } = completeActionSchema.parse(body);
    
    const supabase = await createSupabaseClient();
    
    // Get the action with session info to verify permissions
    const { data: action, error: actionError } = await supabase
      .from('offline_actions')
      .select(`
        id,
        session_id,
        action_text,
        completed,
        coaching_sessions!inner(
          family_id,
          child_id,
          status
        )
      `)
      .eq('id', actionId)
      .single();
    
    if (actionError || !action) {
      return NextResponse.json(
        { error: 'Action not found' },
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
    
    // Check if user is parent in the family or the child who owns the session
    const { data: memberCheck } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', action.coaching_sessions.family_id)
      .eq('user_id', user.id)
      .single();
    
    const isParent = memberCheck?.role === 'parent';
    const isChild = user.id === action.coaching_sessions.child_id;
    
    if (!isParent && !isChild) {
      return NextResponse.json(
        { error: 'Unauthorized: Only family members can complete actions' },
        { status: 403 }
      );
    }
    
    // Mark action as completed
    const { data: updatedAction, error: updateError } = await supabase
      .from('offline_actions')
      .update({
        completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('id', actionId)
      .select('id, action_text, completed, completed_at')
      .single();
    
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to mark action as completed' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      action: updatedAction
    });
    
  } catch (error) {
    console.error('Complete action error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get offline actions for a session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }
    
    const supabase = await createSupabaseClient();
    
    // Get session with family info
    const { data: session, error: sessionError } = await supabase
      .from('coaching_sessions')
      .select('family_id, child_id, status')
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
    
    // Check if user is parent in the family or the child who owns the session
    const { data: memberCheck } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', session.family_id)
      .eq('user_id', user.id)
      .single();
    
    const isParent = memberCheck?.role === 'parent';
    const isChild = user.id === session.child_id;
    
    if (!isParent && !isChild) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Get offline actions for the session
    const { data: actions, error: actionsError } = await supabase
      .from('offline_actions')
      .select('id, action_text, completed, completed_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });
    
    if (actionsError) {
      return NextResponse.json(
        { error: 'Failed to fetch actions' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      actions,
      sessionInfo: {
        isParent,
        isChild
      }
    });
    
  } catch (error) {
    console.error('Get actions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

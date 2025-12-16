import { analyzeChildReflection } from '@/lib/ai-coaching';
import { createSupabaseClient } from '@/supabase-clients/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const reflectSchema = z.object({
  sessionId: z.string().uuid(),
  childResponse: z.string().min(1, 'Response is required'),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const body = await request.json();

    const { sessionId, childResponse } = reflectSchema.parse(body);

    // Verify user is child and session belongs to them
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check session exists and is active
    const { data: session } = await supabase
      .from('coaching_sessions')
      .select('family_id, child_id, status')
      .eq('id', sessionId)
      .single();

    if (!session || session.status !== 'active') {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    }

    // Verify user has access to this session (either parent or the child)
    const { data: userRole } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', session.family_id)
      .eq('user_id', user.id)
      .single();

    const isParent = userRole?.role === 'parent';
    const isChild = session.child_id === user.id;

    if (!isParent && !isChild) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get child profile for age context
    const { data: childProfile } = await supabase
      .from('child_profiles')
      .select('age_range')
      .eq('id', session.child_id)
      .single();

    // Get recent patterns for context
    const { data: recentPatterns } = await supabase
      .from('pattern_events')
      .select('pattern')
      .eq('child_id', session.child_id)
      .order('created_at', { ascending: false })
      .limit(5);

    const previousPatterns =
      recentPatterns?.map((p: { pattern: string }) => p.pattern).filter(Boolean) || [];

    // Use AI analysis
    const analysis = await analyzeChildReflection(
      childResponse,
      childProfile?.age_range || undefined,
      previousPatterns
    );

    // Insert pattern event
    const { error: patternError } = await supabase
      .from('pattern_events')
      .insert({
        session_id: sessionId,
        family_id: session.family_id,
        child_id: session.child_id,
        pattern: analysis.detectedPattern || 'avoidance_loop',
        confidence: Math.round(analysis.patternConfidence * 5) || 1, // Convert 0-1 to 1-5 scale
        created_at: new Date().toISOString(),
      });

    if (patternError) {
      console.error('Pattern insert error:', patternError);
      // Don't fail the request for pattern errors
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Reflection error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

import { createSupabaseClient } from '@/supabase-clients/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get('familyId');
    const childId = searchParams.get('childId');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!familyId) {
      return NextResponse.json(
        { error: 'Family ID required' },
        { status: 400 }
      );
    }
    
    const supabase = await createSupabaseClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify user is a parent in this family
    const { data: memberCheck } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', familyId)
      .eq('user_id', user.id)
      .single();
    
    if (!memberCheck || memberCheck.role !== 'parent') {
      return NextResponse.json(
        { error: 'Unauthorized: Only parents can view summaries' },
        { status: 403 }
      );
    }
    
    // Build query
    let query = supabase
      .from('coaching_sessions')
      .select(`
        id,
        child_id,
        status,
        started_at,
        ended_at,
        summary,
        child_profiles!inner(display_name, age_range),
        offline_actions(
          id,
          action_text,
          completed,
          completed_at
        ),
        pattern_events(
          id,
          pattern,
          confidence,
          created_at
        )
      `)
      .eq('family_id', familyId)
      .order('started_at', { ascending: false })
      .limit(limit);
    
    if (childId) {
      query = query.eq('child_id', childId);
    }
    
    const { data: sessions, error: sessionsError } = await query;
    
    if (sessionsError) {
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }
    
    // Process sessions for parent-friendly summary
    const processedSessions = sessions?.map(session => {
      const completedActions = session.offline_actions?.filter((action: any) => action.completed).length || 0;
      const totalActions = session.offline_actions?.length || 0;
      const patternCounts = session.pattern_events?.reduce((acc: any, event: any) => {
        acc[event.pattern] = (acc[event.pattern] || 0) + 1;
        return acc;
      }, {}) || {};
      
      return {
        id: session.id,
        childName: session.child_profiles.display_name,
        childAgeRange: session.child_profiles.age_range,
        status: session.status,
        startedAt: session.started_at,
        endedAt: session.ended_at,
        summary: session.summary,
        actionProgress: {
          completed: completedActions,
          total: totalActions,
          completionRate: totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0
        },
        patterns: patternCounts,
        patternCount: session.pattern_events?.length || 0
      };
    }) || [];
    
    // Calculate overall trends
    const allPatterns = sessions?.flatMap((session: any) => 
      session.pattern_events?.map((event: any) => event.pattern) || []
    ) || [];
    
    const patternTrends = allPatterns.reduce((acc: any, pattern: string) => {
      acc[pattern] = (acc[pattern] || 0) + 1;
      return acc;
    }, {});
    
    const allActions = sessions?.flatMap((session: any) => session.offline_actions || []) || [];
    const totalCompletedActions = allActions.filter((action: any) => action.completed).length;
    const overallCompletionRate = allActions.length > 0 ? 
      Math.round((totalCompletedActions / allActions.length) * 100) : 0;
    
    return NextResponse.json({
      sessions: processedSessions,
      trends: {
        patternFrequency: patternTrends,
        overallCompletionRate,
        totalSessions: sessions?.length || 0,
        completedSessions: sessions?.filter((s: any) => s.status === 'completed').length || 0
      }
    });
    
  } catch (error) {
    console.error('Session summary error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

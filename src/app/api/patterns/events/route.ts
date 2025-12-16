import { createSupabaseClient } from '@/supabase-clients/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const insertEventSchema = z.object({
  sessionId: z.string().uuid(),
  pattern: z.enum(['avoidance_loop', 'impulsivity_overrun', 'perfection_paralysis']),
  confidence: z.number().int().min(1).max(5),
});

type PatternType = 'avoidance_loop' | 'impulsivity_overrun' | 'perfection_paralysis';

interface PatternAnalytics {
  totalEvents: number;
  patternBreakdown: Record<PatternType, {
    count: number;
    percentage: number;
    avgConfidence: number;
  }>;
  insights: Array<{
    pattern: PatternType;
    frequency: number;
    avgConfidence: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    lastSeen: string;
  }>;
  timeframe: 'week' | 'month' | 'quarter';
}

function calculateTrend(events: any[]): 'increasing' | 'decreasing' | 'stable' {
  if (events.length < 2) return 'stable';
  
  // Split events into two halves and compare frequency
  const midPoint = Math.floor(events.length / 2);
  const firstHalf = events.slice(0, midPoint);
  const secondHalf = events.slice(midPoint);
  
  const firstHalfFreq = firstHalf.length;
  const secondHalfFreq = secondHalf.length;
  
  if (secondHalfFreq > firstHalfFreq * 1.2) return 'increasing';
  if (secondHalfFreq < firstHalfFreq * 0.8) return 'decreasing';
  return 'stable';
}

function calculateAnalytics(events: any[], timeframe: 'week' | 'month' | 'quarter'): PatternAnalytics {
  const totalEvents = events.length;
  
  // Calculate pattern breakdown
  const patternBreakdown: Record<PatternType, {
    count: number;
    percentage: number;
    avgConfidence: number;
  }> = {
    avoidance_loop: { count: 0, percentage: 0, avgConfidence: 0 },
    impulsivity_overrun: { count: 0, percentage: 0, avgConfidence: 0 },
    perfection_paralysis: { count: 0, percentage: 0, avgConfidence: 0 }
  };
  
  // Group events by pattern
  const eventsByPattern: Record<PatternType, any[]> = {
    avoidance_loop: [],
    impulsivity_overrun: [],
    perfection_paralysis: []
  };
  
  events.forEach(event => {
    const pattern = event.pattern as PatternType;
    patternBreakdown[pattern].count++;
    patternBreakdown[pattern].avgConfidence += event.confidence;
    eventsByPattern[pattern].push(event);
  });
  
  // Calculate percentages and average confidence
  Object.keys(patternBreakdown).forEach(pattern => {
    const patternKey = pattern as PatternType;
    const data = patternBreakdown[patternKey];
    
    if (data.count > 0) {
      data.percentage = Math.round((data.count / totalEvents) * 100);
      data.avgConfidence = Math.round(data.avgConfidence / data.count);
    }
  });
  
  // Generate insights
  const insights = Object.entries(eventsByPattern).map(([pattern, patternEvents]) => {
    const patternKey = pattern as PatternType;
    const frequency = patternEvents.length;
    const avgConfidence = frequency > 0 
      ? Math.round(patternEvents.reduce((sum, e) => sum + e.confidence, 0) / frequency)
      : 0;
    
    const lastSeen = patternEvents.length > 0 
      ? patternEvents[0].created_at 
      : new Date().toISOString();
    
    const trend = calculateTrend(patternEvents);
    
    return {
      pattern: patternKey,
      frequency,
      avgConfidence,
      trend,
      lastSeen
    };
  });
  
  return {
    totalEvents,
    patternBreakdown,
    insights,
    timeframe
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, pattern, confidence } = insertEventSchema.parse(body);
    
    const supabase = await createSupabaseClient();
    
    // Get session to verify permissions and get family/child info
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
    
    // Only system should insert pattern events (from AI reflection)
    // But for now, allow parents to insert for testing
    const { data: memberCheck } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', session.family_id)
      .eq('user_id', user.id)
      .single();
    
    if (!memberCheck || memberCheck.role !== 'parent') {
      return NextResponse.json(
        { error: 'Unauthorized: Pattern events are system-generated' },
        { status: 403 }
      );
    }
    
    // Insert pattern event
    const { data: event, error: insertError } = await supabase
      .from('pattern_events')
      .insert({
        family_id: session.family_id,
        child_id: session.child_id,
        session_id: sessionId,
        pattern,
        confidence
      })
      .select('id, family_id, child_id, session_id, pattern, confidence, created_at')
      .single();
    
    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to insert pattern event' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      event
    });
    
  } catch (error) {
    console.error('Pattern event POST error:', error);
    
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get('familyId');
    const childId = searchParams.get('childId');
    const timeframe = (searchParams.get('timeframe') || 'month') as 'week' | 'month' | 'quarter';
    
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
        { error: 'Unauthorized: Only parents can view pattern events' },
        { status: 403 }
      );
    }
    
    // Calculate date range based on timeframe
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
    }
    
    // Build query
    let query = supabase
      .from('pattern_events')
      .select('id, family_id, child_id, session_id, pattern, confidence, created_at')
      .eq('family_id', familyId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });
    
    if (childId) {
      query = query.eq('child_id', childId);
    }
    
    const { data: events, error: eventsError } = await query;
    
    if (eventsError) {
      return NextResponse.json(
        { error: 'Failed to fetch pattern events' },
        { status: 500 }
      );
    }
    
    // Calculate analytics
    const analytics = calculateAnalytics(events || [], timeframe);
    
    return NextResponse.json({
      events: events || [],
      analytics
    });
    
  } catch (error) {
    console.error('Pattern events GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

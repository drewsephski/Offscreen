import { createSupabaseClient } from '@/supabase-clients/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateControlsSchema = z.object({
  familyId: z.string().uuid(),
  ai_enabled: z.boolean().optional(),
  daily_session_limit: z.number().int().min(0).max(10).optional(),
  notes: z.string().max(500).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { familyId, ...updates } = updateControlsSchema.parse(body);
    
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
        { error: 'Unauthorized: Only parents can update controls' },
        { status: 403 }
      );
    }
    
    // Update parent controls
    const { data: updatedControls, error: updateError } = await supabase
      .from('parent_controls')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('family_id', familyId)
      .select('family_id, ai_enabled, daily_session_limit, notes, updated_at')
      .single();
    
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update controls' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      controls: updatedControls
    });
    
  } catch (error) {
    console.error('Controls PATCH error:', error);
    
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
        { error: 'Unauthorized: Only parents can view controls' },
        { status: 403 }
      );
    }
    
    // Get parent controls
    const { data: controls, error: controlsError } = await supabase
      .from('parent_controls')
      .select('family_id, ai_enabled, daily_session_limit, notes, updated_at')
      .eq('family_id', familyId)
      .single();
    
    if (controlsError) {
      return NextResponse.json(
        { error: 'Failed to fetch controls' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      controls
    });
    
  } catch (error) {
    console.error('Controls GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { createSupabaseClient } from '@/supabase-clients/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get user's family memberships
    const { data: memberships, error: membershipError } = await supabase
      .from('family_members')
      .select('family_id, role')
      .eq('user_id', user.id);
    
    if (membershipError) {
      return NextResponse.json(
        { error: 'Failed to fetch family memberships' },
        { status: 500 }
      );
    }
    
    if (!memberships || memberships.length === 0) {
      return NextResponse.json({
        families: [],
        children: [],
        parentControls: []
      });
    }
    
    const familyIds = memberships.map(m => m.family_id);
    
    // Get family details
    const { data: families, error: familiesError } = await supabase
      .from('families')
      .select('id, name, created_at')
      .in('id', familyIds);
    
    if (familiesError) {
      return NextResponse.json(
        { error: 'Failed to fetch family details' },
        { status: 500 }
      );
    }
    
    // Get children profiles for these families
    const { data: children, error: childrenError } = await supabase
      .from('child_profiles')
      .select('id, family_id, user_id, display_name, age_range, created_at')
      .in('family_id', familyIds);
    
    if (childrenError) {
      return NextResponse.json(
        { error: 'Failed to fetch children profiles' },
        { status: 500 }
      );
    }
    
    // Get parent controls for these families
    const { data: parentControls, error: controlsError } = await supabase
      .from('parent_controls')
      .select('family_id, ai_enabled, daily_session_limit, notes, updated_at')
      .in('family_id', familyIds);
    
    if (controlsError) {
      return NextResponse.json(
        { error: 'Failed to fetch parent controls' },
        { status: 500 }
      );
    }
    
    // Combine with user's role information
    const familiesWithRole = families.map(family => ({
      ...family,
      userRole: memberships.find(m => m.family_id === family.id)?.role,
      parentControls: parentControls.find(pc => pc.family_id === family.id)
    }));
    
    return NextResponse.json({
      families: familiesWithRole,
      children: children || [],
      userMemberships: memberships
    });
    
  } catch (error) {
    console.error('Family GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

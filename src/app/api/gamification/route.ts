import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/supabase-clients/server';

export async function GET() {
  try {
    const supabase = await createSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create gamification data
    let { data: gamification, error: gamificationError } = await (
      supabase as any
    )
      .from('user_gamification')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (gamificationError && gamificationError.code === 'PGRST116') {
      // No row found, create one
      const { data: newGamification, error: insertError } = await (
        supabase as any
      )
        .from('user_gamification')
        .insert({ user_id: user.id })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }
      gamification = newGamification;
    } else if (gamificationError) {
      throw gamificationError;
    }

    // Get badges
    const { data: badges, error: badgesError } = await (supabase as any)
      .from('user_badges')
      .select('*')
      .eq('user_id', user.id);

    if (badgesError) {
      throw badgesError;
    }

    return NextResponse.json({
      gamification,
      badges,
    });
  } catch (error) {
    console.error('Error fetching gamification data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, points, streak, badgeType } = body;

    if (action === 'update_points') {
      const { data, error } = await (supabase as any)
        .from('user_gamification')
        .upsert(
          {
            user_id: user.id,
            streak: streak,
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }

    if (action === 'update_streak') {
      const { data, error } = await supabase
        .from('user_gamification')
        .upsert(
          {
            user_id: user.id,
            streak: streak,
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }

    if (action === 'add_badge' && badgeType) {
      // Check if badge already exists
      const { data: existingBadge } = await (supabase as any)
        .from('user_badges')
        .select('id')
        .eq('user_id', user.id)
        .eq('badge_type', badgeType)
        .single();

      if (existingBadge) {
        return NextResponse.json({ message: 'Badge already unlocked' });
      }

      const { data: badgeData, error: badgeError } = await (supabase as any)
        .from('user_badges')
        .insert({
          user_id: user.id,
          badge_type: badgeType,
        })
        .select()
        .single();

      if (existingBadge) {
        return NextResponse.json({ message: 'Badge already unlocked' });
      }

      const { data, error } = await (supabase as any)
        .from('user_gamification')
        .upsert(
          {
            user_id: user.id,
            points: points,
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating gamification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

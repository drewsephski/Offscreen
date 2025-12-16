'use server';

import { createSupabaseClient } from '@/supabase-clients/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createSessionSchema = z.object({
  family_id: z.string().uuid(),
  child_id: z.string().uuid(),
});

export async function createCoachingSession(formData: FormData) {
  const supabase = await createSupabaseClient();

  try {
    const { family_id, child_id } = createSessionSchema.parse({
      family_id: formData.get('family_id'),
      child_id: formData.get('child_id'),
    });

    // Check if user is parent in this family
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized: No user found');
    }
    const { data: memberCheck } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', family_id)
      .eq('user_id', user.id)
      .single();

    if (!memberCheck || memberCheck.role !== 'parent') {
      throw new Error('Unauthorized: Only parents can start coaching sessions');
    }

    // Create new coaching session
    const { data, error } = await supabase
      .from('coaching_sessions')
      .insert({
        family_id,
        child_id,
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }

    revalidatePath('/dashboard');
    return { success: true, sessionId: data.id };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Unknown error occurred' };
  }
}

export async function getActiveCoachingSession(sessionId: string) {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from('coaching_sessions')
    .select(
      `
      id,
      family_id,
      child_id,
      status,
      started_at,
      ended_at,
      summary,
      child_profiles!inner(display_name, age_range),
      families!inner(name)
    `
    )
    .eq('id', sessionId)
    .eq('status', 'active')
    .single();

  if (error) {
    throw new Error(`Failed to get session: ${error.message}`);
  }

  return data;
}

export async function endCoachingSession(sessionId: string, summary: string) {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from('coaching_sessions')
    .update({
      status: 'completed',
      ended_at: new Date().toISOString(),
      summary,
    })
    .eq('id', sessionId)
    .eq('status', 'active')
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to end session: ${error.message}`);
  }

  revalidatePath('/dashboard');
  return { success: true, sessionId: data.id };
}

export async function abandonCoachingSession(sessionId: string) {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from('coaching_sessions')
    .update({
      status: 'abandoned',
      ended_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('status', 'active')
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to abandon session: ${error.message}`);
  }

  revalidatePath('/dashboard');
  return { success: true, sessionId: data.id };
}

export async function getFamilyCoachingSessions(familyId: string) {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from('coaching_sessions')
    .select(
      `
      id,
      status,
      started_at,
      ended_at,
      summary,
      child_profiles!inner(display_name, age_range)
    `
    )
    .eq('family_id', familyId)
    .order('started_at', { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(`Failed to get sessions: ${error.message}`);
  }

  return data;
}

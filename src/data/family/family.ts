'use server';

import { createSupabaseClient } from '@/supabase-clients/server';
import { revalidatePath } from 'next/cache';

export async function createFamily(familyName: string, aiEnabled: boolean = true, sessionLimit: number = 3) {
    try {
        console.log('Starting family creation with name:', familyName, { aiEnabled, sessionLimit });
        const supabase = await createSupabaseClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        console.log('Auth result:', { user: user?.id, authError });

        if (authError || !user) {
            console.log('Authentication failed:', authError);
            throw new Error('Authentication required. Please sign in again.');
        }

        // Create family
        const { data: family, error: familyError } = await supabase
            .from('families')
            .insert({
                name: familyName.trim(),
            })
            .select()
            .single();

        if (familyError) {
            console.error('Family creation error:', familyError);
            throw new Error('Failed to create family. Please try again.');
        }

        // Create family membership for the user as parent
        const { error: membershipError } = await supabase
            .from('family_members')
            .insert({
                family_id: family.id,
                user_id: user.id,
                role: 'parent',
            });

        if (membershipError) {
            console.error('Family membership error:', membershipError);
            throw new Error('Failed to set up family membership. Please try again.');
        }

        // Setup parent controls with user preferences
        const { error: controlsError } = await supabase
            .from('parent_controls')
            .insert({
                family_id: family.id,
                ai_enabled: aiEnabled,
                daily_session_limit: sessionLimit,
                notes: 'Initial setup during onboarding',
            });

        if (controlsError) {
            console.error('Parent controls setup error:', controlsError);
            // Don't throw error for controls - family creation is still successful
            console.warn('Parent controls setup failed, but family was created successfully');
        }

        // Revalidate dashboard to show new family
        revalidatePath('/dashboard');

        return { success: true, family };

    } catch (error) {
        console.error('Create family error:', error);
        throw error;
    }
}

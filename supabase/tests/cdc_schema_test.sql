-- Test CDC Schema RLS Policies
-- This file tests that Row Level Security works correctly for the CDC schema

-- Test 1: Verify tables exist and RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('families', 'family_members', 'child_profiles', 'coaching_sessions', 
                      'pattern_events', 'offline_actions', 'parent_controls', 'safety_events')
ORDER BY tablename;

-- Test 2: Verify RLS policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual as using_expression,
    with_check as check_expression
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('families', 'family_members', 'child_profiles', 'coaching_sessions', 
                      'pattern_events', 'offline_actions', 'parent_controls', 'safety_events')
ORDER BY tablename, policyname;

-- Test 3: Verify foreign key constraints
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('families', 'family_members', 'child_profiles', 'coaching_sessions', 
                          'pattern_events', 'offline_actions', 'parent_controls', 'safety_events')
ORDER BY tc.table_name;

-- Test 4: Verify indexes for performance
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('families', 'family_members', 'child_profiles', 'coaching_sessions', 
                      'pattern_events', 'offline_actions', 'parent_controls', 'safety_events')
ORDER BY tablename, indexname;

-- Test 5: Verify trigger for parent_controls
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_condition,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public' 
    AND event_object_table = 'families';

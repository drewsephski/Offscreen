"use client";

import { useCallback, useState } from 'react';

interface Family {
  id: string;
  name: string;
  created_at: string;
  userRole: 'parent' | 'child';
  parentControls?: {
    family_id: string;
    ai_enabled: boolean;
    daily_session_limit: number;
    notes?: string;
    updated_at: string;
  };
}

interface Child {
  id: string;
  family_id: string;
  user_id: string;
  display_name: string;
  age_range: string;
  created_at: string;
}

interface SessionSummary {
  id: string;
  childName: string;
  childAgeRange: string;
  status: 'active' | 'completed' | 'abandoned';
  startedAt: string;
  endedAt?: string;
  summary?: string;
  actionProgress: {
    completed: number;
    total: number;
    completionRate: number;
  };
  patterns: Record<string, number>;
  patternCount: number;
}

interface DashboardTrends {
  patternFrequency: Record<string, number>;
  overallCompletionRate: number;
  totalSessions: number;
  completedSessions: number;
}

interface ParentControls {
  family_id: string;
  ai_enabled: boolean;
  daily_session_limit: number;
  notes?: string;
  updated_at: string;
}

export function useParentDashboard() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [trends, setTrends] = useState<DashboardTrends | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFamilyData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/family');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch family data');
      }

      const data = await response.json();
      setFamilies(data.families || []);
      setChildren(data.children || []);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSessionSummaries = useCallback(async (familyId: string, childId?: string, limit: number = 10) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        familyId,
        limit: limit.toString()
      });

      if (childId) {
        params.append('childId', childId);
      }

      const response = await fetch(`/api/session/summary?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch session summaries');
      }

      const data = await response.json();
      setSessions(data.sessions || []);
      setTrends(data.trends || null);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchParentControls = useCallback(async (familyId: string): Promise<ParentControls> => {
    try {
      const response = await fetch(`/api/family/controls?familyId=${familyId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch parent controls');
      }

      const data = await response.json();
      return data.controls;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateParentControls = useCallback(async (familyId: string, updates: Partial<ParentControls>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/family/controls', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          familyId,
          ...updates
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update parent controls');
      }

      const data = await response.json();

      // Update local state
      setFamilies(prev => prev.map(family =>
        family.id === familyId
          ? { ...family, parentControls: data.controls }
          : family
      ));

      return data.controls;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getChildrenForFamily = useCallback((familyId: string): Child[] => {
    return children.filter(child => child.family_id === familyId);
  }, [children]);

  const getFamilyForChild = useCallback((childId: string): Family | null => {
    const child = children.find(c => c.id === childId);
    if (!child) return null;

    return families.find(family => family.id === child.family_id) || null;
  }, [children, families]);

  const getPatternTrends = useCallback((timeframe: 'week' | 'month' | 'all' = 'all') => {
    if (!trends) return null;

    // For now, return all trends. In a real implementation, 
    // you'd filter based on timeframe
    return trends.patternFrequency;
  }, [trends]);

  const getCompletionTrends = useCallback((timeframe: 'week' | 'month' | 'all' = 'all') => {
    if (!trends) return null;

    // For now, return overall completion rate. In a real implementation,
    // you'd calculate this based on timeframe
    return trends.overallCompletionRate;
  }, [trends]);

  const refreshData = useCallback(async (familyId?: string) => {
    await fetchFamilyData();

    if (familyId) {
      await fetchSessionSummaries(familyId);
    }
  }, [fetchFamilyData, fetchSessionSummaries]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Data
    families,
    children,
    sessions,
    trends,

    // State
    isLoading,
    error,

    // Methods
    fetchFamilyData,
    fetchSessionSummaries,
    fetchParentControls,
    updateParentControls,

    // Computed helpers
    getChildrenForFamily,
    getFamilyForChild,
    getPatternTrends,
    getCompletionTrends,

    // Utility
    refreshData,
    clearError
  };
}

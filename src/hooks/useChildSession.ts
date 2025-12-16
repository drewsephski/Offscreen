import { createClient } from '@/supabase-clients/client';
import { useCallback, useState } from 'react';

interface Session {
  id: string;
  family_id: string;
  child_id: string;
  status: 'active' | 'completed' | 'abandoned';
  started_at: string;
  ended_at?: string;
  summary?: string;
  child_profiles?: Array<{
    display_name: string;
    age_range: string;
  }>;
}

interface ReflectionResponse {
  aiResponse: string;
  detectedPattern:
  | 'avoidance_loop'
  | 'impulsivity_overrun'
  | 'perfection_paralysis'
  | null;
  patternConfidence: number;
  offlineActions: string[];
  emotionalTone: 'positive' | 'neutral' | 'challenging';
  engagementLevel: 'high' | 'medium' | 'low';
}

interface OfflineAction {
  id: string;
  action_text: string;
  completed: boolean;
  completed_at?: string;
}

export function useChildSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(
    async (familyId: string, childId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // Use server action instead of Edge Function
        const formData = new FormData();
        formData.append('family_id', familyId);
        formData.append('child_id', childId);

        const { createCoachingSession } = await import('@/data/coaching/sessions');
        const result = await createCoachingSession(formData);

        if (!result.success) {
          throw new Error(result.error || 'Failed to start session');
        }

        // Fetch the full session details
        const supabase = createClient();
        const { data: sessionData, error: sessionError } = await supabase
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
            child_profiles!inner(display_name, age_range)
          `
          )
          .eq('id', result.sessionId)
          .single();

        if (sessionError) {
          throw new Error(sessionError.message);
        }

        setSession(sessionData);
        return sessionData;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const reflect = useCallback(
    async (childResponse: string): Promise<ReflectionResponse> => {
      if (!session) {
        throw new Error('No active session');
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/session/reflect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: session.id,
            childResponse,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Reflection failed');
        }

        const data: ReflectionResponse = await response.json();
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [session]
  );

  const endSession = useCallback(
    async (summary?: string) => {
      if (!session) {
        throw new Error('No active session');
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/session/end', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: session.id,
            summary: summary || 'Session completed',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to end session');
        }

        const data = await response.json();

        if (data.success) {
          setSession((prev) =>
            prev
              ? {
                ...prev,
                status: 'completed',
                ended_at: new Date().toISOString(),
                summary,
              }
              : null
          );
          return data;
        } else {
          throw new Error(data.error || 'Failed to end session');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [session]
  );

  const getOfflineActions = useCallback(async (): Promise<OfflineAction[]> => {
    if (!session) {
      throw new Error('No active session');
    }

    try {
      const response = await fetch(
        `/api/offline-actions/complete?sessionId=${session.id}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch actions');
      }

      const data = await response.json();
      return data.actions || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  }, [session]);

  const completeOfflineAction = useCallback(async (actionId: string) => {
    try {
      const response = await fetch('/api/offline-actions/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ actionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete action');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const loadSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

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
          child_profiles!inner(display_name, age_range)
        `
        )
        .eq('id', sessionId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setSession(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSession = useCallback(() => {
    setSession(null);
    setError(null);
  }, []);

  return {
    session,
    isLoading,
    error,
    startSession,
    reflect,
    endSession,
    getOfflineActions,
    completeOfflineAction,
    loadSession,
    clearSession,
  };
}

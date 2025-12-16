import { useState, useEffect, useCallback } from 'react';

interface GamificationData {
  id: string;
  user_id: string;
  points: number;
  streak: number;
  level: number;
  created_at: string;
  updated_at: string;
}

interface Badge {
  id: string;
  user_id: string;
  badge_type: string;
  unlocked_at: string;
}

export function useGamification() {
  const [gamification, setGamification] = useState<GamificationData | null>(
    null
  );
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGamification = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gamification');
      if (!response.ok) {
        throw new Error('Failed to fetch gamification data');
      }

      const data = await response.json();
      setGamification(data.gamification);
      setBadges(data.badges);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePoints = useCallback(async (points: number) => {
    try {
      const response = await fetch('/api/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_points', points }),
      });

      if (!response.ok) {
        throw new Error('Failed to update points');
      }

      const data = await response.json();
      setGamification(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateStreak = useCallback(async (streak: number) => {
    try {
      const response = await fetch('/api/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_streak', streak }),
      });

      if (!response.ok) {
        throw new Error('Failed to update streak');
      }

      const data = await response.json();
      setGamification(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const addBadge = useCallback(async (badgeType: string) => {
    try {
      const response = await fetch('/api/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_badge', badgeType }),
      });

      if (!response.ok) {
        throw new Error('Failed to add badge');
      }

      const data = await response.json();
      if (data.id) {
        setBadges((prev) => [...prev, data]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchGamification();
  }, [fetchGamification]);

  return {
    gamification,
    badges,
    isLoading,
    error,
    updatePoints,
    updateStreak,
    addBadge,
    refetch: fetchGamification,
  };
}

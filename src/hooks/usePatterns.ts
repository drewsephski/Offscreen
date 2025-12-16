import { useState, useCallback } from 'react';

type PatternType = 'avoidance_loop' | 'impulsivity_overrun' | 'perfection_paralysis';

interface PatternEvent {
  id: string;
  family_id: string;
  child_id: string;
  session_id: string;
  pattern: PatternType;
  confidence: number;
  created_at: string;
}

interface PatternInsight {
  pattern: PatternType;
  frequency: number;
  avgConfidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  lastSeen: string;
  actionableSuggestions: string[];
}

interface PatternAnalytics {
  totalEvents: number;
  patternBreakdown: Record<PatternType, {
    count: number;
    percentage: number;
    avgConfidence: number;
  }>;
  insights: PatternInsight[];
  timeframe: 'week' | 'month' | 'quarter';
}

export function usePatterns() {
  const [patternEvents, setPatternEvents] = useState<PatternEvent[]>([]);
  const [analytics, setAnalytics] = useState<PatternAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatternEvents = useCallback(async (familyId: string, childId?: string, timeframe: 'week' | 'month' | 'quarter' = 'month') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        familyId,
        timeframe
      });
      
      if (childId) {
        params.append('childId', childId);
      }
      
      const response = await fetch(`/api/patterns/events?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch pattern events');
      }
      
      const data = await response.json();
      setPatternEvents(data.events || []);
      setAnalytics(data.analytics || null);
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const insertPatternEvent = useCallback(async (sessionId: string, pattern: PatternType, confidence: number) => {
    try {
      const response = await fetch('/api/patterns/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          pattern,
          confidence
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to insert pattern event');
      }
      
      const data = await response.json();
      
      // Update local state
      if (data.event) {
        setPatternEvents(prev => [data.event, ...prev]);
      }
      
      return data.event;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getPatternInsights = useCallback((familyId: string, childId?: string): PatternInsight[] => {
    if (!analytics) return [];
    
    return analytics.insights.map(insight => ({
      ...insight,
      actionableSuggestions: generateActionableSuggestions(insight.pattern, insight.frequency, insight.trend)
    }));
  }, [analytics]);

  const getMostFrequentPattern = useCallback((): PatternType | null => {
    if (!analytics) return null;
    
    const patterns = Object.entries(analytics.patternBreakdown);
    if (patterns.length === 0) return null;
    
    const [pattern] = patterns.sort(([, a], [, b]) => b.count - a.count);
    return pattern[0] as PatternType;
  }, [analytics]);

  const getPatternTrendData = useCallback((pattern: PatternType) => {
    if (!patternEvents.length) return null;
    
    const patternEventsFiltered = patternEvents.filter(event => event.pattern === pattern);
    
    // Group by week for trend analysis
    const weeklyData = patternEventsFiltered.reduce((acc, event) => {
      const weekStart = new Date(event.created_at);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!acc[weekKey]) {
        acc[weekKey] = { count: 0, totalConfidence: 0, events: [] };
      }
      
      acc[weekKey].count++;
      acc[weekKey].totalConfidence += event.confidence;
      acc[weekKey].events.push(event);
      
      return acc;
    }, {} as Record<string, { count: number; totalConfidence: number; events: PatternEvent[] }>);
    
    return Object.entries(weeklyData)
      .map(([week, data]) => ({
        week,
        count: data.count,
        avgConfidence: Math.round(data.totalConfidence / data.count),
        events: data.events
      }))
      .sort((a, b) => a.week.localeCompare(b.week));
  }, [patternEvents]);

  const generateActionableSuggestions = useCallback((pattern: PatternType, frequency: number, trend: 'increasing' | 'decreasing' | 'stable'): string[] => {
    const suggestions: string[] = [];
    
    if (pattern === 'avoidance_loop') {
      suggestions.push('Try breaking tasks into 2-minute micro-steps');
      suggestions.push('Create a visual progress tracker for motivation');
      if (trend === 'increasing') {
        suggestions.push('Consider scheduling regular check-ins to maintain momentum');
      }
    } else if (pattern === 'impulsivity_overrun') {
      suggestions.push('Practice the "pause and breathe" technique before acting');
      suggestions.push('Use a 3-question checklist before making decisions');
      if (trend === 'increasing') {
        suggestions.push('Implement structured decision-making frameworks');
      }
    } else if (pattern === 'perfection_paralysis') {
      suggestions.push('Embrace "good enough" standards for routine tasks');
      suggestions.push('Set time limits to prevent overthinking');
      if (trend === 'increasing') {
        suggestions.push('Focus on progress over perfection in daily activities');
      }
    }
    
    if (frequency > 5) {
      suggestions.push('Consider discussing these patterns with a professional');
    }
    
    return suggestions;
  }, []);

  const exportPatternData = useCallback((format: 'json' | 'csv' = 'json') => {
    if (!patternEvents.length) return null;
    
    if (format === 'json') {
      return JSON.stringify({
        events: patternEvents,
        analytics,
        exportedAt: new Date().toISOString()
      }, null, 2);
    }
    
    // CSV format
    const headers = ['ID', 'Pattern', 'Confidence', 'Created At', 'Session ID', 'Child ID'];
    const csvData = [
      headers.join(','),
      ...patternEvents.map(event => [
        event.id,
        event.pattern,
        event.confidence,
        event.created_at,
        event.session_id,
        event.child_id
      ].join(','))
    ].join('\n');
    
    return csvData;
  }, [patternEvents, analytics]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetData = useCallback(() => {
    setPatternEvents([]);
    setAnalytics(null);
    setError(null);
  }, []);

  return {
    // Data
    patternEvents,
    analytics,
    
    // State
    isLoading,
    error,
    
    // Methods
    fetchPatternEvents,
    insertPatternEvent,
    
    // Computed helpers
    getPatternInsights,
    getMostFrequentPattern,
    getPatternTrendData,
    generateActionableSuggestions,
    
    // Utilities
    exportPatternData,
    clearError,
    resetData
  };
}

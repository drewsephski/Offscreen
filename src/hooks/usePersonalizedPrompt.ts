import { useState, useEffect } from 'react';
import { generatePersonalizedPrompt } from '@/lib/ai-coaching';

export function usePersonalizedPrompt(
  childAge?: string,
  recentPatterns: string[] = [],
  sessionCount = 1
) {
  const [prompt, setPrompt] = useState<string>(
    'How are you feeling right now?'
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (childAge) {
      setIsLoading(true);
      generatePersonalizedPrompt(childAge, recentPatterns, sessionCount)
        .then(setPrompt)
        .finally(() => setIsLoading(false));
    }
  }, [childAge, recentPatterns, sessionCount]);

  return { prompt, isLoading };
}

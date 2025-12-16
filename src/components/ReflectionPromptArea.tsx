'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { usePersonalizedPrompt } from '@/hooks/usePersonalizedPrompt';
import { createClient } from '@/supabase-clients/client';
import { motion } from 'framer-motion';
import { Image, Mic, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AILoadingSpinner } from './ui/loading-spinner';

interface ReflectionPromptAreaProps {
  onSubmit: (response: string) => void;
  sessionId: string;
}

export default function ReflectionPromptArea({
  onSubmit,
  sessionId,
}: ReflectionPromptAreaProps) {
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState<'text' | 'voice' | 'visual'>(
    'text'
  );
  const [childAge, setChildAge] = useState<string>('');
  const [recentPatterns, setRecentPatterns] = useState<string[]>([]);

  // Get child profile and patterns for personalized prompts
  useEffect(() => {
    async function fetchChildData() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get child profile
      const { data: profile } = await supabase
        .from('child_profiles')
        .select('age_range')
        .eq('user_id', user.id)
        .single();

      if (profile?.age_range) {
        setChildAge(profile.age_range);
      }

      // Get recent patterns
      const { data: patterns } = await supabase
        .from('pattern_events')
        .select('pattern')
        .eq('child_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (patterns) {
        const patternStrings = patterns
          .map((p) => p.pattern)
          .filter(Boolean) as string[];
        const uniquePatterns = Array.from(new Set(patternStrings));
        setRecentPatterns(uniquePatterns);
      }
    }

    fetchChildData();
  }, []);

  // Get session count for prompt personalization
  const [sessionCount, setSessionCount] = useState(1);
  useEffect(() => {
    async function fetchSessionCount() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from('coaching_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('child_id', user.id);

      if (count) {
        setSessionCount(count);
      }
    }

    fetchSessionCount();
  }, []);

  const { prompt, isLoading: promptLoading } = usePersonalizedPrompt(
    childAge,
    recentPatterns,
    sessionCount
  );

  const handleSubmit = () => {
    if (input.trim()) {
      onSubmit(input);
    }
  };

  const emojis = ['😊', '🤔', '😢', '😠', '🤗', '😴'];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl flex items-center justify-center space-x-2">
          {promptLoading ? (
            <>
              <AILoadingSpinner />
              <span>Loading your question...</span>
            </>
          ) : (
            <span>{prompt}</span>
          )}
        </CardTitle>
        <p className="text-center text-muted-foreground">
          Tell me what's on your mind, or choose how you want to share.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Type Selection */}
        <div className="flex justify-center space-x-4">
          <Button
            variant={inputType === 'text' ? 'default' : 'outline'}
            onClick={() => setInputType('text')}
            className="flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Text</span>
          </Button>
          <Button
            variant={inputType === 'voice' ? 'default' : 'outline'}
            onClick={() => setInputType('voice')}
            className="flex items-center space-x-2"
            disabled
          >
            <Mic className="w-4 h-4" />
            <span>Voice</span>
          </Button>
          <Button
            variant={inputType === 'visual' ? 'default' : 'outline'}
            onClick={() => setInputType('visual')}
            className="flex items-center space-x-2"
            disabled
          >
            <Image className="w-4 h-4" />
            <span>Visual</span>
          </Button>
        </div>

        {/* Text Input */}
        {inputType === 'text' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <Textarea
              placeholder="Write your thoughts here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[120px] text-lg"
            />

            {/* Emoji Reactions */}
            <div className="flex flex-wrap justify-center gap-2">
              {emojis.map((emoji) => (
                <Button
                  key={emoji}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput((prev) => prev + emoji)}
                  className="text-2xl p-2"
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Voice Input Placeholder */}
        {inputType === 'voice' && (
          <div className="text-center py-8">
            <Mic className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p>Voice input coming soon!</p>
          </div>
        )}

        {/* Visual Input Placeholder */}
        {inputType === 'visual' && (
          <div className="text-center py-8">
            <Image className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p>Visual selection coming soon!</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={!input.trim()}
            size="lg"
            className="px-8"
          >
            Share with AI Helper
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

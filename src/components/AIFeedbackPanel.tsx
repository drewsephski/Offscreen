'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { AILoadingSpinner } from './ui/loading-spinner';

interface AIFeedbackPanelProps {
  aiResponse: string;
  emotionalTone?: 'positive' | 'neutral' | 'challenging';
  engagementLevel?: 'high' | 'medium' | 'low';
  onContinue: () => void;
  isLoading?: boolean;
}

export default function AIFeedbackPanel({
  aiResponse,
  emotionalTone = 'neutral',
  engagementLevel = 'medium',
  onContinue,
  isLoading = false,
}: AIFeedbackPanelProps) {
  const getAvatarColor = () => {
    switch (emotionalTone) {
      case 'positive':
        return 'bg-green-100';
      case 'challenging':
        return 'bg-orange-100';
      default:
        return 'bg-muted';
    }
  };

  const getAvatarIconColor = () => {
    switch (emotionalTone) {
      case 'positive':
        return 'text-green-600';
      case 'challenging':
        return 'text-orange-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getAnimationDelay = () => {
    switch (engagementLevel) {
      case 'high':
        return 0.2;
      case 'low':
        return 0.8;
      default:
        return 0.5;
    }
  };
  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          {/* Animated Avatar */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: isLoading ? [1, 1.1, 1] : 1 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
              delay: getAnimationDelay(),
              repeat: isLoading ? Infinity : 0,
              repeatDelay: 1.5,
            }}
            className="flex justify-center"
          >
            <div
              className={`w-24 h-24 ${getAvatarColor()} rounded-full flex items-center justify-center`}
            >
              {isLoading ? (
                <AILoadingSpinner />
              ) : (
                <Bot className={`w-12 h-12 ${getAvatarIconColor()}`} />
              )}
            </div>
          </motion.div>

          {/* AI Response or Loading State */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoading ? 0.7 : 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            {isLoading ? (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center justify-center space-x-2">
                  <AILoadingSpinner />
                  <span>AI Helper is thinking...</span>
                </h3>
                <div className="bg-muted p-4 rounded-lg text-left">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted-foreground/20 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-muted-foreground/20 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-muted-foreground/20 rounded w-2/3 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Your AI Helper Says:</h3>
                <div className="bg-muted p-4 rounded-lg text-left">
                  <p className="text-lg leading-relaxed">{aiResponse}</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Pattern Hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center"
          >
            <p className="text-muted-foreground">
              Hmm... this looks like a pattern we're working on together!
            </p>
          </motion.div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <Button onClick={onContinue} size="lg" className="px-8">
              See What Pattern This Is
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}

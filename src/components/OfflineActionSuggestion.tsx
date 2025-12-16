'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';

interface OfflineActionSuggestionProps {
  actions: string[];
  onComplete: () => void;
}

export default function OfflineActionSuggestion({
  actions,
  onComplete,
}: OfflineActionSuggestionProps) {
  const [completedActions, setCompletedActions] = useState<Set<number>>(
    new Set()
  );

  const handleActionToggle = (index: number) => {
    const newCompleted = new Set(completedActions);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedActions(newCompleted);
  };

  const allCompleted =
    actions.length > 0 && completedActions.size === actions.length;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Your Action Plan</CardTitle>
        <p className="text-center text-muted-foreground">
          Try one of these small steps to keep growing
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Actions List */}
        <div className="space-y-4">
          {actions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                id={`action-${index}`}
                checked={completedActions.has(index)}
                onCheckedChange={() => handleActionToggle(index)}
                className="w-6 h-6"
              />
              <label
                htmlFor={`action-${index}`}
                className="flex-1 text-left cursor-pointer text-lg"
              >
                {action}
              </label>
              {completedActions.has(index) ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <Circle className="w-6 h-6 text-muted-foreground" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Progress Indicator */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Completed: {completedActions.size} / {actions.length}
          </p>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${(completedActions.size / actions.length) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Complete Button */}
        {allCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="text-center"
          >
            <Button onClick={onComplete} size="lg" className="px-8">
              Great Job! Finish Session
            </Button>
          </motion.div>
        )}

        {!allCompleted && actions.length > 0 && (
          <div className="text-center text-muted-foreground">
            <p>Complete all actions to continue</p>
          </div>
        )}

        {actions.length === 0 && (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              No specific actions suggested this time.
            </p>
            <Button onClick={onComplete} size="lg">
              Continue Anyway
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

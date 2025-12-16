'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { AlertTriangle, Pause, Star } from 'lucide-react';

interface PatternFeedbackProps {
  pattern:
    | 'avoidance_loop'
    | 'impulsivity_overrun'
    | 'perfection_paralysis'
    | null;
  onContinue: () => void;
}

const patternData = {
  avoidance_loop: {
    icon: AlertTriangle,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    title: 'Avoidance Loop',
    message: 'This looks like putting things off.',
    advice: 'Try taking one small step instead of waiting.',
  },
  impulsivity_overrun: {
    icon: Pause,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    title: 'Impulsivity Overrun',
    message: 'This seems like acting quickly without thinking.',
    advice: 'Take a deep breath and think about your choices.',
  },
  perfection_paralysis: {
    icon: Star,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    title: 'Perfection Paralysis',
    message: 'This might be waiting for perfect before starting.',
    advice: 'Just begin! Good enough is okay.',
  },
};

export default function PatternFeedback({
  pattern,
  onContinue,
}: PatternFeedbackProps) {
  if (!pattern || !patternData[pattern]) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p>No specific pattern detected this time. Great awareness!</p>
          <Button onClick={onContinue} className="mt-4">
            Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  const data = patternData[pattern];
  const Icon = data.icon;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Pattern Detected</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Animated Pattern Indicator */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: 0.2,
          }}
          className="flex justify-center"
        >
          <div
            className={`w-32 h-32 ${data.bgColor} rounded-full flex items-center justify-center`}
          >
            <Icon className={`w-16 h-16 ${data.color}`} />
          </div>
        </motion.div>

        {/* Pattern Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-4"
        >
          <h3 className="text-xl font-semibold">{data.title}</h3>
          <p className="text-lg">{data.message}</p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-muted-foreground">{data.advice}</p>
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex justify-center"
        >
          <Button onClick={onContinue} size="lg" className="px-8">
            Get Your Next Action
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}

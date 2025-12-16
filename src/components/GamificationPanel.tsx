'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { InlineLoading } from '@/components/ui/loading-spinner';
import { useGamification } from '@/hooks/useGamification';
import { motion } from 'framer-motion';
import { Flame, Star, Trophy } from 'lucide-react';

export default function GamificationPanel() {
  const { gamification, badges, isLoading } = useGamification();

  if (isLoading || !gamification) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2 py-4">
            <InlineLoading size="sm" />
            <span className="text-muted-foreground">Loading achievements...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Points */}
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <Star className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold">{gamification.points}</span>
            <span className="text-sm text-muted-foreground">points</span>
          </motion.div>

          {/* Streak */}
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <Flame className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold">{gamification.streak}</span>
            <span className="text-sm text-muted-foreground">streak</span>
          </motion.div>

          {/* Level */}
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <Trophy className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold">Level {gamification.level}</span>
          </motion.div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Your Badges:</p>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Badge variant="secondary" className="capitalize">
                    {badge.badge_type.replace('_', ' ')}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

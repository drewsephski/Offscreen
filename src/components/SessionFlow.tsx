'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useChildSession } from '@/hooks/useChildSession';
import { useGamification } from '@/hooks/useGamification';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import AIFeedbackPanel from './AIFeedbackPanel';
import GamificationPanel from './GamificationPanel';
import OfflineActionSuggestion from './OfflineActionSuggestion';
import PatternFeedback from './PatternFeedback';
import ReflectionPromptArea from './ReflectionPromptArea';
import { PageLoading } from './ui/loading-spinner';

type SessionStep =
  | 'welcome'
  | 'reflection'
  | 'feedback'
  | 'pattern'
  | 'action'
  | 'complete';

interface SessionFlowProps {
  sessionId: string;
}

export default function SessionFlow({ sessionId }: SessionFlowProps) {
  const { session, reflect, endSession, loadSession, isLoading, error } =
    useChildSession();
  const { updatePoints, updateStreak, addBadge } = useGamification();
  const [currentStep, setCurrentStep] = useState<SessionStep>('welcome');
  const [reflectionResponse, setReflectionResponse] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [isAILoading, setIsAILoading] = useState(false);

  useEffect(() => {
    loadSession(sessionId);
  }, [sessionId, loadSession]);

  const handleReflectionSubmit = async (response: string) => {
    try {
      setIsAILoading(true);
      setCurrentStep('feedback');
      setProgress(40);
      const aiResponse = await reflect(response);
      setReflectionResponse(aiResponse);
      setIsAILoading(false);
    } catch (err) {
      console.error('Reflection failed:', err);
      setIsAILoading(false);
    }
  };

  const handleFeedbackContinue = () => {
    setCurrentStep('pattern');
    setProgress(60);
  };

  const handlePatternContinue = () => {
    setCurrentStep('action');
    setProgress(80);
  };

  const handleActionComplete = async () => {
    // Award points and update streak
    await updatePoints(10); // Example points
    await updateStreak(1); // Increment streak
    await addBadge('action_hero'); // Example badge

    setCurrentStep('complete');
    setProgress(100);
  };

  const handleSessionComplete = async () => {
    await endSession('Session completed successfully');
  };

  const steps = [
    { key: 'welcome', label: 'Welcome' },
    { key: 'reflection', label: 'Reflect' },
    { key: 'feedback', label: 'AI Feedback' },
    { key: 'pattern', label: 'Pattern Insight' },
    { key: 'action', label: 'Action' },
    { key: 'complete', label: 'Done' },
  ];

  if (isLoading) return <PageLoading message="Loading your session..." />;
  if (error) return <div>Error: {error}</div>;
  if (!session) return <div>Session not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={progress} className="w-full" />
        <div className="flex justify-between text-sm text-muted-foreground">
          {steps.map((step, index) => (
            <span
              key={step.key}
              className={
                currentStep === step.key ? 'font-semibold text-foreground' : ''
              }
            >
              {step.label}
            </span>
          ))}
        </div>
      </div>

      {/* Gamification Panel */}
      <GamificationPanel />

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="min-h-[400px]"
      >
        {currentStep === 'welcome' && (
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">
              Welcome to Your Coaching Session!
            </h1>
            <p className="text-lg text-muted-foreground">
              Let's work together to understand your thoughts and feelings.
            </p>
            <Button onClick={() => setCurrentStep('reflection')} size="lg">
              Start Reflecting
            </Button>
          </div>
        )}

        {currentStep === 'reflection' && (
          <ReflectionPromptArea
            onSubmit={handleReflectionSubmit}
            sessionId={sessionId}
          />
        )}

        {currentStep === 'feedback' && (
          <AIFeedbackPanel
            aiResponse={reflectionResponse?.aiResponse || ''}
            emotionalTone={reflectionResponse?.emotionalTone}
            engagementLevel={reflectionResponse?.engagementLevel}
            onContinue={handleFeedbackContinue}
            isLoading={isAILoading}
          />
        )}

        {currentStep === 'pattern' && reflectionResponse && (
          <PatternFeedback
            pattern={reflectionResponse.detectedPattern}
            onContinue={handlePatternContinue}
          />
        )}

        {currentStep === 'action' && reflectionResponse && (
          <OfflineActionSuggestion
            actions={reflectionResponse.offlineActions}
            onComplete={handleActionComplete}
          />
        )}

        {currentStep === 'complete' && (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">
              Great job completing your session!
            </h2>
            <p className="text-muted-foreground">
              You've earned points and made progress. Keep it up!
            </p>
            <Button onClick={handleSessionComplete} size="lg">
              Finish Session
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

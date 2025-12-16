'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { createFamily } from '@/data/family/family';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import { useState } from 'react';

interface OnboardingWizardProps {
  onComplete: () => void;
}

type OnboardingStep = 'welcome' | 'value-prop' | 'family-setup' | 'preferences' | 'privacy' | 'complete';

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [familyName, setFamilyName] = useState('');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [sessionLimit, setSessionLimit] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupStep, setSetupStep] = useState<string>('');

  const steps: OnboardingStep[] = ['welcome', 'value-prop', 'family-setup', 'preferences', 'privacy', 'complete'];
  const currentStepIndex = steps.indexOf(currentStep);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };

  const handleComplete = async () => {
    if (!familyName.trim()) {
      setError('Family name is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSetupStep('Creating your family space...');

    try {
      // Create the family using the Server Action with preferences
      await createFamily(familyName.trim(), aiEnabled, sessionLimit);

      setSetupStep('Configuring preferences...');
      await new Promise(resolve => setTimeout(resolve, 800));
      setSetupStep('Finalizing setup...');
      await new Promise(resolve => setTimeout(resolve, 500));

      onComplete();
    } catch (error) {
      console.error('Family setup error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create family. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-8 py-12"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="relative"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center shadow-xl">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <motion.div
                className="absolute -inset-2 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl -z-10 opacity-30"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>

            <div className="space-y-4 max-w-xl">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold tracking-tight text-slate-900"
              >
                Welcome to Offscreen
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-slate-600 leading-relaxed"
              >
                A next-generation AI companion designed to help children build emotional intelligence, focus, and real-world skills.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-6 w-full max-w-2xl mt-8"
            >
              <div className="flex flex-col items-center space-y-2 p-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-slate-700" />
                </div>
                <span className="text-sm font-medium text-slate-700">Pattern Detection</span>
                <span className="text-xs text-slate-500 text-center">Identifies behavioral loops</span>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-slate-700" />
                </div>
                <span className="text-sm font-medium text-slate-700">Smart Coaching</span>
                <span className="text-xs text-slate-500 text-center">Personalized guidance</span>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-slate-700" />
                </div>
                <span className="text-sm font-medium text-slate-700">Privacy First</span>
                <span className="text-xs text-slate-500 text-center">Secure by design</span>
              </div>
            </motion.div>
          </motion.div>
        );

      case 'value-prop':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 py-8"
          >
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-slate-900">How Offscreen Works</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Our advanced AI identifies behavioral patterns and guides children toward thoughtful actions and growth.
              </p>
            </div>

            <div className="space-y-4 max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex gap-4 p-6 rounded-xl border bg-white/50"
              >
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-red-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-slate-900">Avoidance Loop Detection</h3>
                  <p className="text-sm text-slate-600">
                    Recognizes when children avoid challenging tasks and provides gentle prompts to build resilience.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-4 p-6 rounded-xl border bg-white/50"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-slate-900">Impulsivity Management</h3>
                  <p className="text-sm text-slate-600">
                    Identifies impulsive patterns and teaches pause-and-reflect strategies for better decision-making.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-4 p-6 rounded-xl border bg-white/50"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-slate-900">Perfectionism Balance</h3>
                  <p className="text-sm text-slate-600">
                    Helps children recognize when perfectionism becomes paralysis and encourages healthy progress over perfection.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-4 rounded-lg bg-slate-50 border mt-6"
              >
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-900">Parent Dashboard Access</p>
                    <p className="text-xs text-slate-600">
                      You'll receive insights and progress trends. Children never see analytics—patterns guide coaching, not diagnoses.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        );

      case 'family-setup':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 py-8"
          >
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-xl bg-slate-100 flex items-center justify-center">
                <Users className="w-7 h-7 text-slate-700" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Create Your Family Space</h2>
              <p className="text-slate-600 max-w-md mx-auto">
                Give your family a name to personalize the coaching experience.
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-6">
              <div className="space-y-3">
                <Label htmlFor="family-name" className="text-base font-medium text-slate-900">
                  Family Name
                </Label>
                <Input
                  id="family-name"
                  placeholder="The Johnson Family"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="h-12 text-base"
                />
                <p className="text-sm text-slate-500">
                  This helps us create a welcoming environment for your family's coaching journey.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-900">What happens next?</p>
                    <p className="text-xs text-slate-600">
                      After setup, you'll add child profiles from your dashboard. Each child gets personalized coaching based on their unique patterns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'preferences':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 py-8"
          >
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-xl bg-slate-100 flex items-center justify-center">
                <Brain className="w-7 h-7 text-slate-700" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Coaching Preferences</h2>
              <p className="text-slate-600 max-w-md mx-auto">
                Configure how Offscreen supports your children's growth.
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-6">
              <div className="p-5 border rounded-xl bg-white space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-slate-600" />
                      <Label className="text-base font-semibold text-slate-900">AI-Powered Coaching</Label>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Enable intelligent pattern detection, personalized reflection prompts, and adaptive guidance.
                    </p>
                  </div>
                  <Switch
                    checked={aiEnabled}
                    onCheckedChange={setAiEnabled}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="p-5 border rounded-xl bg-white space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-600" />
                    <Label className="text-base font-semibold text-slate-900">Daily Session Limit</Label>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Maximum coaching sessions per child per day. Helps balance screen time with offline actions.
                  </p>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={sessionLimit}
                    onChange={(e) => setSessionLimit(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                    className="w-20 h-11 text-center text-lg font-semibold"
                  />
                  <span className="text-sm text-slate-600">sessions per day</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border">
                <p className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-medium text-slate-900">Tip:</span> Each session includes reflection prompts and offline action commitments. Quality over quantity helps build lasting habits.
                </p>
              </div>
            </div>
          </motion.div>
        );

      case 'privacy':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 py-8"
          >
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-xl bg-slate-100 flex items-center justify-center">
                <Shield className="w-7 h-7 text-slate-700" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Privacy & Security</h2>
              <p className="text-slate-600 max-w-md mx-auto">
                Your family's data is protected with enterprise-grade security.
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-4">
              <div className="p-5 rounded-xl border bg-white">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-slate-900">End-to-End Protection</h3>
                    <p className="text-sm text-slate-600">
                      All data is encrypted in transit and at rest. We never sell or share your family's information.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl border bg-white">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-slate-900">Child-Safe by Design</h3>
                    <p className="text-sm text-slate-600">
                      Children never see analytics or pattern data. Only parents access insights through the secure dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl border bg-white">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-slate-900">Patterns, Not Diagnoses</h3>
                    <p className="text-sm text-slate-600">
                      Our AI detects behavioral patterns to guide coaching—not to label or diagnose. This is about growth, not judgment.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border mt-6">
                <p className="text-xs text-slate-600 text-center leading-relaxed">
                  By continuing, you agree to our Terms of Service and Privacy Policy. You can delete your data at any time.
                </p>
              </div>
            </div>
          </motion.div>
        );

      case 'complete':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8 py-12"
          >
            <motion.div
              className="relative mx-auto"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl mx-auto">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <motion.div
                className="absolute -inset-3 bg-gradient-to-br from-green-200 to-emerald-200 rounded-2xl -z-10 opacity-30"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>

            <div className="space-y-4 max-w-xl mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-slate-900"
              >
                Your Family Space is Ready
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-slate-600"
              >
                Everything is set up. Head to your dashboard to add children and start their coaching journey.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-md mx-auto"
            >
              <div className="p-6 rounded-xl border bg-white text-left space-y-4">
                <h3 className="font-semibold text-slate-900 text-center mb-4">What's Next</h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-slate-700">Family space created</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-slate-700">AI coaching configured</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-slate-700">Privacy settings enabled</span>
                  </div>
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Users className="w-3 h-3 text-slate-600" />
                    </div>
                    <span className="text-sm text-slate-900 font-medium">Add children in your dashboard</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Target className="w-3 h-3 text-slate-600" />
                    </div>
                    <span className="text-sm text-slate-900 font-medium">Start first coaching session</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-xl">
        <CardContent className="p-0">
          {/* Progress Bar */}
          <div className="px-8 pt-8 pb-6 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-900">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <span className="text-xs text-slate-500">
                {Math.round(((currentStepIndex + 1) / steps.length) * 100)}% complete
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-slate-700 to-slate-900 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8 min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-8 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-900 font-medium">Setup Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setError(null)}
                className="mt-3"
              >
                Dismiss
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="px-8 pb-8 flex justify-between items-center border-t border-slate-100 pt-6">
            {currentStepIndex > 0 ? (
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(steps[currentStepIndex - 1])}
                disabled={isSubmitting}
                className="text-slate-600 hover:text-slate-900"
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep === 'complete' ? (
              <Button
                onClick={handleComplete}
                disabled={isSubmitting}
                size="lg"
                className="bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 min-w-[200px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {setupStep || 'Setting up...'}
                  </>
                ) : (
                  <>
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={isSubmitting || (currentStep === 'family-setup' && !familyName.trim())}
                size="lg"
                className="bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
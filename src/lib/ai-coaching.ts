import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

let openrouter: ReturnType<typeof createOpenRouter> | null = null;

function getOpenRouter() {
  if (!openrouter && process.env.OPENROUTER_API_KEY) {
    openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });
  }
  return openrouter;
}

export interface CoachingAnalysis {
  aiResponse: string;
  detectedPattern:
  | 'avoidance_loop'
  | 'impulsivity_overrun'
  | 'perfection_paralysis'
  | null;
  patternConfidence: number;
  offlineActions: string[];
  emotionalTone: 'positive' | 'neutral' | 'challenging';
  engagementLevel: 'high' | 'medium' | 'low';
}

export async function analyzeChildReflection(
  childResponse: string,
  childAge?: string,
  previousPatterns?: string[]
): Promise<CoachingAnalysis> {
  if (!process.env.OPENROUTER_API_KEY) {
    // Fallback to mock analysis if no API key
    return getMockAnalysis(childResponse);
  }

  try {
    const ageContext = childAge
      ? `The child is approximately ${childAge} years old.`
      : '';
    const patternContext = previousPatterns?.length
      ? `Previous patterns observed: ${previousPatterns.join(', ')}.`
      : '';

    const openrouterInstance = getOpenRouter();
    if (!openrouterInstance) {
      return getMockAnalysis(childResponse);
    }

    const { text } = await generateText({
      model: openrouterInstance.chat('openai/gpt-oss-20b:free'),
      prompt: `
You are an expert child psychologist and AI coaching assistant. Analyze the following child response and provide detailed, age-appropriate coaching feedback.

Child's response: "${childResponse}"

${ageContext}
${patternContext}

Please provide a JSON response with the following structure:
{
  "aiResponse": "A supportive, encouraging response that validates their feelings and gently guides them toward positive patterns",
  "detectedPattern": "avoidance_loop" | "impulsivity_overrun" | "perfection_paralysis" | null,
  "patternConfidence": 0-1 (confidence level of the pattern detection),
  "offlineActions": ["3-5 specific, actionable suggestions for offline activities"],
  "emotionalTone": "positive" | "neutral" | "challenging",
  "engagementLevel": "high" | "medium" | "low"
}

Guidelines:
- Keep language simple and encouraging
- Focus on emotional validation first
- Suggest concrete, achievable actions
- Adapt suggestions to child's apparent age and maturity level
- If no clear pattern, set detectedPattern to null
- Always provide helpful offline actions regardless of pattern detection
`,
      temperature: 0.7,
    });

    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsedResult = JSON.parse(cleanedText);

    // Validate and ensure all required fields
    return {
      aiResponse:
        parsedResult.aiResponse ||
        "Thank you for sharing. I'm here to help you work through your feelings.",
      detectedPattern: parsedResult.detectedPattern || null,
      patternConfidence: Math.max(
        0,
        Math.min(1, parsedResult.patternConfidence || 0)
      ),
      offlineActions: Array.isArray(parsedResult.offlineActions)
        ? parsedResult.offlineActions.slice(0, 5)
        : [],
      emotionalTone: ['positive', 'neutral', 'challenging'].includes(
        parsedResult.emotionalTone
      )
        ? parsedResult.emotionalTone
        : 'neutral',
      engagementLevel: ['high', 'medium', 'low'].includes(
        parsedResult.engagementLevel
      )
        ? parsedResult.engagementLevel
        : 'medium',
    };
  } catch (error) {
    console.error('OpenRouter API error:', error);
    // Fallback to mock analysis
    return getMockAnalysis(childResponse);
  }
}

function getMockAnalysis(childResponse: string): CoachingAnalysis {
  const lowerResponse = childResponse.toLowerCase();

  if (
    lowerResponse.includes('procrastin') ||
    lowerResponse.includes('later') ||
    lowerResponse.includes('tomorrow')
  ) {
    return {
      aiResponse:
        "I hear you're feeling hesitant about starting something. That's completely normal! Remember, taking the first small step can make a big difference.",
      detectedPattern: 'avoidance_loop',
      patternConfidence: 0.8,
      offlineActions: [
        'Write down one small task you can do in the next 5 minutes',
        'Set a timer for 2 minutes and start working on it',
        "Tell someone you're going to do this task today",
      ],
      emotionalTone: 'neutral',
      engagementLevel: 'medium',
    };
  }

  if (
    lowerResponse.includes('rush') ||
    lowerResponse.includes('quick') ||
    lowerResponse.includes('impulse') ||
    lowerResponse.includes('regret')
  ) {
    return {
      aiResponse:
        "It sounds like you acted quickly and now you're thinking about it. That's great awareness! Next time, try pausing for a moment to consider your options.",
      detectedPattern: 'impulsivity_overrun',
      patternConfidence: 0.7,
      offlineActions: [
        'Practice deep breathing for 30 seconds before making a decision',
        'Write down pros and cons of your choices',
        "Ask yourself: 'How will I feel about this in an hour?'",
      ],
      emotionalTone: 'challenging',
      engagementLevel: 'high',
    };
  }

  if (
    lowerResponse.includes('perfect') ||
    lowerResponse.includes('not good enough') ||
    lowerResponse.includes('wait') ||
    lowerResponse.includes('right')
  ) {
    return {
      aiResponse:
        "You're being really thoughtful about getting things just right. That's a strength! But sometimes 'good enough' is perfect for starting.",
      detectedPattern: 'perfection_paralysis',
      patternConfidence: 0.9,
      offlineActions: [
        'Set a timer for 10 minutes and work on your task until it goes off',
        "Tell yourself: 'I can always improve it later'",
        'Start with a rough draft or sketch',
      ],
      emotionalTone: 'neutral',
      engagementLevel: 'medium',
    };
  }

  return {
    aiResponse:
      "Thanks for sharing how you're feeling. It's great that you're taking time to reflect on this. Keep being aware of your thoughts and actions!",
    detectedPattern: null,
    patternConfidence: 0,
    offlineActions: [
      "Take a moment to notice what you're feeling right now",
      "Write down one thing you're grateful for today",
      'Do something kind for yourself or someone else',
    ],
    emotionalTone: 'positive',
    engagementLevel: 'low',
  };
}

export async function generatePersonalizedPrompt(
  childAge: string,
  recentPatterns: string[],
  sessionCount: number
): Promise<string> {
  if (!process.env.OPENROUTER_API_KEY) {
    return getDefaultPrompt(childAge);
  }

  try {
    const openrouterInstance = getOpenRouter();
    if (!openrouterInstance) {
      return getDefaultPrompt(childAge);
    }

    const { text } = await generateText({
      model: openrouterInstance.chat('openai/gpt-oss-20b:free'),
      prompt: `
Generate a personalized, age-appropriate reflection prompt for a child in coaching sessions.

Child age range: ${childAge}
Recent patterns observed: ${recentPatterns.join(', ') || 'none'}
Session number: ${sessionCount}

Create a single, engaging question that:
- Is appropriate for their age group
- Builds on previous patterns if any
- Encourages self-reflection
- Uses simple, supportive language
- Is between 10-20 words long

Return only the prompt text, no quotes or explanation.
`,
      temperature: 0.8,
    });

    return text.trim() || getDefaultPrompt(childAge);
  } catch (error) {
    console.error('OpenRouter prompt generation error:', error);
    return getDefaultPrompt(childAge);
  }
}

function getDefaultPrompt(age: string): string {
  const prompts = {
    '6-8': 'What made you feel happy or sad today?',
    '9-11': 'How are you feeling about your school work right now?',
    '12-14': "What's something you're looking forward to this week?",
    '15-17': "What's a challenge you're facing that we could talk about?",
  };

  return (
    prompts[age as keyof typeof prompts] || 'How are you feeling right now?'
  );
}

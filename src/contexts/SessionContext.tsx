import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export type AgeGroup = '6-8' | '9-11' | '12-14' | '15-17';

export type Pattern = 'avoidance_loop' | 'impulsivity_overrun' | 'perfection_paralysis' | 'none';

export type InputMethod = 'text' | 'voice' | 'visual';

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt?: Date;
}

export interface OfflineAction {
  id: string;
  description: string;
  completed: boolean;
  points: number;
}

export interface SessionState {
  ageGroup: AgeGroup;
  currentStep: number;
  totalSteps: number;
  currentPrompt: string;
  userInput: string;
  inputMethod: InputMethod;
  detectedPattern: Pattern;
  feedback: string;
  offlineAction: OfflineAction | null;
  points: number;
  streak: number;
  badges: Badge[];
  level: number;
  isListening: boolean;
  isProcessing: boolean;
  sessionComplete: boolean;
}

type SessionAction =
  | { type: 'SET_AGE_GROUP'; payload: AgeGroup }
  | { type: 'SET_PROMPT'; payload: string }
  | { type: 'SET_USER_INPUT'; payload: string }
  | { type: 'SET_INPUT_METHOD'; payload: InputMethod }
  | { type: 'SET_PATTERN'; payload: Pattern }
  | { type: 'SET_FEEDBACK'; payload: string }
  | { type: 'SET_OFFLINE_ACTION'; payload: OfflineAction }
  | { type: 'COMPLETE_OFFLINE_ACTION' }
  | { type: 'ADD_POINTS'; payload: number }
  | { type: 'INCREMENT_STREAK' }
  | { type: 'UNLOCK_BADGE'; payload: Badge }
  | { type: 'NEXT_STEP' }
  | { type: 'SET_LISTENING'; payload: boolean }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'COMPLETE_SESSION' }
  | { type: 'RESET_SESSION' };

const initialState: SessionState = {
  ageGroup: '9-11',
  currentStep: 1,
  totalSteps: 5,
  currentPrompt: "What's one thing you've been putting off today?",
  userInput: '',
  inputMethod: 'text',
  detectedPattern: 'none',
  feedback: '',
  offlineAction: null,
  points: 0,
  streak: 0,
  badges: [],
  level: 1,
  isListening: false,
  isProcessing: false,
  sessionComplete: false,
};

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'SET_AGE_GROUP':
      return { ...state, ageGroup: action.payload };
    case 'SET_PROMPT':
      return { ...state, currentPrompt: action.payload };
    case 'SET_USER_INPUT':
      return { ...state, userInput: action.payload };
    case 'SET_INPUT_METHOD':
      return { ...state, inputMethod: action.payload };
    case 'SET_PATTERN':
      return { ...state, detectedPattern: action.payload };
    case 'SET_FEEDBACK':
      return { ...state, feedback: action.payload };
    case 'SET_OFFLINE_ACTION':
      return { ...state, offlineAction: action.payload };
    case 'COMPLETE_OFFLINE_ACTION':
      if (!state.offlineAction) return state;
      return {
        ...state,
        offlineAction: { ...state.offlineAction, completed: true },
        points: state.points + state.offlineAction.points,
      };
    case 'ADD_POINTS':
      return { ...state, points: state.points + action.payload };
    case 'INCREMENT_STREAK':
      return { ...state, streak: state.streak + 1 };
    case 'UNLOCK_BADGE':
      return {
        ...state,
        badges: [...state.badges.filter(b => b.id !== action.payload.id), { ...action.payload, unlockedAt: new Date() }],
      };
    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.totalSteps),
        userInput: '',
        feedback: '',
        offlineAction: null,
      };
    case 'SET_LISTENING':
      return { ...state, isListening: action.payload };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    case 'COMPLETE_SESSION':
      return { ...state, sessionComplete: true };
    case 'RESET_SESSION':
      return { ...initialState, ageGroup: state.ageGroup, streak: state.streak, badges: state.badges, points: state.points };
    default:
      return state;
  }
}

const SessionContext = createContext<{
  state: SessionState;
  dispatch: React.Dispatch<SessionAction>;
} | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  return (
    <SessionContext.Provider value={{ state, dispatch }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

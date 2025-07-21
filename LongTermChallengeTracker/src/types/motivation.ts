/**
 * Types for motivation enhancement features
 */

// Mood check types
export type MoodType = 'great' | 'good' | 'tired' | 'unmotivated' | 'stressed';

export interface MoodOption {
  key: string;
  label: string;
  emoji: string;
}

export interface MoodCheck {
  id: string;
  sessionId: string;
  mood: string;
  timestamp: string;
}

// If-Then plan types
export interface IfThenPlan {
  condition: string;
  title: string;
  steps: string[];
  miniTask: MiniTask;
  encouragement: string;
}

// Mini task types
export interface MiniTask {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
}

// If-Then motivation data saved with session
export interface IfThenMotivationData {
  usedIfThenFlow: boolean;
  selectedMood?: string;
  selectedPlan?: string;
  completedMiniTask?: boolean;
}

// Maps mood types to appropriate if-then plans
export interface MoodToPlanMap {
  [key: string]: IfThenPlan[];
}

/**
 * Types for motivation enhancement features
 */

// Mood check types
export type MoodType = 'great' | 'good' | 'tired' | 'unmotivated' | 'stressed';

export interface MoodCheck {
  id: string;
  sessionId: string;
  mood: MoodType;
  selectedPlan: string;
  completed: boolean;
  date: string;
}

// If-Then plan types
export interface IfThenPlan {
  condition: string;
  steps: string[];
  encouragement: string[];
}

// Mini task types
export interface MiniTask {
  id: string;
  sessionId: string;
  taskDuration: number; // in minutes
  completed: boolean;
  timestamp: string;
}

// Maps mood types to appropriate if-then plans
export interface MoodToPlanMap {
  [key: string]: IfThenPlan[];
}

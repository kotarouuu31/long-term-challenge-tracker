export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'duration' | 'streak';
  goal: number; // days for streak, hours for duration
  currentProgress: number; // days for streak, hours for duration
  lastCompletedDate: string | null; // ISO string date
  color: string;
  icon: string;
}

export interface ChallengeLog {
  id: string;
  challengeId: string;
  date: string; // ISO string date
  duration?: number; // in minutes, for duration-based challenges
  notes?: string;
}

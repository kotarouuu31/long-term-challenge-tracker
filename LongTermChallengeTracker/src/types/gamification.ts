export interface PointsTransaction {
  id: string;
  challengeId: string;
  type: 'session' | 'streak' | 'milestone';
  points: number;
  reason: string;
  qualityRating?: number;
  streakDays?: number;
  timestamp: string;
}

export interface StreakData {
  challengeId: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
}

export interface MilestoneReward {
  id: string;
  name: string;
  period: '1week' | '1month' | '3month' | '6month' | '9month' | '1year' | '15month' | '18month' | '21month' | '2year' | '27month' | '30month' | '33month' | '3year' | '3year_perfect';
  points: number;
  requiredDays: number;
  months: number;
  unlockedAt?: string;
}

export interface UserGameStats {
  totalPoints: number;
  pointsTransactions: PointsTransaction[];
  streaks: StreakData[];
  unlockedRewards: string[];
  lastUpdated: string;
}

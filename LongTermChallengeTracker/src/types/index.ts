export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'duration' | 'streak' | 'workout' | 'piano' | 'stretch' | 'dj';
  goal: number; // days for streak, hours for duration
  currentProgress: number; // days for streak, hours for duration
  lastCompletedDate: Date | null;
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reward {
  id: string;
  points: number;
  title: string;
  description: string;
  achieved: boolean;
  achievedAt?: Date;
}

export interface ChallengeLog {
  id: string;
  challengeId: string;
  date: string; // ISO string date
  duration?: number; // in minutes, for duration-based challenges
  notes?: string;
}

// 新しい統合データ構造
export interface IntegratedSession {
  id: string;
  challengeId: string;
  date: string;
  
  // 動機づけデータ
  motivationQuestion: string;
  userMotivation: string;
  aiResponse: string;
  motivationResponse: string; // ユーザーの動機づけ回答
  
  // タイマーデータ
  startTime: string;
  endTime: string;
  plannedDuration: number; // 分単位
  actualDuration: number; // 分単位
  
  // 評価データ
  satisfactionLevel: number; // 1-5
  qualityRating: number; // 1-5
  notes?: string;
  
  // ミニタスクデータ
  sessionSequence: number; // 連続セッション数
  continuedFromPrevious: boolean;
  
  // 分析用データ
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  dayOfWeek: string;
  points: number;
  
  // If-Thenモチベーションフローデータ
  ifThenMotivationData?: {
    usedIfThenFlow: boolean;
    selectedMood?: string;
    selectedPlan?: string;
    completedMiniTask?: boolean;
  };
}

export interface DailyStats {
  date: string;
  totalDuration: number;
  targetDuration?: number; // 目標時間（分単位）
  sessionsCount: number;
  averageSatisfaction: number;
  longestSession: number;
  motivationThemes: string[]; // よく出てくる動機
  pointsEarned: number;
}

export interface WeeklyProgress {
  weekStart: string;
  totalMinutes: number;
  dailyAverage: number;
  improvementRate: number; // 前週比
  consistencyScore: number; // 継続性スコア
  topMotivations: string[]; // 上位の動機
  milestoneProgress: {
    current: number;
    target: number;
    unit: 'days' | 'hours';
  };
}

// モーダル関連の型定義
export type ModalType = 
  | 'motivation' 
  | 'taskPlanning' 
  | 'postPractice' 
  | 'continue' 
  | 'none';

export interface TimerState {
  isRunning: boolean;
  startTime: number | null;
  pauseTime: number | null;
  elapsedTime: number; // ミリ秒
  plannedDuration: number; // ミリ秒
}

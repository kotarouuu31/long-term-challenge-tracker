import { IntegratedSession } from '../types';

export interface Reward {
  id: string;
  title: string;
  description: string;
  type: 'habit' | 'monthly' | 'quarterly' | 'biannual' | 'triannual' | 'annual';
  requiredPoints: number;
  requiredDays?: number;
  icon: string;
  color: string;
}

export interface RewardProgress {
  reward: Reward;
  currentPoints: number;
  currentDays: number;
  isAchieved: boolean;
  progressPercentage: number;
  status: 'achieved' | 'in_progress' | 'locked';
}

export interface PointsHistory {
  date: string;
  points: number;
  challengeName: string;
  sessionDuration: number;
}

// 報酬の定義
export const REWARDS: Reward[] = [
  // 習慣形成報酬 (7日連続)
  {
    id: 'habit_7days',
    title: '習慣の芽',
    description: '7日連続でチャレンジを完了',
    type: 'habit',
    requiredPoints: 70,
    requiredDays: 7,
    icon: '🌱',
    color: '#4CAF50'
  },
  
  // 月間報酬 (30日)
  {
    id: 'monthly_30days',
    title: '月間マスター',
    description: '30日間の継続達成',
    type: 'monthly',
    requiredPoints: 300,
    requiredDays: 30,
    icon: '🏆',
    color: '#FF9800'
  },
  
  // 3ヶ月報酬 (90日)
  {
    id: 'quarterly_90days',
    title: '四季の達人',
    description: '90日間の継続達成',
    type: 'quarterly',
    requiredPoints: 900,
    requiredDays: 90,
    icon: '🎯',
    color: '#2196F3'
  },
  
  // 半年報酬 (180日)
  {
    id: 'biannual_180days',
    title: '半年の戦士',
    description: '180日間の継続達成',
    type: 'biannual',
    requiredPoints: 1800,
    requiredDays: 180,
    icon: '⚔️',
    color: '#9C27B0'
  },
  
  // 9ヶ月報酬 (270日)
  {
    id: 'triannual_270days',
    title: '忍耐の達人',
    description: '270日間の継続達成',
    type: 'triannual',
    requiredPoints: 2700,
    requiredDays: 270,
    icon: '🥋',
    color: '#E91E63'
  },
  
  // 1年報酬 (365日)
  {
    id: 'annual_365days',
    title: '年間チャンピオン',
    description: '365日間の継続達成',
    type: 'annual',
    requiredPoints: 3650,
    requiredDays: 365,
    icon: '👑',
    color: '#FFD700'
  }
];

// ポイント計算関数
export const calculatePoints = (session: IntegratedSession): number => {
  const baseDuration = session.actualDuration;
  const satisfactionBonus = session.satisfactionLevel * 2;
  const qualityBonus = session.qualityRating * 2;
  
  // 基本ポイント: 1分 = 1ポイント
  let points = baseDuration;
  
  // 満足度・品質ボーナス
  points += satisfactionBonus + qualityBonus;
  
  // 連続セッションボーナス
  if (session.continuedFromPrevious) {
    points += Math.floor(points * 0.2); // 20%ボーナス
  }
  
  return Math.round(points);
};

// 累計ポイント計算
export const calculateTotalPoints = (sessions: IntegratedSession[]): number => {
  return sessions.reduce((total, session) => total + session.points, 0);
};

// 報酬進捗計算
export const calculateRewardProgress = (
  sessions: IntegratedSession[],
  totalPoints: number
): RewardProgress[] => {
  const consecutiveDays = calculateConsecutiveDays(sessions);
  
  return REWARDS.map(reward => {
    const currentPoints = totalPoints;
    const currentDays = consecutiveDays;
    
    const pointsAchieved = currentPoints >= reward.requiredPoints;
    const daysAchieved = reward.requiredDays ? currentDays >= reward.requiredDays : true;
    const isAchieved = pointsAchieved && daysAchieved;
    
    let progressPercentage = 0;
    if (reward.requiredDays) {
      const pointsProgress = Math.min(currentPoints / reward.requiredPoints, 1);
      const daysProgress = Math.min(currentDays / reward.requiredDays, 1);
      progressPercentage = Math.min(pointsProgress, daysProgress) * 100;
    } else {
      progressPercentage = Math.min(currentPoints / reward.requiredPoints, 1) * 100;
    }
    
    let status: 'achieved' | 'in_progress' | 'locked' = 'locked';
    if (isAchieved) {
      status = 'achieved';
    } else if (progressPercentage > 0) {
      status = 'in_progress';
    }
    
    return {
      reward,
      currentPoints,
      currentDays,
      isAchieved,
      progressPercentage,
      status
    };
  });
};

// 連続日数計算
export const calculateConsecutiveDays = (sessions: IntegratedSession[]): number => {
  if (sessions.length === 0) return 0;
  
  // セッションを日付でソート
  const sortedSessions = sessions.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // 各日の最初のセッションのみを取得
  const dailySessions = new Map<string, IntegratedSession>();
  sortedSessions.forEach(session => {
    const dateKey = session.date.split('T')[0];
    if (!dailySessions.has(dateKey)) {
      dailySessions.set(dateKey, session);
    }
  });
  
  const uniqueDays = Array.from(dailySessions.keys()).sort();
  
  if (uniqueDays.length === 0) return 0;
  
  let consecutiveDays = 1;
  let maxConsecutiveDays = 1;
  
  for (let i = 1; i < uniqueDays.length; i++) {
    const prevDate = new Date(uniqueDays[i - 1]);
    const currentDate = new Date(uniqueDays[i]);
    const diffTime = currentDate.getTime() - prevDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      consecutiveDays++;
      maxConsecutiveDays = Math.max(maxConsecutiveDays, consecutiveDays);
    } else {
      consecutiveDays = 1;
    }
  }
  
  return maxConsecutiveDays;
};

// 最近のポイント履歴取得
export const getRecentPointsHistory = (
  sessions: IntegratedSession[],
  limit: number = 10
): PointsHistory[] => {
  return sessions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
    .map(session => ({
      date: session.date,
      points: session.points,
      challengeName: getChallengeNameById(session.challengeId),
      sessionDuration: session.actualDuration
    }));
};

// チャレンジ名取得（仮実装）
const getChallengeNameById = (challengeId: string): string => {
  const challengeNames: { [key: string]: string } = {
    'workout': '筋トレ',
    'piano': 'ピアノ練習',
    'stretch': 'ストレッチ',
    'dj': 'DJ練習'
  };
  return challengeNames[challengeId] || 'チャレンジ';
};

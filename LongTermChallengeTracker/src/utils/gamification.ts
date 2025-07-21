import { IntegratedSession } from '../types';
import { PointsTransaction, UserGameStats, StreakData } from '../types/gamification';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Reward {
  id: string;
  title: string;
  description: string;
  type: 'habit' | 'monthly' | 'quarterly' | 'biannual' | 'triannual' | 'annual' | 'extended' | 'biennial' | 'triennial' | 'perfect';
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

// 報酬の定義（15段階システム）
export const REWARDS: Reward[] = [
  // 1. 習慣形成（1週間）
  {
    id: 'habit_1week',
    title: '習慣の芽',
    description: '1週間の継続達成',
    type: 'habit',
    requiredPoints: 100,
    requiredDays: 7,
    icon: '🌱',
    color: '#4CAF50'
  },
  
  // 2. 月間（1ヶ月）
  {
    id: 'monthly_1month',
    title: '月間マスター',
    description: '1ヶ月の継続達成',
    type: 'monthly',
    requiredPoints: 500,
    requiredDays: 30,
    icon: '🏆',
    color: '#FF9800'
  },
  
  // 3. 3ヶ月
  {
    id: 'quarterly_3months',
    title: '四季の達人',
    description: '3ヶ月の継続達成',
    type: 'quarterly',
    requiredPoints: 1500,
    requiredDays: 90,
    icon: '🎯',
    color: '#2196F3'
  },
  
  // 4. 半年（6ヶ月）
  {
    id: 'biannual_6months',
    title: '半年の戦士',
    description: '6ヶ月の継続達成',
    type: 'biannual',
    requiredPoints: 3000,
    requiredDays: 180,
    icon: '⚔️',
    color: '#9C27B0'
  },
  
  // 5. 9ヶ月
  {
    id: 'triannual_9months',
    title: '忍耐の達人',
    description: '9ヶ月の継続達成',
    type: 'triannual',
    requiredPoints: 5000,
    requiredDays: 270,
    icon: '🥋',
    color: '#E91E63'
  },
  
  // 6. 1年
  {
    id: 'annual_1year',
    title: '年間チャンピオン',
    description: '1年の継続達成',
    type: 'annual',
    requiredPoints: 10000,
    requiredDays: 365,
    icon: '👑',
    color: '#FFD700'
  },
  
  // 7. 1年3ヶ月（15ヶ月）
  {
    id: 'extended_15months',
    title: '継続の王者',
    description: '1年3ヶ月の継続達成',
    type: 'extended',
    requiredPoints: 12000,
    requiredDays: 450,
    icon: '🔥',
    color: '#FF5722'
  },
  
  // 8. 1年半（18ヶ月）
  {
    id: 'extended_18months',
    title: '不屈の精神',
    description: '1年半の継続達成',
    type: 'extended',
    requiredPoints: 15000,
    requiredDays: 540,
    icon: '💎',
    color: '#00BCD4'
  },
  
  // 9. 1年9ヶ月（21ヶ月）
  {
    id: 'extended_21months',
    title: '鉄の意志',
    description: '1年9ヶ月の継続達成',
    type: 'extended',
    requiredPoints: 18000,
    requiredDays: 630,
    icon: '🛡️',
    color: '#607D8B'
  },
  
  // 10. 2年（24ヶ月）
  {
    id: 'biennial_2years',
    title: '2年の覇者',
    description: '2年の継続達成',
    type: 'biennial',
    requiredPoints: 25000,
    requiredDays: 730,
    icon: '⭐',
    color: '#FFC107'
  },
  
  // 11. 2年3ヶ月（27ヶ月）
  {
    id: 'extended_27months',
    title: '超越者',
    description: '2年3ヶ月の継続達成',
    type: 'extended',
    requiredPoints: 30000,
    requiredDays: 810,
    icon: '🌟',
    color: '#3F51B5'
  },
  
  // 12. 2年半（30ヶ月）
  {
    id: 'extended_30months',
    title: '究極の継続者',
    description: '2年半の継続達成',
    type: 'extended',
    requiredPoints: 35000,
    requiredDays: 900,
    icon: '🚀',
    color: '#673AB7'
  },
  
  // 13. 2年9ヶ月（33ヶ月）
  {
    id: 'extended_33months',
    title: '伝説の挑戦者',
    description: '2年9ヶ月の継続達成',
    type: 'extended',
    requiredPoints: 42000,
    requiredDays: 990,
    icon: '🏅',
    color: '#795548'
  },
  
  // 14. 3年（36ヶ月）
  {
    id: 'triennial_3years',
    title: '3年の偉業',
    description: '3年の継続達成',
    type: 'triennial',
    requiredPoints: 50000,
    requiredDays: 1095,
    icon: '🎖️',
    color: '#FF1744'
  },
  
  // 15. 3年完全達成
  {
    id: 'perfect_3years',
    title: '完全なる達成者',
    description: '3年完全達成（月平均20日以上）',
    type: 'perfect',
    requiredPoints: 100000,
    requiredDays: 1095,
    icon: '🏆',
    color: '#C62828'
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

// 月平均活動日数計算
export const calculateMonthlyAverageDays = (sessions: IntegratedSession[]): number => {
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
  
  // 最初と最後の日付から経過月数を計算
  const startDate = new Date(uniqueDays[0]);
  const endDate = new Date(uniqueDays[uniqueDays.length - 1]);
  
  const monthsDiff = ((endDate.getFullYear() - startDate.getFullYear()) * 12) + 
                    (endDate.getMonth() - startDate.getMonth()) + 1;
  
  return uniqueDays.length / monthsDiff;
};

// 報酬進捗計算
export const calculateRewardProgress = (
  sessions: IntegratedSession[],
  totalPoints: number
): RewardProgress[] => {
  const consecutiveDays = calculateConsecutiveDays(sessions);
  const monthlyAverageDays = calculateMonthlyAverageDays(sessions);
  
  return REWARDS.map(reward => {
    const currentPoints = totalPoints;
    const currentDays = consecutiveDays;
    
    let pointsAchieved = currentPoints >= reward.requiredPoints;
    let daysAchieved = reward.requiredDays ? currentDays >= reward.requiredDays : true;
    
    // 3年完全達成の特別条件
    if (reward.type === 'perfect') {
      const monthlyAverageAchieved = monthlyAverageDays >= 20;
      daysAchieved = daysAchieved && monthlyAverageAchieved;
    }
    
    const isAchieved = pointsAchieved && daysAchieved;
    
    let progressPercentage = 0;
    if (reward.requiredDays) {
      const pointsProgress = Math.min(currentPoints / reward.requiredPoints, 1);
      let daysProgress = Math.min(currentDays / reward.requiredDays, 1);
      
      // 3年完全達成の場合は月平均も考慮
      if (reward.type === 'perfect') {
        const monthlyProgress = Math.min(monthlyAverageDays / 20, 1);
        daysProgress = Math.min(daysProgress, monthlyProgress);
      }
      
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

// AsyncStorage キー定義
const STORAGE_KEYS = {
  POINTS_TRANSACTIONS: '@points_transactions',
  USER_GAME_STATS: '@user_game_stats',
  STREAK_DATA: '@streak_data'
};

// ポイント取引を保存
export const savePointsTransaction = async (transaction: PointsTransaction): Promise<void> => {
  try {
    const existingTransactions = await getPointsTransactions();
    const updatedTransactions = [...existingTransactions, transaction];
    await AsyncStorage.setItem(STORAGE_KEYS.POINTS_TRANSACTIONS, JSON.stringify(updatedTransactions));
  } catch (error) {
    console.error('ポイント取引の保存に失敗しました:', error);
  }
};

// ポイント取引履歴を取得
export const getPointsTransactions = async (): Promise<PointsTransaction[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.POINTS_TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('ポイント取引履歴の取得に失敗しました:', error);
    return [];
  }
};

// ユーザーゲーム統計を保存
export const saveUserGameStats = async (stats: UserGameStats): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_GAME_STATS, JSON.stringify(stats));
  } catch (error) {
    console.error('ユーザーゲーム統計の保存に失敗しました:', error);
  }
};

// ユーザーゲーム統計を取得
export const getUserGameStats = async (): Promise<UserGameStats> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_GAME_STATS);
    if (data) {
      return JSON.parse(data);
    }
    // デフォルト値
    return {
      totalPoints: 0,
      pointsTransactions: [],
      streaks: [],
      unlockedRewards: [],
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('ユーザーゲーム統計の取得に失敗しました:', error);
    return {
      totalPoints: 0,
      pointsTransactions: [],
      streaks: [],
      unlockedRewards: [],
      lastUpdated: new Date().toISOString()
    };
  }
};

// ストリークデータを保存
export const saveStreakData = async (streakData: StreakData[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.STREAK_DATA, JSON.stringify(streakData));
  } catch (error) {
    console.error('ストリークデータの保存に失敗しました:', error);
  }
};

// ストリークデータを取得
export const getStreakData = async (): Promise<StreakData[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.STREAK_DATA);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('ストリークデータの取得に失敗しました:', error);
    return [];
  }
};

// チャレンジの現在のストリーク日数を取得
export const getCurrentStreak = async (challengeId: string): Promise<number> => {
  try {
    const streakData = await getStreakData();
    const challengeStreak = streakData.find(streak => streak.challengeId === challengeId);
    return challengeStreak ? challengeStreak.currentStreak : 0;
  } catch (error) {
    console.error('現在のストリーク取得に失敗しました:', error);
    return 0;
  }
};

// ストリークを更新
export const updateStreak = async (challengeId: string): Promise<number> => {
  try {
    const streakData = await getStreakData();
    const today = new Date().toISOString().split('T')[0];
    
    const existingStreakIndex = streakData.findIndex(streak => streak.challengeId === challengeId);
    
    if (existingStreakIndex >= 0) {
      const existingStreak = streakData[existingStreakIndex];
      const lastActiveDate = new Date(existingStreak.lastActiveDate);
      const todayDate = new Date(today);
      const diffTime = todayDate.getTime() - lastActiveDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // 連続日
        existingStreak.currentStreak += 1;
        existingStreak.longestStreak = Math.max(existingStreak.longestStreak, existingStreak.currentStreak);
      } else if (diffDays === 0) {
        // 同日（ストリーク変更なし）
      } else {
        // ストリーク途切れ
        existingStreak.currentStreak = 1;
      }
      existingStreak.lastActiveDate = today;
      streakData[existingStreakIndex] = existingStreak;
    } else {
      // 新しいチャレンジ
      streakData.push({
        challengeId,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today
      });
    }
    
    await saveStreakData(streakData);
    const updatedStreak = streakData.find(streak => streak.challengeId === challengeId);
    return updatedStreak ? updatedStreak.currentStreak : 1;
  } catch (error) {
    console.error('ストリーク更新に失敗しました:', error);
    return 1;
  }
};

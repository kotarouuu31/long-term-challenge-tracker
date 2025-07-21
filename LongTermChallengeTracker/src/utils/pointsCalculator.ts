import { PointsTransaction, MilestoneReward } from '../types/gamification';

/**
 * 品質評価別ポイント計算
 * @param qualityRating 品質評価（1-5）
 * @returns 計算されたポイント
 */
export const calculateSessionPoints = (qualityRating: number): number => {
  const pointsMap: { [key: number]: number } = {
    1: 2,
    2: 4,
    3: 6,
    4: 8,
    5: 10
  };
  
  return pointsMap[qualityRating] || 0;
};

/**
 * 連続日数ボーナス計算
 * @param streakDays 連続日数
 * @returns ボーナスポイント
 */
export const calculateStreakBonus = (streakDays: number): number => {
  if (streakDays >= 30) return 30;
  if (streakDays >= 21) return 21;
  if (streakDays >= 14) return 14;
  if (streakDays >= 10) return 10;
  if (streakDays >= 7) return 7;
  if (streakDays >= 5) return 5;
  if (streakDays >= 3) return 3;
  if (streakDays >= 2) return 2;
  return 0;
};

/**
 * 15段階のマイルストーン報酬定義
 */
const MILESTONE_REWARDS: MilestoneReward[] = [
  {
    id: 'milestone_1week',
    name: '習慣の芽',
    period: '1week',
    points: 100,
    requiredDays: 7,
    months: 0.25
  },
  {
    id: 'milestone_1month',
    name: '月間マスター',
    period: '1month',
    points: 500,
    requiredDays: 30,
    months: 1
  },
  {
    id: 'milestone_3month',
    name: '四季の達人',
    period: '3month',
    points: 1500,
    requiredDays: 90,
    months: 3
  },
  {
    id: 'milestone_6month',
    name: '半年の戦士',
    period: '6month',
    points: 3000,
    requiredDays: 180,
    months: 6
  },
  {
    id: 'milestone_9month',
    name: '忍耐の達人',
    period: '9month',
    points: 5000,
    requiredDays: 270,
    months: 9
  },
  {
    id: 'milestone_1year',
    name: '年間チャンピオン',
    period: '1year',
    points: 10000,
    requiredDays: 365,
    months: 12
  },
  {
    id: 'milestone_15month',
    name: '継続の王者',
    period: '15month',
    points: 12000,
    requiredDays: 450,
    months: 15
  },
  {
    id: 'milestone_18month',
    name: '不屈の精神',
    period: '18month',
    points: 15000,
    requiredDays: 540,
    months: 18
  },
  {
    id: 'milestone_21month',
    name: '鉄の意志',
    period: '21month',
    points: 18000,
    requiredDays: 630,
    months: 21
  },
  {
    id: 'milestone_2year',
    name: '2年の覇者',
    period: '2year',
    points: 25000,
    requiredDays: 730,
    months: 24
  },
  {
    id: 'milestone_27month',
    name: '超越者',
    period: '27month',
    points: 30000,
    requiredDays: 810,
    months: 27
  },
  {
    id: 'milestone_30month',
    name: '究極の継続者',
    period: '30month',
    points: 35000,
    requiredDays: 900,
    months: 30
  },
  {
    id: 'milestone_33month',
    name: '伝説の挑戦者',
    period: '33month',
    points: 42000,
    requiredDays: 990,
    months: 33
  },
  {
    id: 'milestone_3year',
    name: '3年の偉業',
    period: '3year',
    points: 50000,
    requiredDays: 1095,
    months: 36
  },
  {
    id: 'milestone_3year_perfect',
    name: '完全なる達成者',
    period: '3year_perfect',
    points: 100000,
    requiredDays: 1095,
    months: 36
  }
];

/**
 * 期間別報酬判定
 * @param challengeId チャレンジID
 * @param totalDays 総継続日数
 * @param months 継続月数
 * @returns 達成可能なマイルストーン報酬の配列
 */
export const checkMilestoneRewards = (
  challengeId: string,
  totalDays: number,
  months: number
): MilestoneReward[] => {
  return MILESTONE_REWARDS.filter(reward => {
    // 基本条件：必要日数と月数を満たしているか
    const daysCondition = totalDays >= reward.requiredDays;
    const monthsCondition = months >= reward.months;
    
    // 3年完全達成の特別条件（月平均20日以上）
    if (reward.period === '3year_perfect') {
      const monthlyAverage = totalDays / months;
      const perfectCondition = monthlyAverage >= 20;
      return daysCondition && monthsCondition && perfectCondition;
    }
    
    return daysCondition && monthsCondition;
  });
};

/**
 * 全取引からの累計ポイント計算
 * @param transactions ポイント取引の配列
 * @returns 累計ポイント
 */
export const calculateTotalPoints = (transactions: PointsTransaction[]): number => {
  return transactions.reduce((total, transaction) => {
    return total + transaction.points;
  }, 0);
};

/**
 * セッション完了時の総ポイント計算
 * @param qualityRating 品質評価（1-5）
 * @param streakDays 連続日数
 * @param sessionDuration セッション時間（分）
 * @returns 総獲得ポイント
 */
export const calculateSessionTotalPoints = (
  qualityRating: number,
  streakDays: number,
  sessionDuration: number = 0
): number => {
  const basePoints = sessionDuration; // 1分 = 1ポイント
  const qualityPoints = calculateSessionPoints(qualityRating);
  const streakBonus = calculateStreakBonus(streakDays);
  
  return basePoints + qualityPoints + streakBonus;
};

/**
 * ポイント取引を作成
 * @param challengeId チャレンジID
 * @param type 取引タイプ
 * @param points ポイント数
 * @param reason 理由
 * @param qualityRating 品質評価（オプション）
 * @param streakDays 連続日数（オプション）
 * @returns ポイント取引オブジェクト
 */
export const createPointsTransaction = (
  challengeId: string,
  type: 'session' | 'streak' | 'milestone',
  points: number,
  reason: string,
  qualityRating?: number,
  streakDays?: number
): PointsTransaction => {
  return {
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    challengeId,
    type,
    points,
    reason,
    qualityRating,
    streakDays,
    timestamp: new Date().toISOString()
  };
};

/**
 * 月平均活動日数を計算
 * @param totalDays 総活動日数
 * @param months 継続月数
 * @returns 月平均活動日数
 */
export const calculateMonthlyAverage = (totalDays: number, months: number): number => {
  if (months === 0) return 0;
  return totalDays / months;
};

/**
 * 次のマイルストーン報酬を取得
 * @param currentDays 現在の継続日数
 * @param currentMonths 現在の継続月数
 * @returns 次に達成可能なマイルストーン報酬
 */
export const getNextMilestone = (
  currentDays: number,
  currentMonths: number
): MilestoneReward | null => {
  const unachievedRewards = MILESTONE_REWARDS.filter(reward => {
    if (reward.period === '3year_perfect') {
      const monthlyAverage = currentDays / Math.max(currentMonths, 1);
      return currentDays < reward.requiredDays || 
             currentMonths < reward.months || 
             monthlyAverage < 20;
    }
    return currentDays < reward.requiredDays || currentMonths < reward.months;
  });
  
  return unachievedRewards.length > 0 ? unachievedRewards[0] : null;
};

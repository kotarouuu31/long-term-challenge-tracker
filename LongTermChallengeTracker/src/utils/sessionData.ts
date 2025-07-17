import AsyncStorage from '@react-native-async-storage/async-storage';
import { IntegratedSession, DailyStats, WeeklyProgress } from '../types';
import { v4 as uuidv4 } from 'uuid';

const SESSIONS_STORAGE_KEY = 'integrated_sessions';
const DAILY_STATS_STORAGE_KEY = 'daily_stats';
const WEEKLY_PROGRESS_STORAGE_KEY = 'weekly_progress';

// セッションデータの保存と取得
export const saveSessions = async (sessions: IntegratedSession[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving sessions:', error);
    throw error;
  }
};

export const loadSessions = async (): Promise<IntegratedSession[]> => {
  try {
    const data = await AsyncStorage.getItem(SESSIONS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading sessions:', error);
    return [];
  }
};

// 新しいセッションの作成
export const createSession = async (
  challengeId: string,
  motivationQuestion: string,
  userMotivation: string,
  aiResponse: string,
  plannedDuration: number
): Promise<IntegratedSession> => {
  const now = new Date();
  const timeOfDay = getTimeOfDay(now);
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
  
  // 前回のセッションを確認して連続セッション数を決定
  const sessions = await loadSessions();
  const todaySessions = sessions.filter(
    s => s.challengeId === challengeId && 
    new Date(s.date).toDateString() === now.toDateString()
  );
  
  const sessionSequence = todaySessions.length + 1;
  const continuedFromPrevious = todaySessions.length > 0;
  
  const newSession: IntegratedSession = {
    id: uuidv4(),
    challengeId,
    date: now.toISOString(),
    
    motivationQuestion,
    userMotivation,
    aiResponse,
    motivationResponse: userMotivation, // 動機づけ回答を設定
    
    startTime: now.toISOString(),
    endTime: '', // 終了時に設定
    plannedDuration, // 分単位
    actualDuration: 0, // 終了時に計算
    
    satisfactionLevel: 0, // 練習後に設定
    qualityRating: 0, // 練習後に設定
    notes: '',
    
    sessionSequence,
    continuedFromPrevious,
    
    timeOfDay,
    dayOfWeek,
    points: 0, // 終了時に計算
  };
  
  // セッションを保存
  await saveSessions([...sessions, newSession]);
  
  return newSession;
};

// セッションの完了
export const completeSession = async (
  sessionId: string, 
  actualDuration: number,
  satisfactionLevel: number,
  qualityRating: number,
  notes?: string
): Promise<IntegratedSession> => {
  const sessions = await loadSessions();
  const sessionIndex = sessions.findIndex(s => s.id === sessionId);
  
  if (sessionIndex === -1) {
    throw new Error('Session not found');
  }
  
  const session = sessions[sessionIndex];
  const endTime = new Date().toISOString();
  
  // ポイント計算（基本点 + 満足度ボーナス + 品質ボーナス + 継続ボーナス）
  const basePoints = Math.floor(actualDuration / 5); // 5分ごとに1ポイント
  const satisfactionBonus = satisfactionLevel;
  const qualityBonus = qualityRating;
  const continuityBonus = session.continuedFromPrevious ? 3 : 0;
  
  const points = basePoints + satisfactionBonus + qualityBonus + continuityBonus;
  
  // セッションを更新
  const updatedSession: IntegratedSession = {
    ...session,
    endTime,
    actualDuration,
    satisfactionLevel,
    qualityRating,
    notes: notes || '',
    points,
  };
  
  sessions[sessionIndex] = updatedSession;
  await saveSessions(sessions);
  
  // 統計データを更新
  await updateDailyStats(updatedSession);
  await updateWeeklyProgress();
  
  return updatedSession;
};

// 日次統計の更新
export const updateDailyStats = async (newSession: IntegratedSession): Promise<DailyStats> => {
  try {
    const today = new Date(newSession.date).toISOString().split('T')[0];
    const sessions = await loadSessions();
    const todaySessions = sessions.filter(
      s => new Date(s.date).toISOString().split('T')[0] === today
    );
    
    // 既存の統計データを取得
    const stats = await loadDailyStats();
    const existingStatIndex = stats.findIndex(s => s.date === today);
    
    // 今日の統計を計算
    const totalDuration = todaySessions.reduce((sum, s) => sum + s.actualDuration, 0);
    const sessionsCount = todaySessions.length;
    const completedSessions = todaySessions.filter(s => s.actualDuration > 0);
    const averageSatisfaction = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + s.satisfactionLevel, 0) / completedSessions.length
      : 0;
    const longestSession = Math.max(...completedSessions.map(s => s.actualDuration), 0);
    const motivationThemes = extractMotivationThemes(todaySessions);
    const pointsEarned = todaySessions.reduce((sum, s) => sum + s.points, 0);
    
    const dailyStat: DailyStats = {
      date: today,
      totalDuration,
      sessionsCount,
      averageSatisfaction,
      longestSession,
      motivationThemes,
      pointsEarned,
    };
    
    // 統計を保存
    if (existingStatIndex >= 0) {
      stats[existingStatIndex] = dailyStat;
    } else {
      stats.push(dailyStat);
    }
    
    await saveDailyStats(stats);
    return dailyStat;
  } catch (error) {
    console.error('Error updating daily stats:', error);
    throw error;
  }
};

// 週間進捗の更新
export const updateWeeklyProgress = async (): Promise<WeeklyProgress[]> => {
  try {
    const sessions = await loadSessions();
    const dailyStats = await loadDailyStats();
    
    // 週ごとにグループ化
    const weeklyData: Record<string, {
      sessions: IntegratedSession[],
      stats: DailyStats[]
    }> = {};
    
    // 現在の週の開始日を取得
    const getWeekStart = (dateStr: string) => {
      const date = new Date(dateStr);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // 月曜日を週の始まりとする
      const weekStart = new Date(date.setDate(diff));
      return weekStart.toISOString().split('T')[0];
    };
    
    // セッションを週ごとに分類
    sessions.forEach(session => {
      const weekStart = getWeekStart(session.date);
      if (!weeklyData[weekStart]) {
        weeklyData[weekStart] = { sessions: [], stats: [] };
      }
      weeklyData[weekStart].sessions.push(session);
    });
    
    // 統計データを週ごとに分類
    dailyStats.forEach(stat => {
      const weekStart = getWeekStart(stat.date);
      if (!weeklyData[weekStart]) {
        weeklyData[weekStart] = { sessions: [], stats: [] };
      }
      weeklyData[weekStart].stats.push(stat);
    });
    
    // 週間進捗データを作成
    const weeklyProgress: WeeklyProgress[] = Object.entries(weeklyData).map(([weekStart, data]) => {
      const { sessions, stats } = data;
      
      const totalMinutes = stats.reduce((sum, s) => sum + s.totalDuration, 0);
      const daysWithActivity = new Set(stats.map(s => s.date)).size;
      const dailyAverage = daysWithActivity > 0 ? totalMinutes / daysWithActivity : 0;
      
      // 前週のデータを取得して改善率を計算
      const prevWeekStart = getPreviousWeekStart(weekStart);
      const prevWeekData = weeklyData[prevWeekStart];
      const prevWeekMinutes = prevWeekData 
        ? prevWeekData.stats.reduce((sum, s) => sum + s.totalDuration, 0)
        : 0;
      
      const improvementRate = prevWeekMinutes > 0
        ? ((totalMinutes - prevWeekMinutes) / prevWeekMinutes) * 100
        : 0;
      
      // 継続性スコアを計算（週7日のうち何日活動したか）
      const consistencyScore = (daysWithActivity / 7) * 100;
      
      // 上位の動機を抽出
      const allMotivations = sessions
        .map(s => s.userMotivation)
        .filter(Boolean);
      
      const motivationCounts: Record<string, number> = {};
      allMotivations.forEach(m => {
        motivationCounts[m] = (motivationCounts[m] || 0) + 1;
      });
      
      const topMotivations = Object.entries(motivationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([motivation]) => motivation);
      
      // マイルストーン進捗を計算
      // ここでは単純に週間の合計時間を目標に対する進捗として使用
      const milestoneProgress = {
        current: totalMinutes / 60, // 時間単位に変換
        target: 10, // 仮の目標値
        unit: 'hours' as const,
      };
      
      return {
        weekStart,
        totalMinutes,
        dailyAverage,
        improvementRate,
        consistencyScore,
        topMotivations,
        milestoneProgress,
      };
    });
    
    // 週間進捗を日付順にソートして保存
    const sortedProgress = weeklyProgress.sort((a, b) => 
      new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime()
    );
    
    await saveWeeklyProgress(sortedProgress);
    return sortedProgress;
  } catch (error) {
    console.error('Error updating weekly progress:', error);
    throw error;
  }
};

// 日次統計データの保存と取得
export const saveDailyStats = async (stats: DailyStats[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(DAILY_STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving daily stats:', error);
    throw error;
  }
};

export const loadDailyStats = async (): Promise<DailyStats[]> => {
  try {
    const data = await AsyncStorage.getItem(DAILY_STATS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading daily stats:', error);
    return [];
  }
};

// 週間進捗データの保存と取得
export const saveWeeklyProgress = async (progress: WeeklyProgress[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(WEEKLY_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving weekly progress:', error);
    throw error;
  }
};

export const loadWeeklyProgress = async (): Promise<WeeklyProgress[]> => {
  try {
    const data = await AsyncStorage.getItem(WEEKLY_PROGRESS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading weekly progress:', error);
    return [];
  }
};

// ヘルパー関数
const getTimeOfDay = (date: Date): 'morning' | 'afternoon' | 'evening' => {
  const hour = date.getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

const getPreviousWeekStart = (weekStart: string): string => {
  const date = new Date(weekStart);
  date.setDate(date.getDate() - 7);
  return date.toISOString().split('T')[0];
};

const extractMotivationThemes = (sessions: IntegratedSession[]): string[] => {
  // 単純化のため、ここでは全てのモチベーションを返す
  // 実際のアプリでは、NLPなどを使って共通テーマを抽出する
  return [...new Set(sessions.map(s => s.userMotivation))];
};

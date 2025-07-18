import AsyncStorage from '@react-native-async-storage/async-storage';
import { IntegratedSession, DailyStats, WeeklyProgress } from '../types';
import { generateId } from './idGenerator';

const SESSIONS_STORAGE_KEY = 'integrated_sessions';
const DAILY_STATS_STORAGE_KEY = 'daily_stats';
const WEEKLY_PROGRESS_STORAGE_KEY = 'weekly_progress';

/**
 * 安全なAsyncStorage読み込み
 */
const safeLoadData = async <T>(key: string, defaultValue: T): Promise<T> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key}:`, error);
    return defaultValue;
  }
};

/**
 * 安全なAsyncStorage保存
 */
const safeSaveData = async (key: string, value: any): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    return false;
  }
};

// セッションデータの保存と取得
export const saveSessions = async (sessions: IntegratedSession[]): Promise<void> => {
  const success = await safeSaveData(SESSIONS_STORAGE_KEY, sessions);
  if (!success) {
    console.error('Failed to save sessions');
  }
};

export const loadSessions = async (): Promise<IntegratedSession[]> => {
  return await safeLoadData<IntegratedSession[]>(SESSIONS_STORAGE_KEY, []);
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
    id: generateId(),
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
  try {
    const sessions = await loadSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    // セッションが見つからない場合は新しいセッションを作成
    if (sessionIndex === -1) {
      console.log('Session not found, creating a dummy completed session');
      const now = new Date();
      const dummySession: IntegratedSession = {
        id: sessionId,
        challengeId: 'unknown',
        date: now.toISOString(),
        startTime: new Date(now.getTime() - actualDuration * 60 * 1000).toISOString(),
        endTime: now.toISOString(),
        plannedDuration: actualDuration,
        actualDuration,
        satisfactionLevel,
        qualityRating,
        notes: notes || '',
        motivationQuestion: '',
        userMotivation: '自動生成セッション',
        aiResponse: '',
        motivationResponse: '自動生成セッション',
        sessionSequence: 1,
        continuedFromPrevious: false,
        timeOfDay: getTimeOfDay(now),
        dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
        points: Math.floor(actualDuration / 5) + satisfactionLevel + qualityRating
      };
      
      // 統計データを更新
      try {
        await saveSessions([...sessions, dummySession]);
        await updateDailyStats(dummySession);
        await updateWeeklyProgress();
      } catch (statsError) {
        console.error('Error updating stats for dummy session:', statsError);
      }
      
      return dummySession;
    }
    
    // 既存のセッションを更新
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
    try {
      await updateDailyStats(updatedSession);
      await updateWeeklyProgress();
    } catch (statsError) {
      console.error('Error updating stats:', statsError);
    }
    
    return updatedSession;
  } catch (error) {
    console.error('Error in completeSession:', error);
    // エラーが発生した場合でもダミーセッションを返す
    const now = new Date();
    const dummySession: IntegratedSession = {
      id: sessionId,
      challengeId: 'unknown',
      date: now.toISOString(),
      startTime: new Date(now.getTime() - actualDuration * 60 * 1000).toISOString(),
      endTime: now.toISOString(),
      plannedDuration: actualDuration,
      actualDuration,
      satisfactionLevel,
      qualityRating,
      notes: notes || '',
      motivationQuestion: '',
      userMotivation: '自動生成セッション',
      aiResponse: '',
      motivationResponse: '自動生成セッション',
      sessionSequence: 1,
      continuedFromPrevious: false,
      timeOfDay: getTimeOfDay(now),
      dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
      points: Math.floor(actualDuration / 5) + satisfactionLevel + qualityRating
    };
    
    return dummySession;
  }
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
        .filter(m => m !== null && m !== undefined && m !== '');
      
      const motivationCounts: Record<string, number> = {};
      allMotivations.forEach(m => {
        if (typeof m === 'string') {
          motivationCounts[m] = (motivationCounts[m] || 0) + 1;
        }
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
  const success = await safeSaveData(DAILY_STATS_STORAGE_KEY, stats);
  if (!success) {
    console.error('Failed to save daily stats');
  }
};

export const loadDailyStats = async (): Promise<DailyStats[]> => {
  return await safeLoadData<DailyStats[]>(DAILY_STATS_STORAGE_KEY, []);
};

// 週間進捗データの保存と取得
export const saveWeeklyProgress = async (progress: WeeklyProgress[]): Promise<void> => {
  const success = await safeSaveData(WEEKLY_PROGRESS_STORAGE_KEY, progress);
  if (!success) {
    console.error('Failed to save weekly progress');
  }
};

export const loadWeeklyProgress = async (): Promise<WeeklyProgress[]> => {
  return await safeLoadData<WeeklyProgress[]>(WEEKLY_PROGRESS_STORAGE_KEY, []);
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
  return [...new Set(sessions
    .map(s => s.userMotivation)
    .filter(motivation => motivation !== null && motivation !== undefined && motivation !== '')
  )];
};

import AsyncStorage from '@react-native-async-storage/async-storage';

// タイマーのストレージキー
const TIMER_STORAGE_KEY = 'timer_state';

// タイマー状態の型
export interface TimerStorage {
  isRunning: boolean;
  startTime: number | null;
  pauseTime: number | null;
  elapsedTime: number;
  plannedDuration: number;
  sessionId: string | null;
  challengeId: string | null;
}

// 初期状態
const initialTimerState: TimerStorage = {
  isRunning: false,
  startTime: null,
  pauseTime: null,
  elapsedTime: 0,
  plannedDuration: 0,
  sessionId: null,
  challengeId: null,
};

/**
 * 安全なAsyncStorage読み込み
 */
const safeLoadData = async (key: string, defaultValue: any) => {
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
const safeSaveData = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    return false;
  }
};

/**
 * タイマーの開始
 */
export const startTimer = async (
  sessionId: string,
  challengeId: string,
  plannedDuration: number
): Promise<void> => {
  try {
    const now = Date.now();
    
    const timerState: TimerStorage = {
      isRunning: true,
      startTime: now,
      pauseTime: null,
      elapsedTime: 0,
      plannedDuration,
      sessionId,
      challengeId,
    };
    
    await safeSaveData(TIMER_STORAGE_KEY, timerState);
    console.log('Timer started:', timerState);
  } catch (error) {
    console.error('Error starting timer:', error);
  }
};

/**
 * タイマーの一時停止
 */
export const pauseTimer = async (): Promise<void> => {
  try {
    const timerState = await safeLoadData(TIMER_STORAGE_KEY, initialTimerState);
    
    // すでに停止している場合は何もしない
    if (!timerState.isRunning || !timerState.startTime) {
      return;
    }
    
    const now = Date.now();
    const additionalElapsedTime = now - timerState.startTime;
    
    const updatedTimerState: TimerStorage = {
      ...timerState,
      isRunning: false,
      startTime: null,
      pauseTime: now,
      elapsedTime: timerState.elapsedTime + additionalElapsedTime,
    };
    
    await safeSaveData(TIMER_STORAGE_KEY, updatedTimerState);
    console.log('Timer paused:', updatedTimerState);
  } catch (error) {
    console.error('Error pausing timer:', error);
  }
};

/**
 * タイマーの再開
 */
export const resumeTimer = async (): Promise<void> => {
  try {
    const timerState = await safeLoadData(TIMER_STORAGE_KEY, initialTimerState);
    
    // すでに実行中の場合は何もしない
    if (timerState.isRunning) {
      return;
    }
    
    const now = Date.now();
    
    const updatedTimerState: TimerStorage = {
      ...timerState,
      isRunning: true,
      startTime: now,
      pauseTime: null,
    };
    
    await safeSaveData(TIMER_STORAGE_KEY, updatedTimerState);
    console.log('Timer resumed:', updatedTimerState);
  } catch (error) {
    console.error('Error resuming timer:', error);
  }
};

/**
 * タイマーの停止と経過時間の取得
 */
export const stopTimer = async (): Promise<number> => {
  try {
    const timerState = await safeLoadData(TIMER_STORAGE_KEY, initialTimerState);
    
    let finalElapsedTime = timerState.elapsedTime;
    if (timerState.isRunning && timerState.startTime) {
      const now = Date.now();
      finalElapsedTime = now - timerState.startTime + timerState.elapsedTime;
    }
    
    await safeSaveData(TIMER_STORAGE_KEY, initialTimerState);
    
    return Math.round(finalElapsedTime / (60 * 1000));
  } catch (error) {
    console.error('Error stopping timer:', error);
    return 0;
  }
};

/**
 * 現在のタイマー状態の取得
 */
export const getTimerState = async (): Promise<TimerStorage> => {
  try {
    const timerState = await safeLoadData(TIMER_STORAGE_KEY, initialTimerState);
    
    // タイマーが実行中の場合、経過時間を更新
    if (timerState.isRunning && timerState.startTime) {
      const now = Date.now();
      const currentElapsedTime = now - timerState.startTime + timerState.elapsedTime;
      return {
        ...timerState,
        elapsedTime: currentElapsedTime,
      };
    }
    
    return timerState;
  } catch (error) {
    console.error('Error getting timer state:', error);
    return initialTimerState;
  }
};

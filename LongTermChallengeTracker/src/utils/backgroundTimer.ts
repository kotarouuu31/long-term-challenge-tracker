import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// バックグラウンドタスクの名前
const BACKGROUND_TIMER_TASK = 'background-timer-task';
const TIMER_STORAGE_KEY = 'timer_state';

// 通知の設定
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// タイマー状態の型
export interface TimerStorage {
  isRunning: boolean;
  startTime: number | null;
  pauseTime: number | null;
  elapsedTime: number;
  plannedDuration: number;
  sessionId: string | null;
  challengeId: string | null;
  endNotificationSent: boolean;
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
  endNotificationSent: false,
};

// バックグラウンドタスクの定義
TaskManager.defineTask(BACKGROUND_TIMER_TASK, async () => {
  try {
    const timerStateStr = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
    if (!timerStateStr) return BackgroundFetch.BackgroundFetchResult.NoData;

    const timerState: TimerStorage = JSON.parse(timerStateStr);
    
    // タイマーが実行中でない場合は何もしない
    if (!timerState.isRunning || !timerState.startTime) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const now = Date.now();
    const elapsedTime = now - timerState.startTime + timerState.elapsedTime;
    
    // 予定時間の90%に達したらリマインダー通知
    const ninetyPercentTime = timerState.plannedDuration * 0.9;
    if (elapsedTime >= ninetyPercentTime && !timerState.endNotificationSent) {
      await scheduleEndingSoonNotification(
        Math.floor((timerState.plannedDuration - elapsedTime) / 1000 / 60)
      );
      
      // 通知送信フラグを更新
      timerState.endNotificationSent = true;
      await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timerState));
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Error in background timer task:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// バックグラウンドタスクの登録
export const registerBackgroundTimer = async () => {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_TIMER_TASK, {
      minimumInterval: 60, // 最小間隔（秒）
      // Expo SDKのバージョンによっては以下のオプションが使用できない場合がある
      // stopOnTerminate: false,
      // startOnBoot: true,
    });
    console.log('Background timer registered');
  } catch (error) {
    console.error('Error registering background timer:', error);
  }
};

// バックグラウンドタスクの解除
export const unregisterBackgroundTimer = async () => {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TIMER_TASK);
    console.log('Background timer unregistered');
  } catch (error) {
    console.error('Error unregistering background timer:', error);
  }
};

// タイマーの開始
export const startTimer = async (
  sessionId: string,
  challengeId: string,
  plannedDuration: number
) => {
  try {
    // 通知権限の確認
    await requestNotificationPermissions();
    
    const now = Date.now();
    const timerState: TimerStorage = {
      isRunning: true,
      startTime: now,
      pauseTime: null,
      elapsedTime: 0,
      plannedDuration: plannedDuration * 60 * 1000, // 分からミリ秒に変換
      sessionId,
      challengeId,
      endNotificationSent: false,
    };
    
    await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timerState));
    
    // 終了予定時刻の通知をスケジュール
    await scheduleCompletionNotification(plannedDuration);
    
    // バックグラウンドタスクを登録
    await registerBackgroundTimer();
    
    return timerState;
  } catch (error) {
    console.error('Error starting timer:', error);
    throw error;
  }
};

// タイマーの一時停止
export const pauseTimer = async () => {
  try {
    const timerStateStr = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
    
    // タイマー状態が存在しない場合は初期状態を返す
    if (!timerStateStr) {
      console.log('No timer state found when pausing, returning initial state');
      return { ...initialTimerState };
    }
    
    const timerState: TimerStorage = JSON.parse(timerStateStr);
    if (!timerState.isRunning) return timerState;
    
    const now = Date.now();
    const updatedElapsedTime = timerState.startTime 
      ? now - timerState.startTime + timerState.elapsedTime
      : timerState.elapsedTime;
    
    const updatedState: TimerStorage = {
      ...timerState,
      isRunning: false,
      pauseTime: now,
      elapsedTime: updatedElapsedTime,
    };
    
    await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(updatedState));
    return updatedState;
  } catch (error) {
    console.error('Error pausing timer:', error);
    // エラーが発生した場合は初期状態を返す
    return { ...initialTimerState };
  }
};

// タイマーの再開
export const resumeTimer = async () => {
  try {
    const timerStateStr = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
    
    // タイマー状態が存在しない場合は新しいタイマーを開始
    if (!timerStateStr) {
      console.log('No timer state found, creating new timer state');
      const newState: TimerStorage = {
        ...initialTimerState,
        isRunning: true,
        startTime: Date.now(),
      };
      await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(newState));
      return newState;
    }
    
    const timerState: TimerStorage = JSON.parse(timerStateStr);
    if (timerState.isRunning) return timerState;
    
    const now = Date.now();
    const updatedState: TimerStorage = {
      ...timerState,
      isRunning: true,
      startTime: now,
      pauseTime: null,
    };
    
    await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(updatedState));
    return updatedState;
  } catch (error) {
    console.error('Error resuming timer:', error);
    // エラーをスローせず、新しいタイマー状態を返す
    const newState: TimerStorage = {
      ...initialTimerState,
      isRunning: true,
      startTime: Date.now(),
    };
    await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(newState));
    return newState;
  }
};

// タイマーの停止と経過時間の取得
export const stopTimer = async (): Promise<number> => {
  try {
    const timerStateStr = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
    if (!timerStateStr) {
      console.log('No timer state found when stopping, returning 0');
      return 0;
    }
    
    const timerState: TimerStorage = JSON.parse(timerStateStr);
    
    // 経過時間を計算（分単位で返す）
    let finalElapsedTime = timerState.elapsedTime;
    if (timerState.isRunning && timerState.startTime) {
      const now = Date.now();
      finalElapsedTime = now - timerState.startTime + timerState.elapsedTime;
    }
    
    // タイマー状態をリセット
    await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(initialTimerState));
    
    // バックグラウンドタスクを解除
    await unregisterBackgroundTimer();
    
    // 予定された通知をキャンセル
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // 分単位に変換して返す
    return Math.round(finalElapsedTime / (60 * 1000));
  } catch (error) {
    console.error('Error stopping timer:', error);
    throw error;
  }
};

// 現在のタイマー状態の取得
export const getTimerState = async (): Promise<TimerStorage> => {
  try {
    const timerStateStr = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
    if (!timerStateStr) return initialTimerState;
    
    const timerState: TimerStorage = JSON.parse(timerStateStr);
    
    // 実行中の場合は経過時間を更新
    if (timerState.isRunning && timerState.startTime) {
      const now = Date.now();
      timerState.elapsedTime = now - timerState.startTime + timerState.elapsedTime;
      timerState.startTime = now;
      await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timerState));
    }
    
    return timerState;
  } catch (error) {
    console.error('Error getting timer state:', error);
    return initialTimerState;
  }
};

// 通知権限のリクエスト
export const requestNotificationPermissions = async () => {
  if (Platform.OS === 'android') {
    // Androidの場合、通知チャネルを設定
    // Expo SDKのバージョンによっては以下のメソッドが使用できない場合がある
    try {
      // @ts-ignore - 型定義が存在しない場合があるため無視
      await Notifications.setNotificationChannelAsync('timer-channel', {
        name: 'Timer Notifications',
        // @ts-ignore - 型定義が存在しない場合があるため無視
        importance: Notifications.AndroidImportance?.HIGH || 4,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    } catch (error) {
      console.error('Error setting notification channel:', error);
    }
  }
  
  try {
    // @ts-ignore - 型定義が存在しない場合があるため無視
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

// 終了予定時刻の通知をスケジュール
const scheduleCompletionNotification = async (minutes: number) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '練習時間が終了しました',
      body: `${minutes}分の練習お疲れ様でした。アプリに戻って記録しましょう。`,
      sound: true,
    },
    trigger: { seconds: minutes * 60 },
  });
};

// もうすぐ終了の通知
const scheduleEndingSoonNotification = async (minutesLeft: number) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'もうすぐ終了です',
      body: `あと約${minutesLeft}分で予定時間が終了します。`,
      sound: true,
    },
    trigger: { seconds: 1 },
  });
};

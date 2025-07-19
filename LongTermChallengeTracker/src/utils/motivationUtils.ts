import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { MoodCheck, IfThenPlan, MiniTask, MoodType } from '../types/motivation';

// Storage keys
const MOOD_CHECKS_STORAGE_KEY = 'mood_checks';
const MINI_TASKS_STORAGE_KEY = 'mini_tasks';

// Predefined If-Then plans for different moods
export const ifThenPlans: Record<MoodType, IfThenPlan[]> = {
  great: [
    {
      condition: 'やる気満々のとき',
      steps: [
        '今日の目標を少し高めに設定してみましょう',
        'チャレンジングな部分に取り組んでみましょう',
        '新しいテクニックを試してみましょう'
      ],
      encouragement: [
        'その調子です！',
        '素晴らしい進歩です！',
        'あなたの成長が見えます！'
      ]
    }
  ],
  good: [
    {
      condition: '調子が良いとき',
      steps: [
        '通常の練習メニューを実施しましょう',
        '少し難しい部分にも挑戦してみましょう',
        '前回の反省点を改善してみましょう'
      ],
      encouragement: [
        'よく頑張っています！',
        '着実に進歩していますね',
        '継続は力なり！'
      ]
    }
  ],
  tired: [
    {
      condition: '疲れているとき',
      steps: [
        'まずは5分だけ軽く始めてみましょう',
        '簡単な部分から取り組みましょう',
        '短い時間でも続けることに意味があります'
      ],
      encouragement: [
        '少しでも取り組めたことが素晴らしいです',
        '疲れていても続けられるあなたは強いです',
        '小さな一歩が大きな成果につながります'
      ]
    },
    {
      condition: '体力が低下しているとき',
      steps: [
        '深呼吸をして気持ちをリセットしましょう',
        '今日は軽めのメニューに調整しましょう',
        '質を重視して短時間で効果的に取り組みましょう'
      ],
      encouragement: [
        '自分の状態を理解して調整できていますね',
        '無理せず続けることが長期的な成功につながります',
        '今日の小さな努力が明日の大きな力になります'
      ]
    }
  ],
  unmotivated: [
    {
      condition: 'やる気が出ないとき',
      steps: [
        'たった3分だけでも始めてみましょう',
        '好きな部分から取り組んでみましょう',
        '音楽をかけるなど環境を変えてみましょう'
      ],
      encouragement: [
        '始められたこと自体が素晴らしいです',
        '小さな一歩を踏み出せました！',
        'やる気は行動から生まれます、よく頑張りました！'
      ]
    },
    {
      condition: 'モチベーションが低いとき',
      steps: [
        '目標を思い出してみましょう',
        'これまでの成果を振り返ってみましょう',
        '最初の一歩を踏み出すだけでOKです'
      ],
      encouragement: [
        '一歩踏み出せたことが大切です',
        '継続の力を信じましょう',
        '今日の小さな努力が未来の大きな変化につながります'
      ]
    }
  ],
  stressed: [
    {
      condition: 'ストレスを感じているとき',
      steps: [
        '深呼吸から始めましょう',
        '無理のない範囲で短時間取り組みましょう',
        '達成感を得られる簡単なことから始めましょう'
      ],
      encouragement: [
        'ストレスがあっても取り組めたことを誇りに思いましょう',
        '自分を大切にしながら続けられていますね',
        '小さな成功体験の積み重ねが大きな自信につながります'
      ]
    },
    {
      condition: '心が落ち着かないとき',
      steps: [
        '1分間の瞑想から始めてみましょう',
        '今この瞬間だけに集中してみましょう',
        '自分のペースを大切にしましょう'
      ],
      encouragement: [
        '自分と向き合う時間が取れましたね',
        '心の状態に気づけることも成長です',
        '今日の小さな一歩に感謝しましょう'
      ]
    }
  ]
};

// Save a mood check to AsyncStorage
export const saveMoodCheck = async (moodCheck: MoodCheck): Promise<void> => {
  try {
    const existingMoodChecksJson = await AsyncStorage.getItem(MOOD_CHECKS_STORAGE_KEY);
    const existingMoodChecks: MoodCheck[] = existingMoodChecksJson 
      ? JSON.parse(existingMoodChecksJson) 
      : [];
    
    existingMoodChecks.push(moodCheck);
    await AsyncStorage.setItem(MOOD_CHECKS_STORAGE_KEY, JSON.stringify(existingMoodChecks));
  } catch (error) {
    console.error('Error saving mood check:', error);
    throw error;
  }
};

// Get all mood checks from AsyncStorage
export const getMoodChecks = async (): Promise<MoodCheck[]> => {
  try {
    const moodChecksJson = await AsyncStorage.getItem(MOOD_CHECKS_STORAGE_KEY);
    return moodChecksJson ? JSON.parse(moodChecksJson) : [];
  } catch (error) {
    console.error('Error getting mood checks:', error);
    throw error;
  }
};

// Create a new mood check
export const createMoodCheck = (sessionId: string, mood: MoodType, selectedPlan: string): MoodCheck => {
  return {
    id: uuidv4(),
    sessionId,
    mood,
    selectedPlan,
    completed: false,
    date: new Date().toISOString()
  };
};

// Get If-Then plans for a specific mood
export const getIfThenPlansForMood = (mood: MoodType): IfThenPlan[] => {
  return ifThenPlans[mood] || [];
};

// Save a mini task to AsyncStorage
export const saveMiniTask = async (miniTask: MiniTask): Promise<void> => {
  try {
    const existingMiniTasksJson = await AsyncStorage.getItem(MINI_TASKS_STORAGE_KEY);
    const existingMiniTasks: MiniTask[] = existingMiniTasksJson 
      ? JSON.parse(existingMiniTasksJson) 
      : [];
    
    existingMiniTasks.push(miniTask);
    await AsyncStorage.setItem(MINI_TASKS_STORAGE_KEY, JSON.stringify(existingMiniTasks));
  } catch (error) {
    console.error('Error saving mini task:', error);
    throw error;
  }
};

// Create a new mini task
export const createMiniTask = (sessionId: string, taskDuration: number): MiniTask => {
  return {
    id: uuidv4(),
    sessionId,
    taskDuration,
    completed: false,
    timestamp: new Date().toISOString()
  };
};

// Update a mood check's completion status
export const updateMoodCheckCompletion = async (id: string, completed: boolean): Promise<void> => {
  try {
    const moodChecksJson = await AsyncStorage.getItem(MOOD_CHECKS_STORAGE_KEY);
    if (!moodChecksJson) return;
    
    const moodChecks: MoodCheck[] = JSON.parse(moodChecksJson);
    const updatedMoodChecks = moodChecks.map(check => 
      check.id === id ? { ...check, completed } : check
    );
    
    await AsyncStorage.setItem(MOOD_CHECKS_STORAGE_KEY, JSON.stringify(updatedMoodChecks));
  } catch (error) {
    console.error('Error updating mood check completion:', error);
    throw error;
  }
};

// Update a mini task's completion status
export const updateMiniTaskCompletion = async (id: string, completed: boolean): Promise<void> => {
  try {
    const miniTasksJson = await AsyncStorage.getItem(MINI_TASKS_STORAGE_KEY);
    if (!miniTasksJson) return;
    
    const miniTasks: MiniTask[] = JSON.parse(miniTasksJson);
    const updatedMiniTasks = miniTasks.map(task => 
      task.id === id ? { ...task, completed } : task
    );
    
    await AsyncStorage.setItem(MINI_TASKS_STORAGE_KEY, JSON.stringify(updatedMiniTasks));
  } catch (error) {
    console.error('Error updating mini task completion:', error);
    throw error;
  }
};

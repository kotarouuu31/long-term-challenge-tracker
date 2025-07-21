import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from './idGenerator';
import { MoodCheck, MiniTask } from '../types/motivation';

// Storage keys
const MOOD_CHECKS_STORAGE_KEY = 'mood_checks';
const MINI_TASKS_STORAGE_KEY = 'mini_tasks';

// Save a mood check to AsyncStorage
export const saveMoodCheck = async (moodCheck: MoodCheck): Promise<void> => {
  try {
    const existingMoodChecksJson = await AsyncStorage.getItem(MOOD_CHECKS_STORAGE_KEY);
    const existingMoodChecks: MoodCheck[] = existingMoodChecksJson 
      ? JSON.parse(existingMoodChecksJson) 
      : [];
    
    const updatedMoodChecks = [...existingMoodChecks, moodCheck];
    await AsyncStorage.setItem(MOOD_CHECKS_STORAGE_KEY, JSON.stringify(updatedMoodChecks));
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
export const createMoodCheck = (sessionId: string, mood: string): MoodCheck => {
  return {
    id: generateId(),
    sessionId,
    mood,
    timestamp: new Date().toISOString()
  };
};

// Save a mini task to AsyncStorage
export const saveMiniTask = async (miniTask: MiniTask): Promise<void> => {
  try {
    const existingMiniTasksJson = await AsyncStorage.getItem(MINI_TASKS_STORAGE_KEY);
    const existingMiniTasks: MiniTask[] = existingMiniTasksJson 
      ? JSON.parse(existingMiniTasksJson) 
      : [];
    
    const updatedMiniTasks = [...existingMiniTasks, miniTask];
    await AsyncStorage.setItem(MINI_TASKS_STORAGE_KEY, JSON.stringify(updatedMiniTasks));
  } catch (error) {
    console.error('Error saving mini task:', error);
    throw error;
  }
};

// Get all mini tasks from AsyncStorage
export const getMiniTasks = async (): Promise<MiniTask[]> => {
  try {
    const miniTasksJson = await AsyncStorage.getItem(MINI_TASKS_STORAGE_KEY);
    return miniTasksJson ? JSON.parse(miniTasksJson) : [];
  } catch (error) {
    console.error('Error getting mini tasks:', error);
    throw error;
  }
};

// Create a new mini task
export const createMiniTask = (title: string, description: string, duration: number): MiniTask => {
  return {
    id: generateId(),
    title,
    description,
    duration
  };
};

// Clear all mood checks (for testing)
export const clearMoodChecks = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(MOOD_CHECKS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing mood checks:', error);
    throw error;
  }
};

// Clear all mini tasks (for testing)
export const clearMiniTasks = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(MINI_TASKS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing mini tasks:', error);
    throw error;
  }
};

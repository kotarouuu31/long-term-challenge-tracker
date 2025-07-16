import { Challenge } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initial challenges data
export const initialChallenges: Challenge[] = [
  {
    id: '1',
    name: '筋トレ',
    description: 'ワンパンマントレーニング',
    type: 'streak',
    goal: 365 * 3, // 3 years
    currentProgress: 0,
    lastCompletedDate: null,
    color: '#FF5252',
    icon: '💪',
  },
  {
    id: '2',
    name: 'ピアノ練習',
    description: '毎日のピアノ練習',
    type: 'streak',
    goal: 365 * 3, // 3 years
    currentProgress: 0,
    lastCompletedDate: null,
    color: '#448AFF',
    icon: '🎹',
  },
  {
    id: '3',
    name: 'ストレッチ',
    description: '毎日のストレッチ',
    type: 'streak',
    goal: 365 * 3, // 3 years
    currentProgress: 0,
    lastCompletedDate: null,
    color: '#66BB6A',
    icon: '🧘',
  },
  {
    id: '4',
    name: 'DJ練習',
    description: 'DJスキルの向上',
    type: 'duration',
    goal: 10000, // 10000 hours
    currentProgress: 0,
    lastCompletedDate: null,
    color: '#9C27B0',
    icon: '🎧',
  },
];

// Storage keys
const CHALLENGES_STORAGE_KEY = 'challenges';

// Load challenges from AsyncStorage
export const loadChallenges = async (): Promise<Challenge[]> => {
  try {
    const challengesJson = await AsyncStorage.getItem(CHALLENGES_STORAGE_KEY);
    if (challengesJson) {
      return JSON.parse(challengesJson);
    }
    // If no challenges found, save and return the initial challenges
    await AsyncStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify(initialChallenges));
    return initialChallenges;
  } catch (error) {
    console.error('Failed to load challenges:', error);
    return initialChallenges;
  }
};

// Save challenges to AsyncStorage
export const saveChallenges = async (challenges: Challenge[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify(challenges));
  } catch (error) {
    console.error('Failed to save challenges:', error);
  }
};

// Mark a challenge as completed today
export const completeChallenge = async (challengeId: string, durationMinutes?: number): Promise<Challenge[]> => {
  const challenges = await loadChallenges();
  const today = new Date().toISOString().split('T')[0];
  
  const updatedChallenges = challenges.map(challenge => {
    if (challenge.id === challengeId) {
      const wasCompletedToday = challenge.lastCompletedDate === today;
      
      // If already completed today, don't update
      if (wasCompletedToday) {
        return challenge;
      }
      
      // Check if this is a continuation of a streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];
      const isStreakContinuation = challenge.lastCompletedDate === yesterdayString;
      
      // Update the challenge
      return {
        ...challenge,
        currentProgress: challenge.type === 'streak' 
          ? (isStreakContinuation ? challenge.currentProgress + 1 : 1)
          : (challenge.currentProgress + (durationMinutes || 0) / 60),
        lastCompletedDate: today,
      };
    }
    return challenge;
  });
  
  await saveChallenges(updatedChallenges);
  return updatedChallenges;
};

// Calculate progress percentage
export const calculateProgress = (challenge: Challenge): number => {
  return (challenge.currentProgress / challenge.goal) * 100;
};

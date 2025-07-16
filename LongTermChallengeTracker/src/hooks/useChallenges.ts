import { useState, useEffect, useCallback } from 'react';
import { Challenge } from '../types';
import { loadChallenges, saveChallenges, completeChallenge } from '../utils/challengeData';

export const useChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load challenges on mount
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true);
        const data = await loadChallenges();
        setChallenges(data);
        setError(null);
      } catch (err) {
        setError('Failed to load challenges');
        console.error('Error loading challenges:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  // Complete a challenge
  const handleCompleteChallenge = useCallback(async (challengeId: string, durationMinutes?: number) => {
    try {
      const updatedChallenges = await completeChallenge(challengeId, durationMinutes);
      setChallenges(updatedChallenges);
      return true;
    } catch (err) {
      console.error('Error completing challenge:', err);
      return false;
    }
  }, []);

  // Reset a challenge streak
  const resetChallenge = useCallback(async (challengeId: string) => {
    try {
      const updatedChallenges = challenges.map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, currentProgress: 0, lastCompletedDate: null }
          : challenge
      );
      
      await saveChallenges(updatedChallenges);
      setChallenges(updatedChallenges);
      return true;
    } catch (err) {
      console.error('Error resetting challenge:', err);
      return false;
    }
  }, [challenges]);

  return {
    challenges,
    loading,
    error,
    completeChallenge: handleCompleteChallenge,
    resetChallenge,
  };
};

export default useChallenges;

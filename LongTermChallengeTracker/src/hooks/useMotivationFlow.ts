import { useState, useCallback } from 'react';
import { MoodType, IfThenPlan } from '../types/motivation';
import { MotivationManager } from '../utils/motivationManager';

export const useMotivationFlow = (challengeId: string, challengeName: string) => {
  const [motivationManager, setMotivationManager] = useState<MotivationManager | null>(null);
  const [showMoodCheck, setShowMoodCheck] = useState(false);
  const [showIfThenPlan, setShowIfThenPlan] = useState(false);
  const [showMiniTask, setShowMiniTask] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<IfThenPlan | null>(null);
  const [miniTaskDuration, setMiniTaskDuration] = useState(5); // Default to 5 minutes
  const [encouragementIndex, setEncouragementIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Start the motivation flow
  const startMotivationFlow = useCallback((newSessionId: string) => {
    setSessionId(newSessionId);
    const manager = new MotivationManager(newSessionId, challengeName);
    setMotivationManager(manager);
    setShowMoodCheck(true);
  }, [challengeName]);

  // Handle mood selection
  const handleMoodSelect = useCallback(async (mood: MoodType) => {
    if (!motivationManager) return;
    
    setSelectedMood(mood);
    setShowMoodCheck(false);
    
    try {
      const plans = await motivationManager.recordMood(mood);
      
      if (plans.length > 0) {
        setShowIfThenPlan(true);
      } else {
        // If no plans available, skip to mini task
        setShowMiniTask(true);
      }
    } catch (error) {
      console.error('Error recording mood:', error);
      // Skip flow on error
      resetFlow();
    }
  }, [motivationManager]);

  // Handle plan selection
  const handlePlanSelect = useCallback(async (plan: IfThenPlan) => {
    if (!motivationManager) return;
    
    setSelectedPlan(plan);
    setShowIfThenPlan(false);
    
    try {
      await motivationManager.selectPlan(plan);
      setShowMiniTask(true);
    } catch (error) {
      console.error('Error selecting plan:', error);
      // Skip flow on error
      resetFlow();
    }
  }, [motivationManager]);

  // Handle mini task acceptance
  const handleMiniTaskAccept = useCallback(async () => {
    if (!motivationManager) return;
    
    try {
      await motivationManager.createMiniTask(miniTaskDuration);
      setShowMiniTask(false);
      return miniTaskDuration;
    } catch (error) {
      console.error('Error creating mini task:', error);
      resetFlow();
      return null;
    }
  }, [motivationManager, miniTaskDuration]);

  // Handle mini task decline
  const handleMiniTaskDecline = useCallback(() => {
    setShowMiniTask(false);
    resetFlow();
  }, []);

  // Skip the current step
  const skipCurrentStep = useCallback(() => {
    if (showMoodCheck) {
      setShowMoodCheck(false);
    } else if (showIfThenPlan) {
      setShowIfThenPlan(false);
      setShowMiniTask(true);
    } else if (showMiniTask) {
      setShowMiniTask(false);
    }
  }, [showMoodCheck, showIfThenPlan, showMiniTask]);

  // Reset the flow
  const resetFlow = useCallback(() => {
    setShowMoodCheck(false);
    setShowIfThenPlan(false);
    setShowMiniTask(false);
    setSelectedMood(null);
    setSelectedPlan(null);
    setEncouragementIndex(0);
  }, []);

  // Complete the motivation flow
  const completeMotivationFlow = useCallback(async () => {
    if (motivationManager) {
      try {
        await motivationManager.completeMoodCheck();
      } catch (error) {
        console.error('Error completing mood check:', error);
      }
    }
    resetFlow();
  }, [motivationManager, resetFlow]);

  // Get the next encouragement message
  const getNextEncouragement = useCallback(async (miniTaskId: string) => {
    if (!motivationManager) return null;
    
    try {
      const encouragement = await motivationManager.completeMiniTask(miniTaskId);
      if (encouragement) {
        setEncouragementIndex(prev => prev + 1);
      }
      return encouragement;
    } catch (error) {
      console.error('Error getting next encouragement:', error);
      return null;
    }
  }, [motivationManager]);

  return {
    showMoodCheck,
    showIfThenPlan,
    showMiniTask,
    selectedMood,
    selectedPlan,
    miniTaskDuration,
    encouragementIndex,
    startMotivationFlow,
    handleMoodSelect,
    handlePlanSelect,
    handleMiniTaskAccept,
    handleMiniTaskDecline,
    skipCurrentStep,
    resetFlow,
    completeMotivationFlow,
    getNextEncouragement,
  };
};

export default useMotivationFlow;

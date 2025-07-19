import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MoodCheckModal from './MoodCheckModal';
import IfThenPlanModal from './IfThenPlanModal';
import MiniTaskModal from './MiniTaskModal';
import { MoodType, IfThenPlan } from '../types/motivation';
import { MotivationManager } from '../utils/motivationManager';

interface MotivationFlowControllerProps {
  visible: boolean;
  sessionId: string;
  challengeName: string;
  onComplete: (skipFlow: boolean) => void;
  onMiniTaskAccepted: (duration: number) => void;
}

const MotivationFlowController: React.FC<MotivationFlowControllerProps> = ({
  visible,
  sessionId,
  challengeName,
  onComplete,
  onMiniTaskAccepted,
}) => {
  // Flow state
  const [currentStep, setCurrentStep] = useState<'mood' | 'plan' | 'minitask' | 'complete'>('mood');
  const [motivationManager, setMotivationManager] = useState<MotivationManager | null>(null);
  
  // Modal visibility states
  const [moodModalVisible, setMoodModalVisible] = useState(false);
  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [miniTaskModalVisible, setMiniTaskModalVisible] = useState(false);
  
  // Data states
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [availablePlans, setAvailablePlans] = useState<IfThenPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<IfThenPlan | null>(null);
  const [miniTaskDuration, setMiniTaskDuration] = useState(5); // Default to 5 minutes
  
  // Initialize the motivation manager
  useEffect(() => {
    if (visible && sessionId) {
      const manager = new MotivationManager(sessionId, challengeName);
      setMotivationManager(manager);
      setCurrentStep('mood');
      setMoodModalVisible(true);
    } else {
      resetState();
    }
  }, [visible, sessionId, challengeName]);
  
  // Reset all state when the flow is complete or canceled
  const resetState = () => {
    setCurrentStep('mood');
    setMoodModalVisible(false);
    setPlanModalVisible(false);
    setMiniTaskModalVisible(false);
    setSelectedMood(null);
    setAvailablePlans([]);
    setSelectedPlan(null);
  };
  
  // Handle mood selection
  const handleMoodSelect = async (mood: MoodType) => {
    if (!motivationManager) return;
    
    setSelectedMood(mood);
    setMoodModalVisible(false);
    
    try {
      const plans = await motivationManager.recordMood(mood);
      setAvailablePlans(plans);
      
      if (plans.length > 0) {
        setCurrentStep('plan');
        setPlanModalVisible(true);
      } else {
        // If no plans available, skip to mini task
        setCurrentStep('minitask');
        setMiniTaskModalVisible(true);
      }
    } catch (error) {
      console.error('Error recording mood:', error);
      onComplete(true); // Skip flow on error
    }
  };
  
  // Handle plan selection
  const handlePlanSelect = async (plan: IfThenPlan) => {
    if (!motivationManager) return;
    
    setSelectedPlan(plan);
    setPlanModalVisible(false);
    
    try {
      await motivationManager.selectPlan(plan);
      setCurrentStep('minitask');
      setMiniTaskModalVisible(true);
    } catch (error) {
      console.error('Error selecting plan:', error);
      onComplete(true); // Skip flow on error
    }
  };
  
  // Handle mini task acceptance
  const handleMiniTaskAccept = async () => {
    if (!motivationManager) return;
    
    try {
      const miniTask = await motivationManager.createMiniTask(miniTaskDuration);
      setMiniTaskModalVisible(false);
      onMiniTaskAccepted(miniTaskDuration);
      setCurrentStep('complete');
    } catch (error) {
      console.error('Error creating mini task:', error);
      onComplete(true); // Skip flow on error
    }
  };
  
  // Handle mini task decline
  const handleMiniTaskDecline = () => {
    setMiniTaskModalVisible(false);
    onComplete(false);
    setCurrentStep('complete');
  };
  
  // Skip the current step
  const handleSkip = () => {
    switch (currentStep) {
      case 'mood':
        setMoodModalVisible(false);
        onComplete(true);
        break;
      case 'plan':
        setPlanModalVisible(false);
        setCurrentStep('minitask');
        setMiniTaskModalVisible(true);
        break;
      case 'minitask':
        setMiniTaskModalVisible(false);
        onComplete(true);
        break;
      default:
        onComplete(true);
    }
  };
  
  return (
    <View style={styles.container}>
      <MoodCheckModal
        visible={moodModalVisible}
        onClose={handleSkip}
        onMoodSelect={handleMoodSelect}
        challengeName={challengeName}
      />
      
      {selectedMood && (
        <IfThenPlanModal
          visible={planModalVisible}
          onClose={handleSkip}
          mood={selectedMood}
          onPlanSelect={handlePlanSelect}
        />
      )}
      
      <MiniTaskModal
        visible={miniTaskModalVisible}
        onClose={handleSkip}
        onAccept={handleMiniTaskAccept}
        onDecline={handleMiniTaskDecline}
        taskDuration={miniTaskDuration}
        isFirstTask={true}
        selectedPlan={selectedPlan || undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // This component is mainly a controller, so it doesn't need visible styling
  },
});

export default MotivationFlowController;

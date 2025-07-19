import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { MiniTask } from '../../types/motivation';

interface MiniTaskModalProps {
  visible: boolean;
  miniTask: MiniTask | null;
  onClose: () => void;
  onComplete: (duration: number) => void;
  onSkip: () => void;
}

const MiniTaskModal: React.FC<MiniTaskModalProps> = ({
  visible,
  miniTask,
  onClose,
  onComplete,
  onSkip
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (miniTask) {
      setTimeLeft(miniTask.duration);
      setCompleted(false);
      setIsRunning(false);
    }
  }, [miniTask]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setIsRunning(false);
            setCompleted(true);
            clearInterval(timer);
          }
          return Math.max(0, newTime);
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleComplete = () => {
    if (miniTask) {
      onComplete(miniTask.duration - timeLeft);
    }
  };

  if (!miniTask) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{miniTask.title}</Text>
          <Text style={styles.description}>{miniTask.description}</Text>
          
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
          
          {completed ? (
            <View style={styles.completedContainer}>
              <Text style={styles.completedText}>お疲れ様でした！</Text>
              <TouchableOpacity
                style={styles.completeButton}
                onPress={handleComplete}
              >
                <Text style={styles.completeButtonText}>続ける</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.controlsContainer}>
              {!isRunning ? (
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={handleStart}
                >
                  <Text style={styles.startButtonText}>開始</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.pauseButton}
                  onPress={handlePause}
                >
                  <Text style={styles.pauseButtonText}>一時停止</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          <TouchableOpacity
            style={styles.skipButton}
            onPress={onSkip}
          >
            <Text style={styles.skipButtonText}>スキップ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#444'
  },
  timerContainer: {
    backgroundColor: '#f0f0f0',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20
  },
  timerText: {
    fontSize: 30,
    fontWeight: 'bold'
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '60%',
    alignItems: 'center'
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  pauseButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '60%',
    alignItems: 'center'
  },
  pauseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  completedContainer: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%'
  },
  completedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 15
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '60%',
    alignItems: 'center'
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  skipButton: {
    padding: 10
  },
  skipButtonText: {
    color: '#888',
    fontSize: 16
  }
});

export default MiniTaskModal;

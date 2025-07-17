import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TimerControlsProps {
  isRunning: boolean;
  elapsedTime: number; // 分単位
  plannedDuration: number; // 分単位
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({
  isRunning,
  elapsedTime,
  plannedDuration,
  onPause,
  onResume,
  onStop
}) => {
  const [animatedValue] = useState(new Animated.Value(0));
  const [displayTime, setDisplayTime] = useState('00:00');
  const [progressPercentage, setProgressPercentage] = useState(0);
  
  // 時間表示の更新
  useEffect(() => {
    // 分と秒に変換
    const minutes = Math.floor(elapsedTime);
    const seconds = Math.floor((elapsedTime - minutes) * 60);
    
    // 表示形式に整形
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    
    setDisplayTime(`${formattedMinutes}:${formattedSeconds}`);
    
    // 進捗パーセンテージの計算
    if (plannedDuration > 0) {
      const progress = Math.min((elapsedTime / plannedDuration) * 100, 100);
      setProgressPercentage(progress);
    }
  }, [elapsedTime, plannedDuration]);
  
  // パルスアニメーション
  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
      ).start();
    } else {
      animatedValue.setValue(0);
    }
    
    return () => {
      animatedValue.setValue(0);
    };
  }, [isRunning, animatedValue]);
  
  const pulseScale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1]
  });
  
  const pulseOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.7]
  });
  
  // 残り時間の計算
  const getRemainingTime = (): string => {
    if (plannedDuration <= 0) return '';
    
    const remainingMinutes = Math.max(0, plannedDuration - elapsedTime);
    const minutes = Math.floor(remainingMinutes);
    const seconds = Math.floor((remainingMinutes - minutes) * 60);
    
    return `残り ${minutes}:${String(seconds).padStart(2, '0')}`;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Animated.View 
          style={[
            styles.pulseCircle,
            { 
              transform: [{ scale: pulseScale }],
              opacity: pulseOpacity
            }
          ]}
        />
        
        <View style={styles.timerInner}>
          <Text style={styles.timerText}>{displayTime}</Text>
          <Text style={styles.remainingText}>{getRemainingTime()}</Text>
        </View>
      </View>
      
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar,
            { width: `${progressPercentage}%` }
          ]}
        />
      </View>
      
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onStop}
        >
          <Ionicons name="stop-circle-outline" size={40} color="#FF5252" />
          <Text style={styles.controlText}>終了</Text>
        </TouchableOpacity>
        
        {isRunning ? (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onPause}
          >
            <Ionicons name="pause-circle" size={64} color="#4CAF50" />
            <Text style={styles.controlText}>一時停止</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onResume}
          >
            <Ionicons name="play-circle" size={64} color="#4CAF50" />
            <Text style={styles.controlText}>再開</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.placeholderButton} />
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          {isRunning 
            ? '集中して頑張りましょう！' 
            : '再開して練習を続けましょう'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  pulseCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  timerInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timerText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
  },
  remainingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  progressBarContainer: {
    width: '80%',
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 32,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 24,
  },
  controlButton: {
    alignItems: 'center',
  },
  placeholderButton: {
    width: 40,
  },
  controlText: {
    marginTop: 4,
    color: '#555',
    fontSize: 14,
  },
  infoContainer: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoText: {
    fontSize: 16,
    color: '#555',
  },
});

export default TimerControls;

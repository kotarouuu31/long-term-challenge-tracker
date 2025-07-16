import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Challenge } from '../types';
import { completeChallenge, calculateProgress } from '../utils/challengeData';

interface ChallengeCardProps {
  challenge: Challenge;
  onUpdate: (challengeId: string, durationMinutes?: number) => Promise<boolean>;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onUpdate }) => {
  const progress = calculateProgress(challenge);
  const isCompletedToday = challenge.lastCompletedDate === new Date().toISOString().split('T')[0];

  const handleComplete = async () => {
    if (isCompletedToday) {
      Alert.alert('完了済み', '今日はすでに完了しています！');
      return;
    }

    try {
      let duration: number | undefined;
      
      if (challenge.type === 'duration') {
        // For DJ practice, ask for duration using Alert.alert with buttons
        // since Alert.prompt is iOS-only and might not be available
        Alert.alert(
          '練習時間',
          '今日の練習時間は何分ですか？',
          [
            {
              text: '30分',
              onPress: async () => {
                await onUpdate(challenge.id, 30);
              },
            },
            {
              text: '60分',
              onPress: async () => {
                await onUpdate(challenge.id, 60);
              },
            },
            {
              text: '90分',
              onPress: async () => {
                await onUpdate(challenge.id, 90);
              },
            },
            {
              text: 'キャンセル',
              style: 'cancel',
            },
          ]
        );
      } else {
        // For streak-based challenges
        const success = await onUpdate(challenge.id);
        if (success) {
          Alert.alert('完了！', '今日のチャレンジを記録しました！');
        }
      }
    } catch (error) {
      console.error('Error completing challenge:', error);
      Alert.alert('エラー', '記録に失敗しました。もう一度お試しください。');
    }
  };

  const formatProgress = () => {
    if (challenge.type === 'streak') {
      return `${challenge.currentProgress}日 / ${challenge.goal}日`;
    } else {
      return `${challenge.currentProgress.toFixed(1)}時間 / ${challenge.goal}時間`;
    }
  };

  return (
    <View style={[styles.card, { borderLeftColor: challenge.color }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.icon}>{challenge.icon}</Text>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{challenge.name}</Text>
          <Text style={styles.description}>{challenge.description}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${Math.min(progress, 100)}%`, backgroundColor: challenge.color }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{formatProgress()}</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.completeButton,
          { backgroundColor: isCompletedToday ? '#E0E0E0' : challenge.color }
        ]}
        onPress={handleComplete}
        disabled={isCompletedToday}
      >
        <Text style={styles.buttonText}>
          {isCompletedToday ? '完了済み' : '今日実行した'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 30,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'right',
  },
  completeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ChallengeCard;

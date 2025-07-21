import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { Challenge, IntegratedSession } from '../../types';
import { 
  calculateSessionPoints, 
  calculateStreakBonus, 
  calculateSessionTotalPoints,
  createPointsTransaction 
} from '../../utils/pointsCalculator';
import { 
  savePointsTransaction, 
  getUserGameStats, 
  saveUserGameStats,
  getCurrentStreak,
  updateStreak
} from '../../utils/gamification';

interface PostPracticeModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (satisfactionLevel: number, qualityRating: number, notes: string) => void;
  challenge: Challenge;
  session: IntegratedSession | null;
  actualDuration: number;
}

const PostPracticeModal: React.FC<PostPracticeModalProps> = ({
  visible,
  onClose,
  onComplete,
  challenge,
  session,
  actualDuration
}) => {
  const [satisfactionLevel, setSatisfactionLevel] = useState<number>(0);
  const [qualityRating, setQualityRating] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);
  const [showPointsMessage, setShowPointsMessage] = useState(false);

  const handleComplete = async () => {
    if (satisfactionLevel > 0 && qualityRating > 0 && !isProcessing) {
      setIsProcessing(true);
      
      try {
        // 現在のストリーク日数を取得
        const currentStreak = await getCurrentStreak(challenge.id);
        
        // ポイント計算
        const qualityPoints = calculateSessionPoints(qualityRating);
        const streakBonus = calculateStreakBonus(currentStreak + 1); // +1 because this session will extend the streak
        const totalPoints = actualDuration + qualityPoints + streakBonus;
        
        // ポイント取引を作成
        const transaction = createPointsTransaction(
          challenge.id,
          'session',
          totalPoints,
          `セッション完了: ${actualDuration}分 + 品質評価${qualityRating} + 連続${currentStreak + 1}日ボーナス`,
          qualityRating,
          currentStreak + 1
        );
        
        // ポイント取引を保存
        await savePointsTransaction(transaction);
        
        // ユーザー統計を更新
        const userStats = await getUserGameStats();
        const updatedStats = {
          ...userStats,
          totalPoints: userStats.totalPoints + totalPoints,
          pointsTransactions: [...userStats.pointsTransactions, transaction],
          lastUpdated: new Date().toISOString()
        };
        await saveUserGameStats(updatedStats);
        
        // ストリークを更新
        await updateStreak(challenge.id);
        
        // ポイント獲得メッセージを表示
        setEarnedPoints(totalPoints);
        setShowPointsMessage(true);
        
        // ポイント表示後、元のonCompleteを実行
        setTimeout(() => {
          setShowPointsMessage(false);
          onComplete(satisfactionLevel, qualityRating, notes);
        }, 2000);
        
      } catch (error) {
        console.error('ポイント計算・保存に失敗しました:', error);
        Alert.alert('エラー', 'ポイントの保存に失敗しました。');
        onComplete(satisfactionLevel, qualityRating, notes);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const renderRatingStars = (
    rating: number, 
    setRating: React.Dispatch<React.SetStateAction<number>>,
    label: string
  ) => {
    return (
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingLabel}>{label}</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={styles.starButton}
            >
              <Text style={[
                styles.starIcon, 
                star <= rating ? styles.starActive : styles.starInactive
              ]}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.ratingDescription}>
          {getRatingDescription(rating, label === '満足度')}
        </Text>
      </View>
    );
  };

  const getRatingDescription = (rating: number, isSatisfaction: boolean): string => {
    if (rating === 0) return '';
    
    if (isSatisfaction) {
      const descriptions = [
        '不満足', '少し不満足', '普通', '満足', '非常に満足'
      ];
      return descriptions[rating - 1];
    } else {
      const descriptions = [
        '低品質', '普通以下', '普通', '良い', '非常に良い'
      ];
      return descriptions[rating - 1];
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.modalTitle}>お疲れ様でした！</Text>
            
            <View style={styles.durationContainer}>
              <Text style={styles.durationLabel}>練習時間</Text>
              <Text style={styles.durationValue}>{actualDuration}分</Text>
              {session?.plannedDuration && (
                <Text style={styles.plannedDuration}>
                  {actualDuration >= session.plannedDuration 
                    ? `目標の${session.plannedDuration}分を達成しました！` 
                    : `目標は${session.plannedDuration}分でした`}
                </Text>
              )}
            </View>
            
            <View style={styles.divider} />
            
            <Text style={styles.sectionTitle}>今日の練習を評価してください</Text>
            
            {renderRatingStars(satisfactionLevel, setSatisfactionLevel, '満足度')}
            {renderRatingStars(qualityRating, setQualityRating, '品質')}
            
            <Text style={styles.notesLabel}>メモ（オプション）</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="今日の練習の気づきや学びを記録しましょう..."
              multiline
              maxLength={300}
            />
            
            <View style={styles.motivationalContainer}>
              <Text style={styles.motivationalText}>
                継続は力なり。今日の{challenge.name}は、あなたの成長への確かな一歩です。
              </Text>
            </View>
            
            {/* ポイント獲得メッセージ */}
            {showPointsMessage && (
              <View style={styles.pointsMessageContainer}>
                <Text style={styles.pointsMessageTitle}>🎉 ポイント獲得！</Text>
                <Text style={styles.pointsMessageValue}>+{earnedPoints}pt</Text>
                <Text style={styles.pointsMessageDetail}>
                  {'⭐'.repeat(qualityRating)} + 連続ボーナス
                </Text>
              </View>
            )}
          </ScrollView>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={onClose}
            >
              <Text style={styles.buttonSecondaryText}>キャンセル</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.button, 
                styles.buttonPrimary,
                (satisfactionLevel === 0 || qualityRating === 0 || isProcessing) && styles.buttonDisabled
              ]}
              onPress={handleComplete}
              disabled={satisfactionLevel === 0 || qualityRating === 0 || isProcessing}
            >
              <Text style={styles.buttonText}>
                {isProcessing ? 'ポイント計算中...' : showPointsMessage ? 'ポイント獲得！' : '記録する'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalView: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '90%',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  durationContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  durationLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  durationValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  plannedDuration: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  ratingContainer: {
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  starButton: {
    padding: 8,
  },
  starIcon: {
    fontSize: 32,
  },
  starActive: {
    color: '#FFD700',
  },
  starInactive: {
    color: '#ddd',
  },
  ratingDescription: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    height: 20,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  motivationalContainer: {
    marginTop: 8,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  motivationalText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  pointsMessageContainer: {
    marginTop: 16,
    padding: 20,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    alignItems: 'center',
  },
  pointsMessageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  pointsMessageValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 4,
  },
  pointsMessageDetail: {
    fontSize: 14,
    color: '#388E3C',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    minWidth: '45%',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#4CAF50',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonSecondaryText: {
    color: '#666',
    fontSize: 16,
  },
});

export default PostPracticeModal;

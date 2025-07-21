import React, { useState, useRef } from 'react';
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
  Alert,
  Animated,
  Dimensions
} from 'react-native';
import { Challenge, IntegratedSession } from '../../types';
import { MilestoneReward } from '../../types/gamification';
import { 
  calculateSessionPoints, 
  calculateStreakBonus, 
  calculateSessionTotalPoints,
  createPointsTransaction,
  checkMilestoneRewards
} from '../../utils/pointsCalculator';
import { 
  savePointsTransaction, 
  getUserGameStats, 
  saveUserGameStats,
  getCurrentStreak,
  updateStreak
} from '../../utils/gamification';
import RewardAchievementModal from '../RewardAchievementModal';

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
  const [currentStreakDays, setCurrentStreakDays] = useState<number>(0);
  const [showAnimation, setShowAnimation] = useState(false);
  
  // 報酬獲得モーダル用状態
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [achievedReward, setAchievedReward] = useState<MilestoneReward | null>(null);
  const [nextReward, setNextReward] = useState<MilestoneReward | null>(null);
  const [progressToNext, setProgressToNext] = useState<number>(0);
  
  // アニメーション用のAnimated.Value
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // ポイント獲得アニメーションを開始
  const startPointsAnimation = () => {
    setShowAnimation(true);
    
    // アニメーション値をリセット
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.5);
    slideAnim.setValue(50);
    
    // 並列アニメーション実行
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
    
    // 2秒後にフェードアウト
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowAnimation(false);
      });
    }, 2000);
  };

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
        
        // マイルストーン報酬をチェック
        const totalDays = currentStreak + 1; // 簡易的な総日数計算
        const months = Math.ceil(totalDays / 30); // 簡易的な月数計算
        const milestoneRewards = checkMilestoneRewards(challenge.id, totalDays, months);
        const newReward = milestoneRewards.find(reward => 
          !updatedStats.unlockedRewards.includes(reward.id)
        );
        
        // 新しい報酬があれば統計に追加
        if (newReward) {
          updatedStats.unlockedRewards.push(newReward.id);
          await saveUserGameStats(updatedStats);
        }
        
        // アニメーション用データを設定
        setEarnedPoints(totalPoints);
        setCurrentStreakDays(currentStreak + 1);
        
        // ポイント獲得アニメーションを開始
        startPointsAnimation();
        
        // アニメーション完了後の処理
        setTimeout(() => {
          if (newReward) {
            // 新しい報酬があれば報酬モーダルを表示
            setAchievedReward(newReward);
            
            // 次の報酬を設定
            const allRewards = checkMilestoneRewards(challenge.id, 999999, 999); // 全報酬を取得
            const currentIndex = allRewards.findIndex(r => r.id === newReward.id);
            if (currentIndex < allRewards.length - 1) {
              const nextRewardItem = allRewards[currentIndex + 1];
              setNextReward(nextRewardItem);
              // 進捗計算（簡易版）
              const progress = Math.min(100, (updatedStats.totalPoints / nextRewardItem.points) * 100);
              setProgressToNext(progress);
            }
            
            setShowRewardModal(true);
          } else {
            // 報酬がなければ通常完了
            onComplete(satisfactionLevel, qualityRating, notes);
          }
        }, 3000); // アニメーション時間を考慮して3秒に延長
        
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
            
            {/* ポイント獲得アニメーション */}
            {showAnimation && (
              <Animated.View style={[
                styles.animationOverlay,
                {
                  opacity: fadeAnim,
                  transform: [
                    { scale: scaleAnim },
                    { translateY: slideAnim }
                  ]
                }
              ]}>
                <View style={styles.animationContainer}>
                  <Text style={styles.celebrationIcon}>🎉</Text>
                  <Text style={styles.pointsEarned}>+{earnedPoints}pt!</Text>
                  <Text style={styles.pointsDetail}>
                    ({'⭐'.repeat(qualityRating)} + 連続{currentStreakDays}日ボーナス)
                  </Text>
                </View>
              </Animated.View>
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
      
      {/* 報酬獲得モーダル */}
      <RewardAchievementModal
        visible={showRewardModal}
        reward={achievedReward}
        nextReward={nextReward}
        progressToNext={progressToNext}
        onClose={() => {
          setShowRewardModal(false);
          setAchievedReward(null);
          setNextReward(null);
          setProgressToNext(0);
          onComplete(satisfactionLevel, qualityRating, notes);
        }}
      />
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
  // アニメーション用スタイル
  animationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
  },
  animationContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  celebrationIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  pointsEarned: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  pointsDetail: {
    fontSize: 16,
    color: '#666',
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

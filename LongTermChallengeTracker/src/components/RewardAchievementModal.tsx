import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { MilestoneReward } from '../types/gamification';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface RewardAchievementModalProps {
  visible: boolean;
  reward: MilestoneReward | null;
  onClose: () => void;
  nextReward?: MilestoneReward | null;
  progressToNext?: number;
}

const RewardAchievementModal: React.FC<RewardAchievementModalProps> = ({
  visible,
  reward,
  onClose,
  nextReward,
  progressToNext = 0,
}) => {
  // アニメーション用のAnimated.Value
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && reward) {
      startCelebrationAnimation();
    } else {
      resetAnimations();
    }
  }, [visible, reward]);

  const resetAnimations = () => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.3);
    rotateAnim.setValue(0);
    sparkleAnim.setValue(0);
    textFadeAnim.setValue(0);
  };

  const startCelebrationAnimation = () => {
    // 背景フェードイン
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // メインコンテンツのスケールアニメーション
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // 報酬アイコンの回転アニメーション
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // キラキラエフェクト
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // テキストのフェードイン（遅延）
    setTimeout(() => {
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 300);
  };

  const getRewardIcon = (period: string): string => {
    const iconMap: { [key: string]: string } = {
      '1week': '🏅',
      '1month': '🎖️',
      '3month': '🏆',
      '6month': '👑',
      '9month': '💎',
      '1year': '🌟',
      '15month': '⭐',
      '18month': '✨',
      '21month': '🎯',
      '2year': '🎊',
      '27month': '🎉',
      '30month': '🎆',
      '33month': '🌈',
      '3year': '🎇',
      '3year_perfect': '🏅👑',
    };
    return iconMap[period] || '🎉';
  };

  const getCelebrationMessage = (period: string): string => {
    const messages: { [key: string]: string } = {
      '1week': 'おめでとうございます！\n最初のマイルストーンを達成しました！',
      '1month': '素晴らしい継続力です！\n1ヶ月の習慣化を達成しました！',
      '3month': '驚異的な継続力！\n3ヶ月の長期継続を達成しました！',
      '6month': '半年間の継続、お疲れ様でした！\n真の習慣として定着しています！',
      '9month': '9ヶ月間の継続は素晴らしい成果です！\nあなたの意志の強さに敬服します！',
      '1year': '🎉 1年間継続達成！ 🎉\nあなたは真のチャンピオンです！',
      '15month': '15ヶ月の継続は偉業です！\n諦めない心が実を結びました！',
      '18month': '18ヶ月間、本当にお疲れ様でした！\n継続は力なりを体現しています！',
      '21month': '21ヶ月の継続は伝説級です！\nあなたの努力は多くの人の励みになります！',
      '2year': '🌟 2年間継続達成！ 🌟\n不屈の精神で偉大な成果を達成しました！',
      '27month': '27ヶ月の継続は奇跡的です！\nあなたの意志力は無限大です！',
      '30month': '30ヶ月継続は神話級の偉業！\n継続の化身として称賛されるべきです！',
      '33month': '33ヶ月の継続は伝説を超えました！\nあなたは継続のマスターです！',
      '3year': '🎆 3年間完全継続達成！ 🎆\n人類の可能性を証明する偉業です！',
      '3year_perfect': '🏅👑 完璧な3年間達成！ 👑🏅\n史上最高の継続記録です！\nあなたは永遠の伝説となりました！',
    };
    return messages[period] || 'おめでとうございます！新しい報酬を獲得しました！';
  };

  if (!reward) return null;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        {/* 背景キラキラエフェクト */}
        <Animated.View style={[styles.sparkleContainer, { opacity: sparkleOpacity }]}>
          {[...Array(20)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.sparkle,
                {
                  left: Math.random() * screenWidth,
                  top: Math.random() * screenHeight,
                },
              ]}
            >
              <Text style={styles.sparkleText}>✨</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* 報酬アイコン */}
          <Animated.View
            style={[
              styles.rewardIconContainer,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <Text style={styles.rewardIcon}>{getRewardIcon(reward.period)}</Text>
          </Animated.View>

          {/* メインコンテンツ */}
          <Animated.View style={[styles.contentContainer, { opacity: textFadeAnim }]}>
            <Text style={styles.achievementTitle}>🎉 報酬獲得！ 🎉</Text>
            <Text style={styles.rewardName}>{reward.name}</Text>
            <Text style={styles.rewardPoints}>+{reward.points} ポイント</Text>
            
            <View style={styles.achievementDetails}>
              <Text style={styles.achievementCondition}>
                達成条件: {reward.requiredDays}日間継続
              </Text>
              <Text style={styles.achievementPeriod}>
                期間: {reward.months}ヶ月
              </Text>
            </View>

            <Text style={styles.celebrationMessage}>
              {getCelebrationMessage(reward.period)}
            </Text>

            {/* 次の報酬への進捗 */}
            {nextReward && (
              <View style={styles.nextRewardContainer}>
                <Text style={styles.nextRewardTitle}>次の報酬</Text>
                <Text style={styles.nextRewardName}>{nextReward.name}</Text>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${progressToNext}%` }]} />
                </View>
                <Text style={styles.progressText}>{Math.round(progressToNext)}%</Text>
              </View>
            )}
          </Animated.View>

          {/* 閉じるボタン */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>続ける</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleText: {
    fontSize: 20,
    color: '#FFD700',
  },
  modalContainer: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: 30,
    padding: 30,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  rewardIconContainer: {
    marginBottom: 20,
  },
  rewardIcon: {
    fontSize: 100,
    textAlign: 'center',
  },
  contentContainer: {
    alignItems: 'center',
  },
  achievementTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
    textAlign: 'center',
  },
  rewardName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  rewardPoints: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00FF7F',
    marginBottom: 20,
    textAlign: 'center',
  },
  achievementDetails: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  achievementCondition: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 5,
    textAlign: 'center',
  },
  achievementPeriod: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  celebrationMessage: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 25,
    fontWeight: '500',
  },
  nextRewardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
  },
  nextRewardTitle: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  nextRewardName: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 5,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00FF7F',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  closeButton: {
    backgroundColor: '#FFD700',
    borderRadius: 25,
    paddingHorizontal: 40,
    paddingVertical: 15,
    marginTop: 10,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
});

export default RewardAchievementModal;

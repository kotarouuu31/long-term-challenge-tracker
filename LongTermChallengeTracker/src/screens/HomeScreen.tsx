import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import { Challenge, Reward } from '../types';
import { RootStackParamList } from '../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [todayCompleted, setTodayCompleted] = useState<{[key: string]: boolean}>({});
  const [showRewardMessage, setShowRewardMessage] = useState(false);
  const [rewardMessage, setRewardMessage] = useState('');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [nextReward, setNextReward] = useState<Reward | null>(null);

  // 初期データの設定
  useEffect(() => {
    initializeData();
    loadTodayStatus();
    loadTotalPoints();
    loadRewards();
  }, []);

  // ポイントが変更された時に次の報酬を更新
  useEffect(() => {
    updateNextReward();
  }, [totalPoints, rewards]);

  const initializeData = async () => {
    const defaultChallenges: Challenge[] = [
      {
        id: '1',
        name: '筋トレ',
        type: 'workout',
        description: 'ワンパンマントレーニング',
        goal: 1095, // 3年間
        currentProgress: 0,
        lastCompletedDate: null,
        color: '#FF5722',
        icon: '💪',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2', 
        name: 'ピアノ練習',
        type: 'piano',
        description: 'ピアノ練習',
        goal: 1095, // 3年間
        currentProgress: 0,
        lastCompletedDate: null,
        color: '#9C27B0',
        icon: '🎹',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'ストレッチ',
        type: 'stretch', 
        description: 'ストレッチ',
        goal: 1095, // 3年間
        currentProgress: 0,
        lastCompletedDate: null,
        color: '#4CAF50',
        icon: '🧘',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        name: 'DJ練習',
        type: 'dj',
        description: 'DJ練習',
        goal: 10000, // 10000時間目標
        currentProgress: 0,
        lastCompletedDate: null,
        color: '#FF9800',
        icon: '🎧',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    try {
      const storedChallenges = await AsyncStorage.getItem('challenges');
      if (storedChallenges) {
        setChallenges(JSON.parse(storedChallenges));
      } else {
        setChallenges(defaultChallenges);
        await AsyncStorage.setItem('challenges', JSON.stringify(defaultChallenges));
      }
    } catch (error) {
      console.error('チャレンジデータの初期化に失敗:', error);
      setChallenges(defaultChallenges);
    }
  };

  const loadTodayStatus = async () => {
    try {
      const today = new Date().toDateString();
      const storedStatus = await AsyncStorage.getItem(`todayCompleted_${today}`);
      if (storedStatus) {
        setTodayCompleted(JSON.parse(storedStatus));
      }
    } catch (error) {
      console.error('今日の状況の読み込みに失敗:', error);
    }
  };

  const loadTotalPoints = async () => {
    try {
      const storedPoints = await AsyncStorage.getItem('totalPoints');
      if (storedPoints) {
        setTotalPoints(parseInt(storedPoints));
      }
    } catch (error) {
      console.error('ポイントの読み込みに失敗:', error);
    }
  };

  const loadRewards = async () => {
    try {
      const storedRewards = await AsyncStorage.getItem('rewards');
      if (storedRewards) {
        setRewards(JSON.parse(storedRewards));
      } else {
        // デフォルト報酬を初期化
        const defaultRewards = createDefaultRewards();
        setRewards(defaultRewards);
        await AsyncStorage.setItem('rewards', JSON.stringify(defaultRewards));
      }
    } catch (error) {
      console.error('報酬データの読み込みに失敗:', error);
    }
  };

  const createDefaultRewards = (): Reward[] => {
    const defaultRewards = [];
    for (let i = 1; i <= 10; i++) {
      const points = i * 100;
      defaultRewards.push({
        id: `reward_${points}`,
        points,
        title: `${points}pt報酬`,
        description: `${points}ポイント達成の報酬を設定してください`,
        achieved: false
      });
    }
    return defaultRewards;
  };

  const updateNextReward = () => {
    const nextUnachievedReward = rewards.find(reward => !reward.achieved && reward.points > totalPoints);
    setNextReward(nextUnachievedReward || null);
  };

  const checkAndUpdateRewardAchievement = async (newPoints: number) => {
    const achievedRewards = rewards.filter(reward => !reward.achieved && reward.points <= newPoints);
    
    if (achievedRewards.length > 0) {
      const updatedRewards = rewards.map(reward => {
        if (achievedRewards.some(ar => ar.id === reward.id)) {
          return { ...reward, achieved: true, achievedAt: new Date() };
        }
        return reward;
      });
      
      setRewards(updatedRewards);
      await AsyncStorage.setItem('rewards', JSON.stringify(updatedRewards));
      
      // 最新の達成報酬を表示
      const latestReward = achievedRewards.sort((a, b) => b.points - a.points)[0];
      setRewardMessage(`🎉 ${latestReward.points}pt達成！\n設定した報酬: ${latestReward.title}`);
      setShowRewardMessage(true);
      setTimeout(() => setShowRewardMessage(false), 4000);
    }
  };

  const handleCompleteChallenge = async (challengeId: string) => {
    try {
      const today = new Date().toDateString();
      const newTodayCompleted = {
        ...todayCompleted,
        [challengeId]: !todayCompleted[challengeId]
      };
      
      setTodayCompleted(newTodayCompleted);
      await AsyncStorage.setItem(`todayCompleted_${today}`, JSON.stringify(newTodayCompleted));
      
      // ポイント計算（1チャレンジ完了 = 1ポイント）
      if (!todayCompleted[challengeId]) {
        const newTotalPoints = totalPoints + 1;
        setTotalPoints(newTotalPoints);
        await AsyncStorage.setItem('totalPoints', newTotalPoints.toString());
        
        // 報酬達成チェック
        await checkAndUpdateRewardAchievement(newTotalPoints);
      } else {
        // チェックを外した場合はポイントを減らす
        const newTotalPoints = Math.max(0, totalPoints - 1);
        setTotalPoints(newTotalPoints);
        await AsyncStorage.setItem('totalPoints', newTotalPoints.toString());
      }
      
      // チャレンジデータの更新
      const updatedChallenges = challenges.map(challenge => {
        if (challenge.id === challengeId) {
          const currentProgress = newTodayCompleted[challengeId] 
            ? challenge.currentProgress + 1 
            : Math.max(0, challenge.currentProgress - 1);
          return {
            ...challenge,
            currentProgress,
            lastCompletedDate: newTodayCompleted[challengeId] ? new Date() : challenge.lastCompletedDate,
            updatedAt: new Date()
          };
        }
        return challenge;
      });
      
      setChallenges(updatedChallenges);
      await AsyncStorage.setItem('challenges', JSON.stringify(updatedChallenges));
      
    } catch (error) {
      console.error('チャレンジ完了の処理に失敗:', error);
    }
  };

  const handleChallengePress = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      switch (challenge.type) {
        case 'workout':
          navigation.navigate('Workout');
          break;
        case 'piano':
          navigation.navigate('Piano');
          break;
        case 'stretch':
          navigation.navigate('Stretch');
          break;
        case 'dj':
          navigation.navigate('Dj');
          break;
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <ScrollView style={styles.scrollView}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.title}>Long Term Challenge Tracker</Text>
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsText}>🎯 累計ポイント: {totalPoints}</Text>
          </View>
        </View>
        
        {/* 今日の達成状況 */}
        <View style={styles.todaySection}>
          <Text style={styles.sectionTitle}>今日の達成状況</Text>
          {challenges.map((challenge) => (
            <TouchableOpacity
              key={challenge.id}
              style={styles.challengeItem}
              onPress={() => handleCompleteChallenge(challenge.id)}
            >
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeIcon}>
                  {todayCompleted[challenge.id] ? '✅' : '⬜'}
                </Text>
                <View style={styles.challengeDetails}>
                  <Text style={styles.challengeName}>{challenge.name}</Text>
                  <Text style={styles.challengeDescription}>{challenge.description}</Text>
                  <Text style={styles.challengeProgress}>
                    総日数: {challenge.currentProgress}日
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => handleChallengePress(challenge.id)}
              >
                <Text style={styles.detailButtonText}>詳細</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* 次の報酬まで */}
        <View style={styles.rewardSection}>
          <View style={styles.rewardHeader}>
            <Text style={styles.sectionTitle}>報酬システム</Text>
            <TouchableOpacity 
              style={styles.rewardSettingsButton}
              onPress={() => navigation.navigate('Rewards')}
            >
              <Text style={styles.rewardSettingsButtonText}>報酬設定</Text>
            </TouchableOpacity>
          </View>
          
          {nextReward ? (
            <View style={styles.nextRewardContainer}>
              <Text style={styles.nextRewardTitle}>次の報酬まで</Text>
              <Text style={styles.nextRewardPoints}>
                あと {nextReward.points - totalPoints}pt
              </Text>
              <Text style={styles.nextRewardName}>{nextReward.title}</Text>
              <Text style={styles.nextRewardDescription}>{nextReward.description}</Text>
              
              {/* プログレスバー */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill,
                      { 
                        width: `${Math.min(100, (totalPoints / nextReward.points) * 100)}%` 
                      }
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {totalPoints} / {nextReward.points}pt
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.noRewardContainer}>
              <Text style={styles.noRewardText}>🎉 すべての報酬を達成しました！</Text>
              <Text style={styles.noRewardSubText}>新しい報酬を設定してみましょう</Text>
            </View>
          )}
        </View>
        
        {/* 報酬メッセージ */}
        {showRewardMessage && (
          <View style={styles.rewardOverlay}>
            <View style={styles.rewardContainer}>
              <Text style={styles.rewardText}>{rewardMessage}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  pointsContainer: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
  },
  pointsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1976D2',
  },
  todaySection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  challengeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  challengeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  challengeDetails: {
    flex: 1,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  challengeProgress: {
    fontSize: 12,
    color: '#999999',
  },
  detailButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  detailButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  rewardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    margin: 32,
  },
  rewardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  // 報酬セクションのスタイル
  rewardSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rewardSettingsButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  rewardSettingsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  nextRewardContainer: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
  },
  nextRewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  nextRewardPoints: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  nextRewardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  nextRewardDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  noRewardContainer: {
    backgroundColor: '#F1F8E9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  noRewardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  noRewardSubText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

export default HomeScreen;

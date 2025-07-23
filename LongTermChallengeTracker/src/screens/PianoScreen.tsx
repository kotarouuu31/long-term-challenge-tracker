import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Challenge } from '../types';

// ピアノ練習専用画面
const PianoScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const challengeId = '2'; // ピアノのチャレンジID
  const challengeName = 'ピアノ練習';

  // 状態管理
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  // 初期データの読み込み
  useEffect(() => {
    loadChallengeData();
    loadTodayStatus();
    loadTotalPoints();
  }, []);

  const loadChallengeData = async () => {
    try {
      const storedChallenges = await AsyncStorage.getItem('challenges');
      if (storedChallenges) {
        const challenges: Challenge[] = JSON.parse(storedChallenges);
        const pianoChallenge = challenges.find(c => c.id === challengeId);
        if (pianoChallenge) {
          setChallenge(pianoChallenge);
        }
      }
    } catch (error) {
      console.error('チャレンジデータの読み込みに失敗:', error);
    }
  };

  const loadTodayStatus = async () => {
    try {
      const today = new Date().toDateString();
      const storedStatus = await AsyncStorage.getItem(`todayCompleted_${today}`);
      if (storedStatus) {
        const todayStatus = JSON.parse(storedStatus);
        setTodayCompleted(todayStatus[challengeId] || false);
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

  const handleCompleteToday = async () => {
    try {
      const today = new Date().toDateString();
      const newCompleted = !todayCompleted;
      
      // 今日の完了状況を更新
      const storedStatus = await AsyncStorage.getItem(`todayCompleted_${today}`);
      const todayStatus = storedStatus ? JSON.parse(storedStatus) : {};
      todayStatus[challengeId] = newCompleted;
      await AsyncStorage.setItem(`todayCompleted_${today}`, JSON.stringify(todayStatus));
      
      setTodayCompleted(newCompleted);
      
      // ポイント計算（1チャレンジ完了 = 1ポイント）
      if (newCompleted) {
        const newTotalPoints = totalPoints + 1;
        setTotalPoints(newTotalPoints);
        await AsyncStorage.setItem('totalPoints', newTotalPoints.toString());
        
        // 100ポイントごとに祝福メッセージ
        if (newTotalPoints % 100 === 0) {
          alert(`🎉 おめでとうございます！${newTotalPoints}ポイント達成！`);
        }
      } else {
        const newTotalPoints = Math.max(0, totalPoints - 1);
        setTotalPoints(newTotalPoints);
        await AsyncStorage.setItem('totalPoints', newTotalPoints.toString());
      }
      
      // チャレンジデータの更新
      if (challenge) {
        const storedChallenges = await AsyncStorage.getItem('challenges');
        if (storedChallenges) {
          const challenges: Challenge[] = JSON.parse(storedChallenges);
          const updatedChallenges = challenges.map(c => {
            if (c.id === challengeId) {
              const currentProgress = newCompleted 
                ? c.currentProgress + 1 
                : Math.max(0, c.currentProgress - 1);
              return {
                ...c,
                currentProgress,
                lastCompletedDate: newCompleted ? new Date() : c.lastCompletedDate,
                updatedAt: new Date()
              };
            }
            return c;
          });
          
          await AsyncStorage.setItem('challenges', JSON.stringify(updatedChallenges));
          const updatedChallenge = updatedChallenges.find(c => c.id === challengeId);
          if (updatedChallenge) {
            setChallenge(updatedChallenge);
          }
        }
      }
    } catch (error) {
      console.error('完了処理に失敗:', error);
    }
  };

  const calculateCurrentStreak = () => {
    // 簡単なストリーク計算（実際の実装では過去のデータを参照）
    return challenge?.currentProgress || 0;
  };

  if (!challenge) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{challengeName}</Text>
      </View>

      <View style={styles.content}>
        {/* 今日の状況 */}
        <View style={styles.todaySection}>
          <Text style={styles.sectionTitle}>今日の状況</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusIcon}>
              {todayCompleted ? '✅' : '⬜'}
            </Text>
            <Text style={styles.statusText}>
              {todayCompleted ? '完了済み' : '未完了'}
            </Text>
          </View>
        </View>

        {/* 統計情報 */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>統計</Text>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>総日数</Text>
            <Text style={styles.statValue}>{challenge.currentProgress}日</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>現在のストリーク</Text>
            <Text style={styles.statValue}>{calculateCurrentStreak()}日</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>累計ポイント</Text>
            <Text style={styles.statValue}>{totalPoints}pt</Text>
          </View>
        </View>

        {/* 完了ボタン */}
        <TouchableOpacity 
          style={[
            styles.completeButton, 
            todayCompleted && styles.completedButton
          ]} 
          onPress={handleCompleteToday}
        >
          <Text style={[
            styles.completeButtonText,
            todayCompleted && styles.completedButtonText
          ]}>
            {todayCompleted ? '今日の完了を取り消し' : '今日完了'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#333333',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2196F3',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  todaySection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    color: '#333333',
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statLabel: {
    fontSize: 16,
    color: '#666666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: '#FF9800',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  completedButtonText: {
    color: '#FFFFFF',
  },
});

export default PianoScreen;

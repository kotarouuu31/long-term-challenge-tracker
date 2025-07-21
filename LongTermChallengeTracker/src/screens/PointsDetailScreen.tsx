import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { IntegratedSession } from '../types';
import { RootStackParamList } from '../types/navigation';
import {
  calculateTotalPoints,
  calculateRewardProgress,
  getRecentPointsHistory,
  RewardProgress,
  PointsHistory,
  REWARDS
} from '../utils/gamification';
import { loadSessions } from '../utils/sessionData';

type PointsDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PointsDetail'>;

interface PointsDetailScreenProps {
  navigation: PointsDetailScreenNavigationProp;
}

const PointsDetailScreen = ({ navigation }: PointsDetailScreenProps) => {
  const [sessions, setSessions] = useState<IntegratedSession[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [rewardProgress, setRewardProgress] = useState<RewardProgress[]>([]);
  const [pointsHistory, setPointsHistory] = useState<PointsHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPointsData();
  }, []);

  const loadPointsData = async () => {
    try {
      setLoading(true);
      const allSessions = await loadSessions();
      setSessions(allSessions);
      
      const total = calculateTotalPoints(allSessions);
      setTotalPoints(total);
      
      const progress = calculateRewardProgress(allSessions, total);
      setRewardProgress(progress);
      
      const history = getRecentPointsHistory(allSessions, 15);
      setPointsHistory(history);
    } catch (error) {
      console.error('ポイントデータの読み込みに失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: 'achieved' | 'in_progress' | 'locked') => {
    switch (status) {
      case 'achieved':
        return '✅';
      case 'in_progress':
        return '🔄';
      case 'locked':
        return '🔒';
      default:
        return '🔒';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const renderRewardItem = ({ item }: { item: RewardProgress }) => (
    <View style={[styles.rewardCard, { borderLeftColor: item.reward.color }]}>
      <View style={styles.rewardHeader}>
        <View style={styles.rewardTitleContainer}>
          <Text style={styles.rewardIcon}>{item.reward.icon}</Text>
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardTitle}>{item.reward.title}</Text>
            <Text style={styles.rewardDescription}>{item.reward.description}</Text>
          </View>
        </View>
        <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${item.progressPercentage}%`,
                backgroundColor: item.reward.color 
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(item.progressPercentage)}%
        </Text>
      </View>
      
      <View style={styles.requirementContainer}>
        <Text style={styles.requirementText}>
          ポイント: {item.currentPoints} / {item.reward.requiredPoints}
        </Text>
        {item.reward.requiredDays && (
          <Text style={styles.requirementText}>
            継続日数: {item.currentDays} / {item.reward.requiredDays}日
          </Text>
        )}
      </View>
    </View>
  );

  const renderHistoryItem = ({ item }: { item: PointsHistory }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyLeft}>
        <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
        <Text style={styles.historyChallenge}>{item.challengeName}</Text>
      </View>
      <View style={styles.historyRight}>
        <Text style={styles.historyPoints}>+{item.points}pt</Text>
        <Text style={styles.historyDuration}>{item.sessionDuration}分</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ポイント詳細</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 累計ポイント表示 */}
        <View style={styles.totalPointsCard}>
          <Text style={styles.totalPointsLabel}>累計ポイント</Text>
          <Text style={styles.totalPointsValue}>{totalPoints.toLocaleString()}</Text>
          <Text style={styles.totalPointsUnit}>pts</Text>
        </View>

        {/* 報酬進捗セクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 報酬進捗</Text>
          <FlatList
            data={rewardProgress}
            renderItem={renderRewardItem}
            keyExtractor={(item) => item.reward.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* 報酬条件説明 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 報酬条件について</Text>
          <View style={styles.explanationCard}>
            <Text style={styles.explanationText}>
              • ポイントは練習時間と満足度・品質評価から計算されます{'\n'}
              • 連続セッションでは20%のボーナスポイントが付与されます{'\n'}
              • 報酬獲得にはポイントと継続日数の両方の条件を満たす必要があります{'\n'}
              • 継続日数は最大連続記録で判定されます
            </Text>
          </View>
        </View>

        {/* 最近のポイント履歴 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 最近のポイント履歴</Text>
          {pointsHistory.length > 0 ? (
            <FlatList
              data={pointsHistory}
              renderItem={renderHistoryItem}
              keyExtractor={(item, index) => `${item.date}-${index}`}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>まだ履歴がありません</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  totalPointsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  totalPointsLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  totalPointsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  totalPointsUnit: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  rewardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  rewardTitleContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  rewardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 14,
    color: '#666',
  },
  statusIcon: {
    fontSize: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    minWidth: 35,
    textAlign: 'right',
  },
  requirementContainer: {
    gap: 4,
  },
  requirementText: {
    fontSize: 12,
    color: '#888',
  },
  explanationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  explanationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  historyItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  historyLeft: {
    flex: 1,
  },
  historyDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  historyChallenge: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyPoints: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  historyDuration: {
    fontSize: 12,
    color: '#666',
  },
  noDataContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  noDataText: {
    fontSize: 14,
    color: '#888',
  },
});

export default PointsDetailScreen;

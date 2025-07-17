import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DailyStats, IntegratedSession } from '../../types';

interface DailyDashboardProps {
  dailyStats: DailyStats | null;
  todaySessions: IntegratedSession[];
  challengeName: string;
  onStartNewSession: () => void;
}

const DailyDashboard: React.FC<DailyDashboardProps> = ({
  dailyStats,
  todaySessions,
  challengeName,
  onStartNewSession
}) => {
  // 今日の日付をフォーマット
  const formatToday = (): string => {
    const today = new Date();
    return today.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
  };
  
  // セッションカードの時間フォーマット
  const formatTime = (date: string): string => {
    return new Date(date).toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // 動機のキーワード抽出
  const extractMotivationKeywords = (sessions: IntegratedSession[]): string[] => {
    const keywords: string[] = [];
    
    sessions.forEach(session => {
      if (session.motivationResponse && session.motivationResponse.trim() !== '') {
        // 簡易的なキーワード抽出（実際のアプリではより高度な処理が必要）
        const words = session.motivationResponse
          .toLowerCase()
          .split(/\s+/)
          .filter((word: string) => word.length > 3)
          .slice(0, 2);
        
        keywords.push(...words);
      }
    });
    
    // 重複を削除して返す
    return [...new Set(keywords)].slice(0, 3);
  };
  
  const motivationKeywords = extractMotivationKeywords(todaySessions);
  
  // 目標達成率の計算
  const calculateGoalCompletion = (): number => {
    if (!dailyStats || !dailyStats.targetDuration) return 0;
    return Math.min(100, (dailyStats.totalDuration / dailyStats.targetDuration) * 100);
  };
  
  const goalCompletion = calculateGoalCompletion();
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatToday()}</Text>
        <Text style={styles.title}>{challengeName}の今日の記録</Text>
      </View>
      
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {dailyStats?.totalDuration || 0}分
          </Text>
          <Text style={styles.summaryLabel}>練習時間</Text>
        </View>
        
        <View style={styles.summaryDivider} />
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {todaySessions.length}
          </Text>
          <Text style={styles.summaryLabel}>セッション数</Text>
        </View>
        
        <View style={styles.summaryDivider} />
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {dailyStats?.averageSatisfaction.toFixed(1) || '0.0'}
          </Text>
          <Text style={styles.summaryLabel}>平均満足度</Text>
        </View>
      </View>
      
      {dailyStats?.targetDuration ? (
        <View style={styles.goalContainer}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>今日の目標</Text>
            <Text style={styles.goalValue}>
              {dailyStats.totalDuration}/{dailyStats.targetDuration}分
            </Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar,
                { width: `${goalCompletion}%` }
              ]}
            />
          </View>
          
          <Text style={styles.goalCompletionText}>
            {goalCompletion >= 100 
              ? '目標達成おめでとうございます！' 
              : `目標達成まであと${Math.max(0, (dailyStats.targetDuration || 0) - dailyStats.totalDuration)}分`}
          </Text>
        </View>
      ) : null}
      
      {motivationKeywords.length > 0 && (
        <View style={styles.motivationContainer}>
          <Text style={styles.sectionTitle}>今日の動機</Text>
          <View style={styles.tagsContainer}>
            {motivationKeywords.map((keyword, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{keyword}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      <View style={styles.sessionsContainer}>
        <Text style={styles.sectionTitle}>今日のセッション</Text>
        
        {todaySessions.length > 0 ? (
          todaySessions.map((session, index) => (
            <View key={index} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionTime}>
                  {formatTime(session.startTime)}
                </Text>
                <View style={styles.sessionDuration}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.sessionDurationText}>
                    {session.actualDuration}分
                  </Text>
                </View>
              </View>
              
              <View style={styles.sessionDetails}>
                {session.satisfactionLevel > 0 && (
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingLabel}>満足度:</Text>
                    <View style={styles.starsContainer}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Text 
                          key={star} 
                          style={[
                            styles.starIcon, 
                            star <= session.satisfactionLevel 
                              ? styles.starActive 
                              : styles.starInactive
                          ]}
                        >
                          ★
                        </Text>
                      ))}
                    </View>
                  </View>
                )}
                
                {session.notes && session.notes.trim() !== '' && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>メモ:</Text>
                    <Text style={styles.notesText}>{session.notes}</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptySessionsContainer}>
            <Text style={styles.emptySessionsText}>
              今日はまだセッションがありません
            </Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.startButton}
        onPress={onStartNewSession}
      >
        <Ionicons name="add-circle" size={24} color="white" />
        <Text style={styles.startButtonText}>新しいセッションを開始</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
  summaryDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#eee',
  },
  goalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  goalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  goalCompletionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  motivationContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#555',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f0f8ff',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#4682b4',
  },
  sessionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sessionCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  sessionDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  sessionDurationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  sessionDetails: {
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    fontSize: 16,
    marginRight: 2,
  },
  starActive: {
    color: '#FFD700',
  },
  starInactive: {
    color: '#ddd',
  },
  notesContainer: {
    marginTop: 4,
  },
  notesLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  emptySessionsContainer: {
    alignItems: 'center',
    padding: 24,
  },
  emptySessionsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default DailyDashboard;

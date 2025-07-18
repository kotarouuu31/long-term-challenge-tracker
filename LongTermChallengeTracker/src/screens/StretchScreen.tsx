import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import TimerControls from '../components/timer/TimerControls';
import MotivationModal from '../components/modals/MotivationModal';
import TaskPlanningModal from '../components/modals/TaskPlanningModal';
import PostPracticeModal from '../components/modals/PostPracticeModal';
import ContinueModal from '../components/modals/ContinueModal';
import useIntegratedSession from '../hooks/useIntegratedSession';
import { loadSessions, loadDailyStats } from '../utils/sessionData';
import { IntegratedSession, DailyStats } from '../types';

// ストレッチ専用画面
const StretchScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const challengeId = 'stretch'; // ストレッチのチャレンジID

  // セッション管理フック
  const {
    currentSession,
    activeModal,
    isTimerRunning,
    elapsedTime,
    plannedDuration,
    loading,
    error,
    showMotivationModal,
    showTaskPlanningModal,
    showPostPracticeModal,
    showContinueModal,
    closeModal,
    startNewSession,
    handlePauseTimer,
    handleResumeTimer,
    completeCurrentSession
  } = useIntegratedSession(challengeId);

  // 状態管理
  const [todaySessions, setTodaySessions] = useState<IntegratedSession[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [localMotivation, setLocalMotivation] = useState('');
  const [showStatsView, setShowStatsView] = useState(false);
  const [stretchTypes, setStretchTypes] = useState([
    { name: '全身ストレッチ', completed: true },
    { name: '肩甲骨ストレッチ', completed: false },
    { name: '股関節ストレッチ', completed: true },
    { name: '足首ストレッチ', completed: false }
  ]);

  // データ読み込み
  useEffect(() => {
    const loadData = async () => {
      try {
        const sessions = await loadSessions();
        const stats = await loadDailyStats();
        
        // 今日のセッションをフィルタリング
        const today = new Date().toISOString().split('T')[0];
        const filteredSessions = sessions.filter(session => {
          if (!session || !session.date) return false;
          try {
            const sessionDate = new Date(session.date).toISOString().split('T')[0];
            return sessionDate === today && session.challengeId === challengeId;
          } catch (e) {
            return false;
          }
        });
        
        setTodaySessions(filteredSessions);
        
        // 最新の統計情報を取得
        if (stats && stats.length > 0) {
          setDailyStats(stats[stats.length - 1]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, [challengeId]);

  // セッション開始のハンドラー
  const handleStartSession = () => {
    showMotivationModal();
  };

  // モチベーション入力後のハンドラー
  const handleMotivationComplete = (question: string, motivation: string, aiResponse: string) => {
    setLocalMotivation(motivation);
    closeModal();
    showTaskPlanningModal();
  };

  // タスク計画入力後のハンドラー
  const handleTaskPlanningComplete = (duration: number) => {
    closeModal();
    startNewSession(
      "今日のストレッチで何を達成したいですか？",
      localMotivation,
      "AIレスポンス", // 仮のAIレスポンス
      duration
    );
  };

  // セッション終了のハンドラー
  const handleEndSession = () => {
    showPostPracticeModal();
  };

  // 練習後の振り返り入力後のハンドラー
  const handlePostPracticeComplete = (satisfactionLevel: number, qualityRating: number, notes: string) => {
    closeModal();
    completeCurrentSession(satisfactionLevel, qualityRating, notes)
      .then(() => {
        showContinueModal();
      });
  };

  // 継続モーダルのハンドラー
  const handleContinue = (duration: number) => {
    closeModal();
    showMotivationModal();
  };

  // ストレッチ項目の完了状態を切り替える
  const toggleStretchCompletion = (index: number) => {
    const updatedStretchTypes = [...stretchTypes];
    updatedStretchTypes[index].completed = !updatedStretchTypes[index].completed;
    setStretchTypes(updatedStretchTypes);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.backButtonText}>← ホームに戻る</Text>
          </TouchableOpacity>
          <Text style={styles.title}>ストレッチ</Text>
          <Text style={styles.subtitle}>3年間継続目標</Text>
        </View>

        {/* 今日の進捗サマリー */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>今日の進捗</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{todaySessions.length}</Text>
              <Text style={styles.statLabel}>セッション</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {todaySessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0)} 分
              </Text>
              <Text style={styles.statLabel}>合計時間</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {dailyStats?.pointsEarned || 0}
              </Text>
              <Text style={styles.statLabel}>ポイント</Text>
            </View>
          </View>
        </View>

        {/* ストレッチチェックリスト */}
        <View style={styles.stretchListContainer}>
          <Text style={styles.sectionTitle}>ストレッチチェックリスト</Text>
          {stretchTypes.map((stretch, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.stretchItem}
              onPress={() => toggleStretchCompletion(index)}
            >
              <View style={[
                styles.checkbox, 
                stretch.completed ? styles.checkboxCompleted : {}
              ]}>
                {stretch.completed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[
                styles.stretchText,
                stretch.completed ? styles.stretchTextCompleted : {}
              ]}>
                {stretch.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 柔軟性の進捗 */}
        <View style={styles.flexibilityContainer}>
          <Text style={styles.sectionTitle}>柔軟性の進捗</Text>
          <View style={styles.flexibilityItem}>
            <Text style={styles.flexibilityLabel}>前屈</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '60%' }]} />
            </View>
            <Text style={styles.progressText}>+5cm (先週比)</Text>
          </View>
          <View style={styles.flexibilityItem}>
            <Text style={styles.flexibilityLabel}>開脚</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '40%' }]} />
            </View>
            <Text style={styles.progressText}>+3cm (先週比)</Text>
          </View>
        </View>

        {/* タイマーコントロール */}
        {!showStatsView && (
          <View style={styles.timerContainer}>
            <TimerControls 
              isRunning={isTimerRunning}
              elapsedTime={elapsedTime}
              plannedDuration={plannedDuration}
              onPause={handlePauseTimer}
              onResume={handleResumeTimer}
              onStop={handleEndSession}
            />
          </View>
        )}

        {/* アクションボタン */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStartSession}
          >
            <Text style={styles.startButtonText}>ストレッチ開始</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.statsToggleButton}
            onPress={() => setShowStatsView(!showStatsView)}
          >
            <Text style={styles.statsToggleText}>
              {showStatsView ? "タイマーを表示" : "統計を表示"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* モーダルコンポーネント */}
      <MotivationModal 
        visible={activeModal === 'motivation'} 
        onClose={closeModal}
        onComplete={handleMotivationComplete} 
        challenge={{
          id: challengeId,
          name: 'ストレッチ',
          description: '3年間継続目標',
          type: 'duration',
          goal: 1095,
          currentProgress: 0,
          lastCompletedDate: null,
          icon: '🧉',
          color: '#C8A2C8'
        }}
      />
      
      <TaskPlanningModal 
        visible={activeModal === 'taskPlanning'} 
        onClose={closeModal}
        onSelectDuration={handleTaskPlanningComplete} 
        challenge={{
          id: challengeId,
          name: 'ストレッチ',
          description: '3年間継続目標',
          type: 'duration',
          goal: 1095,
          currentProgress: 0,
          lastCompletedDate: null,
          icon: '🧉',
          color: '#C8A2C8'
        }}
      />
      
      <PostPracticeModal 
        visible={activeModal === 'postPractice'} 
        onClose={closeModal}
        onComplete={handlePostPracticeComplete} 
        challenge={{
          id: challengeId,
          name: 'ストレッチ',
          description: '3年間継続目標',
          type: 'duration',
          goal: 1095,
          currentProgress: 0,
          lastCompletedDate: null,
          icon: '🧉',
          color: '#C8A2C8'
        }}
        session={currentSession}
        actualDuration={elapsedTime / 60000} // ミリ秒から分に変換
      />
      
      <ContinueModal 
        visible={activeModal === 'continue'} 
        onClose={closeModal}
        onContinue={handleContinue} 
        challenge={{
          id: challengeId,
          name: 'ストレッチ',
          description: '3年間継続目標',
          type: 'duration',
          goal: 1095,
          currentProgress: 0,
          lastCompletedDate: null,
          icon: '🧉',
          color: '#C8A2C8'
        }}
        completedSession={currentSession}
      />
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
    color: '#333',
  },
  header: {
    padding: 16,
    backgroundColor: '#C8A2C8',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  summaryContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#C8A2C8',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  stretchListContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  stretchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C8A2C8',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#C8A2C8',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stretchText: {
    fontSize: 16,
    color: '#333',
  },
  stretchTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  flexibilityContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  flexibilityItem: {
    marginBottom: 16,
  },
  flexibilityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#C8A2C8',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  timerContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionContainer: {
    margin: 16,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#C8A2C8',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsToggleButton: {
    padding: 8,
  },
  statsToggleText: {
    color: '#666',
    fontSize: 16,
  },
});

export default StretchScreen;

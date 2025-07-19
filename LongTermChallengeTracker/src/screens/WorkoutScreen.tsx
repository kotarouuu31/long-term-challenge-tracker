import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import TimerControls from '../components/timer/TimerControls';
import MotivationModal from '../components/modals/MotivationModal';
import TaskPlanningModal from '../components/modals/TaskPlanningModal';
import PostPracticeModal from '../components/modals/PostPracticeModal';
import ContinueModal from '../components/modals/ContinueModal';
import MoodCheckModal from '../components/MoodCheckModal';
import IfThenPlanModal from '../components/IfThenPlanModal';
import MiniTaskModal from '../components/MiniTaskModal';
import useIntegratedSession from '../hooks/useIntegratedSession';
import useMotivationFlow from '../hooks/useMotivationFlow';
import { loadSessions, loadDailyStats } from '../utils/sessionData';
import { IntegratedSession, DailyStats } from '../types';
import { MoodType, IfThenPlan } from '../types/motivation';

// ワークアウト専用画面
const WorkoutScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const challengeId = 'workout'; // 筋トレのチャレンジID
  const challengeName = '筋トレ（ワンパンマントレーニング）';

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
  
  // モチベーション強化機能の状態管理
  const {
    showMoodCheck,
    showIfThenPlan,
    showMiniTask,
    selectedMood,
    selectedPlan,
    miniTaskDuration,
    startMotivationFlow,
    handleMoodSelect,
    handlePlanSelect,
    handleMiniTaskAccept,
    handleMiniTaskDecline,
    skipCurrentStep,
    resetFlow,
    completeMotivationFlow
  } = useMotivationFlow(challengeId, challengeName);

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
    // 新しいモチベーションフローを使用するか従来のフローを使用するかをランダムに決定
    // 本番環境では設定や状況に応じて切り替える
    const useNewFlow = Math.random() > 0.5;
    
    if (useNewFlow) {
      // 新しいモチベーション強化フローを開始
      startMotivationFlow(Date.now().toString());
    } else {
      // 従来のモチベーションフロー
      showMotivationModal();
    }
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
      "今日のワークアウトで何を達成したいですか？",
      localMotivation,
      "AIレスポンス", // 仮のAIレスポンス
      duration
    );
  };
  
  // ミニタスク完了ハンドラー
  const handleMiniTaskComplete = async () => {
    const duration = await handleMiniTaskAccept();
    if (duration) {
      // ミニタスクの時間でセッションを開始
      startNewSession(
        "今日のワークアウトで何を達成したいですか？",
        selectedMood ? `気分: ${selectedMood}` : localMotivation,
        selectedPlan ? `プラン: ${selectedPlan.condition}` : "AIレスポンス",
        duration
      );
      completeMotivationFlow();
    }
  };

  // セッション終了のハンドラー
  const handleEndSession = () => {
    showPostPracticeModal();
  };

  // 練習後の振り返り入力後のハンドラー
  const handlePostPracticeComplete = (satisfactionLevel: number, qualityRating: number, notes: string) => {
    closeModal();
    
    // If-Thenモチベーションフローのデータを準備
    const motivationFlowData = selectedMood ? {
      usedIfThenFlow: true,
      selectedMood,
      selectedPlan: selectedPlan?.condition,
      completedMiniTask: !!miniTaskDuration
    } : undefined;
    
    completeCurrentSession(satisfactionLevel, qualityRating, notes, motivationFlowData)
      .then(() => {
        showContinueModal();
      });
  };

  // 継続モーダルのハンドラー
  const handleContinue = (duration: number) => {
    closeModal();
    showMotivationModal();
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
          <Text style={styles.title}>筋トレ（ワンパンマントレーニング）</Text>
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

        {/* ワンパンマン進捗 */}
        <View style={styles.workoutProgressContainer}>
          <Text style={styles.sectionTitle}>ワンパンマン進捗</Text>
          <View style={styles.workoutItems}>
            <View style={styles.workoutItem}>
              <Text style={styles.workoutValue}>100</Text>
              <Text style={styles.workoutLabel}>腕立て</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '70%' }]} />
              </View>
            </View>
            <View style={styles.workoutItem}>
              <Text style={styles.workoutValue}>100</Text>
              <Text style={styles.workoutLabel}>腹筋</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '60%' }]} />
              </View>
            </View>
            <View style={styles.workoutItem}>
              <Text style={styles.workoutValue}>100</Text>
              <Text style={styles.workoutLabel}>スクワット</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '50%' }]} />
              </View>
            </View>
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
            <Text style={styles.startButtonText}>トレーニング開始</Text>
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

      {/* 従来のモーダルコンポーネント */}
      <MotivationModal 
        visible={activeModal === 'motivation'} 
        onClose={closeModal}
        onComplete={handleMotivationComplete} 
        challenge={{
          id: challengeId,
          name: challengeName,
          description: '3年間継続目標',
          type: 'duration',
          goal: 1095, // 3年 = 約1095日
          currentProgress: 0,
          lastCompletedDate: null,
          icon: '💪',
          color: '#FF6B6B'
        }}
      />
      
      <TaskPlanningModal 
        visible={activeModal === 'taskPlanning'} 
        onClose={closeModal}
        onSelectDuration={handleTaskPlanningComplete} 
        challenge={{
          id: challengeId,
          name: challengeName,
          description: '3年間継続目標',
          type: 'duration',
          goal: 1095,
          currentProgress: 0,
          lastCompletedDate: null,
          icon: '💪',
          color: '#FF6B6B'
        }}
      />
      
      <PostPracticeModal 
        visible={activeModal === 'postPractice'} 
        onClose={closeModal}
        onComplete={handlePostPracticeComplete} 
        challenge={{
          id: challengeId,
          name: challengeName,
          description: '3年間継続目標',
          type: 'duration',
          goal: 1095,
          currentProgress: 0,
          lastCompletedDate: null,
          icon: '💪',
          color: '#FF6B6B'
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
          name: challengeName,
          description: '3年間継続目標',
          type: 'duration',
          goal: 1095,
          currentProgress: 0,
          lastCompletedDate: null,
          icon: '💪',
          color: '#FF6B6B'
        }}
        completedSession={currentSession}
      />
      
      {/* 新しいモチベーション強化モーダル */}
      <MoodCheckModal
        visible={showMoodCheck}
        onClose={skipCurrentStep}
        onMoodSelect={handleMoodSelect}
        challengeName={challengeName}
      />
      
      {selectedMood && (
        <IfThenPlanModal
          visible={showIfThenPlan}
          onClose={skipCurrentStep}
          mood={selectedMood}
          onPlanSelect={handlePlanSelect}
        />
      )}
      
      <MiniTaskModal
        visible={showMiniTask}
        onClose={skipCurrentStep}
        onAccept={handleMiniTaskComplete}
        onDecline={handleMiniTaskDecline}
        taskDuration={miniTaskDuration}
        isFirstTask={true}
        selectedPlan={selectedPlan || undefined}
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
    backgroundColor: '#FF6B6B',
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
    color: '#FF6B6B',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  workoutProgressContainer: {
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
  workoutItems: {
    gap: 16,
  },
  workoutItem: {
    marginBottom: 12,
  },
  workoutValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  workoutLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
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
    backgroundColor: '#FF6B6B',
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

export default WorkoutScreen;

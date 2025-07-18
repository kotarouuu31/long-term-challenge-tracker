import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import ChallengeCard from '../components/ChallengeCard';
import useChallenges from '../hooks/useChallenges';
import useIntegratedSession from '../hooks/useIntegratedSession';
import MotivationModal from '../components/modals/MotivationModal';
import TaskPlanningModal from '../components/modals/TaskPlanningModal';
import TimerControls from '../components/timer/TimerControls';
import PostPracticeModal from '../components/modals/PostPracticeModal';
import ContinueModal from '../components/modals/ContinueModal';
import DailyDashboard from '../components/stats/DailyDashboard';
import ProgressCharts from '../components/stats/ProgressCharts';
import { DailyStats, Challenge, IntegratedSession } from '../types';
import { stopTimer } from '../utils/backgroundTimer';

const HomeScreen = () => {
  const { challenges, loading, completeChallenge } = useChallenges();
  // 最初のチャレンジIDを使用（実際のアプリでは選択されたチャレンジIDを使用）
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('');
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  
  // チャレンジが読み込まれたら最初のチャレンジを選択
  useEffect(() => {
    if (challenges && challenges.length > 0) {
      setSelectedChallengeId(challenges[0].id);
    }
  }, [challenges]);
  
  const {
    currentSession,
    activeModal,
    isTimerRunning,
    elapsedTime,
    plannedDuration,
    loading: sessionLoading,
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
  } = useIntegratedSession(selectedChallengeId);

  // 追加の状態管理
  const [showStatsView, setShowStatsView] = useState(false);
  const [localTaskPlan, setLocalTaskPlan] = useState('');
  const [localMotivation, setLocalMotivation] = useState('');
  const [localReflection, setLocalReflection] = useState('');
  const [localRating, setLocalRating] = useState(0);

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
      "今日の練習で何を達成したいですか？", // 仮の質問
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
    setLocalReflection(notes);
    setLocalRating(satisfactionLevel);
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
  
  const handleCloseModal = () => {
    closeModal();
    setShowStatsView(true);
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
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>チャレンジトラッカー</Text>
          <Text style={styles.subtitle}>あなたの長期目標を達成しよう！</Text>
        </View>
        
        {/* 統計情報表示 */}
        {dailyStats && (
          <View style={styles.statsContainer}>
            <DailyDashboard 
              dailyStats={dailyStats}
              todaySessions={[]}
              challengeName={challenges.find(c => c.id === selectedChallengeId)?.name || '練習'}
              onStartNewSession={handleStartSession}
            />
            <ProgressCharts 
              dailyStats={[]}
              weeklyProgress={[]} 
              challengeName={challenges.find(c => c.id === selectedChallengeId)?.name || '練習'}
            />
          </View>
        )}
        
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
        
        {/* チャレンジリスト */}
        <FlatList
          data={challenges}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChallengeCard challenge={item} onUpdate={completeChallenge} />
          )}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
        />
        
        {/* 統計表示切り替えボタン */}
        <TouchableOpacity 
          style={styles.statsToggleButton}
          onPress={() => setShowStatsView(!showStatsView)}
        >
          <Text style={styles.statsToggleText}>
            {showStatsView ? "タイマーを表示" : "統計を表示"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* モーダルコンポーネント */}
      <MotivationModal 
        visible={activeModal === 'motivation'} 
        onClose={closeModal}
        onComplete={handleMotivationComplete} 
        challenge={challenges.find(c => c.id === selectedChallengeId) || {
          id: selectedChallengeId,
          name: '練習',
          description: '',
          type: 'duration',
          goal: 0,
          currentProgress: 0,
          lastCompletedDate: null,
          color: '#4287f5',
          icon: 'star'
        }}
      />
      
      <TaskPlanningModal 
        visible={activeModal === 'taskPlanning'} 
        onClose={closeModal}
        onSelectDuration={handleTaskPlanningComplete} 
        challenge={challenges.find(c => c.id === selectedChallengeId) || {
          id: selectedChallengeId,
          name: '練習',
          description: '',
          type: 'duration',
          goal: 0,
          currentProgress: 0,
          lastCompletedDate: null,
          color: '#4287f5',
          icon: 'star'
        }}
      />
      
      <PostPracticeModal 
        visible={activeModal === 'postPractice'} 
        onClose={closeModal}
        onComplete={handlePostPracticeComplete} 
        challenge={challenges.find(c => c.id === selectedChallengeId) || {
          id: selectedChallengeId,
          name: '練習',
          description: '',
          type: 'duration',
          goal: 0,
          currentProgress: 0,
          lastCompletedDate: null,
          color: '#4287f5',
          icon: 'star'
        }}
        session={currentSession}
        actualDuration={elapsedTime}
      />
      
      <ContinueModal 
        visible={activeModal === 'continue'} 
        onClose={handleCloseModal} 
        onContinue={handleContinue} 
        challenge={challenges.find(c => c.id === selectedChallengeId) || {
          id: selectedChallengeId,
          name: '練習',
          description: '',
          type: 'duration',
          goal: 0,
          currentProgress: 0,
          lastCompletedDate: null,
          color: '#4287f5',
          icon: 'star'
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
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  listContainer: {
    padding: 16,
  },
  timerContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsToggleButton: {
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  statsToggleText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeScreen;

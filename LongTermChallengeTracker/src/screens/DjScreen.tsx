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

// DJ練習専用画面
const DjScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const challengeId = 'dj'; // DJのチャレンジID
  const challengeName = 'DJ練習';

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
  const [totalHours, setTotalHours] = useState(0);
  const [skills, setSkills] = useState([
    { name: 'ビートマッチング', level: 7 },
    { name: 'スクラッチ', level: 4 },
    { name: 'ミキシング', level: 6 },
    { name: 'トラック選択', level: 8 }
  ]);
  
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

        // 全セッションの合計時間を計算（10000時間目標の進捗）
        const totalMinutes = sessions
          .filter(session => session && session.challengeId === challengeId && session.actualDuration)
          .reduce((sum, session) => sum + (session.actualDuration || 0), 0);
        
        setTotalHours(Math.round(totalMinutes / 60 * 10) / 10); // 小数点第一位まで表示
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
      "今日のDJ練習で何を達成したいですか？",
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
        "今日のDJ練習で何を達成したいですか？",
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
          <Text style={styles.title}>DJ練習</Text>
          <Text style={styles.subtitle}>10000時間達成目標</Text>
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

        {/* 10000時間への進捗 */}
        <View style={styles.hoursContainer}>
          <Text style={styles.sectionTitle}>10000時間への進捗</Text>
          <View style={styles.hoursCard}>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursValue}>{totalHours}</Text>
              <Text style={styles.hoursLabel}>時間達成</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${Math.min(100, (totalHours / 10000) * 100)}%` }
                  ]} 
                />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressStart}>0</Text>
                <Text style={styles.progressEnd}>10000時間</Text>
              </View>
            </View>
            <Text style={styles.progressPercentage}>
              {((totalHours / 10000) * 100).toFixed(2)}% 完了
            </Text>
          </View>
        </View>

        {/* スキルレベル */}
        <View style={styles.skillsContainer}>
          <Text style={styles.sectionTitle}>DJ スキルレベル</Text>
          {skills.map((skill, index) => (
            <View key={index} style={styles.skillItem}>
              <View style={styles.skillHeader}>
                <Text style={styles.skillName}>{skill.name}</Text>
                <Text style={styles.skillLevel}>Lv. {skill.level}</Text>
              </View>
              <View style={styles.skillBar}>
                <View 
                  style={[
                    styles.skillFill, 
                    { width: `${(skill.level / 10) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          ))}
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
            <Text style={styles.startButtonText}>DJ練習開始</Text>
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
          description: '10000時間達成目標',
          type: 'duration',
          goal: 10000,
          currentProgress: totalHours,
          lastCompletedDate: null,
          icon: '🎧',
          color: '#FFD166'
        }}
      />
      
      <TaskPlanningModal 
        visible={activeModal === 'taskPlanning'} 
        onClose={closeModal}
        onSelectDuration={handleTaskPlanningComplete} 
        challenge={{
          id: challengeId,
          name: challengeName,
          description: '10000時間達成目標',
          type: 'duration',
          goal: 10000,
          currentProgress: totalHours,
          lastCompletedDate: null,
          icon: '🎧',
          color: '#FFD166'
        }}
      />
      
      <PostPracticeModal 
        visible={activeModal === 'postPractice'} 
        onClose={closeModal}
        onComplete={handlePostPracticeComplete} 
        challenge={{
          id: challengeId,
          name: challengeName,
          description: '10000時間達成目標',
          type: 'duration',
          goal: 10000,
          currentProgress: totalHours,
          lastCompletedDate: null,
          icon: '🎧',
          color: '#FFD166'
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
          description: '10000時間達成目標',
          type: 'duration',
          goal: 10000,
          currentProgress: totalHours,
          lastCompletedDate: null,
          icon: '🎧',
          color: '#FFD166'
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
    backgroundColor: '#FFD166',
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
    color: '#FFD166',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  hoursContainer: {
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
  hoursCard: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 8,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  hoursValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD166',
    marginRight: 8,
  },
  hoursLabel: {
    fontSize: 16,
    color: '#666',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD166',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStart: {
    fontSize: 12,
    color: '#999',
  },
  progressEnd: {
    fontSize: 12,
    color: '#999',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
  skillsContainer: {
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
  skillItem: {
    marginBottom: 16,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  skillLevel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD166',
  },
  skillBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  skillFill: {
    height: '100%',
    backgroundColor: '#FFD166',
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
    backgroundColor: '#FFD166',
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

export default DjScreen;

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
import { loadSessions, loadDailyStats, loadWeeklyProgress } from '../utils/sessionData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ナビゲーションの型定義
type RootStackParamList = {
  Home: undefined;
  Workout: undefined;
  Piano: undefined;
  Stretch: undefined;
  Dj: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { challenges, loading, completeChallenge } = useChallenges();
  // 最初のチャレンジIDを使用（実際のアプリでは選択されたチャレンジIDを使用）
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('');
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [debugInfo, setDebugInfo] = useState('');
  
  // デバッグ情報を取得する関数
  const debugAsyncStorage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      console.log('AsyncStorage keys:', keys);
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        console.log(`${key}:`, value ? JSON.parse(value) : '{}');
      }
    } catch (error) {
      console.error('AsyncStorage debug error:', error);
    }
  };
  
  const [todaySessions, setTodaySessions] = useState<IntegratedSession[]>([]);
  const [weeklyProgressData, setWeeklyProgressData] = useState<any[]>([]);
  const [allDailyStats, setAllDailyStats] = useState<any[]>([]);

  // データ保存状況を確認し、統計情報を読み込む
  useEffect(() => {
    const checkStoredData = async () => {
      try {
        const sessions = await loadSessions();
        const stats = await loadDailyStats();
        const weeklyProgress = await loadWeeklyProgress();
        
        // 統計情報を設定
        if (stats && stats.length > 0) {
          setDailyStats(stats[stats.length - 1]); // 最新の統計情報を設定
          setAllDailyStats(stats); // 全ての日次統計データを設定
        }
        
        // 週間進捗データを設定
        if (weeklyProgress && weeklyProgress.length > 0) {
          setWeeklyProgressData(weeklyProgress);
        }
        
        // 今日のセッションを取得
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];
        
        const todaySessions = sessions.filter(session => {
          const sessionDate = new Date(session.date).toISOString().split('T')[0];
          return sessionDate === todayStr;
        });
        
        setTodaySessions(todaySessions);
        
        setDebugInfo(`
          セッション数: ${sessions.length}
          今日のセッション数: ${todaySessions.length}
          今日の統計: ${stats.length}
          週間進捗: ${weeklyProgress.length}
          最新セッション: ${sessions.length > 0 ? new Date(sessions[sessions.length - 1]?.date).toLocaleString() : 'なし'}
          統計データ読み込み状況: ${stats && stats.length > 0 ? '成功' : 'データなし'}
        `);
        
        // コンソールにも詳細情報を出力
        console.log('Sessions:', sessions);
        console.log('Today Sessions:', todaySessions);
        console.log('Daily Stats:', stats);
        console.log('Weekly Progress:', weeklyProgress);
        console.log('Current dailyStats state:', dailyStats);
        
        // AsyncStorageの全データを確認
        debugAsyncStorage();
      } catch (error) {
        setDebugInfo(`データ読み込みエラー: ${error instanceof Error ? error.message : String(error)}`);
        console.error('Data loading error:', error);
      }
    };
    
    checkStoredData();
  }, []);
  
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
  const [showProgressSection, setShowProgressSection] = useState<boolean>(false);
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
        
        {/* デバッグ情報表示 */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>デバッグ情報</Text>
          <Text style={styles.debugText}>{debugInfo}</Text>
        </View>
        
        {/* 統計情報表示 */}
        <View style={styles.statsContainer}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity 
              style={styles.sectionHeaderButton}
              onPress={() => setShowProgressSection(!showProgressSection)}
            >
              <Text style={styles.sectionHeaderText}>進捗を表示</Text>
              <Text style={styles.arrowIcon}>
                {showProgressSection ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={async () => {
                try {
                  const stats = await loadDailyStats();
                  const weeklyProgress = await loadWeeklyProgress();
                  const sessions = await loadSessions();
                  
                  if (stats && stats.length > 0) {
                    setDailyStats(stats[stats.length - 1]);
                  }
                  
                  setDebugInfo(`
                    データ再読み込み完了
                    セッション数: ${sessions.length}
                    今日の統計: ${stats.length}
                    週間進捗: ${weeklyProgress.length}
                  `);
                } catch (error) {
                  console.error('Error refreshing data:', error);
                }
              }}
            >
              <Text style={styles.refreshButtonText}>更新</Text>
            </TouchableOpacity>
          </View>
          
          {showProgressSection && (
            <>
              <DailyDashboard 
                dailyStats={dailyStats || { 
                  date: new Date().toISOString(), 
                  totalDuration: 0, 
                  sessionsCount: 0, 
                  averageSatisfaction: 0, 
                  longestSession: 0, 
                  motivationThemes: [], 
                  pointsEarned: 0 
                }}
                todaySessions={todaySessions}
                challengeName={challenges.find(c => c.id === selectedChallengeId)?.name || '練習'}
                onStartNewSession={handleStartSession}
              />
              
              <ProgressCharts 
                dailyStats={allDailyStats}
                weeklyProgress={weeklyProgressData} 
                challengeName={challenges.find(c => c.id === selectedChallengeId)?.name || '練習'}
              />
            </>
          )}
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
        
        {/* チャレンジリスト */}
        <FlatList
          data={challenges}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChallengeCard 
              challenge={item} 
              onUpdate={completeChallenge} 
              navigation={navigation}
            />
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
  debugContainer: {
    margin: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  refreshButton: {
    backgroundColor: '#4287f5',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
    alignSelf: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  sectionHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  arrowIcon: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;

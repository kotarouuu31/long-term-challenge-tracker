import { useState, useEffect, useCallback } from 'react';
import { IntegratedSession, ModalType } from '../types';
import {
  createSession,
  completeSession,
  loadSessions,
} from '../utils/sessionData';
import {
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  getTimerState,
} from '../utils/backgroundTimer';

export const useIntegratedSession = (challengeId: string) => {
  const [currentSession, setCurrentSession] = useState<IntegratedSession | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [plannedDuration, setPlannedDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // タイマー状態を定期的に更新
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const updateTimerState = async () => {
      try {
        const timerState = await getTimerState();
        
        if (timerState.isRunning) {
          setIsTimerRunning(true);
          // ミリ秒から分に変換して小数点以下2桁まで表示
          setElapsedTime(parseFloat((timerState.elapsedTime / (60 * 1000)).toFixed(2)));
          setPlannedDuration(timerState.plannedDuration / (60 * 1000));
          
          // セッションIDが一致する場合のみセッションを設定
          if (timerState.sessionId && timerState.challengeId === challengeId) {
            const sessions = await loadSessions();
            const session = sessions.find(s => s.id === timerState.sessionId);
            if (session) {
              setCurrentSession(session);
            }
          }
        } else {
          setIsTimerRunning(false);
        }
      } catch (err) {
        console.error('Error updating timer state:', err);
      }
    };

    // 初期状態を読み込む
    updateTimerState();
    
    // タイマーが動いている場合は定期的に更新
    if (isTimerRunning) {
      intervalId = setInterval(updateTimerState, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTimerRunning, challengeId]);

  // 初期化時に進行中のセッションがあるか確認
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        setLoading(true);
        const timerState = await getTimerState();
        
        // 同じチャレンジのアクティブなセッションがある場合
        if (timerState.isRunning && timerState.challengeId === challengeId) {
          const sessions = await loadSessions();
          const session = sessions.find(s => s.id === timerState.sessionId);
          
          if (session) {
            setCurrentSession(session);
            setIsTimerRunning(true);
            setPlannedDuration(timerState.plannedDuration / (60 * 1000));
            setElapsedTime(timerState.elapsedTime / (60 * 1000));
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error checking active session:', err);
        setError('セッション情報の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    checkActiveSession();
  }, [challengeId]);

  // 動機づけモーダルを表示
  const showMotivationModal = useCallback(() => {
    setActiveModal('motivation');
  }, []);

  // タスク計画モーダルを表示
  const showTaskPlanningModal = useCallback(() => {
    setActiveModal('taskPlanning');
  }, []);

  // 練習後評価モーダルを表示
  const showPostPracticeModal = useCallback(() => {
    setActiveModal('postPractice');
  }, []);

  // 継続確認モーダルを表示
  const showContinueModal = useCallback(() => {
    setActiveModal('continue');
  }, []);

  // モーダルを閉じる
  const closeModal = useCallback(() => {
    setActiveModal('none');
  }, []);

  // 新しいセッションを開始
  const startNewSession = useCallback(async (
    motivationQuestion: string,
    userMotivation: string,
    aiResponse: string,
    plannedDurationMinutes: number
  ) => {
    try {
      // 新しいセッションを作成
      const newSession = await createSession(
        challengeId,
        motivationQuestion,
        userMotivation,
        aiResponse,
        plannedDurationMinutes
      );
      
      setCurrentSession(newSession);
      
      // タイマーを開始
      await startTimer(newSession.id, challengeId, plannedDurationMinutes);
      
      setIsTimerRunning(true);
      setPlannedDuration(plannedDurationMinutes);
      setElapsedTime(0);
      
      return newSession;
    } catch (err) {
      console.error('Error starting new session:', err);
      setError('セッションの開始に失敗しました');
      throw err;
    }
  }, [challengeId]);

  // タイマーを一時停止
  const handlePauseTimer = useCallback(async () => {
    try {
      await pauseTimer();
      setIsTimerRunning(false);
    } catch (err) {
      console.error('Error pausing timer:', err);
      setError('タイマーの一時停止に失敗しました');
    }
  }, []);

  // タイマーを再開
  const handleResumeTimer = useCallback(async () => {
    try {
      await resumeTimer();
      setIsTimerRunning(true);
    } catch (err) {
      console.error('Error resuming timer:', err);
      setError('タイマーの再開に失敗しました');
    }
  }, []);

  // セッションを完了
  const completeCurrentSession = useCallback(async (
    satisfactionLevel: number,
    qualityRating: number,
    notes?: string
  ) => {
    try {
      // タイマーを停止して実際の経過時間を取得
      const actualDuration = await stopTimer();
      
      // セッションが存在しない場合は新しいセッションを作成して完了する
      if (!currentSession) {
        console.log('No active session, creating a new one');
        // 新しいセッションを作成
        const newSession = await createSession(
          challengeId,
          '今日の練習で何を達成したいですか？', // 仮の質問
          '自動生成セッション', // 仮のユーザー入力
          'AIレスポンス', // 仮のAIレスポンス
          Math.max(5, Math.ceil(actualDuration)) // 実際の時間から計画時間を推定
        );
        
        // 作成したセッションを完了
        const completedSession = await completeSession(
          newSession.id,
          actualDuration,
          satisfactionLevel,
          qualityRating,
          notes
        );
        
        setCurrentSession(completedSession);
        setIsTimerRunning(false);
        
        return completedSession;
      }
      
      // 既存のセッションを完了
      const completedSession = await completeSession(
        currentSession.id,
        actualDuration,
        satisfactionLevel,
        qualityRating,
        notes
      );
      
      setCurrentSession(completedSession);
      setIsTimerRunning(false);
      
      return completedSession;
    } catch (err) {
      console.error('Error completing session:', err);
      setError('セッションの完了に失敗しました');
      throw err;
    }
  }, [currentSession, challengeId]);

  return {
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
    completeCurrentSession,
  };
};

export default useIntegratedSession;

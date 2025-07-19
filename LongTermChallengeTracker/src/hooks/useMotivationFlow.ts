import { useState, useCallback, useEffect } from 'react';
import { IfThenPlan, IfThenMotivationData, MiniTask } from '../types/motivation';
import { moodOptions, getPlanForMood } from '../utils/ifThenPlans';

interface UseMotivationFlowProps {
  onComplete?: (motivationData: IfThenMotivationData) => void;
}

/**
 * モチベーションフローを管理するカスタムフック
 */
const useMotivationFlow = (challengeId: string, challengeName: string, options?: UseMotivationFlowProps) => {
  // モーダル表示状態
  const [showMoodCheck, setShowMoodCheck] = useState(false);
  const [showIfThenPlan, setShowIfThenPlan] = useState(false);
  const [showMiniTask, setShowMiniTask] = useState(false);
  
  // データ状態
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<IfThenPlan | null>(null);
  const [miniTaskCompleted, setMiniTaskCompleted] = useState(false);
  const [miniTaskDuration, setMiniTaskDuration] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // If-Thenフローを使用するかのランダム決定（テスト用）
  const [useIfThenFlow, setUseIfThenFlow] = useState(true);

  // 初期化時にランダムでフローを決定
  useEffect(() => {
    // 開発中は常にIf-Thenフローを使用
    // 本番環境では確率で決定する
    // setUseIfThenFlow(Math.random() > 0.5);
  }, []);

  // モチベーションフローを開始
  const startMotivationFlow = useCallback((newSessionId: string) => {
    setSessionId(newSessionId);
    
    // If-Thenフローを使用する場合
    if (useIfThenFlow) {
      setShowMoodCheck(true);
    } else {
      // 従来のフローを使用する場合は何もせずに完了
      if (options?.onComplete) {
        options.onComplete({
          usedIfThenFlow: false
        });
      }
    }
  }, [useIfThenFlow, options]);

  // 気分選択のハンドラー
  const handleMoodSelect = useCallback((mood: string) => {
    setSelectedMood(mood);
    setShowMoodCheck(false);
    
    // 選択した気分に対応するプランを取得
    const plan = getPlanForMood(mood);
    
    if (plan) {
      setSelectedPlan(plan);
      setShowIfThenPlan(true);
    } else {
      // プランがない場合は完了
      completeFlow();
    }
  }, []);

  // プラン選択のハンドラー
  const handlePlanSelect = useCallback((plan: IfThenPlan) => {
    setSelectedPlan(plan);
    setShowIfThenPlan(false);
    setShowMiniTask(true);
  }, []);

  // ミニタスク完了のハンドラー
  const handleMiniTaskComplete = useCallback((duration: number) => {
    setMiniTaskCompleted(true);
    setMiniTaskDuration(duration);
    setShowMiniTask(false);
    completeFlow();
  }, []);

  // ミニタスクスキップのハンドラー
  const handleMiniTaskSkip = useCallback(() => {
    setShowMiniTask(false);
    completeFlow();
  }, []);

  // 現在のステップをスキップ
  const skipCurrentStep = useCallback(() => {
    if (showMoodCheck) {
      setShowMoodCheck(false);
      completeFlow();
    } else if (showIfThenPlan) {
      setShowIfThenPlan(false);
      completeFlow();
    } else if (showMiniTask) {
      setShowMiniTask(false);
      completeFlow();
    }
  }, [showMoodCheck, showIfThenPlan, showMiniTask]);

  // フローをリセット
  const resetFlow = useCallback(() => {
    setShowMoodCheck(false);
    setShowIfThenPlan(false);
    setShowMiniTask(false);
    setSelectedMood(null);
    setSelectedPlan(null);
    setMiniTaskCompleted(false);
    setMiniTaskDuration(null);
  }, []);

  // モチベーションフローを完了
  const completeFlow = useCallback(() => {
    // 結果データを作成
    const motivationData: IfThenMotivationData = {
      usedIfThenFlow: true,
      selectedMood: selectedMood || undefined,
      selectedPlan: selectedPlan?.title || undefined,
      completedMiniTask: miniTaskCompleted
    };

    // コールバックを呼び出し
    if (options?.onComplete) {
      options.onComplete(motivationData);
    }

    // フローをリセット
    resetFlow();
  }, [options, selectedMood, selectedPlan, miniTaskCompleted, resetFlow]);

  return {
    showMoodCheck,
    showIfThenPlan,
    showMiniTask,
    selectedMood,
    selectedPlan,
    miniTaskCompleted,
    useIfThenFlow,
    startMotivationFlow,
    handleMoodSelect,
    handlePlanSelect,
    handleMiniTaskComplete,
    handleMiniTaskSkip,
    skipCurrentStep,
    resetFlow
  };
};

export default useMotivationFlow;

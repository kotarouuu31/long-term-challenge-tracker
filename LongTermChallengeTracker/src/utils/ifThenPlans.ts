import { IfThenPlan } from '../types/motivation';

// 気分選択オプション
export const moodOptions = [
  { key: 'great', label: '絶好調！', emoji: '🔥' },
  { key: 'good', label: '普通', emoji: '😊' },
  { key: 'tired', label: '疲れている', emoji: '😴' },
  { key: 'unmotivated', label: 'やる気が出ない', emoji: '😕' },
  { key: 'stressed', label: 'ストレス', emoji: '😰' }
];

// 各気分に対応するIf-Thenプラン
export const ifThenPlans: Record<string, IfThenPlan> = {
  // やる気が出ない場合のプラン
  unmotivated: {
    condition: 'unmotivated',
    title: 'やる気が出ない時のプラン',
    steps: [
      'まず5分だけ軽く始めてみましょう',
      '好きな音楽をかけて気分を上げましょう',
      '達成感を得るために小さな目標を設定しましょう'
    ],
    miniTask: {
      title: '小さな一歩',
      description: '今日は5分間だけ取り組んでみましょう。短い時間でも始めることが大切です。',
      duration: 5 * 60, // 5分（秒単位）
    },
    encouragement: '小さな一歩が大きな変化を生みます'
  },
  
  // 疲れている場合のプラン
  tired: {
    condition: 'tired',
    title: '疲れている時のプラン',
    steps: [
      '深呼吸を3回して体をリラックスさせましょう',
      '軽いストレッチで体をほぐしましょう',
      '無理せず短時間でも続けることを意識しましょう'
    ],
    miniTask: {
      title: 'リラックスタイム',
      description: '3分間の簡単なストレッチをしてから始めましょう。体が目覚めてきます。',
      duration: 3 * 60, // 3分（秒単位）
    },
    encouragement: '体調を整えながら少しずつ進みましょう'
  },
  
  // ストレスを感じている場合のプラン
  stressed: {
    condition: 'stressed',
    title: 'ストレスを感じている時のプラン',
    steps: [
      'マインドフルネス呼吸法で心を落ち着かせましょう',
      '今日は完璧を目指さず、プロセスを楽しみましょう',
      '達成できたことに注目しましょう'
    ],
    miniTask: {
      title: 'マインドフルネス',
      description: '2分間、目を閉じて呼吸に集中しましょう。その後、リラックスした状態で始めます。',
      duration: 2 * 60, // 2分（秒単位）
    },
    encouragement: '心の余裕を持って取り組むことで、より良い結果が生まれます'
  },
  
  // 良い状態の場合も軽いサポートを提供
  good: {
    condition: 'good',
    title: '今日のプラン',
    steps: [
      '今の調子を維持しましょう',
      '少し挑戦的な目標を設定してみましょう',
      '達成感を味わいながら進めましょう'
    ],
    miniTask: {
      title: '準備運動',
      description: '1分間の準備運動をして、今日のセッションを始めましょう！',
      duration: 1 * 60, // 1分（秒単位）
    },
    encouragement: '今日も素晴らしい1日になりますように！'
  },
  
  // 絶好調の場合はさらなる高みを目指す
  great: {
    condition: 'great',
    title: '絶好調の今日を最大限に活かすプラン',
    steps: [
      '今日はいつもより少し高い目標に挑戦してみましょう',
      'フロー状態を意識して集中して取り組みましょう',
      '達成したら自分を褒めることを忘れずに'
    ],
    miniTask: {
      title: 'チャレンジタイム',
      description: '今日は特別な日！いつもより少し難しいことに1分間チャレンジしてみましょう。',
      duration: 1 * 60, // 1分（秒単位）
    },
    encouragement: '今日のあなたなら何でもできます！'
  }
};

// 気分に基づいて適切なプランを取得する関数
export const getPlanForMood = (mood: string): IfThenPlan | null => {
  return ifThenPlans[mood] || null;
};

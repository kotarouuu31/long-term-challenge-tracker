import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Challenge } from '../../types';

// 動機づけの質問リスト
const MOTIVATION_QUESTIONS = [
  "今日の[チャレンジ名]で、あなたにとって何が一番大切ですか？",
  "どんな気持ちを味わいたいですか？",
  "このチャレンジを続けることで、どんな自分になりたいですか？",
  "今日の練習で特に意識したいことはありますか？",
  "このスキルを身につけることで、どんな未来を実現したいですか？"
];

// AIフィードバックのシミュレーション（実際のアプリではAPIを使用）
const generateAIResponse = (motivation: string, challengeName: string): Promise<string> => {
  return new Promise((resolve) => {
    // 実際のアプリではここでAPIを呼び出す
    setTimeout(() => {
      const responses = [
        `素晴らしい動機ですね！「${motivation}」という思いを持って${challengeName}に取り組むことで、あなたの成長がより確かなものになるでしょう。`,
        `「${motivation}」という内発的な動機は、長期的な成長の鍵です。今日の${challengeName}を通じて、一歩ずつ前進していきましょう。`,
        `${challengeName}を通じて「${motivation}」を実現することは、とても価値のある目標です。小さな一歩の積み重ねが、大きな変化をもたらします。`,
        `「${motivation}」という思いを持ち続けることが、${challengeName}を継続する原動力になります。今日も一緒に頑張りましょう！`
      ];
      const randomIndex = Math.floor(Math.random() * responses.length);
      resolve(responses[randomIndex]);
    }, 1000); // 1秒後に応答
  });
};

interface MotivationModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (question: string, motivation: string, aiResponse: string) => void;
  challenge: Challenge;
}

const MotivationModal: React.FC<MotivationModalProps> = ({
  visible,
  onClose,
  onComplete,
  challenge
}) => {
  const [motivation, setMotivation] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: 入力、2: AI応答表示
  const [selectedQuestion, setSelectedQuestion] = useState('');

  // モーダルが表示されるたびに質問をランダムに選択
  useEffect(() => {
    if (visible) {
      const randomIndex = Math.floor(Math.random() * MOTIVATION_QUESTIONS.length);
      const question = MOTIVATION_QUESTIONS[randomIndex].replace('[チャレンジ名]', challenge.name);
      setSelectedQuestion(question);
      setMotivation('');
      setAiResponse('');
      setStep(1);
    }
  }, [visible, challenge.name]);

  const handleSubmit = async () => {
    if (!motivation.trim()) return;
    
    setLoading(true);
    try {
      const response = await generateAIResponse(motivation, challenge.name);
      setAiResponse(response);
      setStep(2);
    } catch (error) {
      console.error('Error generating AI response:', error);
      setAiResponse('申し訳ありません。応答の生成中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    onComplete(selectedQuestion, motivation, aiResponse);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>今日の動機を確認</Text>
          
          {step === 1 ? (
            <>
              <Text style={styles.question}>{selectedQuestion}</Text>
              <TextInput
                style={styles.input}
                value={motivation}
                onChangeText={setMotivation}
                placeholder="あなたの思いを入力してください..."
                multiline
                maxLength={200}
              />
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={onClose}
                >
                  <Text style={styles.buttonSecondaryText}>キャンセル</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.button, 
                    styles.buttonPrimary,
                    !motivation.trim() && styles.buttonDisabled
                  ]}
                  onPress={handleSubmit}
                  disabled={!motivation.trim() || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>次へ</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.feedbackTitle}>あなたの動機</Text>
              <Text style={styles.motivationText}>{motivation}</Text>
              
              <Text style={styles.feedbackTitle}>フィードバック</Text>
              <Text style={styles.feedbackText}>{aiResponse}</Text>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={() => setStep(1)}
                >
                  <Text style={styles.buttonSecondaryText}>戻る</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary]}
                  onPress={handleComplete}
                >
                  <Text style={styles.buttonText}>開始する</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalView: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  question: {
    fontSize: 18,
    marginBottom: 16,
    color: '#333',
    lineHeight: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    minWidth: '45%',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#4CAF50',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonSecondaryText: {
    color: '#666',
    fontSize: 16,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#555',
  },
  motivationText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  feedbackText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    lineHeight: 22,
  },
});

export default MotivationModal;

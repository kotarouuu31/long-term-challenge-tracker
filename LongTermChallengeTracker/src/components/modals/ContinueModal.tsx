import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Image
} from 'react-native';
import { Challenge, IntegratedSession } from '../../types';

interface ContinueModalProps {
  visible: boolean;
  onClose: () => void;
  onContinue: (duration: number) => void;
  challenge: Challenge;
  completedSession: IntegratedSession | null;
}

const ContinueModal: React.FC<ContinueModalProps> = ({
  visible,
  onClose,
  onContinue,
  challenge,
  completedSession
}) => {
  // 継続セッションの推奨時間（直前のセッションの時間に基づく）
  const getSuggestedDurations = (): number[] => {
    if (!completedSession) return [5, 10];
    
    const lastDuration = completedSession.actualDuration;
    
    if (lastDuration <= 5) return [5, 10];
    if (lastDuration <= 10) return [10, 15];
    if (lastDuration <= 15) return [15, 20];
    if (lastDuration <= 30) return [15, 30];
    
    return [Math.round(lastDuration * 0.5), lastDuration]; // 50%と同じ時間
  };
  
  const suggestedDurations = getSuggestedDurations();
  
  // 今日の累計時間を計算
  const getTodaysTotalDuration = (): number => {
    if (!completedSession) return 0;
    
    // 実際のアプリでは、同じ日のすべてのセッションを集計する
    return completedSession.actualDuration;
  };
  
  const todayTotal = getTodaysTotalDuration();
  
  // モチベーションメッセージを生成
  const getMotivationalMessage = (): string => {
    if (!completedSession) return "素晴らしい進捗です！もう少し続けませんか？";
    
    const messages = [
      "素晴らしい進捗です！この調子でもう少し続けませんか？",
      `今日は既に${todayTotal}分達成しています。この勢いを活かしましょう！`,
      "今の集中力を活かして、もう少し練習を続けませんか？",
      "短い時間でも続けることで、大きな成果につながります。",
      `${challenge.name}のスキルを磨くチャンスです。もう少し続けましょう！`
    ];
    
    // セッション番号に基づいてメッセージを選択
    const index = (completedSession.sessionSequence - 1) % messages.length;
    return messages[index];
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.headerContainer}>
            <Image 
              source={require('../../../assets/icon.png')} 
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.modalTitle}>継続のチャンス！</Text>
          </View>
          
          <Text style={styles.motivationalMessage}>
            {getMotivationalMessage()}
          </Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{todayTotal}分</Text>
              <Text style={styles.statLabel}>今日の合計</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {completedSession?.sessionSequence || 1}
              </Text>
              <Text style={styles.statLabel}>今日のセッション</Text>
            </View>
          </View>
          
          <Text style={styles.continueQuestion}>
            もう少し{challenge.name}を続けますか？
          </Text>
          
          <View style={styles.optionsContainer}>
            {suggestedDurations.map((duration) => (
              <TouchableOpacity
                key={duration}
                style={styles.durationOption}
                onPress={() => onContinue(duration)}
              >
                <Text style={styles.durationValue}>{duration}</Text>
                <Text style={styles.durationUnit}>分</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={onClose}
            >
              <Text style={styles.buttonSecondaryText}>今日はここまで</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.tipText}>
            Tip: 短い時間でも継続することで、習慣化が促進されます。
          </Text>
        </View>
      </View>
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  motivationalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#ddd',
    marginHorizontal: 16,
  },
  continueQuestion: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  durationOption: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  durationValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  durationUnit: {
    fontSize: 16,
    color: 'white',
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  button: {
    borderRadius: 8,
    padding: 12,
    minWidth: '80%',
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonSecondaryText: {
    color: '#666',
    fontSize: 16,
  },
  tipText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#888',
  },
});

export default ContinueModal;

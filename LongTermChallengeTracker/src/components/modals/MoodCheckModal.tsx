import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { moodOptions } from '../../utils/ifThenPlans';

interface MoodCheckModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectMood: (mood: string) => void;
  onSkip: () => void;
}

const MoodCheckModal: React.FC<MoodCheckModalProps> = ({
  visible,
  onClose,
  onSelectMood,
  onSkip
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>今日の調子はどうですか？</Text>
          <Text style={styles.modalSubtitle}>あなたの状態に合わせたサポートを提供します</Text>
          
          <ScrollView style={styles.optionsContainer}>
            {moodOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={styles.moodOption}
                onPress={() => onSelectMood(option.key)}
              >
                <Text style={styles.moodEmoji}>{option.emoji}</Text>
                <Text style={styles.moodLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity
            style={styles.skipButton}
            onPress={onSkip}
          >
            <Text style={styles.skipButtonText}>スキップ</Text>
          </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center'
  },
  optionsContainer: {
    width: '100%',
    maxHeight: 300
  },
  moodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10
  },
  moodEmoji: {
    fontSize: 24,
    marginRight: 15
  },
  moodLabel: {
    fontSize: 18
  },
  skipButton: {
    marginTop: 20,
    padding: 10
  },
  skipButtonText: {
    color: '#888',
    fontSize: 16
  }
});

export default MoodCheckModal;

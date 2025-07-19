import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MoodType } from '../types/motivation';

interface MoodCheckModalProps {
  visible: boolean;
  onClose: () => void;
  onMoodSelect: (mood: MoodType) => void;
  challengeName: string;
}

const MoodCheckModal: React.FC<MoodCheckModalProps> = ({
  visible,
  onClose,
  onMoodSelect,
  challengeName,
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
    onMoodSelect(mood);
  };

  const getMoodEmoji = (mood: MoodType): string => {
    switch (mood) {
      case 'great':
        return '😄';
      case 'good':
        return '🙂';
      case 'tired':
        return '😴';
      case 'unmotivated':
        return '😕';
      case 'stressed':
        return '😰';
      default:
        return '🤔';
    }
  };

  const getMoodLabel = (mood: MoodType): string => {
    switch (mood) {
      case 'great':
        return '絶好調！';
      case 'good':
        return '調子いい';
      case 'tired':
        return '疲れている';
      case 'unmotivated':
        return 'やる気が出ない';
      case 'stressed':
        return 'ストレスを感じる';
      default:
        return '';
    }
  };

  const getMoodDescription = (mood: MoodType): string => {
    switch (mood) {
      case 'great':
        return 'エネルギッシュで何でもできそう！';
      case 'good':
        return '普通に取り組める状態';
      case 'tired':
        return '体力的・精神的に疲労を感じる';
      case 'unmotivated':
        return 'モチベーションが低く、始める気になれない';
      case 'stressed':
        return '不安やプレッシャーを感じている';
      default:
        return '';
    }
  };

  const moods: MoodType[] = ['great', 'good', 'tired', 'unmotivated', 'stressed'];

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
          <Text style={styles.challengeName}>{challengeName}</Text>
          
          <ScrollView style={styles.moodContainer}>
            {moods.map((mood) => (
              <TouchableOpacity
                key={mood}
                style={[
                  styles.moodOption,
                  selectedMood === mood && styles.selectedMood,
                ]}
                onPress={() => handleMoodSelect(mood)}
              >
                <Text style={styles.moodEmoji}>{getMoodEmoji(mood)}</Text>
                <View style={styles.moodTextContainer}>
                  <Text style={styles.moodLabel}>{getMoodLabel(mood)}</Text>
                  <Text style={styles.moodDescription}>
                    {getMoodDescription(mood)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>スキップ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonConfirm,
                !selectedMood && styles.buttonDisabled,
              ]}
              onPress={() => selectedMood && handleMoodSelect(selectedMood)}
              disabled={!selectedMood}
            >
              <Text style={styles.buttonText}>次へ</Text>
            </TouchableOpacity>
          </View>
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
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
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
    marginBottom: 10,
    textAlign: 'center',
  },
  challengeName: {
    fontSize: 18,
    color: '#4A90E2',
    marginBottom: 20,
    textAlign: 'center',
  },
  moodContainer: {
    width: '100%',
    maxHeight: 400,
  },
  moodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#F5F5F5',
  },
  selectedMood: {
    backgroundColor: '#E1F5FE',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  moodEmoji: {
    fontSize: 30,
    marginRight: 15,
  },
  moodTextContainer: {
    flex: 1,
  },
  moodLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  moodDescription: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    minWidth: '45%',
    alignItems: 'center',
  },
  buttonConfirm: {
    backgroundColor: '#4A90E2',
  },
  buttonCancel: {
    backgroundColor: '#F0F0F0',
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MoodCheckModal;

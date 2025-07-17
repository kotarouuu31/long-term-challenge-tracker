import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView
} from 'react-native';
import { Challenge } from '../../types';

// 事前定義された時間オプション（分単位）
const TIME_OPTIONS = [5, 10, 15, 30, 45, 60];

interface TaskPlanningModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDuration: (duration: number) => void;
  challenge: Challenge;
}

const TaskPlanningModal: React.FC<TaskPlanningModalProps> = ({
  visible,
  onClose,
  onSelectDuration,
  challenge
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [customDuration, setCustomDuration] = useState<number | null>(null);

  const handleSelectDuration = (duration: number) => {
    setSelectedDuration(duration);
    setCustomDuration(null);
  };

  const handleConfirm = () => {
    if (selectedDuration) {
      onSelectDuration(selectedDuration);
    }
  };

  // カスタム時間の選択肢
  const customTimeOptions = [75, 90, 120];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>練習時間を設定</Text>
          
          <Text style={styles.subtitle}>
            まず{challenge.name}を何分間続けますか？
          </Text>
          
          <ScrollView 
            style={styles.optionsContainer}
            contentContainerStyle={styles.optionsContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.timeGrid}>
              {TIME_OPTIONS.map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.timeOption,
                    selectedDuration === duration && styles.selectedOption
                  ]}
                  onPress={() => handleSelectDuration(duration)}
                >
                  <Text 
                    style={[
                      styles.timeText,
                      selectedDuration === duration && styles.selectedTimeText
                    ]}
                  >
                    {duration}分
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.sectionTitle}>もっと長く</Text>
            
            <View style={styles.timeGrid}>
              {customTimeOptions.map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.timeOption,
                    selectedDuration === duration && styles.selectedOption
                  ]}
                  onPress={() => handleSelectDuration(duration)}
                >
                  <Text 
                    style={[
                      styles.timeText,
                      selectedDuration === duration && styles.selectedTimeText
                    ]}
                  >
                    {duration}分
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.motivationalContainer}>
              <Text style={styles.motivationalText}>
                小さな一歩から始めましょう。
                {selectedDuration ? `\n${selectedDuration}分の集中から大きな成果が生まれます。` : ''}
              </Text>
            </View>
          </ScrollView>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={onClose}
            >
              <Text style={styles.buttonSecondaryText}>戻る</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.button, 
                styles.buttonPrimary,
                !selectedDuration && styles.buttonDisabled
              ]}
              onPress={handleConfirm}
              disabled={!selectedDuration}
            >
              <Text style={styles.buttonText}>
                {selectedDuration ? `${selectedDuration}分で開始` : '時間を選択'}
              </Text>
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
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  optionsContainer: {
    maxHeight: 350,
  },
  optionsContent: {
    paddingBottom: 16,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeOption: {
    width: '31%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedOption: {
    backgroundColor: '#4CAF50',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
  },
  selectedTimeText: {
    color: 'white',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#555',
  },
  motivationalContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  motivationalText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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
});

export default TaskPlanningModal;

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { IfThenPlan, MoodType } from '../types/motivation';
import { getIfThenPlansForMood } from '../utils/motivationUtils';

interface IfThenPlanModalProps {
  visible: boolean;
  onClose: () => void;
  mood: MoodType;
  onPlanSelect: (plan: IfThenPlan) => void;
}

const IfThenPlanModal: React.FC<IfThenPlanModalProps> = ({
  visible,
  onClose,
  mood,
  onPlanSelect,
}) => {
  const plans = getIfThenPlansForMood(mood);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number | null>(null);

  const handlePlanSelect = (index: number) => {
    setSelectedPlanIndex(index);
  };

  const handleConfirm = () => {
    if (selectedPlanIndex !== null) {
      onPlanSelect(plans[selectedPlanIndex]);
    }
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

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.moodHeader}>
            <Text style={styles.moodEmoji}>{getMoodEmoji(mood)}</Text>
            <Text style={styles.moodLabel}>{getMoodLabel(mood)}</Text>
          </View>
          
          <Text style={styles.modalTitle}>今日のプランを選んでください</Text>
          
          <ScrollView style={styles.plansContainer}>
            {plans.map((plan, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.planOption,
                  selectedPlanIndex === index && styles.selectedPlan,
                ]}
                onPress={() => handlePlanSelect(index)}
              >
                <Text style={styles.conditionText}>{plan.condition}</Text>
                <View style={styles.stepsContainer}>
                  {plan.steps.map((step, stepIndex) => (
                    <View key={stepIndex} style={styles.stepItem}>
                      <Text style={styles.stepNumber}>{stepIndex + 1}</Text>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={onClose}
            >
              <Text style={styles.buttonCancelText}>スキップ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonConfirm,
                selectedPlanIndex === null && styles.buttonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={selectedPlanIndex === null}
            >
              <Text style={styles.buttonConfirmText}>このプランで始める</Text>
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
  moodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    width: '100%',
    justifyContent: 'center',
  },
  moodEmoji: {
    fontSize: 30,
    marginRight: 10,
  },
  moodLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  plansContainer: {
    width: '100%',
    maxHeight: 400,
  },
  planOption: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#F5F5F5',
  },
  selectedPlan: {
    backgroundColor: '#E1F5FE',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  conditionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  stepsContainer: {
    marginLeft: 5,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepNumber: {
    backgroundColor: '#4A90E2',
    color: 'white',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#444',
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
  buttonConfirmText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonCancelText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default IfThenPlanModal;

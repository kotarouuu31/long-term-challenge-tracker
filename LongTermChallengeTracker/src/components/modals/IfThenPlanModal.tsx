import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { IfThenPlan } from '../../types/motivation';

interface IfThenPlanModalProps {
  visible: boolean;
  plan: IfThenPlan | null;
  onClose: () => void;
  onAccept: (plan: IfThenPlan) => void;
  onSkip: () => void;
}

const IfThenPlanModal: React.FC<IfThenPlanModalProps> = ({
  visible,
  plan,
  onClose,
  onAccept,
  onSkip
}) => {
  if (!plan) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{plan.title}</Text>
          
          <View style={styles.stepsContainer}>
            <Text style={styles.stepsTitle}>今日のアプローチ：</Text>
            {plan.steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
          
          <Text style={styles.encouragementText}>{plan.encouragement}</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => onAccept(plan)}
            >
              <Text style={styles.acceptButtonText}>このプランで進める</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.skipButton}
              onPress={onSkip}
            >
              <Text style={styles.skipButtonText}>スキップ</Text>
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
    marginBottom: 20,
    textAlign: 'center'
  },
  stepsContainer: {
    width: '100%',
    marginBottom: 20
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15
  },
  stepNumber: {
    backgroundColor: '#4CAF50',
    color: 'white',
    width: 25,
    height: 25,
    borderRadius: 12.5,
    textAlign: 'center',
    lineHeight: 25,
    marginRight: 10,
    fontWeight: 'bold'
  },
  stepText: {
    fontSize: 16,
    flex: 1
  },
  encouragementText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 20,
    textAlign: 'center'
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center'
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 10,
    width: '80%',
    alignItems: 'center'
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  skipButton: {
    padding: 10
  },
  skipButtonText: {
    color: '#888',
    fontSize: 16
  }
});

export default IfThenPlanModal;

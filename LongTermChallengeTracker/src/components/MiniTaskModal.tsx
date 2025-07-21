import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { IfThenPlan } from '../types/motivation';

interface MiniTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
  taskDuration: number; // in minutes
  isFirstTask: boolean;
  selectedPlan?: IfThenPlan;
  encouragementIndex?: number;
}

const MiniTaskModal: React.FC<MiniTaskModalProps> = ({
  visible,
  onClose,
  onAccept,
  onDecline,
  taskDuration,
  isFirstTask,
  selectedPlan,
  encouragementIndex = 0,
}) => {
  // Get appropriate message based on whether this is the first task or a follow-up
  const getTitle = () => {
    if (isFirstTask) {
      return `まずは${taskDuration}分だけやってみませんか？`;
    } else {
      return `よくできました！さらに${taskDuration}分続けますか？`;
    }
  };

  // Get appropriate encouragement message if a plan is selected
  const getEncouragement = () => {
    if (selectedPlan && selectedPlan.encouragement.length > 0) {
      const index = encouragementIndex % selectedPlan.encouragement.length;
      return selectedPlan.encouragement[index];
    }
    return null;
  };

  const encouragement = getEncouragement();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {!isFirstTask && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>🎉 素晴らしい！ 🎉</Text>
            </View>
          )}
          
          <Text style={styles.modalTitle}>{getTitle()}</Text>
          
          {!isFirstTask && encouragement && (
            <View style={styles.encouragementContainer}>
              <Text style={styles.encouragementText}>{encouragement}</Text>
            </View>
          )}
          
          <View style={[styles.imageContainer, { justifyContent: 'center', alignItems: 'center' }]}>
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: '#e0e0e0',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text>⏱️</Text>
            </View>
          </View>
          
          <Text style={styles.descriptionText}>
            {isFirstTask 
              ? '小さな一歩から始めましょう。たった数分でも、始めることに意味があります。'
              : '作業を始めると、続けるのが楽になります。もう少し頑張りましょう！'}
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonDecline]}
              onPress={onDecline}
            >
              <Text style={styles.buttonDeclineText}>
                {isFirstTask ? 'やめておく' : '終了する'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonAccept]}
              onPress={onAccept}
            >
              <Text style={styles.buttonAcceptText}>
                {isFirstTask ? `${taskDuration}分やってみる` : `${taskDuration}分続ける`}
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
  },
  modalView: {
    width: '90%',
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
  successBanner: {
    backgroundColor: '#4CAF50',
    width: '110%',
    padding: 10,
    marginTop: -20,
    marginBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  successText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  encouragementContainer: {
    backgroundColor: '#FFF9C4',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
  },
  encouragementText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  imageContainer: {
    width: '80%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  descriptionText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  button: {
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    minWidth: '45%',
    alignItems: 'center',
  },
  buttonAccept: {
    backgroundColor: '#4A90E2',
  },
  buttonDecline: {
    backgroundColor: '#F0F0F0',
  },
  buttonAcceptText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonDeclineText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MiniTaskModal;

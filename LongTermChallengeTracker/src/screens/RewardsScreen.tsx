import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  TextInput,
  Alert,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Reward } from '../types';

const RewardsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  
  // 状態管理
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [newRewardTitle, setNewRewardTitle] = useState('');
  const [newRewardDescription, setNewRewardDescription] = useState('');
  const [newRewardPoints, setNewRewardPoints] = useState('');

  useEffect(() => {
    loadRewards();
    loadTotalPoints();
  }, []);

  const loadRewards = async () => {
    try {
      const storedRewards = await AsyncStorage.getItem('rewards');
      if (storedRewards) {
        setRewards(JSON.parse(storedRewards));
      } else {
        // デフォルト報酬を初期化
        const defaultRewards = createDefaultRewards();
        setRewards(defaultRewards);
        await AsyncStorage.setItem('rewards', JSON.stringify(defaultRewards));
      }
    } catch (error) {
      console.error('報酬データの読み込みに失敗:', error);
    }
  };

  const loadTotalPoints = async () => {
    try {
      const storedPoints = await AsyncStorage.getItem('totalPoints');
      if (storedPoints) {
        setTotalPoints(parseInt(storedPoints));
      }
    } catch (error) {
      console.error('ポイントの読み込みに失敗:', error);
    }
  };

  const createDefaultRewards = (): Reward[] => {
    const defaultRewards = [];
    for (let i = 1; i <= 10; i++) {
      const points = i * 100;
      defaultRewards.push({
        id: `reward_${points}`,
        points,
        title: `${points}pt報酬`,
        description: `${points}ポイント達成の報酬を設定してください`,
        achieved: false
      });
    }
    return defaultRewards;
  };

  const handleAddReward = () => {
    setEditingReward(null);
    setNewRewardTitle('');
    setNewRewardDescription('');
    setNewRewardPoints('');
    setShowAddModal(true);
  };

  const handleEditReward = (reward: Reward) => {
    setEditingReward(reward);
    setNewRewardTitle(reward.title);
    setNewRewardDescription(reward.description);
    setNewRewardPoints(reward.points.toString());
    setShowAddModal(true);
  };

  const handleSaveReward = async () => {
    if (!newRewardTitle.trim() || !newRewardDescription.trim() || !newRewardPoints.trim()) {
      Alert.alert('エラー', 'すべての項目を入力してください');
      return;
    }

    const points = parseInt(newRewardPoints);
    if (isNaN(points) || points <= 0) {
      Alert.alert('エラー', '有効なポイント数を入力してください');
      return;
    }

    // 重複チェック（編集時は自分以外をチェック）
    const existingReward = rewards.find(reward => 
      reward.points === points && 
      (!editingReward || reward.id !== editingReward.id)
    );
    
    if (existingReward) {
      Alert.alert(
        'エラー', 
        `${points}ptの報酬は既に存在します。\n既存: ${existingReward.title}`
      );
      return;
    }

    try {
      let updatedRewards;
      
      if (editingReward) {
        // 編集の場合
        updatedRewards = rewards.map(reward => 
          reward.id === editingReward.id 
            ? { ...reward, points, title: newRewardTitle.trim(), description: newRewardDescription.trim() }
            : reward
        );
      } else {
        // 新規追加の場合
        const newReward: Reward = {
          id: Date.now().toString(),
          points,
          title: newRewardTitle.trim(),
          description: newRewardDescription.trim(),
          achieved: false
        };
        updatedRewards = [...rewards, newReward];
      }
      
      // ポイント順でソート
      updatedRewards.sort((a, b) => a.points - b.points);
      
      setRewards(updatedRewards);
      await AsyncStorage.setItem('rewards', JSON.stringify(updatedRewards));
      
      // フォームをリセット
      setNewRewardTitle('');
      setNewRewardDescription('');
      setNewRewardPoints('');
      setEditingReward(null);
      setShowAddModal(false);
    } catch (error) {
      console.error('報酬の保存に失敗:', error);
      Alert.alert('エラー', '報酬の保存に失敗しました');
    }
  };

  const handleDeleteReward = (rewardId: string) => {
    const rewardToDelete = rewards.find(r => r.id === rewardId);
    
    // デフォルト報酬（100pt-1000pt）は削除不可
    if (rewardToDelete && rewardToDelete.points <= 1000) {
      Alert.alert(
        '削除できません',
        'デフォルト報酬（100pt-1000pt）は削除できません。編集のみ可能です。'
      );
      return;
    }
    
    Alert.alert(
      '報酬を削除',
      '本当にこの報酬を削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '削除', 
          style: 'destructive',
          onPress: async () => {
            const updatedRewards = rewards.filter(r => r.id !== rewardId);
            setRewards(updatedRewards);
            await AsyncStorage.setItem('rewards', JSON.stringify(updatedRewards));
          }
        }
      ]
    );
  };

  const getNextReward = () => {
    return rewards.find(reward => !reward.achieved && reward.points > totalPoints);
  };

  const nextReward = getNextReward();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.title}>報酬設定</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* 現在のポイントと次の報酬 */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>現在の状況</Text>
          <Text style={styles.currentPoints}>現在のポイント: {totalPoints}pt</Text>
          {nextReward && (
            <View style={styles.nextRewardContainer}>
              <Text style={styles.nextRewardText}>
                次の報酬まで: {nextReward.points - totalPoints}pt
              </Text>
              <Text style={styles.nextRewardTitle}>{nextReward.title}</Text>
            </View>
          )}
        </View>

        {/* 報酬リスト */}
        <View style={styles.rewardsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>報酬一覧</Text>
            <Text style={styles.rewardCount}>
              表示中: {rewards.filter(r => r.points >= totalPoints).length}件
            </Text>
          </View>

          {/* 現在のポイント数以降の報酬のみ表示 */}
          {rewards
            .filter(reward => reward.points >= totalPoints)
            .map((reward) => (
            <View 
              key={reward.id} 
              style={[
                styles.rewardItem,
                reward.achieved && styles.achievedReward
              ]}
            >
              <View style={styles.rewardInfo}>
                <Text style={[
                  styles.rewardPoints,
                  reward.achieved && styles.achievedText
                ]}>
                  {reward.points}pt
                </Text>
                <Text style={[
                  styles.rewardTitle,
                  reward.achieved && styles.achievedText
                ]}>
                  {reward.title}
                </Text>
                <Text style={[
                  styles.rewardDescription,
                  reward.achieved && styles.achievedText
                ]}>
                  {reward.description}
                </Text>
                {reward.achieved && reward.achievedAt && (
                  <Text style={styles.achievedDate}>
                    達成日: {new Date(reward.achievedAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
              <View style={styles.rewardActions}>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => handleEditReward(reward)}
                >
                  <Text style={styles.editButtonText}>編集</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteReward(reward.id)}
                >
                  <Text style={styles.deleteButtonText}>削除</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 画面下部の新しい報酬追加ボタン */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity 
          style={styles.addNewRewardButton} 
          onPress={handleAddReward}
        >
          <Text style={styles.addNewRewardButtonText}>+ 新しい報酬を追加</Text>
        </TouchableOpacity>
      </View>

      {/* 追加・編集モーダル */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancelText}>キャンセル</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingReward ? '報酬を編集' : '報酬を追加'}
            </Text>
            <TouchableOpacity onPress={handleSaveReward}>
              <Text style={styles.modalSaveText}>保存</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ポイント数</Text>
              <TextInput
                style={styles.input}
                value={newRewardPoints}
                onChangeText={setNewRewardPoints}
                placeholder="100"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>報酬タイトル</Text>
              <TextInput
                style={styles.input}
                value={newRewardTitle}
                onChangeText={setNewRewardTitle}
                placeholder="好きなケーキを買う"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>詳細説明</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newRewardDescription}
                onChangeText={setNewRewardDescription}
                placeholder="お気に入りのケーキ屋さんで好きなケーキを選んで買う"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2196F3',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  currentPoints: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  nextRewardContainer: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
  },
  nextRewardText: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 4,
  },
  nextRewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  rewardsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rewardItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  achievedReward: {
    backgroundColor: '#F1F8E9',
  },
  rewardInfo: {
    flex: 1,
  },
  rewardPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  achievedText: {
    color: '#4CAF50',
  },
  achievedDate: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
  },
  rewardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  rewardCount: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
  bottomButtonContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  addNewRewardButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addNewRewardButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RewardsScreen;

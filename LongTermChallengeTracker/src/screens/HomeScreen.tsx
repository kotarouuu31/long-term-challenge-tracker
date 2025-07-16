import React from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import ChallengeCard from '../components/ChallengeCard';
import useChallenges from '../hooks/useChallenges';

const HomeScreen = () => {
  const { challenges, loading, completeChallenge } = useChallenges();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <View style={styles.header}>
        <Text style={styles.title}>チャレンジトラッカー</Text>
        <Text style={styles.subtitle}>あなたの長期目標を達成しよう！</Text>
      </View>
      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChallengeCard challenge={item} onUpdate={completeChallenge} />
        )}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  listContainer: {
    padding: 16,
  },
});

export default HomeScreen;

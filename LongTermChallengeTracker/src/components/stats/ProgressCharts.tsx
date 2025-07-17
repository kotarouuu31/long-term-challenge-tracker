import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions,
  ScrollView
} from 'react-native';
import { DailyStats, WeeklyProgress } from '../../types';

// 実際のアプリではreact-native-svg-chartsなどのライブラリを使用
// ここではモックのチャートコンポーネントを実装
const BarChart = ({ data, maxValue, barColor }: { 
  data: { label: string; value: number }[]; 
  maxValue: number;
  barColor: string;
}) => {
  return (
    <View style={styles.chartContainer}>
      {data.map((item, index) => {
        const barHeight = (item.value / maxValue) * 150;
        return (
          <View key={index} style={styles.barContainer}>
            <View style={styles.barLabelContainer}>
              <Text style={styles.barValue}>
                {item.value.toFixed(0)}
              </Text>
            </View>
            <View style={styles.barWrapper}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: Math.max(barHeight, 2),
                    backgroundColor: barColor
                  }
                ]} 
              />
            </View>
            <Text style={styles.barLabel}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
};

interface ProgressChartsProps {
  dailyStats: DailyStats[];
  weeklyProgress: WeeklyProgress[];
  challengeName: string;
}

const ProgressCharts: React.FC<ProgressChartsProps> = ({
  dailyStats,
  weeklyProgress,
  challengeName
}) => {
  // 過去7日間のデータを抽出
  const getLastSevenDaysData = () => {
    const last7Days = [...dailyStats]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7)
      .reverse();
    
    return last7Days.map(day => {
      const date = new Date(day.date);
      const dayOfWeek = date.toLocaleDateString('ja-JP', { weekday: 'short' });
      return {
        label: dayOfWeek,
        value: day.totalDuration
      };
    });
  };
  
  // 過去4週間のデータを抽出
  const getLastFourWeeksData = () => {
    const last4Weeks = [...weeklyProgress]
      .sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime())
      .slice(0, 4)
      .reverse();
    
    return last4Weeks.map(week => {
      const date = new Date(week.weekStart);
      const weekLabel = `${(date.getMonth() + 1)}/${date.getDate()}週`;
      return {
        label: weekLabel,
        value: week.totalMinutes / 60 // 時間単位に変換
      };
    });
  };
  
  // 満足度データを抽出
  const getSatisfactionData = () => {
    const last7Days = [...dailyStats]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7)
      .reverse();
    
    return last7Days.map(day => {
      const date = new Date(day.date);
      const dayOfWeek = date.toLocaleDateString('ja-JP', { weekday: 'short' });
      return {
        label: dayOfWeek,
        value: day.averageSatisfaction
      };
    });
  };
  
  // データがない場合のプレースホルダー
  const placeholderData = [
    { label: '月', value: 0 },
    { label: '火', value: 0 },
    { label: '水', value: 0 },
    { label: '木', value: 0 },
    { label: '金', value: 0 },
    { label: '土', value: 0 },
    { label: '日', value: 0 },
  ];
  
  const dailyData = dailyStats.length > 0 ? getLastSevenDaysData() : placeholderData;
  const weeklyData = weeklyProgress.length > 0 ? getLastFourWeeksData() : [
    { label: '1週目', value: 0 },
    { label: '2週目', value: 0 },
    { label: '3週目', value: 0 },
    { label: '4週目', value: 0 },
  ];
  const satisfactionData = dailyStats.length > 0 ? getSatisfactionData() : placeholderData;
  
  // 最大値の計算（0除算を防ぐため最小値を1に）
  const maxDailyValue = Math.max(1, ...dailyData.map(d => d.value));
  const maxWeeklyValue = Math.max(1, ...weeklyData.map(d => d.value));
  
  // 統計サマリーの計算
  const calculateStats = () => {
    if (dailyStats.length === 0) {
      return {
        totalDuration: 0,
        averageDuration: 0,
        totalSessions: 0,
        averageSatisfaction: 0
      };
    }
    
    const totalDuration = dailyStats.reduce((sum, day) => sum + day.totalDuration, 0);
    const totalSessions = dailyStats.reduce((sum, day) => sum + day.sessionsCount, 0);
    
    return {
      totalDuration,
      averageDuration: totalSessions > 0 ? totalDuration / totalSessions : 0,
      totalSessions,
      averageSatisfaction: dailyStats.reduce((sum, day) => sum + day.averageSatisfaction, 0) / dailyStats.length
    };
  };
  
  const stats = calculateStats();
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{challengeName}の進捗</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalDuration.toFixed(0)}分</Text>
          <Text style={styles.statLabel}>累計時間</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalSessions}</Text>
          <Text style={styles.statLabel}>総セッション数</Text>
        </View>
      </View>
      
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>日別練習時間（分）</Text>
        <BarChart 
          data={dailyData} 
          maxValue={maxDailyValue} 
          barColor="#4CAF50" 
        />
      </View>
      
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>週別練習時間（時間）</Text>
        <BarChart 
          data={weeklyData} 
          maxValue={maxWeeklyValue} 
          barColor="#2196F3" 
        />
      </View>
      
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>満足度（5段階）</Text>
        <BarChart 
          data={satisfactionData} 
          maxValue={5} 
          barColor="#FF9800" 
        />
      </View>
      
      {weeklyProgress.length > 0 && (
        <View style={styles.insightsContainer}>
          <Text style={styles.insightsTitle}>分析</Text>
          
          {weeklyProgress[0].improvementRate !== 0 && (
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>前週比:</Text>
              <Text 
                style={[
                  styles.insightValue,
                  weeklyProgress[0].improvementRate > 0 
                    ? styles.positiveValue 
                    : styles.negativeValue
                ]}
              >
                {weeklyProgress[0].improvementRate > 0 ? '+' : ''}
                {weeklyProgress[0].improvementRate.toFixed(1)}%
              </Text>
            </View>
          )}
          
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>継続性スコア:</Text>
            <Text style={styles.insightValue}>
              {weeklyProgress[0]?.consistencyScore.toFixed(1)}%
            </Text>
          </View>
          
          {weeklyProgress[0]?.topMotivations && weeklyProgress[0].topMotivations.length > 0 && (
            <View style={styles.motivationsContainer}>
              <Text style={styles.insightLabel}>主な動機:</Text>
              {weeklyProgress[0].topMotivations.map((motivation, index) => (
                <View key={index} style={styles.motivationTag}>
                  <Text style={styles.motivationText}>{motivation}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
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
    height: '80%',
    backgroundColor: '#eee',
    marginHorizontal: 8,
  },
  chartSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#555',
  },
  chartContainer: {
    flexDirection: 'row',
    height: 200,
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barLabelContainer: {
    marginBottom: 4,
  },
  barValue: {
    fontSize: 12,
    color: '#666',
  },
  barWrapper: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 20,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  insightsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#555',
  },
  insightItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  insightLabel: {
    fontSize: 14,
    color: '#666',
  },
  insightValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  positiveValue: {
    color: '#4CAF50',
  },
  negativeValue: {
    color: '#F44336',
  },
  motivationsContainer: {
    marginTop: 8,
  },
  motivationTag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  motivationText: {
    fontSize: 14,
    color: '#555',
  },
});

export default ProgressCharts;

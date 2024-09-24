import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Text, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { questions } from './questions';

interface SubjectPerformance {
  subject: string;
  score: number;
  totalQuestions: number;
}

const MCQStatsScreen: React.FC = () => {
  const [subjectPerformances, setSubjectPerformances] = useState<SubjectPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    try {
      const subjects = Object.keys(questions);
      const performances = subjects.map((subject) => ({
        subject,
        score: Math.floor(Math.random() * 100), // Replace with actual score data
        totalQuestions: questions[subject]?.length || 0,
      }));
      setSubjectPerformances(performances);
    } catch (error) {
      console.error('Error loading subject performances:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStrengthsAndWeaknesses = () => {
    const sortedPerformances = [...subjectPerformances].sort((a, b) => b.score - a.score);
    const strengths = sortedPerformances.slice(0, 2);
    const weaknesses = sortedPerformances.slice(-2).reverse();
    return { strengths, weaknesses };
  };

  const { strengths, weaknesses } = getStrengthsAndWeaknesses();

  const overallScore = subjectPerformances.length > 0
    ? Math.round(subjectPerformances.reduce((sum, subject) => sum + subject.score, 0) / subjectPerformances.length)
    : 0;

  const subjectChartData = {
    labels: subjectPerformances.map(p => p.subject.substring(0, 3)),
    datasets: [
      {
        data: subjectPerformances.map(p => p.score),
        color: (opacity = 1) => `rgba(0, 21, 41, ${opacity})`,
        strokeWidth: 2
      }
    ]
  };

  // Mock data for monthly performance
  const monthlyChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [65, 70, 68, 75, 72, 78],
        color: (opacity = 1) => `rgba(0, 121, 107, ${opacity})`,
        strokeWidth: 2
      }
    ]
  };

  // Mock data for yearly performance
  const yearlyChartData = {
    labels: ['2019', '2020', '2021', '2022', '2023'],
    datasets: [
      {
        data: [60, 65, 70, 75, 78],
      }
    ]
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 21, 41, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 21, 41, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#001529'
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrowleft" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MCQ Performance</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.overallGrade}>
          <Text style={styles.overallGradeTitle}>Overall Score</Text>
          <Text style={styles.overallGradeValue}>{overallScore}%</Text>
        </View>

        {subjectPerformances.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Subject Performance</Text>
            <LineChart
              data={subjectChartData}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Subject-wise Performance</Text>
          {subjectPerformances.map((performance, index) => (
            <View key={index} style={styles.subjectItem}>
              <Text style={styles.subjectName}>{performance.subject}</Text>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${performance.score}%` }]} />
                </View>
                <Text style={styles.subjectScore}>{performance.score}%</Text>
              </View>
              <Text style={styles.subjectDetails}>
                {Math.round(performance.score * performance.totalQuestions / 100)} / {performance.totalQuestions} correct
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Monthly Performance</Text>
          <LineChart
            data={monthlyChartData}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(0, 121, 107, ${opacity})`,
            }}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Strengths & Areas for Improvement</Text>
          <View style={styles.strengthWeaknessContent}>
            <View style={styles.strengthWeaknessColumn}>
              <Text style={styles.columnTitle}>
                <Icon name="star" size={20} color="#FFD700" /> Strengths
              </Text>
              {strengths.map((subject, index) => (
                <View key={index} style={styles.performanceCard}>
                  <Icon name="checkcircle" size={24} color="#4CAF50" style={styles.cardIcon} />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{subject.subject}</Text>
                    <Text style={styles.cardScore}>{subject.score}%</Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.strengthWeaknessColumn}>
              <Text style={styles.columnTitle}>
                <Icon name="exclamationcircle" size={20} color="#FF9800" /> Improve
              </Text>
              {weaknesses.map((subject, index) => (
                <View key={index} style={styles.performanceCard}>
                  <Icon name="upcircle" size={24} color="#FF5722" style={styles.cardIcon} />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{subject.subject}</Text>
                    <Text style={styles.cardScore}>{subject.score}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Yearly Performance</Text>
          <BarChart
            data={yearlyChartData}
            width={Dimensions.get('window').width - 40}
            height={220}
            yAxisLabel=""
            yAxisSuffix="%"
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(156, 39, 176, ${opacity})`,
            }}
            style={styles.chart}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#001529',
    padding: 15,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  overallGrade: {
    backgroundColor: '#001529',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  overallGradeTitle: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 8,
  },
  overallGradeValue: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
    marginBottom: 16,
  },
  subjectItem: {
    marginBottom: 16,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001529',
    marginBottom: 8,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#001529',
  },
  subjectScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#001529',
    width: 40,
    textAlign: 'right',
  },
  subjectDetails: {
    fontSize: 12,
    color: '#4a4a4a',
  },
  strengthWeaknessContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  strengthWeaknessColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#001529',
  },
  performanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  cardIcon: {
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#001529',
  },
  cardScore: {
    fontSize: 12,
    color: '#4a4a4a',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MCQStatsScreen;
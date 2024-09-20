import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, FlatList, Image, TextInput, SectionList } from 'react-native';
import { Text, Icon as AntIcon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

type MarksheetScreenProps = {
  navigation: StackNavigationProp<any, 'Marksheet'>;
};

// Add this type definition
type SubjectName = 'Mathematics' | 'Science' | 'English' | 'Social Studies' | 'Physical Education';

const MarksheetScreen: React.FC<MarksheetScreenProps> = ({ navigation }) => {
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredExams, setFilteredExams] = useState<any[]>([]);

  const exams = [
    { id: '1', name: 'First Term Exam', date: '2023-09-15', status: 'Completed', score: 92 },
    { id: '2', name: 'Mid-Term Exam', date: '2023-12-10', status: 'Completed', score: 88 },
    { id: '3', name: 'Final Term Exam', date: '2024-03-20', status: 'Upcoming', score: null },
    // Add more exams as needed
  ];

  useEffect(() => {
    setFilteredExams(
      exams.filter(exam => 
        exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.date.includes(searchQuery)
      )
    );
  }, [searchQuery]);

  const subjects: { name: SubjectName; grade: string; percentage: number }[] = [
    { name: 'Mathematics', grade: 'A', percentage: 92 },
    { name: 'Science', grade: 'A+', percentage: 98 },
    { name: 'English', grade: 'B+', percentage: 88 },
    { name: 'Social Studies', grade: 'A', percentage: 94 },
    { name: 'Physical Education', grade: 'A+', percentage: 96 },
  ];

  const classAverages: Record<SubjectName, number> = {
    Mathematics: 85,
    Science: 88,
    English: 82,
    'Social Studies': 86,
    'Physical Education': 90,
  };

  const renderPerformanceComparison = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.sectionTitle}>Performance Comparison</Text>
      <BarChart
        data={{
          labels: subjects.map(subject => subject.name.substring(0, 3)),
          datasets: [
            {
              data: subjects.map(subject => subject.percentage),
              color: (opacity = 1) => `rgba(0, 21, 41, ${opacity})`,
            },
            {
              data: subjects.map(subject => classAverages[subject.name]),
              color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
            },
          ],
        }}
        width={Dimensions.get('window').width - 40}
        height={220}
        yAxisLabel="%"
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(0, 21, 41, 1)' }]} />
          <Text style={styles.legendText}>Your Score</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(134, 65, 244, 1)' }]} />
          <Text style={styles.legendText}>Class Average</Text>
        </View>
      </View>
    </View>
  );

  const renderExamReport = () => (
    <>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>MUHAMMED AYAAN P P</Text>
        <Text style={styles.studentClass}>Class: UKG</Text>
        <Text style={styles.academicYear}>Academic Year: 2023-2024</Text>
      </View>

      <View style={styles.overallGrade}>
        <Text style={styles.overallGradeTitle}>Overall Grade</Text>
        <Text style={styles.overallGradeValue}>A</Text>
        <Text style={styles.overallPercentage}>93.6%</Text>
      </View>

      {renderPerformanceComparison()}

      <View style={styles.subjectsContainer}>
        <Text style={styles.sectionTitle}>Subject-wise Performance</Text>
        {subjects.map((subject, index) => (
          <View key={index} style={styles.subjectItem}>
            <View style={styles.subjectInfo}>
              <Text style={styles.subjectName}>{subject.name}</Text>
              <Text style={styles.subjectGrade}>{subject.grade}</Text>
            </View>
            <View style={styles.percentageBar}>
              <View style={[styles.percentageFill, { width: `${subject.percentage}%` }]} />
            </View>
            <Text style={styles.percentageText}>{subject.percentage}%</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.downloadButton}>
        <AntIcon name="download" size={24} color="#ffffff" />
        <Text style={styles.downloadButtonText}>Download PDF</Text>
      </TouchableOpacity>
    </>
  );

  const renderExamItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.examItem}
      onPress={() => setSelectedExam(item.id)}
    >
      <View style={styles.examMainInfo}>
        <Text style={styles.examName}>{item.name}</Text>
        <Text style={styles.examDate}>{item.date}</Text>
      </View>
      <View style={styles.examStatus}>
        <Text style={[styles.examStatusText, { color: item.status === 'Completed' ? '#52c41a' : '#faad14' }]}>
          {item.status}
        </Text>
        {item.score && <Text style={styles.examScore}>{item.score}%</Text>}
      </View>
    </TouchableOpacity>
  );

  const renderExamList = () => {
    const sections = [
      {
        title: 'Student Info',
        data: ['info'],
        renderItem: () => (
          <View style={styles.studentInfoCard}>
            <Image
              source={{ uri: 'https://example.com/student-avatar.jpg' }}
              style={styles.studentAvatar}
            />
            <View style={styles.studentDetails}>
              <Text style={styles.studentName}>MUHAMMED AYAAN P P</Text>
              <Text style={styles.studentClass}>Class: UKG</Text>
              <Text style={styles.academicYear}>Academic Year: 2023-2024</Text>
            </View>
          </View>
        )
      },
      {
        title: 'Summary',
        data: ['summary'],
        renderItem: () => (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryTitle}>Average Score</Text>
              <Text style={styles.summaryValue}>90%</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryTitle}>Exams Taken</Text>
              <Text style={styles.summaryValue}>2/3</Text>
            </View>
          </View>
        )
      },
      {
        title: 'Performance Chart',
        data: ['chart'],
        renderItem: () => renderPerformanceChart()
      },
      {
        title: 'Exam Reports',
        data: ['search', ...filteredExams],
        renderItem: ({ item, index }: { item: any; index: number }) => {
          if (index === 0) {
            return (
              <View style={styles.searchContainer}>
                <AntIcon name="search" size={20} color="#001529" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search exams..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            );
          }
          return renderExamItem({ item });
        }
      }
    ];

    return (
      <View style={styles.examListContainer}>
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={({ item, section, index }) => section.renderItem({ item, index })}
          renderSectionHeader={({ section: { title } }) => 
            title === 'Exam Reports' ? (
              <Text style={styles.sectionTitle}>{title}</Text>
            ) : null
          }
          contentContainerStyle={styles.scrollContent}
          stickySectionHeadersEnabled={false}
        />
      </View>
    );
  };

  const renderPerformanceChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.sectionTitle}>Performance Trend</Text>
      <LineChart
        data={{
          labels: exams.map(exam => exam.name.split(' ')[0]),
          datasets: [{
            data: exams.map(exam => exam.score || 0)
          }]
        }}
        width={Dimensions.get('window').width - 40}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 21, 41, ${opacity})`,
          style: {
            borderRadius: 16
          }
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => selectedExam ? setSelectedExam(null) : navigation.goBack()}>
          <AntIcon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Marksheet</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.contentContainer}>
        {selectedExam ? (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {renderExamReport()}
          </ScrollView>
        ) : (
          renderExamList()
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  contentContainer: {
    flex: 1,
    marginTop: 80, // Height of the header plus top margin
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#001529',
    padding: 15,
    borderRadius: 10,
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
    height: 60, // Specify a fixed height for the header
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  studentInfo: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
  },
  studentClass: {
    fontSize: 16,
    color: '#4a4a4a',
    marginTop: 5,
  },
  academicYear: {
    fontSize: 16,
    color: '#4a4a4a',
    marginTop: 5,
  },
  overallGrade: {
    backgroundColor: '#001529',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  overallGradeTitle: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 10,
  },
  overallGradeValue: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  overallPercentage: {
    color: '#ffffff',
    fontSize: 18,
    marginTop: 5,
  },
  subjectsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
    marginBottom: 10,
    marginTop: 20,
  },
  subjectItem: {
    marginBottom: 15,
  },
  subjectInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  subjectName: {
    fontSize: 16,
    color: '#4a4a4a',
  },
  subjectGrade: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001529',
  },
  percentageBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  percentageFill: {
    height: '100%',
    backgroundColor: '#001529',
  },
  percentageText: {
    fontSize: 14,
    color: '#4a4a4a',
    marginTop: 5,
    textAlign: 'right',
  },
  downloadButton: {
    backgroundColor: '#001529',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
  },
  downloadButtonText: {
    color: '#ffffff',
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 16,
  },
  examListContainer: {
    flex: 1,
  },
  studentInfoCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  studentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  studentDetails: {
    flex: 1,
  },
  examList: {
    flex: 1,
  },
  examItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  examMainInfo: {
    flex: 1,
  },
  examName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001529',
  },
  examDate: {
    fontSize: 14,
    color: '#4a4a4a',
    marginTop: 2,
  },
  examStatus: {
    alignItems: 'flex-end',
  },
  examStatusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  examScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001529',
    marginTop: 2,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    color: '#4a4a4a',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#4a4a4a',
  },
  examReportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
});

export default MarksheetScreen;
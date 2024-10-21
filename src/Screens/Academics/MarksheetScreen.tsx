import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, FlatList, Image, TextInput, SectionList } from 'react-native';
import { Text, Icon as AntIcon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions, TouchableWithoutFeedback } from 'react-native';
import { getExamMarksheet, getMarksheet } from '../../Services/Marksheet/markSheetServices';
import { logJSON } from '../../utils/logger';
import { formatDate } from "../../utils/DateUtil";

type MarksheetScreenProps = {
  navigation: StackNavigationProp<any, 'Marksheet'>;
};

type SubjectName = 'Mathematics' | 'Science' | 'English' | 'Social Studies' | 'Physical Education';

const MarksheetScreen: React.FC<MarksheetScreenProps> = ({ navigation }) => {
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredExams, setFilteredExams] = useState<any[]>([]);
  const [marksheetData, setMarksheetData] = useState<any>(null);
  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; visible: boolean; exam: any } | null>(null);



  useEffect(() => {
    const fetchMarksheet = async () => {
      try {
        const data = await getMarksheet();
        setMarksheetData(data);
        logJSON("MARKSHEET", data);
      } catch (error) {
        console.error('Error fetching marksheet:', error);
      }
    };

    fetchMarksheet();
  }, []);

  const [selectedExamDetails, setSelectedExamDetails] = useState<any>(null);

  // ... existing useEffect hooks ...

  useEffect(() => {
    if (selectedExam) {
      fetchExamDetails(selectedExam);
    }
  }, [selectedExam]);

  const fetchExamDetails = async (examId: string) => {
    try {
      const data = await getExamMarksheet(examId);
      setSelectedExamDetails(data);
      logJSON("SELECTED EXAM DETAILS", data);
    } catch (error) {
      console.error('Error fetching exam details:', error);
    }
  };

  useEffect(() => {
    if (marksheetData && marksheetData.exams) {
      setFilteredExams(
        marksheetData.exams.filter((exam: any) => 
          exam.examType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          formatDate(exam.date).includes(searchQuery)
        )
      );
    }
  }, [searchQuery, marksheetData]);

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

  const renderExamReport = () => {
    if (!selectedExamDetails) return null;

    const subjects = selectedExamDetails.map(detail => ({
      name: detail.subjectDetails.name,
      grade: calculateGrade(detail.score, detail.examDetails.exams.find((exam:any) => exam.subjectId === detail.subjectId).totalMark),
      percentage: calculatePercentage(detail.score, detail.examDetails.exams.find((exam:any) => exam.subjectId === detail.subjectId).totalMark),
      score: detail.score,
      totalMark: detail.examDetails.exams.find((exam:any) => exam.subjectId === detail.subjectId).totalMark
    }));

    const overallPercentage = calculateOverallPercentage(subjects);
    const overallGrade = calculateGrade(overallPercentage, 100);

    return (
      <>
        <View style={styles.overallGrade}>
          <Text style={styles.overallGradeTitle}>Overall Grade</Text>
          <Text style={styles.overallGradeValue}>{overallGrade}</Text>
          <Text style={styles.overallPercentage}>{Math.round(overallPercentage)}%</Text>
        </View>

        {renderPerformanceComparison(subjects)}

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
              <Text style={styles.percentageText}>{Math.round(subject.percentage) }%</Text>
              <Text style={styles.scoreText}>({subject.score}/{subject.totalMark})</Text>
            </View>
          ))}
        </View>

        {/* <TouchableOpacity style={styles.downloadButton}>
          <AntIcon name="download" size={24} color="#ffffff" />
          <Text style={styles.downloadButtonText}>Download PDF</Text>
        </TouchableOpacity> */}
      </>
    );
  };

  // Helper functions
  const calculateGrade = (score: number, totalMark: number): string => {
    const percentage = (score / totalMark) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    return 'F';
  };

  const calculatePercentage = (score: number, totalMark: number): number => {
    return (score / totalMark) * 100;
  };

  const calculateOverallPercentage = (subjects: any[]): number => {
    const totalScore = subjects.reduce((sum, subject) => sum + subject.score, 0);
    const totalMarks = subjects.reduce((sum, subject) => sum + subject.totalMark, 0);
    return (totalScore / totalMarks) * 100;
  };

  const renderExamItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.examItem}
      onPress={() => navigation.navigate('ExamDetails', { examId: item._id, studentId: '', isTeacher: false })}
    >
      <View style={styles.examMainInfo}>
        <Text style={styles.examName}>{item.examType}</Text>
        <Text style={styles.examDate}>{formatDate(item.date)}</Text>
      </View>
      <View style={styles.examStatus}>
        <Text style={[styles.examStatusText, { color: '#52c41a' }]}>
          Score
        </Text>
        <Text style={styles.examScore}>{Math.round(item.percentage)}%</Text>
      </View>
    </TouchableOpacity>
  );

  const renderExamList = () => {
    const calculateAverageScore = () => {
      if (!marksheetData || !marksheetData.exams || marksheetData.exams.length === 0) {
        return 'N/A';
      }
      
      const totalPercentage = marksheetData.exams.reduce((sum, exam) => sum + exam.percentage, 0);
      const averagePercentage = totalPercentage / marksheetData.exams.length;
      
      return `${Math.round(averagePercentage)}%`;
    };

    const sections = [
      {
        title: 'Summary',
        data: ['summary'],
        renderItem: () => (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryTitle}>Average Score</Text>
              <Text style={styles.summaryValue}>{calculateAverageScore()}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryTitle}>Exams Taken</Text>
              <Text style={styles.summaryValue}>
                {marksheetData ? `${marksheetData.exams.length}/${marksheetData.total}` : 'N/A'}
              </Text>
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
        data: ['search', ...(filteredExams || [])],
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

  const renderPerformanceChart = () => {
    if (!marksheetData) return null;

    const examData = marksheetData.exams.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 40; // Adjust padding as needed
    const chartHeight = 220;

    return (
      <TouchableWithoutFeedback onPress={() => setTooltipData(null)}>
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Performance Trend</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={{
                // labels: examData.map(exam => exam.examType === 'Class Test' ? 'Test' : exam.examType),
                datasets: [{
                  data: examData.map(exam => Math.round(exam.percentage))
                }]
              }}
              width={Math.max(chartWidth, examData.length * 60)} // Ensure minimum width based on data points
              height={chartHeight}
              yAxisLabel=""
              yAxisSuffix="%"
              yAxisInterval={1}
              fromZero={true}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 21, 41, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#ffa726'
                }
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
              onDataPointClick={({ x, y, index }) => {
                const exam = examData[index];
                setTooltipData({ x, y, visible: true, exam });
              }}
              decorator={() => {
                return tooltipData?.visible ? (
                  <View
                    style={[
                      styles.tooltip,
                      {
                        left: tooltipData.x - 60,
                        top: tooltipData.y - 50,
                      },
                    ]}
                  >
                    <Text style={styles.tooltipTitle}>{tooltipData.exam.examType}</Text>
                    <Text style={styles.tooltipText}>Score: {Math.round(tooltipData.exam.percentage)}%</Text>
                    <Text style={styles.tooltipText}>Date: {formatDate(tooltipData.exam.date)}</Text>
                  </View>
                ) : null;
              }}
            />
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    );
  };

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
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            onScroll={() => setTooltipData(null)}
            scrollEventThrottle={16}
          >
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
    marginTop: 80, 
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
  chartLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    marginRight: 10,
    marginBottom: 5,
    fontSize: 12,
    color: '#4a4a4a',
  },
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 5,
    padding: 10,
    position: 'absolute',
    width: 120,
  },
  tooltipTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tooltipText: {
    color: 'white',
    fontSize: 12,
  },
  scoreText: {
    fontSize: 14,
    color: '#4a4a4a',
    marginTop: 5,
    textAlign: 'right',
  },
});

export default MarksheetScreen;

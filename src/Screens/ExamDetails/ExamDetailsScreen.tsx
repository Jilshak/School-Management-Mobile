import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { Text } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';
import { getExistingResultOfStudent, getExamMarksheet } from '../../Services/Marksheet/markSheetServices';
import { formatDate } from '../../utils/DateUtil';
import { calculateGrade, calculatePercentage, gradeSystem } from '../../utils/GradeUtils';

type ExamDetailsScreenProps = {
  navigation: StackNavigationProp<any, 'ExamDetails'>;
  route: RouteProp<{ ExamDetails: { examId: string; studentId: string; isTeacher: boolean } }, 'ExamDetails'>;
};

const ExamDetailsScreen: React.FC<ExamDetailsScreenProps> = ({ navigation, route }) => {
  const { examId, studentId, isTeacher } = route.params;
  const [examDetails, setExamDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGradeSystemVisible, setIsGradeSystemVisible] = useState(false);

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        let result;
        if (isTeacher) {
          result = await getExistingResultOfStudent(examId, studentId);
        } else {
          result = await getExamMarksheet(examId);
        }
        setExamDetails(result);
      } catch (error) {
        console.error('Error fetching exam details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamDetails();
  }, [examId, studentId, isTeacher]);

  const calculateOverallGrade = (subjects: any[]) => {
    const totalScore = subjects.reduce((sum, subject) => sum + subject.score, 0);
    const totalMarks = subjects.reduce((sum, subject) => sum + subject.totalMark, 0);
    const overallPercentage = (totalScore / totalMarks) * 100;
    return calculateGrade(overallPercentage, 100);
  };

  const renderGradeSystemModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isGradeSystemVisible}
      onRequestClose={() => setIsGradeSystemVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Grade System</Text>
          {Object.entries(gradeSystem).map(([grade, range], index) => (
            <View key={index} style={styles.gradeRow}>
              <Text style={styles.gradeText}>{grade}</Text>
              <Text style={styles.gradeRangeText}>{range}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsGradeSystemVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#001529" />
      </View>
    );
  }

  if (!examDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load exam details.</Text>
      </View>
    );
  }

  const subjects = Array.isArray(examDetails) 
    ? examDetails.map((detail: any) => ({
        name: detail.subjectDetails.name,
        score: detail.score,
        totalMark: detail.examDetails.exams.find((exam: any) => exam.subjectId === detail.subjectId).totalMark,
        grade: calculateGrade(detail.score, detail.examDetails.exams.find((exam: any) => exam.subjectId === detail.subjectId).totalMark),
        percentage: calculatePercentage(detail.score, detail.examDetails.exams.find((exam: any) => exam.subjectId === detail.subjectId).totalMark),
      }))
    : Object.entries(examDetails.subjects).map(([subjectId, subjectData]: [string, any]) => ({
        name: subjectData.name,
        score: subjectData.obtainedMarks,
        totalMark: subjectData.totalMarks,
        grade: calculateGrade(subjectData.obtainedMarks, subjectData.totalMarks),
        percentage: calculatePercentage(subjectData.obtainedMarks, subjectData.totalMarks),
      }));

  const overallGrade = calculateOverallGrade(subjects);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrowleft" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exam Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.contentContainer}>

        <View style={styles.overallGradeContainer}>
          <View style={styles.overallGradeHeader}>
            <Text style={styles.overallGradeTitle}>Overall Grade</Text>
            <TouchableOpacity onPress={() => setIsGradeSystemVisible(true)}>
              <Icon name="infocirlceo" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.overallGradeValue}>{overallGrade}</Text>
        </View>

        <View style={styles.subjectsContainer}>
          <Text style={styles.sectionTitle}>Subject-wise Performance</Text>
          {subjects.map((subject: any, index: number) => (
            <View key={index} style={styles.subjectItem}>
              <View style={styles.subjectInfo}>
                <Text style={styles.subjectName}>{subject.name}</Text>
                <Text style={styles.subjectGrade}>{subject.grade}</Text>
              </View>
              <View style={styles.percentageBar}>
                <View style={[styles.percentageFill, { width: `${subject.percentage}%` }]} />
              </View>
              <Text style={styles.percentageText}>{Math.round(subject.percentage)}%</Text>
              <Text style={styles.scoreText}>({subject.score}/{subject.totalMark})</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {renderGradeSystemModal()}
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
    borderRadius: 10,
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
    height: 60,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    marginTop: 80,
    padding: 20,
  },
  examInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  examName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
  },
  examDate: {
    fontSize: 14,
    color: '#4a4a4a',
    marginTop: 5,
  },
  overallGradeContainer: {
    backgroundColor: '#001529',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  overallGradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  overallGradeTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  overallGradeValue: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
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
    marginBottom: 15,
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
  scoreText: {
    fontSize: 14,
    color: '#4a4a4a',
    marginTop: 5,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4d4f',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#001529',
    marginBottom: 15,
    textAlign: 'center',
  },
  gradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gradeText: {
    fontSize: 16,
    color: '#001529',
    fontWeight: 'bold',
  },
  gradeRangeText: {
    fontSize: 16,
    color: '#4a4a4a',
  },
  closeButton: {
    backgroundColor: '#001529',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ExamDetailsScreen;

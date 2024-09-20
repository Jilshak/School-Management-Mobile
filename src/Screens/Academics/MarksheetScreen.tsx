import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Text, Icon as AntIcon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type MarksheetScreenProps = {
  navigation: StackNavigationProp<any, 'Marksheet'>;
};

const MarksheetScreen: React.FC<MarksheetScreenProps> = ({ navigation }) => {
  const subjects = [
    { name: 'Mathematics', grade: 'A', percentage: 92 },
    { name: 'Science', grade: 'A+', percentage: 98 },
    { name: 'English', grade: 'B+', percentage: 88 },
    { name: 'Social Studies', grade: 'A', percentage: 94 },
    { name: 'Physical Education', grade: 'A+', percentage: 96 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntIcon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Marksheet</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
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
        </ScrollView>
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
});

export default MarksheetScreen;
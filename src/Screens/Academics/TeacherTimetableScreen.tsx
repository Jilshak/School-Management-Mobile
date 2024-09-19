import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Text, Icon as AntIcon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type TeacherTimetableScreenProps = {
  navigation: StackNavigationProp<any, 'TeacherTimetable'>;
};

const TeacherTimetableScreen: React.FC<TeacherTimetableScreenProps> = ({ navigation }) => {
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const teacherTimetable = {
    Monday: [
      { time: '09:00 - 10:00', subject: 'Mathematics', class: 'UKG-A' },
      { time: '10:00 - 11:00', subject: 'English', class: 'LKG-B' },
      { time: '11:15 - 12:15', subject: 'Science', class: 'UKG-B' },
      { time: '13:00 - 14:00', subject: 'Mathematics', class: 'LKG-A' },
      { time: '14:00 - 15:00', subject: 'English', class: 'UKG-C' },
    ],
    Tuesday: [
      { time: '09:00 - 10:00', subject: 'Science', class: 'UKG-B' },
      { time: '10:00 - 11:00', subject: 'Mathematics', class: 'LKG-B' },
      { time: '11:15 - 12:15', subject: 'English', class: 'UKG-A' },
      { time: '13:00 - 14:00', subject: 'Science', class: 'LKG-A' },
      { time: '14:00 - 15:00', subject: 'Mathematics', class: 'UKG-C' },
    ],
    Wednesday: [
      { time: '09:00 - 10:00', subject: 'English', class: 'LKG-A' },
      { time: '10:00 - 11:00', subject: 'Science', class: 'UKG-C' },
      { time: '11:15 - 12:15', subject: 'Mathematics', class: 'UKG-B' },
      { time: '13:00 - 14:00', subject: 'English', class: 'LKG-B' },
      { time: '14:00 - 15:00', subject: 'Science', class: 'UKG-A' },
    ],
    Thursday: [
      { time: '09:00 - 10:00', subject: 'Mathematics', class: 'LKG-B' },
      { time: '10:00 - 11:00', subject: 'Science', class: 'UKG-A' },
      { time: '11:15 - 12:15', subject: 'English', class: 'LKG-A' },
      { time: '13:00 - 14:00', subject: 'Mathematics', class: 'UKG-C' },
      { time: '14:00 - 15:00', subject: 'Science', class: 'UKG-B' },
    ],
    Friday: [
      { time: '09:00 - 10:00', subject: 'English', class: 'UKG-C' },
      { time: '10:00 - 11:00', subject: 'Mathematics', class: 'LKG-A' },
      { time: '11:15 - 12:15', subject: 'Science', class: 'UKG-B' },
      { time: '13:00 - 14:00', subject: 'English', class: 'UKG-A' },
      { time: '14:00 - 15:00', subject: 'Mathematics', class: 'LKG-B' },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntIcon name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Teacher Timetable</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.teacherInfo}>
          <Text style={styles.teacherName}>Mrs. Sarah Johnson</Text>
          <Text style={styles.teacherSubject}>Subjects: Mathematics, English, Science</Text>
          <Text style={styles.academicYear}>Academic Year: 2023-2024</Text>
        </View>

        {weekDays.map((day, index) => (
          <View key={index} style={styles.dayContainer}>
            <Text style={styles.dayTitle}>{day}</Text>
            {teacherTimetable[day]?.map((period, periodIndex) => (
              <View key={periodIndex} style={styles.periodItem}>
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>{period.time}</Text>
                </View>
                <View style={styles.classInfoContainer}>
                  <Text style={styles.subjectText}>{period.subject}</Text>
                  <Text style={styles.classText}>{period.class}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}

        <TouchableOpacity style={styles.downloadButton}>
          <AntIcon name="download" size={24} color="#ffffff" />
          <Text style={styles.downloadButtonText}>Download Timetable</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#001529',
    padding: 15,
    borderRadius: 10,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  teacherInfo: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
  },
  teacherSubject: {
    fontSize: 16,
    color: '#4a4a4a',
    marginTop: 5,
  },
  academicYear: {
    fontSize: 16,
    color: '#4a4a4a',
    marginTop: 5,
  },
  dayContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
    marginBottom: 10,
  },
  periodItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  timeContainer: {
    backgroundColor: '#001529',
    borderRadius: 5,
    padding: 5,
    width: 120,
  },
  timeText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
  },
  classInfoContainer: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    borderRadius: 5,
    padding: 5,
    marginLeft: 10,
    justifyContent: 'center',
  },
  subjectText: {
    color: '#001529',
    fontSize: 16,
    fontWeight: 'bold',
  },
  classText: {
    color: '#4a4a4a',
    fontSize: 14,
  },
  downloadButton: {
    backgroundColor: '#001529',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  downloadButtonText: {
    color: '#ffffff',
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TeacherTimetableScreen;
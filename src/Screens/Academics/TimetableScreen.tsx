import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Text, Icon as AntIcon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type TimetableScreenProps = {
  navigation: StackNavigationProp<any, 'Timetable'>;
};

const TimetableScreen: React.FC<TimetableScreenProps> = ({ navigation }) => {
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timetable = {
    Monday: [
      { time: '09:00 - 10:00', subject: 'Mathematics' },
      { time: '10:00 - 11:00', subject: 'English' },
      { time: '11:15 - 12:15', subject: 'Science' },
      { time: '13:00 - 14:00', subject: 'Social Studies' },
      { time: '14:00 - 15:00', subject: 'Physical Education' },
    ],
    Tuesday: [
      { time: '09:00 - 10:00', subject: 'Science' },
      { time: '10:00 - 11:00', subject: 'Mathematics' },
      { time: '11:15 - 12:15', subject: 'English' },
      { time: '13:00 - 14:00', subject: 'Art' },
      { time: '14:00 - 15:00', subject: 'Music' },
    ],
    Wednesday: [
      { time: '09:00 - 10:00', subject: 'English' },
      { time: '10:00 - 11:00', subject: 'Social Studies' },
      { time: '11:15 - 12:15', subject: 'Mathematics' },
      { time: '13:00 - 14:00', subject: 'Science' },
      { time: '14:00 - 15:00', subject: 'Computer' },
    ],
    Thursday: [
      { time: '09:00 - 10:00', subject: 'Social Studies' },
      { time: '10:00 - 11:00', subject: 'Science' },
      { time: '11:15 - 12:15', subject: 'Mathematics' },
      { time: '13:00 - 14:00', subject: 'English' },
      { time: '14:00 - 15:00', subject: 'Art' },
    ],
    Friday: [
      { time: '09:00 - 10:00', subject: 'Mathematics' },
      { time: '10:00 - 11:00', subject: 'English' },
      { time: '11:15 - 12:15', subject: 'Science' },
      { time: '13:00 - 14:00', subject: 'Physical Education' },
      { time: '14:00 - 15:00', subject: 'Music' },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntIcon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Timetable</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>MUHAMMED AYAAN P P</Text>
            <Text style={styles.studentClass}>Class: UKG</Text>
            <Text style={styles.academicYear}>Academic Year: 2023-2024</Text>
          </View>

          {weekDays.map((day, index) => (
            <View key={index} style={styles.dayContainer}>
              <Text style={styles.dayTitle}>{day}</Text>
              {timetable[day as keyof typeof timetable]?.map((period, periodIndex) => (
                <View key={periodIndex} style={styles.periodItem}>
                  <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{period.time}</Text>
                  </View>
                  <View style={styles.subjectContainer}>
                    <Text style={styles.subjectText}>{period.subject}</Text>
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
  subjectContainer: {
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

export default TimetableScreen;
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Text, Icon as AntIcon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getTimetableForStudent } from '../../Services/TimeTable/timetableServices';

type TimetableScreenProps = {
  navigation: StackNavigationProp<any, 'Timetable'>;
};

interface TimetableData {
  classroomDetails: {
    name: string;
    academicYear: {
      startDate: string;
      endDate: string;
    };
  };
  monday: Period[];
  tuesday: Period[];
  wednesday: Period[];
  thursday: Period[];
  friday: Period[];
  // Add other days if needed
}

interface Period {
  startTime: number;
  endTime: number;
  subject: {
    name: string;
  };
  teacher: {
    firstName: string;
    lastName: string;
  };
}

const TimetableScreen: React.FC<TimetableScreenProps> = ({ navigation }) => {
  const [timetableData, setTimetableData] = useState<TimetableData | null>(null);

  useEffect(() => {
    getTimetableForStudent().then((res) => {
      setTimetableData(res);
    });
  }, []);

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderPeriods = (day: keyof TimetableData) => {
    if (!timetableData || !timetableData[day]) return null;

    return Array.isArray(timetableData[day]) ? timetableData[day].map((period, index) => (
      <View key={index} style={styles.periodItem}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {formatTime(period.startTime)} - {formatTime(period.endTime)}
          </Text>
        </View>
        <View style={styles.subjectContainer}>
          <Text style={styles.subjectText}>{period.subject.name}</Text>
          <Text style={styles.teacherText}>
            {period.teacher.firstName} {period.teacher.lastName}
          </Text>
        </View>
      </View>
    )) : null;
  };

  if (!timetableData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.studentName}>Class: {timetableData.classroomDetails.name}</Text>
            <Text style={styles.academicYear}>
              Academic Year: {new Date(timetableData.classroomDetails.academicYear.startDate).getFullYear()} - 
              {new Date(timetableData.classroomDetails.academicYear.endDate).getFullYear()}
            </Text>
          </View>

          {weekDays.map((day, index) => (
            <View key={index} style={styles.dayContainer}>
              <Text style={styles.dayTitle}>{day}</Text>
              {renderPeriods(day.toLowerCase() as keyof TimetableData)}
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
  teacherText: {
    color: '#4a4a4a',
    fontSize: 14,
    marginTop: 2,
  },
});

export default TimetableScreen;
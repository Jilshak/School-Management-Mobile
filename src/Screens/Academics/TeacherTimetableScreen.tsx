import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Text, Icon as AntIcon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getTeacherTimetable } from '../../Services/TimeTable/timetableServices';

type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

type Period = {
  period: number;
  startTime: number;
  endTime: number;
  className: string;
  subject: {
    _id: string;
    name: string;
    code: string;
    schoolId: string;
  };
};

type TeacherTimetable = {
  [key in WeekDay]: Period[];
};

type TeacherTimetableScreenProps = {
  navigation: StackNavigationProp<any, 'TeacherTimetable'>;
};

const TeacherTimetableScreen: React.FC<TeacherTimetableScreenProps> = ({ navigation }) => {
  const [timetable, setTimetable] = useState<TeacherTimetable | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const weekDays: WeekDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        // Simulate a delay to show the skeleton loader
        await new Promise(resolve => setTimeout(resolve, 2000));
        const res = await getTeacherTimetable();
        setTimetable(res);
      } catch (error) {
        console.error('Error fetching teacher timetable:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonTeacherInfo} />
      {weekDays.map((_, index) => (
        <View key={index} style={styles.skeletonDay}>
          <View style={styles.skeletonDayTitle} />
          {[...Array(4)].map((_, subIndex) => (
            <View key={subIndex} style={styles.skeletonPeriod}>
              <View style={styles.skeletonTime} />
              <View style={styles.skeletonSubject} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <AntIcon name="schedule" size={80} color="#001529" />
      <Text style={styles.emptyStateTitle}>No Timetable Available</Text>
      <Text style={styles.emptyStateDescription}>Your timetable hasn't been set up yet. Check back later or contact your administrator.</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntIcon name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Teacher Timetable</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.contentContainer}>
          {renderSkeletonLoader()}
        </View>
      </SafeAreaView>
    );
  }

  if (!timetable || Object.keys(timetable).length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntIcon name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Teacher Timetable</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.contentContainer}>
          {renderEmptyState()}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntIcon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Teacher Timetable</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.teacherInfo}>
            <Text style={styles.teacherName}>Teacher Name</Text>
            <Text style={styles.academicYear}>Academic Year: 2023-2024</Text>
          </View>

          {timetable && weekDays.map((day, index) => (
            <View key={index} style={styles.dayContainer}>
              <Text style={styles.dayTitle}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
              {timetable[day].length > 0 ? (
                timetable[day].map((period: Period, periodIndex: number) => (
                  <View key={periodIndex} style={styles.periodItem}>
                    <View style={styles.timeContainer}>
                      <Text style={styles.timeText}>
                        {`${formatTime(period.startTime)} - ${formatTime(period.endTime)}`}
                      </Text>
                    </View>
                    <View style={styles.classInfoContainer}>
                      <Text style={styles.subjectText}>{period.subject.name}</Text>
                      <Text style={styles.classText}>{`Class ${period.className}`}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noClassText}>No classes scheduled</Text>
              )}
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
  noClassText: {
    fontSize: 16,
    color: '#4a4a4a',
    fontStyle: 'italic',
  },
  skeletonContainer: {
    padding: 20,
  },
  skeletonTeacherInfo: {
    height: 80,
    backgroundColor: '#E1E9EE',
    borderRadius: 10,
    marginBottom: 20,
  },
  skeletonDay: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  skeletonDayTitle: {
    width: '40%',
    height: 24,
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
    marginBottom: 10,
  },
  skeletonPeriod: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  skeletonTime: {
    width: 80,
    height: 30,
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
    marginRight: 10,
  },
  skeletonSubject: {
    flex: 1,
    height: 30,
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#001529',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#8c8c8c',
    textAlign: 'center',
  },
});

export default TeacherTimetableScreen;
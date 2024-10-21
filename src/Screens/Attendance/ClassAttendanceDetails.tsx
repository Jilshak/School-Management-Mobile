import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  VirtualizedList,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { fetchClassroomAttendanceByDate } from '../../Services/Attendance/ClassAttendance';
import Icon from 'react-native-vector-icons/AntDesign';
import { StackNavigationProp } from "@react-navigation/stack";
import { useToast } from '../../hooks/useToast';
import Toast from "../../Components/common/Toast";
import useProfileStore from '../../store/profileStore';
import { useNavigation } from '@react-navigation/native';

export interface StudentAttendance {
    enrollmentNumber: string;
    firstName: string;
    lastName: string;
    isRegularized: boolean;
    remark: string;
    status: 'present' | 'absent' | 'halfday';
    studentId: string;
  }

type ClassAttendanceDetailsProps = {
  navigation: StackNavigationProp<any, "ClassAttendanceDetails">;
};

// Define the navigation type
type NavigationProp = StackNavigationProp<any, 'StudentDetails'>;

const ClassAttendanceDetails: React.FC<ClassAttendanceDetailsProps> = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceDetails, setAttendanceDetails] = useState<StudentAttendance[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAttendance, setFilteredAttendance] = useState<StudentAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { isVisible, toastProps, showToast, hideToast } = useToast();
  const { profile } = useProfileStore();
  const navigationHook = useNavigation<NavigationProp>();
  const today = new Date().toISOString().split('T')[0];


  const handleToast = useCallback((message: string, type: "success" | "error") => {
    showToast({
      message: message,
      type: type,
      duration: 3000,
    });
  }, [showToast]);

  const handleFetchAttendanceDetails = useCallback(async (date: string) => {
    setIsLoading(true);
    try {
      if (!profile?.classroom?._id) {
        throw new Error("Classroom ID not found");
      }
      const response = await fetchClassroomAttendanceByDate(profile.classroom._id, date);
      setAttendanceDetails(response);
      setFilteredAttendance(response);
    } catch (error) {
      console.error('Error fetching attendance details:', error);
      setAttendanceDetails([]);
      setFilteredAttendance([]);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.classroom?._id]);

  useEffect(() => {
    handleFetchAttendanceDetails(selectedDate);
  }, [selectedDate, handleFetchAttendanceDetails]);

  useEffect(() => {
    setFilteredAttendance(
      attendanceDetails.filter(
        (student) =>
          student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.enrollmentNumber.includes(searchQuery)
      )
    );
  }, [searchQuery, attendanceDetails]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return "#52c41a";
      case 'absent': return "#f5222d";
      case 'halfday': return "#faad14";
      default: return "#001529";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return "checkcircle";
      case 'absent': return "closecircle";
      case 'halfday': return "clockcircle";
      default: return "questioncircle";
    }
  };

  const handleStudentPress = useCallback((studentId: string) => {
    navigationHook.navigate('StudentDetails', { studentId });
  }, [navigationHook]);

  const renderAttendanceItem = useCallback(({ item }: { item: StudentAttendance }) => (
    <TouchableOpacity
      style={[styles.attendanceItem, { borderLeftColor: getStatusColor(item.status) }]}
      onPress={() => handleStudentPress(item.studentId)}
    >
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{`${item.firstName} ${item.lastName}`}</Text>
        <Text style={styles.studentRollNumber}>Enrollment No: {item.enrollmentNumber}</Text>
      </View>
      <View style={styles.statusContainer}>
        <Icon name={getStatusIcon(item.status)} size={18} color={getStatusColor(item.status)} />
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
    </TouchableOpacity>
  ), [handleStudentPress]);

  const renderAttendanceContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#001529" />
        </View>
      );
    }

    if (filteredAttendance.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Icon name="calendar" size={50} color="#001529" />
          <Text style={styles.noDataText}>No attendance data available for this date.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={filteredAttendance}
        renderItem={renderAttendanceItem}
        keyExtractor={(item) => item.studentId}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  const renderItem = useCallback(({ item }: { item: any }) => {
    if (item.type === 'calendar') {
      return (
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: "#001529" },
            }}
            maxDate={today} // Add this line to set the maximum selectable date
            theme={{
              calendarBackground: "#ffffff",
              textSectionTitleColor: "#001529",
              selectedDayBackgroundColor: "#001529",
              selectedDayTextColor: "#ffffff",
              todayTextColor: "#1890ff",
              dayTextColor: "#001529",
              textDisabledColor: "#cccccc",
              monthTextColor: "#001529",
              arrowColor: "#1890ff",
            }}
          />
        </View>
      );
    } else if (item.type === 'search') {
      return (
        <View style={styles.searchContainer}>
          <Icon name="search1" size={20} color="#001529" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or enrollment number"
            placeholderTextColor="#001529"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      );
    } else if (item.type === 'attendanceList') {
      return (
        <View style={styles.attendanceContainer}>
          <Text style={styles.dateText}>
            Attendance for {selectedDate}
          </Text>
          {renderAttendanceContent()}
        </View>
      );
    }
    return null;
  }, [selectedDate, searchQuery, renderAttendanceContent, today]); // Add 'today' to the dependency array

  const getItemCount = useCallback(() => 3, []);

  const getItem = useCallback((data: any, index: number) => {
    const items = [
      { type: 'calendar', key: 'calendar' },
      { type: 'search', key: 'search' },
      { type: 'attendanceList', key: 'attendanceList' },
    ];
    return items[index];
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Class Attendance Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <VirtualizedList
        style={styles.scrollContainer}
        data={[]}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        getItemCount={getItemCount}
        getItem={getItem}
      />

      <Toast
        isVisible={isVisible}
        message={toastProps.message}
        type={toastProps.type}
        duration={toastProps.duration}
        onClose={hideToast}
      />
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375 || height < 667;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#001529",
    padding: 15,
    borderRadius: 10,
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
    height: 60,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollContainer: {
    flex: 1,
    marginTop: 100, // Adjust this value to account for the fixed header
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: isSmallScreen ? 8 : 10,
    marginTop: isSmallScreen ? 15 : 20,
    marginHorizontal: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: isSmallScreen ? 14 : 16,
    color: "#001529",
  },
  calendarContainer: {
    marginTop: isSmallScreen ? 15 : 20,
    marginHorizontal: 20,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: isSmallScreen ? 8 : 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  attendanceContainer: {
    flex: 1,
    marginTop: isSmallScreen ? 15 : 20,
    marginHorizontal: 20,
  },
  dateText: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: "bold",
    color: "#001529",
    marginBottom: isSmallScreen ? 10 : 16,
  },
  attendanceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: isSmallScreen ? 12 : 15,
    marginBottom: isSmallScreen ? 10 : 12,
    borderLeftWidth: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: isSmallScreen ? 15 : 17,
    fontWeight: "bold",
    color: "#001529",
  },
  studentRollNumber: {
    fontSize: isSmallScreen ? 13 : 15,
    color: "#4a4a4a",
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  statusText: {
    marginLeft: 4,
    fontSize: isSmallScreen ? 11 : 13,
    fontWeight: "bold",
  },
  listContent: {
    flexGrow: 1,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    height: 200, // Increase the height of the container
  },
  noDataText: {
    fontSize: 16,
    color: '#001529',
    textAlign: 'center',
    marginTop: 20, // Increase top margin
    marginBottom: 20, // Increase bottom margin
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ClassAttendanceDetails;

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { Text } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';

type StudentListScreenProps = {
  navigation: StackNavigationProp<any, 'StudentList'>;
  route: RouteProp<{ StudentList: { classId: string } }, 'StudentList'>;
};

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  performance: number;
  attendance: number;
}

const StudentListScreen: React.FC<StudentListScreenProps> = ({ navigation, route }) => {
  const { classId } = route.params;
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterPerformance, setFilterPerformance] = useState<string | null>(null);
  const [filterAttendance, setFilterAttendance] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      const mockStudents: Student[] = [
        { id: '1', name: 'Alice Johnson', rollNumber: '001', performance: 85, attendance: 95 },
        { id: '2', name: 'Bob Smith', rollNumber: '002', performance: 78, attendance: 88 },
        { id: '3', name: 'Charlie Brown', rollNumber: '003', performance: 92, attendance: 98 },
        { id: '4', name: 'Diana Prince', rollNumber: '004', performance: 65, attendance: 75 },
        { id: '5', name: 'Ethan Hunt', rollNumber: '005', performance: 88, attendance: 92 },
      ];
      setStudents(mockStudents);
    };

    fetchStudents();
  }, [classId]);

  const getPerformanceRange = (performance: number): string => {
    if (performance < 60) return 'Below 60%';
    if (performance < 80) return '60% - 79%';
    return '80% and above';
  };

  const getAttendanceRange = (attendance: number): string => {
    if (attendance < 75) return 'Below 75%';
    if (attendance < 90) return '75% - 89%';
    return '90% and above';
  };

  const filteredStudents = students.filter(
    (student) =>
      (student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.includes(searchQuery)) &&
      (filterPerformance === null || getPerformanceRange(student.performance) === filterPerformance) &&
      (filterAttendance === null || getAttendanceRange(student.attendance) === filterAttendance)
  );

  const performanceRanges = ['Below 60%', '60% - 79%', '80% and above'];
  const attendanceRanges = ['Below 75%', '75% - 89%', '90% and above'];

  const resetFilters = () => {
    setFilterPerformance(null);
    setFilterAttendance(null);
  };

  const renderStudentItem = ({ item }: { item: Student }) => (
    <TouchableOpacity
      style={styles.studentItem}
      onPress={() => navigation.navigate('StudentDetails', { studentId: item.id, student: item })}
    >
      <View>
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.studentRollNumber}>Roll No: {item.rollNumber}</Text>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon name="barchart" size={16} color="#001529" />
          <Text style={styles.statText}>{item.performance}%</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="calendar" size={16} color="#001529" />
          <Text style={styles.statText}>{item.attendance}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrowleft" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student List</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.searchContainer}>
          <Icon name="search1" size={20} color="#001529" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or roll number"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={styles.filterButton}>
            <Icon name="filter" size={24} color="#001529" />
          </TouchableOpacity>
        </View>

        <View style={styles.studentListContainer}>
          <Text style={styles.sectionTitle}>Students</Text>
          <FlatList
            data={filteredStudents}
            renderItem={renderStudentItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Students</Text>
            
            <Text style={styles.filterLabel}>Performance Range:</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[styles.filterOption, filterPerformance === null && styles.filterOptionActive]}
                onPress={() => setFilterPerformance(null)}
              >
                <Text style={[styles.filterOptionText, filterPerformance === null && styles.filterOptionTextActive]}>All</Text>
              </TouchableOpacity>
              {performanceRanges.map(range => (
                <TouchableOpacity
                  key={range}
                  style={[styles.filterOption, filterPerformance === range && styles.filterOptionActive]}
                  onPress={() => setFilterPerformance(range)}
                >
                  <Text style={[styles.filterOptionText, filterPerformance === range && styles.filterOptionTextActive]}>{range}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterLabel}>Attendance Range:</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[styles.filterOption, filterAttendance === null && styles.filterOptionActive]}
                onPress={() => setFilterAttendance(null)}
              >
                <Text style={[styles.filterOptionText, filterAttendance === null && styles.filterOptionTextActive]}>All</Text>
              </TouchableOpacity>
              {attendanceRanges.map(range => (
                <TouchableOpacity
                  key={range}
                  style={[styles.filterOption, filterAttendance === range && styles.filterOptionActive]}
                  onPress={() => setFilterAttendance(range)}
                >
                  <Text style={[styles.filterOptionText, filterAttendance === range && styles.filterOptionTextActive]}>{range}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={resetFilters}>
                <Text style={styles.modalButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.applyButton]} onPress={() => setFilterModalVisible(false)}>
                <Text style={[styles.modalButtonText, styles.applyButtonText]}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  studentListContainer: {
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
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001529',
  },
  studentRollNumber: {
    fontSize: 14,
    color: '#4a4a4a',
  },
  performanceContainer: {
    backgroundColor: '#f0f2f5',
    borderRadius: 15,
    padding: 8,
  },
  performanceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#001529',
  },
  filterButton: {
    padding: 5,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  statText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#4a4a4a',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 10,
  },
  filterOptionActive: {
    backgroundColor: '#001529',
  },
  filterOptionText: {
    color: '#001529',
  },
  filterOptionTextActive: {
    color: '#ffffff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: '#001529',
    marginLeft: 10,
  },
  applyButtonText: {
    color: 'white',
  },
});

export default StudentListScreen;
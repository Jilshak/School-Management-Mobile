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
  TouchableWithoutFeedback,
} from 'react-native';
import { Text, Button } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';
import { fetchClassroomById } from '../../Services/Classroom/ClassroomService';
import { logJSON } from '../../utils/logger';
import { ClassroomStudent } from '../../Services/Classroom/Interfaces/IClassroomService';

type StudentListScreenProps = {
  navigation: StackNavigationProp<any, 'StudentList'>;
  route: RouteProp<{ StudentList: { classId: string } }, 'StudentList'>;
};

const StudentListScreen: React.FC<StudentListScreenProps> = ({ navigation, route }) => {
  const { classId } = route.params;
  const [students, setStudents] = useState<ClassroomStudent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    gender: '',
    performanceRange: '',
  });

  useEffect(() => {
    const fetchStudents = async () => {
      const classroom = await fetchClassroomById(classId);
      setStudents(Object.values(classroom));
    };

    fetchStudents();
  }, [classId]);

  const filteredStudents = students?.filter((student) => {
    if (!student.studentDetails) return false;

    const nameMatch =
      student.studentDetails.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentDetails.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentDetails.enrollmentNumber.includes(searchQuery);

    const genderMatch =
      filterOptions.gender === '' || student.studentDetails.gender === filterOptions.gender;

    const performance = student.studentDetails.performance || 0;
    const performanceMatch =
      filterOptions.performanceRange === '' ||
      (filterOptions.performanceRange === 'high' && performance >= 80) ||
      (filterOptions.performanceRange === 'medium' && performance >= 50 && performance < 80) ||
      (filterOptions.performanceRange === 'low' && performance < 50);

    return nameMatch && genderMatch && performanceMatch;
  });

  const closeFilterModal = () => {
    setFilterModalVisible(false);
  };

  const applyFilters = () => {
    closeFilterModal();
    // The filteredStudents will automatically update based on the new filterOptions
  };

  const resetFilters = () => {
    setFilterOptions({
      gender: '',
      performanceRange: '',
    });
    closeFilterModal();
  };

  const renderStudentItem = ({ item }: { item: ClassroomStudent }) => {
    if (!item.studentDetails) return null;
    
    const performance = item.studentDetails.performance || 0;
    const attendance = item.studentDetails.attendance || 0;
    
    return (
      <TouchableOpacity
        style={styles.studentItem}
        onPress={() => navigation.navigate('StudentDetails', { studentId: item._id })}
      >
        <View>
          <Text style={styles.studentName}>{`${item.studentDetails.firstName} ${item.studentDetails.lastName}`}</Text>
          <Text style={styles.studentRollNumber}>Roll No: {item.studentDetails.enrollmentNumber}</Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="star" size={16} color="#000000" />
            <Text style={styles.statText}>{performance}%</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="calendar" size={16} color="#000000" />
            <Text style={styles.statText}>{attendance}%</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrowleft" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student List</Text>
        <View style={{ width: 24 }} />
      </View>

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

      <ScrollView style={styles.contentContainer}>
        <View style={styles.studentListContainer}>
          <Text style={styles.sectionTitle}>Students</Text>
          <FlatList
            data={filteredStudents}
            renderItem={renderStudentItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeFilterModal}
      >
        <TouchableWithoutFeedback onPress={closeFilterModal}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Filter Students</Text>

                <Text style={styles.filterLabel}>Gender</Text>
                <View style={styles.filterOptions}>
                  {['Male', 'Female', 'Other'].map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      style={[
                        styles.filterOption,
                        filterOptions.gender === gender && styles.filterOptionActive,
                      ]}
                      onPress={() => setFilterOptions({ ...filterOptions, gender })}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          filterOptions.gender === gender && styles.filterOptionTextActive,
                        ]}
                      >
                        {gender}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.filterLabel}>Performance</Text>
                <View style={styles.filterOptions}>
                  {['High', 'Medium', 'Low'].map((range) => (
                    <TouchableOpacity
                      key={range}
                      style={[
                        styles.filterOption,
                        filterOptions.performanceRange === range.toLowerCase() && styles.filterOptionActive,
                      ]}
                      onPress={() => setFilterOptions({ ...filterOptions, performanceRange: range.toLowerCase() })}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          filterOptions.performanceRange === range.toLowerCase() && styles.filterOptionTextActive,
                        ]}
                      >
                        {range}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalButtons}>
                  <Button onPress={resetFilters} style={styles.modalButton}>
                    Reset
                  </Button>
                  <Button onPress={applyFilters} style={[styles.modalButton, styles.applyButton]} type="primary">
                    Apply
                  </Button>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    position: 'absolute',
    top: 90,
    left: 20,
    right: 20,
    zIndex: 999,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    marginTop: 150, // Adjusted to accommodate header and search bar
    padding: 20,
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
  statsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
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
  filterButton: {
    padding: 5,
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
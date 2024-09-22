import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Modal,
} from 'react-native';
import { Text } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/AntDesign';

type ClassDetailsScreenProps = {
  navigation: StackNavigationProp<any, 'ClassDetails'>;
};

interface ClassInfo {
  id: string;
  name: string;
  teacher: string;
  studentCount: number;
  averagePerformance: number;
}

const ClassDetailsScreen: React.FC<ClassDetailsScreenProps> = ({ navigation }) => {
  const [classes, setClasses] = useState<ClassInfo[]>([
    { id: '1', name: 'Class 1A', teacher: 'John Doe', studentCount: 30, averagePerformance: 85 },
    { id: '2', name: 'Class 2B', teacher: 'Jane Smith', studentCount: 28, averagePerformance: 78 },
    { id: '3', name: 'Class 3C', teacher: 'Mike Johnson', studentCount: 32, averagePerformance: 92 },
    // Add more sample data as needed
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClasses, setFilteredClasses] = useState<ClassInfo[]>(classes);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterTeacher, setFilterTeacher] = useState<string | null>(null);
  const [filterPerformance, setFilterPerformance] = useState<string | null>(null);

  useEffect(() => {
    setFilteredClasses(
      classes.filter(
        (classInfo) =>
          (classInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          classInfo.teacher.toLowerCase().includes(searchQuery.toLowerCase())) &&
          (filterTeacher === null || classInfo.teacher === filterTeacher) &&
          (filterPerformance === null || getPerformanceRange(classInfo.averagePerformance) === filterPerformance)
      )
    );
  }, [searchQuery, classes, filterTeacher, filterPerformance]);

  const getPerformanceRange = (performance: number): string => {
    if (performance < 60) return 'Below 60%';
    if (performance < 80) return '60% - 79%';
    return '80% and above';
  };

  const teachers = Array.from(new Set(classes.map(classInfo => classInfo.teacher)));
  const performanceRanges = ['Below 60%', '60% - 79%', '80% and above'];

  const resetFilters = () => {
    setFilterTeacher(null);
    setFilterPerformance(null);
  };

  const renderClassCard = ({ item }: { item: ClassInfo }) => (
    <TouchableOpacity
      style={styles.classCard}
      onPress={() => navigation.navigate('StudentList', { classId: item.id })}
    >
      <Text style={styles.className}>{item.name}</Text>
      <Text style={styles.classTeacher}>Teacher: {item.teacher}</Text>
      <View style={styles.classStats}>
        <View style={styles.statItem}>
          <Icon name="team" size={20} color="#001529" />
          <Text style={styles.statText}>{item.studentCount} students</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="barchart" size={20} color="#001529" />
          <Text style={styles.statText}>{item.averagePerformance}% avg. performance</Text>
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
        <Text style={styles.headerTitle}>Class Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.searchContainer}>
          <Icon name="search1" size={20} color="#001529" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by class name or teacher"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={styles.filterButton}>
            <Icon name="filter" size={24} color="#001529" />
          </TouchableOpacity>
        </View>

        <View style={styles.classListContainer}>
          <Text style={styles.sectionTitle}>Classes</Text>
          <FlatList
            data={filteredClasses}
            renderItem={renderClassCard}
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
            <Text style={styles.modalTitle}>Filter Classes</Text>
            
            <Text style={styles.filterLabel}>Teacher:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.filterOption, filterTeacher === null && styles.filterOptionActive]}
                onPress={() => setFilterTeacher(null)}
              >
                <Text style={[styles.filterOptionText, filterTeacher === null && styles.filterOptionTextActive]}>All</Text>
              </TouchableOpacity>
              {teachers.map(teacher => (
                <TouchableOpacity
                  key={teacher}
                  style={[styles.filterOption, filterTeacher === teacher && styles.filterOptionActive]}
                  onPress={() => setFilterTeacher(teacher)}
                >
                  <Text style={[styles.filterOptionText, filterTeacher === teacher && styles.filterOptionTextActive]}>{teacher}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

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
  classListContainer: {
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
  classCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
    marginBottom: 5,
  },
  classTeacher: {
    fontSize: 14,
    color: '#4a4a4a',
    marginBottom: 10,
  },
  classStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 15,
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

export default ClassDetailsScreen;

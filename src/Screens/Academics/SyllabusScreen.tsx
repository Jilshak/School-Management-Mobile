import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, TextInput, Modal } from 'react-native';
import { Text, Icon, Card } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import BottomNavBar from '../../Components/BottomNavBar';

type SyllabusScreenProps = {
  navigation: StackNavigationProp<any, 'Syllabus'>;
};

type Subject = 'Mathematics' | 'Science' | 'English' | 'Social Studies' | 'Physical Education' | 'Computer Science';

type SubjectInfo = {
  subject: Subject;
  icon: string;
  color: string;
  unitsCount: number;
  progress: number;
};

const SyllabusScreen: React.FC<SyllabusScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'In Progress' | 'Completed'>('All');

  const subjects: SubjectInfo[] = [
    { subject: 'Mathematics', icon: 'calculator', color: '#FFFFFF', unitsCount: 5, progress: 75 },
    { subject: 'Science', icon: 'experiment', color: '#FFFFFF', unitsCount: 4, progress: 60 },
    { subject: 'English', icon: 'read', color: '#FFFFFF', unitsCount: 6, progress: 80 },
    { subject: 'Social Studies', icon: 'global', color: '#FFFFFF', unitsCount: 3, progress: 45 },
    { subject: 'Physical Education', icon: 'trophy', color: '#FFFFFF', unitsCount: 2, progress: 90 },
    { subject: 'Computer Science', icon: 'laptop', color: '#FFFFFF', unitsCount: 4, progress: 30 },
  ];

  const filteredSubjects = subjects.filter(subject =>
    subject.subject.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedFilter === 'All' || 
     (selectedFilter === 'In Progress' && subject.progress < 100) ||
     (selectedFilter === 'Completed' && subject.progress === 100))
  );

  const renderSubjectCard = ({ item }: { item: SubjectInfo }) => (
    <TouchableOpacity onPress={() => navigation.navigate('SubjectDetail', { subject: item.subject })}>
      <Card style={styles.subjectCard}>
        <View style={styles.subjectCardContent}>
          <View style={styles.subjectIconContainer}>
            <Icon name={item.icon as any} size={30} color="#001529" />
          </View>
          <View style={styles.subjectInfo}>
            <Text style={styles.subjectName}>{item.subject}</Text>
            <Text style={styles.unitCount}>{`${item.unitsCount} Units`}</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{`${item.progress}% Completed`}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter Subjects</Text>
          <View style={styles.filterOptions}>
            {['All', 'In Progress', 'Completed'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterOption,
                  selectedFilter === filter && styles.filterOptionActive
                ]}
                onPress={() => {
                  setSelectedFilter(filter as 'All' | 'In Progress' | 'Completed');
                  setShowFilterModal(false);
                }}
              >
                <Text style={[styles.filterOptionText, selectedFilter === filter && styles.filterOptionTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowFilterModal(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Syllabus</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#001529" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search subjects..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.filterButton}>
            <Icon name="filter" size={24} color="#001529" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredSubjects}
          keyExtractor={(item) => item.subject}
          renderItem={renderSubjectCard}
          contentContainerStyle={styles.scrollContent}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>No subjects found</Text>
          }
          showsVerticalScrollIndicator={false} // Add this line to remove the scrollbar
        />
      </View>

      {renderFilterModal()}
      <BottomNavBar />
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
  filterButton: {
    padding: 5,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  subjectCard: {
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  subjectCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  subjectIconContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#001529',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#001529',
    borderRadius: 2,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
    marginBottom: 4,
  },
  unitCount: {
    fontSize: 14,
    color: '#4a4a4a',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#4a4a4a',
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
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
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
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
  closeButton: {
    backgroundColor: '#001529',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SyllabusScreen;
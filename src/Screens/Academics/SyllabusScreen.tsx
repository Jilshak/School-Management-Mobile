import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, TextInput, Modal, TouchableWithoutFeedback } from 'react-native';
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
  const [isLoading, setIsLoading] = useState(true);
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);

  useEffect(() => {
    // Simulating API call
    setTimeout(() => {
      setSubjects([
        { subject: 'Mathematics', icon: 'calculator', color: '#FFFFFF', unitsCount: 5, progress: 75 },
        { subject: 'Science', icon: 'experiment', color: '#FFFFFF', unitsCount: 4, progress: 60 },
        { subject: 'English', icon: 'read', color: '#FFFFFF', unitsCount: 6, progress: 80 },
        { subject: 'Social Studies', icon: 'global', color: '#FFFFFF', unitsCount: 3, progress: 45 },
        { subject: 'Physical Education', icon: 'trophy', color: '#FFFFFF', unitsCount: 2, progress: 90 },
        { subject: 'Computer Science', icon: 'laptop', color: '#FFFFFF', unitsCount: 4, progress: 30 },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const closeFilterModal = () => {
    setShowFilterModal(false);
  };

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
      onRequestClose={closeFilterModal}
    >
      <TouchableWithoutFeedback onPress={closeFilterModal}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback>
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
                      closeFilterModal();
                    }}
                  >
                    <Text style={[styles.filterOptionText, selectedFilter === filter && styles.filterOptionTextActive]}>
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={closeFilterModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonSearchBar} />
      {[...Array(5)].map((_, index) => (
        <View key={index} style={styles.skeletonCard}>
          <View style={styles.skeletonCardContent}>
            <View style={styles.skeletonIcon} />
            <View style={styles.skeletonInfo}>
              <View style={styles.skeletonSubjectName} />
              <View style={styles.skeletonUnitCount} />
              <View style={styles.skeletonProgressBarContainer}>
                <View style={styles.skeletonProgressBar} />
              </View>
              <View style={styles.skeletonProgressText} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Icon name="book" size={80} color="#001529" />
      <Text style={styles.emptyStateTitle}>No Subjects Available</Text>
      <Text style={styles.emptyStateDescription}>There are no subjects to display at this time. Check back later for updates.</Text>
    </View>
  );

  if (isLoading) {
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
          {renderSkeletonLoader()}
        </View>
      </SafeAreaView>
    );
  }

  if (subjects.length === 0) {
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
          {renderEmptyState()}
        </View>
      </SafeAreaView>
    );
  }

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
          showsVerticalScrollIndicator={false}
        />
      </View>

      {renderFilterModal()}
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
  skeletonContainer: {
    padding: 20,
  },
  skeletonSearchBar: {
    height: 50,
    backgroundColor: '#E1E9EE',
    borderRadius: 10,
    marginBottom: 20,
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  skeletonCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  skeletonIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E1E9EE',
    marginRight: 15,
  },
  skeletonInfo: {
    flex: 1,
  },
  skeletonSubjectName: {
    height: 18,
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
    marginBottom: 8,
    width: '80%',
  },
  skeletonUnitCount: {
    height: 14,
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
    marginBottom: 8,
    width: '40%',
  },
  skeletonProgressBarContainer: {
    height: 4,
    backgroundColor: '#E1E9EE',
    borderRadius: 2,
    marginBottom: 6,
    width: '100%',
  },
  skeletonProgressBar: {
    height: '100%',
    backgroundColor: '#D0D0D0',
    borderRadius: 2,
    width: '60%',
  },
  skeletonProgressText: {
    height: 12,
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
    width: '30%',
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

export default SyllabusScreen;
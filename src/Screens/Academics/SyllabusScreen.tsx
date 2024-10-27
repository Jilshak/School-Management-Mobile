import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, TextInput, Modal, TouchableWithoutFeedback } from 'react-native';
import { Text, Icon, Card } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { fetchSyllabus } from '../../Services/Syllabus/Syllabus';
import { ISyllabus } from '../../Services/Syllabus/ISyllabus';

type SyllabusScreenProps = {
  navigation: StackNavigationProp<any, 'Syllabus'>;
};

type SubjectInfo = {
  subject: string;
  color: string;
  unitsCount: number;
  resourceCount: number;
  subjectId: string;
};

const SyllabusScreen: React.FC<SyllabusScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'All'>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [syllabusData, setSyllabusData] = useState<ISyllabus[]>([]);

  useEffect(() => {
    const fetchSyllabuses = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetchSyllabus();
        const data: ISyllabus[] = response;
        
        if (data.length > 0) {
          // Map the subjects to the required format
          const mappedSubjects: SubjectInfo[] = data[0].subjects.map(subject => {
            // Generate a consistent color based on subject name
            const getSubjectColor = (name: string): string => {
              // Using different shades of light gray/black
              const colors = [
                '#f0f2f5', // same as tag background
                '#e6e8eb',
                '#dcdfe3',
                '#d2d6db',
                '#c8ccd3',
                '#bec3cb',
                '#b4b9c2',
                '#aaafba',
                '#a0a5b1',
                '#969ba8'
              ];
              
              const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
              return colors[sum % colors.length];
            };

            return {
              subject: subject.subjectName,
              color: getSubjectColor(subject.subjectName),
              unitsCount: subject.chapters.length,
              resourceCount: subject.chapters.reduce((total, chapter) => 
                total + (chapter.filePath ? 1 : 0), 0),
              subjectId: subject.subjectId
            };
          });

          setSubjects(mappedSubjects);
          setSyllabusData(data);
        }
      } catch (error) {
        console.error('Error fetching syllabus:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSyllabuses();
  }, []);

  const closeFilterModal = () => {
    setShowFilterModal(false);
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSubjectCard = ({ item }: { item: SubjectInfo }) => {
    const subjectData = syllabusData[0].subjects.find(
      (subject) => subject.subjectId === item.subjectId
    );

    return (
      <TouchableOpacity 
        onPress={() => navigation.navigate('SubjectDetail', { 
          subject: item.subject,
          subjectId: item.subjectId,
          chapters: subjectData?.chapters || []
        })}
        activeOpacity={0.7}
      >
        <View style={styles.subjectCard}>
          <View style={styles.subjectCardContent}>
            <View style={[styles.subjectIconContainer, { backgroundColor: item.color }]}>
              <Text style={styles.subjectInitial}>
                {item.subject.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.subjectInfo}>
              <Text style={styles.subjectName}>{item.subject}</Text>
              <View style={styles.tagsContainer}>
                <View style={styles.tag}>
                  <Icon name="book" size={14} color="#001529" />
                  <Text style={styles.tagText}>{item.unitsCount} Chapters</Text>
                </View>
                <View style={styles.tag}>
                  <Icon name="file-text" size={14} color="#001529" />
                  <Text style={styles.tagText}>{item.resourceCount} Resources</Text>
                </View>
              </View>
            </View>
            <Icon name="right" size={20} color="#8c8c8c" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
                <TouchableOpacity
                  style={[styles.filterOption, styles.filterOptionActive]}
                  onPress={closeFilterModal}
                >
                  <Text style={[styles.filterOptionText, styles.filterOptionTextActive]}>
                    All Subjects
                  </Text>
                </TouchableOpacity>
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

  const renderSearchBar = () => (
    <View style={styles.searchWrapper}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#8C8C8C" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search subjects..."
          placeholderTextColor="#8C8C8C"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
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
        {renderSearchBar()}
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
    paddingHorizontal: 16,
  },
  searchWrapper: {
    paddingVertical: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#001529',
  },
  subjectCard: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden', // Add this to prevent shadow bleeding
  },
  subjectCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  subjectIconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginRight: 16,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#001529',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6, // Add space between icon and text
  },
  tagText: {
    fontSize: 12,
    color: '#001529',
    fontWeight: '500',
    marginLeft: 4, // Add some space after the icon
  },
  scrollContent: {
    paddingBottom: 24,
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
  subjectInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001529', // Changed to dark color to match tag text
  },
});

export default SyllabusScreen;

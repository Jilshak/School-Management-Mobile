import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, TextInput, Modal, TouchableWithoutFeedback } from 'react-native';
import { Text, Icon, Card } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

type SubjectDetailScreenProps = {
  navigation: StackNavigationProp<any, 'SubjectDetail'>;
  route: RouteProp<{ SubjectDetail: { subject: string } }, 'SubjectDetail'>;
};

type SyllabusItem = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  estimatedHours: number;
};

type Resource = {
  id: string;
  title: string;
  type: 'pdf' | 'ppt' | 'video';
  url: string;
  fileSize: string;
  uploadDate: string;
};

type Assignment = {
  id: string;
  title: string;
  dueDate: string;
  status: 'Pending' | 'Submitted' | 'Graded';
  grade?: string;
  totalPoints: number;
  submissionMethod: string;
};

const SubjectDetailScreen: React.FC<SubjectDetailScreenProps> = ({ navigation, route }) => {
  const { subject } = route.params;
  const [activeTab, setActiveTab] = useState<'syllabus' | 'resources' | 'assignments'>('syllabus');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    // Simulating API call
    setTimeout(() => {
      setSyllabus([
        { id: '1', title: 'Unit 1: Introduction', description: 'Overview of the subject', completed: true, estimatedHours: 10 },
        { id: '2', title: 'Unit 2: Core Concepts', description: 'Fundamental principles and theories', completed: true, estimatedHours: 15 },
        { id: '3', title: 'Unit 3: Advanced Topics', description: 'In-depth exploration of complex ideas', completed: false, estimatedHours: 20 },
        { id: '4', title: 'Unit 4: Practical Applications', description: 'Real-world use cases and examples', completed: false, estimatedHours: 25 },
        { id: '5', title: 'Unit 5: Review and Assessment', description: 'Recap and evaluation of learning', completed: false, estimatedHours: 12 },
      ]);
      setResources([
        { id: '1', title: 'Textbook PDF', type: 'pdf', url: 'https://example.com/textbook.pdf', fileSize: '15.2 MB', uploadDate: '2023-05-01' },
        { id: '2', title: 'Lecture Slides', type: 'ppt', url: 'https://example.com/slides.ppt', fileSize: '5.7 MB', uploadDate: '2023-05-15' },
        { id: '3', title: 'Video Tutorial', type: 'video', url: 'https://example.com/tutorial.mp4', fileSize: '102.8 MB', uploadDate: '2023-05-20' },
      ]);
      setAssignments([
        { id: '1', title: 'Assignment 1', dueDate: '2023-06-15', status: 'Submitted', grade: 'A', totalPoints: 100, submissionMethod: 'Online' },
        { id: '2', title: 'Assignment 2', dueDate: '2023-06-30', status: 'Pending', totalPoints: 50, submissionMethod: 'In-class' },
        { id: '3', title: 'Assignment 3', dueDate: '2023-07-15', status: 'Graded', grade: 'B+', totalPoints: 75, submissionMethod: 'Online' },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const closeFilterModal = () => {
    setShowFilterModal(false);
  };

  const renderSyllabusItem = ({ item }: { item: SyllabusItem }) => (
    <Card style={styles.syllabusCard}>
      <View style={styles.syllabusItemHeader}>
        <Text style={styles.syllabusItemTitle}>{item.title}</Text>
        <Icon name={item.completed ? 'check-circle' : 'clock-circle'} size={20} color={item.completed ? '#52c41a' : '#faad14'} />
      </View>
      <Text style={styles.syllabusItemDescription}>{item.description}</Text>
      <Text style={styles.syllabusItemHours}>Estimated study time: {item.estimatedHours} hours</Text>
    </Card>
  );

  const renderResourceItem = ({ item }: { item: Resource }) => (
    <TouchableOpacity style={styles.resourceItem} onPress={() => console.log(`Opening ${item.url}`)}>
      <Icon name={item.type === 'pdf' ? 'file-pdf' : item.type === 'ppt' ? 'file-ppt' : 'video-camera'} size={24} color="#1890ff" />
      <View style={styles.resourceInfo}>
        <Text style={styles.resourceTitle}>{item.title}</Text>
        <Text style={styles.resourceDetails}>{`${item.fileSize} • Uploaded: ${item.uploadDate}`}</Text>
      </View>
      <Icon name="download" size={24} color="#1890ff" />
    </TouchableOpacity>
  );

  const renderAssignmentItem = ({ item }: { item: Assignment }) => (
    <Card style={styles.assignmentCard}>
      <Text style={styles.assignmentTitle}>{item.title}</Text>
      <Text style={styles.assignmentDueDate}>Due: {item.dueDate}</Text>
      <Text style=
      {styles.assignmentDetails}>{`Total Points: ${item.totalPoints} • Submit via: ${item.submissionMethod}`}</Text>
      <View style={styles.assignmentFooter}>
        <Text style={[styles.assignmentStatus, { color: item.status === 'Submitted' ? '#52c41a' : item.status === 'Graded' ? '#1890ff' : '#faad14' }]}>{item.status}</Text>
        {item.grade && <Text style={styles.assignmentGrade}>Grade: {item.grade}</Text>}
      </View>
    </Card>
  );

  const filteredContent = () => {
    let content = [];
    switch (activeTab) {
      case 'syllabus':
        content = syllabus;
        if (selectedFilter === 'Completed') content = content.filter(item => item.completed);
        if (selectedFilter === 'Incomplete') content = content.filter(item => !item.completed);
        break;
      case 'resources':
        content = resources;
        if (selectedFilter !== 'All') content = content.filter(item => item.type === selectedFilter.toLowerCase());
        break;
      case 'assignments':
        content = assignments;
        if (selectedFilter !== 'All') content = content.filter(item => item.status === selectedFilter);
        break;
    }
    return content.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));
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
              <Text style={styles.modalTitle}>Filter {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</Text>
              <View style={styles.filterOptions}>
                {getFilterOptions().map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterOption,
                      selectedFilter === filter && styles.filterOptionActive
                    ]}
                    onPress={() => {
                      setSelectedFilter(filter);
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

  const getFilterOptions = () => {
    switch (activeTab) {
      case 'syllabus':
        return ['All', 'Completed', 'Incomplete'];
      case 'resources':
        return ['All', 'PDF', 'PPT', 'Video'];
      case 'assignments':
        return ['All', 'Pending', 'Submitted', 'Graded'];
      default:
        return ['All'];
    }
  };

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonSearchBar} />
      <View style={styles.skeletonTabContainer}>
        {[...Array(3)].map((_, index) => (
          <View key={index} style={styles.skeletonTab} />
        ))}
      </View>
      {[...Array(5)].map((_, index) => (
        <View key={index} style={styles.skeletonCard}>
          <View style={styles.skeletonCardHeader}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonIcon} />
          </View>
          <View style={styles.skeletonDescription} />
          <View style={styles.skeletonDetails} />
        </View>
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Icon name="file-unknown" size={80} color="#001529" />
      <Text style={styles.emptyStateTitle}>No Content Available</Text>
      <Text style={styles.emptyStateDescription}>There is no content to display for this subject at this time. Check back later for updates.</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{subject}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.contentContainer}>
          {renderSkeletonLoader()}
        </View>
      </SafeAreaView>
    );
  }

  const currentContent = activeTab === 'syllabus' ? syllabus : activeTab === 'resources' ? resources : assignments;

  if (currentContent.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{subject}</Text>
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
        <Text style={styles.headerTitle}>{subject}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#001529" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.filterButton}>
            <Icon name="filter" size={24} color="#001529" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          {['syllabus', 'resources', 'assignments'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filteredContent()}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            switch (activeTab) {
              case 'syllabus':
                return renderSyllabusItem({ item: item as SyllabusItem });
              case 'resources':
                return renderResourceItem({ item: item as Resource });
              case 'assignments':
                return renderAssignmentItem({ item: item as Assignment });
              default:
                return null;
            }
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
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
    marginRight: 10,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#001529',
  },
  tabText: {
    fontSize: 16,
    color: '#4a4a4a',
  },
  activeTabText: {
    color: '#001529',
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  syllabusCard: {
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
  },
  syllabusItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  syllabusItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001529',
  },
  syllabusItemDescription: {
    fontSize: 14,
    color: '#4a4a4a',
  },
  syllabusItemHours: {
    fontSize: 14,
    color: '#4a4a4a',
    marginTop: 5,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  resourceInfo: {
    flex: 1,
    marginLeft: 10,
  },
  resourceTitle: {
    fontSize: 16,
    color: '#001529',
  },
  resourceDetails: {
    fontSize: 12,
    color: '#4a4a4a',
  },
  assignmentCard: {
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#001529',
  },
  assignmentDueDate: {
    fontSize: 14,
    color: '#4a4a4a',
    marginBottom: 5,
  },
  assignmentDetails: {
    fontSize: 14,
    color: '#4a4a4a',
    marginBottom: 5,
  },
  assignmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  assignmentStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  assignmentGrade: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1890ff',
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
    height: 40,
    backgroundColor: '#E1E9EE',
    borderRadius: 10,
    marginBottom: 20,
  },
  skeletonTabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  skeletonTab: {
    width: '30%',
    height: 40,
    backgroundColor: '#E1E9EE',
    borderRadius: 10,
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  skeletonCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  skeletonTitle: {
    width: '70%',
    height: 20,
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
  },
  skeletonIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#E1E9EE',
    borderRadius: 10,
  },
  skeletonDescription: {
    height: 15,
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
    marginBottom: 10,
  },
  skeletonDetails: {
    height: 15,
    backgroundColor: '#E1E9EE',
    width: '50%',
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

export default SubjectDetailScreen;
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, FlatList, TextInput, Animated, Modal, ScrollView, Alert, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { Icon as AntIcon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type SubjectSelectionScreenProps = {
  navigation: StackNavigationProp<any, 'SubjectSelection'>;
};

type Subject = {
  name: string;
  questionCount: number;
  completed: number;
  available: boolean;
  genre: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
};

export const subjects: Subject[] = [
  { name: 'Mathematics', questionCount: 10, completed: 5, available: true, genre: 'Science', description: 'Master the art of numbers and equations.', difficulty: 'Medium' },
  { name: 'Physics', questionCount: 8, completed: 3, available: true, genre: 'Science', description: 'Explore the fundamental laws of the universe.', difficulty: 'Hard' },
  { name: 'Chemistry', questionCount: 12, completed: 7, available: true, genre: 'Science', description: 'Discover the composition and properties of matter.', difficulty: 'Medium' },
  { name: 'Biology', questionCount: 7, completed: 2, available: true, genre: 'Science', description: 'Study the science of life and living organisms.', difficulty: 'Medium' },
];

const SubjectSelectionScreen: React.FC<SubjectSelectionScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterAvailable, setFilterAvailable] = useState<boolean | null>(null);
  const [filterGenre, setFilterGenre] = useState<string | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [subjectsData, setSubjectsData] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubjects = useCallback(async () => {
    try {
      setIsLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Subjects fetched:', subjects);
      setSubjectsData(subjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('Component mounted');
    fetchSubjects();
  }, [fetchSubjects]);

  const filteredSubjects = useCallback(() => {
    return subjectsData.filter(subject =>
      (subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.genre.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filterAvailable === null || subject.available === filterAvailable) &&
      (filterGenre === null || subject.genre === filterGenre)
    );
  }, [subjectsData, searchQuery, filterAvailable, filterGenre]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSubjects().then(() => setRefreshing(false));
  }, [fetchSubjects]);

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject) 
        : [...prev, subject]
    );
  };

  const handleNextStep = () => {
    if (selectedSubjects.length === 0) {
      // Show an alert that at least one subject must be selected
      Alert.alert("Selection Required", "Please select at least one subject.");
      return;
    }
    navigation.navigate('ChapterSelection', { subjects: selectedSubjects });
  };

  const renderSubject = ({ item }: { item: Subject }) => {
    const isSelected = selectedSubjects.includes(item.name);
    return (
      <View style={[styles.subjectCard, isSelected && styles.selectedCard]}>
        <TouchableOpacity onPress={() => handleSubjectSelect(item.name)}>
          <View style={styles.subjectHeader}>
            <AntIcon name="book" size={24} color="#ffffff" style={styles.subjectIcon} />
            <Text style={styles.subjectName}>{item.name}</Text>
            {isSelected && (
              <AntIcon name="check-circle" size={24} color="#001529" style={styles.checkIcon} />
            )}
          </View>
          <Text style={styles.subjectDescription}>{item.description}</Text>
          <View style={styles.tagsContainer}>
            <Text style={[styles.tag, styles[item.difficulty as keyof typeof styles]]}>{item.difficulty}</Text>
          </View>
          <Text style={styles.questionCount}>{item.questionCount} Questions</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${(item.completed / item.questionCount) * 100}%` }]} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonSearchBar} />
      {[...Array(4)].map((_, index) => (
        <View key={index} style={styles.skeletonSubjectCard}>
          <View style={styles.skeletonSubjectHeader}>
            <View style={styles.skeletonIcon} />
            <View style={styles.skeletonTitle} />
          </View>
          <View style={styles.skeletonDescription} />
          <View style={styles.skeletonTags} />
          <View style={styles.skeletonProgressBar} />
        </View>
      ))}
    </View>
  );

  console.log('Rendering component, subjectsData:', subjectsData);
  console.log('Filtered subjects:', filteredSubjects());

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const genres = Array.from(new Set(subjectsData.map(subject => subject.genre)));

  const resetFilters = () => {
    setFilterAvailable(null);
    setFilterGenre(null);
  };

  const closeFilterModal = () => {
    setFilterModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntIcon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Subject</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <AntIcon name="reload" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        renderSkeletonLoader()
      ) : (
        <>
          <View style={styles.searchContainer}>
            <AntIcon name="search" size={20} color="#001529" style={styles.searchIcon} />
            <TextInput
              style={styles.searchBar}
              placeholder="Search subjects..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#4a4a4a"
            />
            <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={styles.filterButton}>
              <AntIcon name="filter" size={24} color="#001529" />
            </TouchableOpacity>
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
                <AntIcon name="close" size={20} color="#001529" />
              </TouchableOpacity>
            )}
          </View>

          {filteredSubjects().length > 0 ? (
            <FlatList
              data={filteredSubjects()}
              renderItem={renderSubject}
              keyExtractor={item => item.name}
              contentContainerStyle={styles.subjectList}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          ) : (
            <Text style={styles.noResultsText}>No subjects match your search criteria.</Text>
          )}

          <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={closeFilterModal}
      >
        <TouchableWithoutFeedback onPress={closeFilterModal}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Filter Subjects</Text>
                
                <Text style={styles.filterLabel}>Availability:</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity
                    style={[styles.filterOption, filterAvailable === null && styles.filterOptionActive]}
                    onPress={() => setFilterAvailable(null)}
                  >
                    <Text style={[styles.filterOptionText, filterAvailable === null && styles.filterOptionTextActive]}>All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterOption, filterAvailable === true && styles.filterOptionActive]}
                    onPress={() => setFilterAvailable(true)}
                  >
                    <Text style={[styles.filterOptionText, filterAvailable === true && styles.filterOptionTextActive]}>Available</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterOption, filterAvailable === false && styles.filterOptionActive]}
                    onPress={() => setFilterAvailable(false)}
                  >
                    <Text style={[styles.filterOptionText, filterAvailable === false && styles.filterOptionTextActive]}>Not Available</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.filterLabel}>Genre:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroll}>
                  <TouchableOpacity
                    style={[styles.filterOption, filterGenre === null && styles.filterOptionActive]}
                    onPress={() => setFilterGenre(null)}
                  >
                    <Text style={[styles.filterOptionText, filterGenre === null && styles.filterOptionTextActive]}>All</Text>
                  </TouchableOpacity>
                  {genres.map(genre => (
                    <TouchableOpacity
                      key={genre}
                      style={[styles.filterOption, filterGenre === genre && styles.filterOptionActive]}
                      onPress={() => setFilterGenre(genre)}
                    >
                      <Text style={[styles.filterOptionText, filterGenre === genre && styles.filterOptionTextActive]}>{genre}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.modalButton} onPress={resetFilters}>
                    <Text style={styles.modalButtonText}>Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.applyButton]} onPress={closeFilterModal}>
                    <Text style={[styles.modalButtonText, styles.applyButtonText]}>Apply</Text>
                  </TouchableOpacity>
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
    marginTop: 20,
    marginHorizontal: 20,
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
    margin: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: '#001529',
  },
  filterButton: {
    padding: 5,
  },
  clearButton: {
    marginLeft: 10,
  },
  subjectList: {
    padding: 20,
  },
  subjectCard: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    backgroundColor: '#f0faff', // Very light blue background for selected cards
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  subjectIcon: {
    marginRight: 10,
    backgroundColor: '#001529',
    padding: 5,
    borderRadius: 5,
  },
  subjectName: {
    color: '#001529',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  subjectDescription: {
    color: '#4a4a4a',
    fontSize: 14,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#001529',
    color: '#001529',
    fontSize: 12,
    fontWeight: 'bold',
  },
  easy: {
    borderColor: '#001529',
    color: '#001529',
  },
  medium: {
    borderColor: '#001529',
    color: '#001529',
  },
  hard: {
    borderColor: '#001529',
    color: '#001529',
  },
  questionCount: {
    color: '#4a4a4a',
    fontSize: 14,
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#001529',
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
  genreScroll: {
    flexDirection: 'row',
    marginBottom: 15,
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
  checkIcon: {
    marginLeft: 10,
  },
  nextButton: {
    backgroundColor: '#001529',
    padding: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 18,
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
  skeletonSubjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  skeletonSubjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  skeletonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E1E9EE',
    marginRight: 10,
  },
  skeletonTitle: {
    height: 20,
    width: '60%',
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
  },
  skeletonDescription: {
    height: 15,
    width: '100%',
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
    marginBottom: 10,
  },
  skeletonTags: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  skeletonProgressBar: {
    height: 10,
    width: '100%',
    backgroundColor: '#E1E9EE',
    borderRadius: 5,
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
  noResultsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#4a4a4a',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#001529',
  },
});

export default SubjectSelectionScreen;
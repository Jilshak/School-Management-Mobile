import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, FlatList, TextInput, Animated, Modal, ScrollView, Alert } from 'react-native';
import { Icon as AntIcon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type SubjectSelectionScreenProps = {
  navigation: StackNavigationProp<any, 'SubjectSelection'>;
};

type Subject = {
  name: string;
  questionCount: number;
  completed: number; // New field to show progress
  available: boolean;
  genre: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
};

const subjects: Subject[] = [
  { name: 'Mathematics', questionCount: 10, completed: 5, available: true, genre: 'Science', description: 'Master the art of numbers and equations.', difficulty: 'Medium' },
  { name: 'Science', questionCount: 8, completed: 3, available: false, genre: 'Science', description: 'Dive into the world of scientific discoveries.', difficulty: 'Hard' },
  { name: 'English', questionCount: 12, completed: 7, available: true, genre: 'Language', description: 'Enhance your English language skills.', difficulty: 'Easy' },
  { name: 'Social Studies', questionCount: 7, completed: 2, available: false, genre: 'History', description: 'Explore the history of human society.', difficulty: 'Medium' },
  { name: 'Physical Education', questionCount: 5, completed: 1, available: true, genre: 'Sports', description: 'Stay active and healthy with physical exercises.', difficulty: 'Easy' },
];

const SubjectSelectionScreen: React.FC<SubjectSelectionScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterAvailable, setFilterAvailable] = useState<boolean | null>(null);
  const [filterGenre, setFilterGenre] = useState<string | null>(null);
  const animatedValue = new Animated.Value(0);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

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

  const renderSubject = ({ item }: { item: Subject }) => (
    <Animated.View style={[styles.subjectCard, { opacity: animatedValue }]}>
      <TouchableOpacity onPress={() => handleSubjectSelect(item.name)}>
        <View style={styles.subjectHeader}>
          <AntIcon name="book" size={24} color="#ffffff" style={styles.subjectIcon} />
          <Text style={styles.subjectName}>{item.name}</Text>
          {selectedSubjects.includes(item.name) && (
            <AntIcon name="check" size={24} color="#52c41a" style={styles.checkIcon} />
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
    </Animated.View>
  );

  const filteredSubjects = subjects.filter(subject =>
    (subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.genre.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterAvailable === null || subject.available === filterAvailable) &&
    (filterGenre === null || subject.genre === filterGenre)
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const genres = Array.from(new Set(subjects.map(subject => subject.genre)));

  const resetFilters = () => {
    setFilterAvailable(null);
    setFilterGenre(null);
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

      <FlatList
        data={filteredSubjects}
        renderItem={renderSubject}
        keyExtractor={item => item.name}
        contentContainerStyle={styles.subjectList}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
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
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
});

export default SubjectSelectionScreen;
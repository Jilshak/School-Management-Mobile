import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, FlatList, Switch, Alert, Modal, ScrollView, TextInput } from 'react-native';
import { Icon as AntIcon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

type ChapterSelectionScreenProps = {
  navigation: StackNavigationProp<any, 'ChapterSelection'>;
  route: RouteProp<{ params: { subjects: string[] } }, 'params'>;
};

type Chapter = {
  id: string;
  name: string;
  topics: string[];
  questionCount: number;
};

type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  chapterId: string;
};

const chapters: { [key: string]: Chapter[] } = {
  Mathematics: [
    { id: 'math1', name: 'Algebra', topics: ['Linear equations', 'Quadratic equations'], questionCount: 20 },
    { id: 'math2', name: 'Geometry', topics: ['Triangles', 'Circles'], questionCount: 15 },
    { id: 'math3', name: 'Calculus', topics: ['Limits', 'Derivatives'], questionCount: 25 },
  ],
  Science: [
    { id: 'sci1', name: 'Physics', topics: ['Mechanics', 'Thermodynamics'], questionCount: 18 },
    { id: 'sci2', name: 'Chemistry', topics: ['Atomic structure', 'Chemical bonding'], questionCount: 22 },
    { id: 'sci3', name: 'Biology', topics: ['Cell biology', 'Genetics'], questionCount: 20 },
  ],
};

const questions: { [key: string]: Question[] } = {
  Mathematics: [
    { id: 1, question: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correctAnswer: '4', chapterId: 'math1' },
    { id: 2, question: 'What is 3 * 3?', options: ['6', '7', '8', '9'], correctAnswer: '9', chapterId: 'math1' },
    // ... (add more questions for each chapter)
  ],
  Science: [
    { id: 1, question: 'What is the chemical symbol for water?', options: ['H2O', 'O2', 'CO2', 'NaCl'], correctAnswer: 'H2O', chapterId: 'sci1' },
    { id: 2, question: 'What planet is known as the Red Planet?', options: ['Earth', 'Mars', 'Jupiter', 'Saturn'], correctAnswer: 'Mars', chapterId: 'sci1' },
    // ... (add more questions for each chapter)
  ],
  // ... (add questions for other subjects)
};

type RootStackParamList = {
  MCQ: { subjects: string[]; selectedChapters: string[]; blacklistedQuestions: number[]; };
  QuestionList: { chapter: Chapter; subject: string };
};

type NavigationProps = StackNavigationProp<RootStackParamList>;

const ChapterSelectionScreen: React.FC<ChapterSelectionScreenProps> = ({ route }) => {
  const { subjects } = route.params;
  const navigation = useNavigation<NavigationProps>();
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [availableChapters, setAvailableChapters] = useState<Chapter[]>([]);
  const [blacklistedQuestions, setBlacklistedQuestions] = useState<number[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterSelected, setFilterSelected] = useState<boolean | null>(null);

  useEffect(() => {
    if (subjects && subjects.length > 0) {
      const chaptersForSelectedSubjects = subjects.flatMap(subject => chapters[subject] || []);
      setAvailableChapters(chaptersForSelectedSubjects);
      setFilteredChapters(chaptersForSelectedSubjects);
    }
  }, [subjects]);

  const toggleChapter = (chapterId: string) => {
    setSelectedChapters(prev =>
      prev.includes(chapterId)
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const handleStartExam = () => {
    if (selectedChapters.length === 0) {
      Alert.alert("Selection Required", "Please select at least one chapter.");
      return;
    }
    navigation.navigate('MCQ', { subjects, selectedChapters, blacklistedQuestions });
  };

  const openQuestionModal = (chapter: Chapter) => {
    setCurrentChapter(chapter);
    setModalVisible(true);
  };

  const toggleBlacklistedQuestion = (questionId: number) => {
    setBlacklistedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleViewQuestions = (chapter: Chapter) => {
    navigation.navigate('QuestionList', { chapter, subject: subjects[0] });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, filterSelected);
  };

  const applyFilters = (query: string, selected: boolean | null) => {
    const lowercaseQuery = query.toLowerCase();
    const filtered = availableChapters.filter(chapter => 
      chapter.name.toLowerCase().includes(lowercaseQuery) &&
      (selected === null || selectedChapters.includes(chapter.id) === selected)
    );
    setFilteredChapters(filtered);
  };

  const resetFilters = () => {
    setFilterSelected(null);
    setSearchQuery('');
    setFilteredChapters(availableChapters);
  };

  const renderChapter = ({ item }: { item: Chapter }) => (
    <View style={styles.chapterCard}>
      <View style={styles.chapterHeader}>
        <View style={styles.chapterInfo}>
          <Text style={styles.chapterName}>{item.name}</Text>
        </View>
        <Switch
          value={selectedChapters.includes(item.id)}
          onValueChange={() => toggleChapter(item.id)}
          trackColor={{ false: "#767577", true: "#001529" }}
          thumbColor={selectedChapters.includes(item.id) ? "#ffffff" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
        />
      </View>
      <View style={styles.questionCountContainer}>
        <View style={styles.questionCountChip}>
          <Text style={styles.questionCountText}>{item.questionCount} Questions</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.viewQuestionsButton} 
        onPress={() => handleViewQuestions(item)}
      >
        <Text style={styles.viewQuestionsButtonText}>View Questions</Text>
        <AntIcon name="right" size={16} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );

  const renderQuestionModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{currentChapter?.name} Questions</Text>
          <ScrollView style={styles.questionList}>
            {questions[subjects[0]]
              .filter(q => q.chapterId === currentChapter?.id)
              .map(question => (
                <View key={question.id} style={styles.questionItem}>
                  <Text style={styles.questionText}>{question.question}</Text>
                  <TouchableOpacity
                    style={[
                      styles.blacklistButton,
                      blacklistedQuestions.includes(question.id) && styles.blacklistedButton
                    ]}
                    onPress={() => toggleBlacklistedQuestion(question.id)}
                  >
                    <Text style={styles.blacklistButtonText}>
                      {blacklistedQuestions.includes(question.id) ? 'Unblacklist' : 'Blacklist'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
          </ScrollView>
          <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeModalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntIcon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Chapters</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <AntIcon name="search" size={20} color="#001529" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search chapters..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#4a4a4a"
        />
        <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={styles.filterButton}>
          <AntIcon name="filter" size={24} color="#001529" />
        </TouchableOpacity>
      </View>

      {filteredChapters.length > 0 ? (
        <FlatList
          data={filteredChapters}
          renderItem={renderChapter}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.chapterList}
        />
      ) : (
        <Text style={styles.noChaptersText}>No chapters found.</Text>
      )}

      <TouchableOpacity style={styles.startButton} onPress={handleStartExam}>
        <Text style={styles.startButtonText}>Start Exam</Text>
      </TouchableOpacity>

      {renderQuestionModal()}

      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Chapters</Text>
            
            <Text style={styles.filterLabel}>Status:</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[styles.filterOption, filterSelected === null && styles.filterOptionActive]}
                onPress={() => {
                  setFilterSelected(null);
                  applyFilters(searchQuery, null);
                }}
              >
                <Text style={[styles.filterOptionText, filterSelected === null && styles.filterOptionTextActive]}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, filterSelected === true && styles.filterOptionActive]}
                onPress={() => {
                  setFilterSelected(true);
                  applyFilters(searchQuery, true);
                }}
              >
                <Text style={[styles.filterOptionText, filterSelected === true && styles.filterOptionTextActive]}>Selected</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, filterSelected === false && styles.filterOptionActive]}
                onPress={() => {
                  setFilterSelected(false);
                  applyFilters(searchQuery, false);
                }}
              >
                <Text style={[styles.filterOptionText, filterSelected === false && styles.filterOptionTextActive]}>Not Selected</Text>
              </TouchableOpacity>
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
    marginTop: 20,
    marginHorizontal: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chapterList: {
    padding: 20,
  },
  chapterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chapterInfo: {
    flex: 1,
  },
  chapterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
    marginBottom: 2,
  },
  questionCountContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  questionCountChip: {
    backgroundColor: '#f0f2f5',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  questionCountText: {
    fontSize: 14,
    color: '#001529',
    fontWeight: 'bold',
  },
  viewQuestionsButton: {
    backgroundColor: '#001529',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  viewQuestionsButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 5,
  },
  startButton: {
    backgroundColor: '#001529',
    padding: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noChaptersText: {
    fontSize: 16,
    color: '#4a4a4a',
    textAlign: 'center',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  questionList: {
    maxHeight: '80%',
  },
  questionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
  },
  blacklistButton: {
    backgroundColor: '#ff4d4f',
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  blacklistedButton: {
    backgroundColor: '#52c41a',
  },
  blacklistButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeModalButton: {
    backgroundColor: '#001529',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: '#ffffff',
    fontSize: 16,
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
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#001529',
  },
  filterButton: {
    padding: 5,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  filterOption: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  filterOptionActive: {
    backgroundColor: '#001529',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#001529',
  },
  filterOptionTextActive: {
    color: '#ffffff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#001529',
  },
  applyButton: {
    backgroundColor: '#001529',
  },
  applyButtonText: {
    color: '#ffffff',
  },
});

export default ChapterSelectionScreen;
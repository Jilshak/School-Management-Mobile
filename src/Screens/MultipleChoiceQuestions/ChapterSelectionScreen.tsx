import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, FlatList, Switch, Alert, Modal, ScrollView, TextInput, TextInput as RNTextInput } from 'react-native';
import { Icon as AntIcon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { questions, Question } from './questions';

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

const chapters: { [key: string]: Chapter[] } = {
  Physics: [
    { id: 'phy1', name: 'Physical World', topics: [], questionCount: 10 },
    { id: 'phy2', name: 'Units and Measurements', topics: [], questionCount: 15 },
    { id: 'phy3', name: 'Motion in a Straight Line', topics: [], questionCount: 20 },
    { id: 'phy4', name: 'Motion in a Plane', topics: [], questionCount: 18 },
    { id: 'phy5', name: 'Laws of Motion', topics: [], questionCount: 25 },
    { id: 'phy6', name: 'Work, Energy, and Power', topics: [], questionCount: 22 },
    { id: 'phy7', name: 'System of Particles and Rotational Motion', topics: [], questionCount: 20 },
    { id: 'phy8', name: 'Gravitation', topics: [], questionCount: 18 },
    { id: 'phy9', name: 'Mechanical Properties of Solids', topics: [], questionCount: 15 },
    { id: 'phy10', name: 'Mechanical Properties of Fluids', topics: [], questionCount: 17 },
    { id: 'phy11', name: 'Thermal Properties of Matter', topics: [], questionCount: 16 },
    { id: 'phy12', name: 'Thermodynamics', topics: [], questionCount: 20 },
    { id: 'phy13', name: 'Kinetic Theory', topics: [], questionCount: 15 },
    { id: 'phy14', name: 'Oscillations', topics: [], questionCount: 18 },
    { id: 'phy15', name: 'Waves', topics: [], questionCount: 20 },
  ],
  Biology: [
    { id: 'bio1', name: 'The Living World', topics: [], questionCount: 12 },
    { id: 'bio2', name: 'Biological Classification', topics: [], questionCount: 15 },
    { id: 'bio3', name: 'Plant Kingdom', topics: [], questionCount: 18 },
    { id: 'bio4', name: 'Animal Kingdom', topics: [], questionCount: 20 },
    { id: 'bio5', name: 'Morphology of Flowering Plants', topics: [], questionCount: 16 },
    { id: 'bio6', name: 'Anatomy of Flowering Plants', topics: [], questionCount: 17 },
    { id: 'bio7', name: 'Structural Organisation in Animals', topics: [], questionCount: 18 },
    { id: 'bio8', name: 'Cell: The Unit of Life', topics: [], questionCount: 22 },
    { id: 'bio9', name: 'Biomolecules', topics: [], questionCount: 20 },
    { id: 'bio10', name: 'Cell Cycle and Cell Division', topics: [], questionCount: 18 },
    { id: 'bio11', name: 'Transport in Plants', topics: [], questionCount: 15 },
    { id: 'bio12', name: 'Mineral Nutrition', topics: [], questionCount: 14 },
    { id: 'bio13', name: 'Photosynthesis in Higher Plants', topics: [], questionCount: 20 },
    { id: 'bio14', name: 'Respiration in Plants', topics: [], questionCount: 18 },
    { id: 'bio15', name: 'Plant Growth and Development', topics: [], questionCount: 16 },
    { id: 'bio16', name: 'Digestion and Absorption', topics: [], questionCount: 18 },
    { id: 'bio17', name: 'Breathing and Exchange of Gases', topics: [], questionCount: 17 },
    { id: 'bio18', name: 'Body Fluids and Circulation', topics: [], questionCount: 19 },
    { id: 'bio19', name: 'Excretory Products and Their Elimination', topics: [], questionCount: 16 },
    { id: 'bio20', name: 'Locomotion and Movement', topics: [], questionCount: 15 },
    { id: 'bio21', name: 'Neural Control and Coordination', topics: [], questionCount: 20 },
    { id: 'bio22', name: 'Chemical Coordination and Integration', topics: [], questionCount: 18 },
    { id: 'bio23', name: 'Reproduction in Organisms', topics: [], questionCount: 16 },
    { id: 'bio24', name: 'Sexual Reproduction in Flowering Plants', topics: [], questionCount: 18 },
    { id: 'bio25', name: 'Human Reproduction', topics: [], questionCount: 20 },
    { id: 'bio26', name: 'Reproductive Health', topics: [], questionCount: 15 },
    { id: 'bio27', name: 'Principles of Inheritance and Variation', topics: [], questionCount: 22 },
    { id: 'bio28', name: 'Molecular Basis of Inheritance', topics: [], questionCount: 25 },
    { id: 'bio29', name: 'Evolution', topics: [], questionCount: 18 },
    { id: 'bio30', name: 'Human Health and Disease', topics: [], questionCount: 20 },
    { id: 'bio31', name: 'Strategies for Enhancement in Food Production', topics: [], questionCount: 15 },
    { id: 'bio32', name: 'Microbes in Human Welfare', topics: [], questionCount: 16 },
    { id: 'bio33', name: 'Biotechnology: Principles and Processes', topics: [], questionCount: 18 },
    { id: 'bio34', name: 'Biotechnology and Its Applications', topics: [], questionCount: 17 },
    { id: 'bio35', name: 'Organisms and Populations', topics: [], questionCount: 19 },
    { id: 'bio36', name: 'Ecosystem', topics: [], questionCount: 20 },
    { id: 'bio37', name: 'Biodiversity and Conservation', topics: [], questionCount: 18 },
    { id: 'bio38', name: 'Environmental Issues', topics: [], questionCount: 16 },
  ],
  Chemistry: [
    { id: 'chem1', name: 'Some Basic Concepts of Chemistry', topics: [], questionCount: 15 },
    { id: 'chem2', name: 'Structure of Atom', topics: [], questionCount: 20 },
    { id: 'chem3', name: 'Classification of Elements and Periodicity in Properties', topics: [], questionCount: 18 },
    { id: 'chem4', name: 'Chemical Bonding and Molecular Structure', topics: [], questionCount: 22 },
    { id: 'chem5', name: 'States of Matter', topics: [], questionCount: 16 },
    { id: 'chem6', name: 'Thermodynamics', topics: [], questionCount: 20 },
    { id: 'chem7', name: 'Equilibrium', topics: [], questionCount: 25 },
    { id: 'chem8', name: 'Redox Reactions', topics: [], questionCount: 18 },
    { id: 'chem9', name: 'Hydrogen', topics: [], questionCount: 15 },
    { id: 'chem10', name: 's-Block Elements', topics: [], questionCount: 17 },
    { id: 'chem11', name: 'p-Block Elements', topics: [], questionCount: 20 },
    { id: 'chem12', name: 'Organic Chemistry: Some Basic Principles and Techniques', topics: [], questionCount: 22 },
    { id: 'chem13', name: 'Hydrocarbons', topics: [], questionCount: 20 },
    { id: 'chem14', name: 'Environmental Chemistry', topics: [], questionCount: 15 },
    { id: 'chem15', name: 'Solid State', topics: [], questionCount: 18 },
    { id: 'chem16', name: 'Solutions', topics: [], questionCount: 20 },
    { id: 'chem17', name: 'Electrochemistry', topics: [], questionCount: 22 },
    { id: 'chem18', name: 'Chemical Kinetics', topics: [], questionCount: 20 },
    { id: 'chem19', name: 'Surface Chemistry', topics: [], questionCount: 16 },
    { id: 'chem20', name: 'd and f Block Elements', topics: [], questionCount: 18 },
    { id: 'chem21', name: 'Coordination Compounds', topics: [], questionCount: 20 },
    { id: 'chem22', name: 'Haloalkanes and Haloarenes', topics: [], questionCount: 18 },
    { id: 'chem23', name: 'Alcohols, Phenols and Ethers', topics: [], questionCount: 20 },
    { id: 'chem24', name: 'Aldehydes, Ketones and Carboxylic Acids', topics: [], questionCount: 22 },
    { id: 'chem25', name: 'Amines', topics: [], questionCount: 18 },
    { id: 'chem26', name: 'Biomolecules', topics: [], questionCount: 20 },
    { id: 'chem27', name: 'Polymers', topics: [], questionCount: 15 },
    { id: 'chem28', name: 'Chemistry in Everyday Life', topics: [], questionCount: 16 },
  ],
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
  const [randomSelectionModalVisible, setRandomSelectionModalVisible] = useState(false);
  const [randomSelectionCount, setRandomSelectionCount] = useState('');

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

  const toggleAllChapters = () => {
    if (selectedChapters.length === availableChapters.length) {
      // If all chapters are selected, deselect all
      setSelectedChapters([]);
    } else {
      // Otherwise, select all chapters
      setSelectedChapters(availableChapters.map(chapter => chapter.id));
    }
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
    const subject = subjects[0]; // Assuming we're using the first selected subject
    if (subject && questions[subject]) {
      const chapterQuestions = questions[subject].filter(q => q.chapterId === chapter.id);
      if (chapterQuestions.length > 0) {
        navigation.navigate('QuestionList', { chapter, subject });
      } else {
        Alert.alert("No Questions", "There are no questions available for this chapter yet.");
      }
    } else {
      Alert.alert("No Questions", "There are no questions available for this subject yet.");
    }
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

  const handleRandomSelection = () => {
    const count = parseInt(randomSelectionCount, 10);
    if (isNaN(count) || count <= 0 || count > availableChapters.length) {
      Alert.alert('Invalid Input', `Please enter a number between 1 and ${availableChapters.length}.`);
      return;
    }

    const shuffled = [...availableChapters].sort(() => 0.5 - Math.random());
    const randomlySelected = shuffled.slice(0, count).map(chapter => chapter.id);
    setSelectedChapters(randomlySelected);
    setRandomSelectionModalVisible(false);
    setRandomSelectionCount('');
  };

  const renderChapter = ({ item }: { item: Chapter }) => {
    const isSelected = selectedChapters.includes(item.id);
    return (
      <TouchableOpacity 
        style={[styles.chapterCard, isSelected && styles.selectedCard]}
        onPress={() => toggleChapter(item.id)}
      >
        <View style={styles.chapterHeader}>
          <View style={styles.chapterInfo}>
            <Text style={styles.chapterName}>{item.name}</Text>
          </View>
          {isSelected && (
            <AntIcon name="check-circle" size={24} color="#001529" style={styles.checkIcon} />
          )}
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
      </TouchableOpacity>
    );
  };

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
            {subjects[0] && questions[subjects[0]] ? (
              questions[subjects[0]]
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
                ))
            ) : (
              <Text style={styles.noQuestionsText}>No questions available for this chapter.</Text>
            )}
          </ScrollView>
          <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeModalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderRandomSelectionModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={randomSelectionModalVisible}
      onRequestClose={() => setRandomSelectionModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Random Chapter Selection</Text>
          <Text style={styles.modalText}>Enter the number of chapters to randomly select:</Text>
          <RNTextInput
            style={styles.input}
            keyboardType="numeric"
            value={randomSelectionCount}
            onChangeText={setRandomSelectionCount}
            placeholder={`1 - ${availableChapters.length}`}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]} 
              onPress={() => setRandomSelectionModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.applyButton]} 
              onPress={handleRandomSelection}
            >
              <Text style={[styles.modalButtonText, styles.applyButtonText]}>Select</Text>
            </TouchableOpacity>
          </View>
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

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity onPress={toggleAllChapters} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>
            {selectedChapters.length === availableChapters.length ? 'Deselect All' : 'Select All'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setRandomSelectionModalVisible(true)} 
          style={styles.actionButton}
        >
          <Text style={styles.actionButtonText}>Random Selection</Text>
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
      {renderRandomSelectionModal()}

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
  checkIcon: {
    marginLeft: 10,
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
  noQuestionsText: {
    fontSize: 16,
    color: '#4a4a4a',
    textAlign: 'center',
    marginTop: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: '#001529',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#001529',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  selectedCard: {
    backgroundColor: '#f0faff', // Very light blue background for selected cards
  },
});


export default ChapterSelectionScreen;
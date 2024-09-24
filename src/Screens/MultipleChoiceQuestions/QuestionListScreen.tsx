import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, FlatList, TextInput, Modal, ScrollView } from 'react-native';
import { Icon as AntIcon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { questions } from './questions';

type QuestionListScreenProps = {
  navigation: StackNavigationProp<any, 'QuestionList'>;
  route: RouteProp<{ params: { chapter: Chapter; subject: string } }, 'params'>;
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

const QuestionListScreen: React.FC<QuestionListScreenProps> = ({ navigation, route }) => {
  const { chapter, subject } = route.params;
  const [excludedQuestions, setExcludedQuestions] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterExcluded, setFilterExcluded] = useState<boolean | null>(null);

  useEffect(() => {
    const chapterQuestions = questions[subject].filter(q => q.chapterId === chapter.id);
    setFilteredQuestions(chapterQuestions);
  }, [subject, chapter]);

  const toggleExcludedQuestion = (questionId: number) => {
    setExcludedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, filterExcluded);
  };

  const applyFilters = (query: string, excluded: boolean | null) => {
    const lowercaseQuery = query.toLowerCase();
    const filtered = questions[subject].filter(q => 
      q.chapterId === chapter.id &&
      q.question.toLowerCase().includes(lowercaseQuery) &&
      (excluded === null || excludedQuestions.includes(q.id) === excluded)
    );
    setFilteredQuestions(filtered);
  };

  const renderQuestion = ({ item, index }: { item: Question; index: number }) => (
    <TouchableOpacity 
      style={styles.questionItem}
      onPress={() => toggleExcludedQuestion(item.id)}
    >
      <View style={styles.questionNumberContainer}>
        <Text style={styles.questionNumber}>{index + 1}</Text>
      </View>
      <View style={styles.questionContent}>
        <Text style={styles.questionText}>{item.question}</Text>
        <AntIcon 
          name={excludedQuestions.includes(item.id) ? "close-circle" : "check-circle"} 
          size={24} 
          color={excludedQuestions.includes(item.id) ? "#ff4d4f" : "#52c41a"}
        />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <AntIcon name="inbox" size={50} color="#001529" />
      <Text style={styles.emptyText}>No questions available for this chapter</Text>
    </View>
  );

  const resetFilters = () => {
    setFilterExcluded(null);
    applyFilters(searchQuery, null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntIcon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{chapter.name} Questions</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <AntIcon name="search" size={20} color="#001529" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search questions..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#4a4a4a"
        />
        <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={styles.filterButton}>
          <AntIcon name="filter" size={24} color="#001529" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredQuestions}
        renderItem={renderQuestion}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.questionList}
        ListEmptyComponent={renderEmptyList}
      />

      <TouchableOpacity 
        style={styles.saveButton}
        onPress={() => {
          navigation.goBack();
        }}
      >
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Questions</Text>
            
            <Text style={styles.filterLabel}>Status:</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[styles.filterOption, filterExcluded === null && styles.filterOptionActive]}
                onPress={() => {
                  setFilterExcluded(null);
                  applyFilters(searchQuery, null);
                }}
              >
                <Text style={[styles.filterOptionText, filterExcluded === null && styles.filterOptionTextActive]}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, filterExcluded === false && styles.filterOptionActive]}
                onPress={() => {
                  setFilterExcluded(false);
                  applyFilters(searchQuery, false);
                }}
              >
                <Text style={[styles.filterOptionText, filterExcluded === false && styles.filterOptionTextActive]}>Included</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, filterExcluded === true && styles.filterOptionActive]}
                onPress={() => {
                  setFilterExcluded(true);
                  applyFilters(searchQuery, true);
                }}
              >
                <Text style={[styles.filterOptionText, filterExcluded === true && styles.filterOptionTextActive]}>Excluded</Text>
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
  questionList: {
    flexGrow: 1,
    padding: 20,
  },
  questionItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionNumberContainer: {
    backgroundColor: '#001529',
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },
  questionNumber: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  questionContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    color: '#001529',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#001529',
    padding: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#001529',
    marginTop: 10,
    textAlign: 'center',
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

export default QuestionListScreen;
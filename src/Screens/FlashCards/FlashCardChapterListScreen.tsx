import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, FlatList, TextInput, Alert, Modal, ScrollView } from 'react-native';
import { Icon as AntIcon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { chapters } from './flashCards';
import { TextInput as RNTextInput } from 'react-native';

type FlashCardChapterListScreenProps = {
  navigation: StackNavigationProp<any, 'FlashCardChapterList'>;
  route: RouteProp<{ params: { subjects: string[] } }, 'params'>;
};

const FlashCardChapterListScreen: React.FC<FlashCardChapterListScreenProps> = ({ navigation, route }) => {
  const { subjects } = route.params;
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterSubject, setFilterSubject] = useState<string | null>(null);
  const [filterQuestionCount, setFilterQuestionCount] = useState<number | null>(null);
  const [flashCardCountModalVisible, setFlashCardCountModalVisible] = useState(false);
  const [flashCardCount, setFlashCardCount] = useState('');

  const filteredChapters = subjects.flatMap(subject => 
    chapters[subject] ? chapters[subject].filter(chapter => 
      chapter.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterSubject === null || subject === filterSubject) &&
      (filterQuestionCount === null || chapter.questionCount >= filterQuestionCount)
    ) : []
  );

  const handleChapterSelect = (chapterId: string) => {
    setSelectedChapters(prev => 
      prev.includes(chapterId)
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const handleStartFlashCards = () => {
    if (selectedChapters.length === 0) {
      Alert.alert("Selection Required", "Please select at least one chapter.");
      return;
    }
    setFlashCardCountModalVisible(true);
  };

  const startFlashCardSession = () => {
    const count = parseInt(flashCardCount, 10);
    if (isNaN(count) || count <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number of flash cards.');
      return;
    }
    setFlashCardCountModalVisible(false);
    navigation.navigate('FlashCardsLogic', { selectedChapters, flashCardCount: count });
  };

  const getSubjectForChapter = (chapterId: string): string => {
    for (const subject in chapters) {
      if (chapters[subject].some(ch => ch.id === chapterId)) {
        return subject;
      }
    }
    return 'Unknown Subject';
  };

  const resetFilters = () => {
    setFilterSubject(null);
    setFilterQuestionCount(null);
  };

  const applyFilters = () => {
    setFilterModalVisible(false);
  };

  const toggleAllChapters = () => {
    if (selectedChapters.length === filteredChapters.length) {
      // If all chapters are selected, deselect all
      setSelectedChapters([]);
    } else {
      // Otherwise, select all chapters
      setSelectedChapters(filteredChapters.map(chapter => chapter.id));
    }
  };

  const [randomSelectionModalVisible, setRandomSelectionModalVisible] = useState(false);
  const [randomSelectionCount, setRandomSelectionCount] = useState('');

  const handleRandomSelection = () => {
    const count = parseInt(randomSelectionCount, 10);
    if (isNaN(count) || count <= 0 || count > filteredChapters.length) {
      Alert.alert('Invalid Input', `Please enter a number between 1 and ${filteredChapters.length}.`);
      return;
    }

    const shuffled = [...filteredChapters].sort(() => 0.5 - Math.random());
    const randomlySelected = shuffled.slice(0, count).map(chapter => chapter.id);
    setSelectedChapters(randomlySelected);
    setRandomSelectionModalVisible(false);
    setRandomSelectionCount('');
  };

  const renderChapter = ({ item }: { item: typeof chapters[keyof typeof chapters][number] }) => (
    <TouchableOpacity 
      style={styles.chapterCard}
      onPress={() => handleChapterSelect(item.id)}
    >
      <View style={styles.chapterHeader}>
        <Text style={styles.chapterName}>{item.name}</Text>
        {selectedChapters.includes(item.id) && (
          <AntIcon name="check-circle" size={24} color="#001529" style={styles.checkIcon} />
        )}
      </View>
      <Text style={styles.chapterSubject}>{getSubjectForChapter(item.id)}</Text>
      <Text style={styles.deckCount}>{item.questionCount} Questions</Text>
    </TouchableOpacity>
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
          style={styles.searchBar}
          placeholder="Search chapters..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#4a4a4a"
        />
        <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={styles.filterButton}>
          <AntIcon name="filter" size={24} color="#001529" />
        </TouchableOpacity>
      </View>

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity onPress={toggleAllChapters} style={styles.actionButton}>
          <AntIcon 
            name={selectedChapters.length === filteredChapters.length ? "close-circle" : "check-circle"} 
            size={20} 
            color="#ffffff" 
            style={styles.actionButtonIcon}
          />
          <Text style={styles.actionButtonText}>
            {selectedChapters.length === filteredChapters.length ? 'Deselect All' : 'Select All'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setRandomSelectionModalVisible(true)} 
          style={styles.actionButton}
        >
          <AntIcon name="reload" size={20} color="#ffffff" style={styles.actionButtonIcon} />
          <Text style={styles.actionButtonText}>Random</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredChapters}
        renderItem={renderChapter}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chapterList}
      />

      <TouchableOpacity style={styles.startButton} onPress={handleStartFlashCards}>
        <Text style={styles.startButtonText}>Start Flash Cards</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Chapters</Text>
            
            <Text style={styles.filterLabel}>Subject:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectScroll}>
              <TouchableOpacity
                style={[styles.filterOption, filterSubject === null && styles.filterOptionActive]}
                onPress={() => setFilterSubject(null)}
              >
                <Text style={[styles.filterOptionText, filterSubject === null && styles.filterOptionTextActive]}>All</Text>
              </TouchableOpacity>
              {subjects.map(subject => (
                <TouchableOpacity
                  key={subject}
                  style={[styles.filterOption, filterSubject === subject && styles.filterOptionActive]}
                  onPress={() => setFilterSubject(subject)}
                >
                  <Text style={[styles.filterOptionText, filterSubject === subject && styles.filterOptionTextActive]}>{subject}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>Minimum Questions:</Text>
            <View style={styles.filterOptions}>
              {[null, 5, 10, 15, 20].map(count => (
                <TouchableOpacity
                  key={count?.toString() || 'all'}
                  style={[styles.filterOption, filterQuestionCount === count && styles.filterOptionActive]}
                  onPress={() => setFilterQuestionCount(count)}
                >
                  <Text style={[styles.filterOptionText, filterQuestionCount === count && styles.filterOptionTextActive]}>
                    {count === null ? 'All' : `${count}+`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={resetFilters}>
                <Text style={styles.modalButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.applyButton]} onPress={applyFilters}>
                <Text style={[styles.modalButtonText, styles.applyButtonText]}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={randomSelectionCount}
              onChangeText={setRandomSelectionCount}
              placeholder={`1 - ${filteredChapters.length}`}
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={flashCardCountModalVisible}
        onRequestClose={() => setFlashCardCountModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Flash Card Count</Text>
            <Text style={styles.modalText}>Enter the number of flash cards for this session:</Text>
            <RNTextInput
              style={styles.input}
              keyboardType="numeric"
              value={flashCardCount}
              onChangeText={setFlashCardCount}
              placeholder="Enter number of flash cards"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setFlashCardCountModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.applyButton]} 
                onPress={startFlashCardSession}
              >
                <Text style={[styles.modalButtonText, styles.applyButtonText]}>Start</Text>
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
    marginBottom: 5,
  },
  chapterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
  },
  chapterSubject: {
    fontSize: 14,
    color: '#4a4a4a',
    marginBottom: 5,
  },
  deckCount: {
    fontSize: 14,
    color: '#4a4a4a',
  },
  checkIcon: {
    marginLeft: 10,
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
  subjectScroll: {
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
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: '#001529',
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonIcon: {
    marginRight: 15,  // Increased from 10 to 15
    marginLeft: 5,    // Added a small left margin
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 20,  // Added to balance the icon's left margin
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
});

export default FlashCardChapterListScreen;

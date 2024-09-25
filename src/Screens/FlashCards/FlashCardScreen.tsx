import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, FlatList, TextInput, Animated, Modal, ScrollView } from 'react-native';
import { Icon as AntIcon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type FlashCardScreenProps = {
  navigation: StackNavigationProp<any, 'FlashCards'>;
};

type FlashCardDeck = {
  id: string;
  name: string;
  subject: string;
  cardCount: number;
  masteredCards: number;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  lastStudied: string;
};

const flashCardDecks: FlashCardDeck[] = [
  { id: '1', name: 'Biology', subject: 'Biology', cardCount: 20, masteredCards: 10, description: 'Biology is the study of living organisms and their interactions with each other and their environment.', difficulty: 'Easy', lastStudied: '2023-05-15' },
  { id: '2', name: 'Physics', subject: 'Physics', cardCount: 30, masteredCards: 15, description: 'Physics is the study of matter, energy, and their interactions.', difficulty: 'Medium', lastStudied: '2023-05-18' },
  { id: '3', name: 'Chemistry', subject: 'Chemistry', cardCount: 25, masteredCards: 5, description: 'Chemistry is the study of substances and their properties.', difficulty: 'Hard', lastStudied: '2023-05-10' },
  { id: '4', name: 'Mathematics', subject: 'Mathematics', cardCount: 40, masteredCards: 20, description: 'Mathematics is the study of numbers, shapes, and patterns.', difficulty: 'Medium', lastStudied: '2023-05-20' },
];

const FlashCardScreen: React.FC<FlashCardScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState<string | null>(null);
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleDeckSelect = (deck: FlashCardDeck) => {
    navigation.navigate('FlashCards', { deckId: deck.id });
  };

  const renderDeck = ({ item }: { item: FlashCardDeck }) => (
    <Animated.View style={[styles.deckCard, { opacity: animatedValue }]} key={item.id}>
      <TouchableOpacity onPress={() => handleDeckSelect(item)}>
        <View style={styles.deckHeader}>
          <AntIcon name="book" size={24} color="#ffffff" style={styles.deckIcon} />
          <View style={styles.deckTitleContainer}>
            <Text style={styles.deckName}>{item.name}</Text>
            <Text style={styles.deckSubject}>{item.subject}</Text>
          </View>
          <AntIcon 
            name={item.difficulty === 'Easy' ? 'smile' : item.difficulty === 'Medium' ? 'meh' : 'frown'} 
            size={24} 
            color={item.difficulty === 'Easy' ? '#52c41a' : item.difficulty === 'Medium' ? '#faad14' : '#f5222d'} 
          />
        </View>
        <Text style={styles.deckDescription}>{item.description}</Text>
        <View style={styles.deckFooter}>
          <Text style={styles.cardCount}>{item.cardCount} Cards</Text>
          <Text style={styles.lastStudied}>Last studied: {item.lastStudied}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const filteredDecks = flashCardDecks.filter(deck =>
    (deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deck.subject.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterDifficulty === null || deck.difficulty === filterDifficulty) &&
    (filterSubject === null || deck.subject === filterSubject)
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

  const subjects = Array.from(new Set(flashCardDecks.map(deck => deck.subject)));
  const difficulties = ['Easy', 'Medium', 'Hard'];

  const resetFilters = () => {
    setFilterDifficulty(null);
    setFilterSubject(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntIcon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Flash Card Decks</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <AntIcon name="reload" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <AntIcon name="search" size={20} color="#001529" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search decks..."
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
        data={filteredDecks}
        renderItem={renderDeck}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.deckList}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Decks</Text>
            
            <Text style={styles.filterLabel}>Difficulty:</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[styles.filterOption, filterDifficulty === null && styles.filterOptionActive]}
                onPress={() => setFilterDifficulty(null)}
              >
                <Text style={[styles.filterOptionText, filterDifficulty === null && styles.filterOptionTextActive]}>All</Text>
              </TouchableOpacity>
              {difficulties.map(difficulty => (
                <TouchableOpacity
                  key={difficulty}
                  style={[styles.filterOption, filterDifficulty === difficulty && styles.filterOptionActive]}
                  onPress={() => setFilterDifficulty(difficulty)}
                >
                  <Text style={[styles.filterOptionText, filterDifficulty === difficulty && styles.filterOptionTextActive]}>{difficulty}</Text>
                </TouchableOpacity>
              ))}
            </View>

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
    marginLeft: 10,
  },
  clearButton: {
    padding: 5,
    marginLeft: 10,
  },
  deckList: {
    padding: 20,
  },
  deckCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  deckIcon: {
    marginRight: 10,
    backgroundColor: '#001529',
    padding: 5,
    borderRadius: 5,
  },
  deckTitleContainer: {
    flex: 1,
  },
  deckName: {
    color: '#001529',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deckSubject: {
    color: '#4a4a4a',
    fontSize: 14,
  },
  deckDescription: {
    color: '#4a4a4a',
    fontSize: 14,
    marginBottom: 10,
  },
  deckFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  cardCount: {
    color: '#4a4a4a',
    fontSize: 14,
  },
  lastStudied: {
    color: '#8c8c8c',
    fontSize: 12,
    fontStyle: 'italic',
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
});

export default FlashCardScreen;
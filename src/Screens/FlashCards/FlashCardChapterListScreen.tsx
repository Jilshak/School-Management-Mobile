import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, FlatList, TextInput, Alert } from 'react-native';
import { Icon as AntIcon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { chapters } from './flashCards';

type FlashCardChapterListScreenProps = {
  navigation: StackNavigationProp<any, 'FlashCardChapterList'>;
  route: RouteProp<{ params: { subjects: string[] } }, 'params'>;
};

const FlashCardChapterListScreen: React.FC<FlashCardChapterListScreenProps> = ({ navigation, route }) => {
  const { subjects } = route.params;
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChapters = subjects.flatMap(subject => 
    chapters[subject] ? chapters[subject].filter(chapter => 
      chapter.name.toLowerCase().includes(searchQuery.toLowerCase())
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
    navigation.navigate('FlashCardsLogic', { selectedChapters });
  };

  const getSubjectForChapter = (chapterId: string): string => {
    for (const subject in chapters) {
      if (chapters[subject].some(ch => ch.id === chapterId)) {
        return subject;
      }
    }
    return 'Unknown Subject';
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
});

export default FlashCardChapterListScreen;

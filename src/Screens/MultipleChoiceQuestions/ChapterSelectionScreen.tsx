import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, FlatList, Switch, Alert } from 'react-native';
import { Icon as AntIcon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

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

const ChapterSelectionScreen: React.FC<ChapterSelectionScreenProps> = ({ navigation, route }) => {
  const { subjects } = route.params;
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [availableChapters, setAvailableChapters] = useState<Chapter[]>([]);

  useEffect(() => {
    if (subjects && subjects.length > 0) {
      const chaptersForSelectedSubjects = subjects.flatMap(subject => chapters[subject] || []);
      setAvailableChapters(chaptersForSelectedSubjects);
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
    navigation.navigate('MCQ', { subjects, selectedChapters });
  };

  const renderChapter = ({ item }: { item: Chapter }) => (
    <View style={styles.chapterCard}>
      <View style={styles.chapterHeader}>
        <Text style={styles.chapterName}>{item.name}</Text>
        <Switch
          value={selectedChapters.includes(item.id)}
          onValueChange={() => toggleChapter(item.id)}
        />
      </View>
      <Text style={styles.topicsText}>Topics: {item.topics.join(', ')}</Text>
      <Text style={styles.questionCountText}>Questions: {item.questionCount}</Text>
    </View>
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

      {availableChapters.length > 0 ? (
        <FlatList
          data={availableChapters}
          renderItem={renderChapter}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.chapterList}
        />
      ) : (
        <Text style={styles.noChaptersText}>No chapters available for the selected subjects.</Text>
      )}

      <TouchableOpacity style={styles.startButton} onPress={handleStartExam}>
        <Text style={styles.startButtonText}>Start Exam</Text>
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
  chapterList: {
    padding: 20,
  },
  chapterCard: {
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
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chapterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
  },
  topicsText: {
    fontSize: 14,
    color: '#4a4a4a',
    marginBottom: 5,
  },
  questionCountText: {
    fontSize: 14,
    color: '#4a4a4a',
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
});

export default ChapterSelectionScreen;
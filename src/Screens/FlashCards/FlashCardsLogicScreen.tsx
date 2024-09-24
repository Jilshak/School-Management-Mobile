import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, SafeAreaView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Icon as AntIcon } from '@ant-design/react-native';

type FlashCardsProps = {
  route: RouteProp<any, 'FlashCards'>;
  navigation: StackNavigationProp<any, 'FlashCards'>;
};

type FlashCard = {
  id: string;
  question: string;
  answer: string;
};

const flashCards: FlashCard[] = [
  { id: '1', question: 'What is the capital of France?', answer: 'Paris' },
  { id: '2', question: 'Who wrote "Romeo and Juliet"?', answer: 'William Shakespeare' },
  { id: '3', question: 'What is the chemical symbol for gold?', answer: 'Au' },
  { id: '4', question: 'What year did World War II end?', answer: '1945' },
  { id: '5', question: 'What is the largest planet in our solar system?', answer: 'Jupiter' },
  { id: '6', question: 'Who painted the Mona Lisa?', answer: 'Leonardo da Vinci' },
  { id: '7', question: 'What is the square root of 64?', answer: '8' },
  { id: '8', question: 'In which year did the Titanic sink?', answer: '1912' },
  { id: '9', question: 'What is the hardest natural substance on Earth?', answer: 'Diamond' },
  { id: '10', question: 'Who is known as the father of modern physics?', answer: 'Albert Einstein' },
];

const FlashCardsLogicScreen: React.FC<FlashCardsProps> = ({ route, navigation }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const flipCard = () => {
    setIsFlipped(!isFlipped);
    Animated.spring(flipAnimation, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  };

  const nextCard = () => {
    if (currentCardIndex < flashCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
      flipAnimation.setValue(0);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
      flipAnimation.setValue(0);
    }
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntIcon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Flashcards</Text>
        <TouchableOpacity onPress={() => {}}>
          <AntIcon name="reload" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        <TouchableOpacity onPress={flipCard} activeOpacity={0.9}>
          <Animated.View style={[styles.card, frontAnimatedStyle]}>
            <Text style={styles.cardTitle}>Question</Text>
            <Text style={styles.cardText}>{flashCards[currentCardIndex].question}</Text>
            <Text style={styles.flipPrompt}>Tap to flip</Text>
          </Animated.View>
          <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
            <Text style={styles.cardTitle}>Answer</Text>
            <Text style={styles.cardText}>{flashCards[currentCardIndex].answer}</Text>
            <Text style={styles.flipPrompt}>Tap to flip back</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={styles.navigationContainer}>
        <TouchableOpacity onPress={prevCard} style={[styles.navButton, currentCardIndex === 0 && styles.navButtonDisabled]} disabled={currentCardIndex === 0}>
          <AntIcon name="left" size={24} color={currentCardIndex === 0 ? '#ccc' : '#001529'} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <Text style={styles.cardCount}>{currentCardIndex + 1} / {flashCards.length}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((currentCardIndex + 1) / flashCards.length) * 100}%` }]} />
          </View>
        </View>
        <TouchableOpacity onPress={nextCard} style={[styles.navButton, currentCardIndex === flashCards.length - 1 && styles.navButtonDisabled]} disabled={currentCardIndex === flashCards.length - 1}>
          <AntIcon name="right" size={24} color={currentCardIndex === flashCards.length - 1 ? '#ccc' : '#001529'} />
        </TouchableOpacity>
      </View>
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
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: Dimensions.get('window').width - 40,
    height: Dimensions.get('window').height * 0.6,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#e6f7ff',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001529',
    marginBottom: 20,
  },
  cardText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
  },
  flipPrompt: {
    position: 'absolute',
    bottom: 20,
    color: '#888',
    fontSize: 14,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  navButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
  },
  cardCount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  progressBar: {
    width: '100%',
    height: 4,
    marginBottom: 30,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#001529', // Changed to match the header color
    borderRadius: 2,
  },
});

export default FlashCardsLogicScreen;

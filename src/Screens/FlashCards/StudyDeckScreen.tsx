import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image, Dimensions, Modal, ScrollView } from 'react-native';
import { Icon as AntIcon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Card {
  id: string;
  front: string;
  back: string;
  frontImage?: string;
  backImage?: string;
  lastReviewed?: Date;
}

interface CardWithProgress extends Card {
  difficulty?: 'easy' | 'medium' | 'hard' | 'again';
  nextReview?: Date;
  repetitionCount?: number;
}

interface StudyDeckProps {
  navigation: StackNavigationProp<any, 'StudyDeck'>;
  route: RouteProp<{ StudyDeck: { deckId: string; cards: Card[] } }, 'StudyDeck'>;
}

const { width } = Dimensions.get('window');

interface SpacingOption {
  label: string;
  days: number;
  color: string;
}

const StudyDeckScreen: React.FC<StudyDeckProps> = ({ navigation, route }) => {
  const { cards } = route.params;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const [showDifficultyButtons, setShowDifficultyButtons] = useState(false);
  const [studyCards, setStudyCards] = useState<CardWithProgress[]>(() => 
    route.params.cards.map(card => ({
      ...card,
      repetitionCount: 0,
      nextReview: new Date()
    }))
  );

  const handleDifficultySelect = (difficulty: 'easy' | 'medium' | 'hard') => {
    setShowDifficultyButtons(true);
  };

  const handleSpacingSelect = async (option: SpacingOption) => {
    const card = studyCards[currentIndex];
    const now = new Date();
    const nextReview = new Date(now.getTime() + option.days * 24 * 60 * 60 * 1000);

    const updatedCards = [...studyCards];
    updatedCards[currentIndex] = {
      ...card,
      difficulty: option.label.toLowerCase() as 'easy' | 'medium' | 'hard' | 'again',
      nextReview,
      repetitionCount: (card.repetitionCount || 0) + 1,
      lastReviewed: now
    };

    setStudyCards(updatedCards);
    
    try {
      await AsyncStorage.setItem(
        `deck_${route.params.deckId}_progress`,
        JSON.stringify(updatedCards)
      );
    } catch (error) {
      console.error('Error saving card progress:', error);
    }

    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      flipAnimation.setValue(0);
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.goBack();
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      // Show difficulty buttons when card is flipped to back
      setShowDifficultyButtons(true);
    }
    Animated.spring(flipAnimation, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
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

  const renderCardContent = (content: string, image?: string) => (
    <TouchableOpacity 
      style={styles.cardContent} 
      onPress={flipCard}
      activeOpacity={0.9}
    >
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.cardText}>{content}</Text>
        </View>
        {image && (
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: image }}
              style={styles.cardImage}
              resizeMode="contain"
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const savedProgress = await AsyncStorage.getItem(`deck_${route.params.deckId}_progress`);
        if (savedProgress) {
          const parsedProgress = JSON.parse(savedProgress);
          setStudyCards(parsedProgress);
        }
      } catch (error) {
        console.error('Error loading card progress:', error);
      }
    };

    loadProgress();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntIcon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Study Cards</Text>
        <Text style={styles.cardCount}>
          {currentIndex + 1}/{cards.length}
        </Text>
      </View>

      <View style={styles.cardContainer}>
        <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
          {renderCardContent(cards[currentIndex].front, cards[currentIndex].frontImage)}
        </Animated.View>
        <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
          {renderCardContent(cards[currentIndex].back, cards[currentIndex].backImage)}
        </Animated.View>
      </View>

      {isFlipped && (
        <View style={styles.difficultyContainer}>
          <TouchableOpacity
            style={[styles.difficultyButton, styles.againButton]}
            onPress={() => handleSpacingSelect({ label: 'Again', days: 0, color: '#8c8c8c' })}
          >
            <AntIcon name="reload" size={20} color="#ffffff" />
            <Text style={styles.difficultyButtonText}>Again</Text>
            <Text style={styles.difficultyButtonSubtext}>10 min</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.difficultyButton, styles.hardButton]}
            onPress={() => handleSpacingSelect({ label: 'Hard', days: 1, color: '#ff4d4f' })}
          >
            <AntIcon name="frown" size={20} color="#ffffff" />
            <Text style={styles.difficultyButtonText}>Hard</Text>
            <Text style={styles.difficultyButtonSubtext}>1 day</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.difficultyButton, styles.mediumButton]}
            onPress={() => handleSpacingSelect({ label: 'Good', days: 4, color: '#faad14' })}
          >
            <AntIcon name="meh" size={20} color="#ffffff" />
            <Text style={styles.difficultyButtonText}>Good</Text>
            <Text style={styles.difficultyButtonSubtext}>4 days</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.difficultyButton, styles.easyButton]}
            onPress={() => handleSpacingSelect({ label: 'Easy', days: 7, color: '#52c41a' })}
          >
            <AntIcon name="smile" size={20} color="#ffffff" />
            <Text style={styles.difficultyButtonText}>Easy</Text>
            <Text style={styles.difficultyButtonSubtext}>7 days</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
  cardCount: {
    color: '#ffffff',
    fontSize: 16,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: width - 40,
    height: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    position: 'absolute',
    backfaceVisibility: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardFront: {
    backgroundColor: '#ffffff',
  },
  cardBack: {
    backgroundColor: '#f6ffed',
  },
  cardContent: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  textContainer: {
    width: '100%',
    marginBottom: 30,
  },
  cardText: {
    fontSize: 18,
    color: '#001529',
    textAlign: 'center',
    lineHeight: 24,
  },
  imageWrapper: {
    width: '100%',
    marginTop: 20,
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 30,
  },
  controlButton: {
    width: 50,
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  flipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#001529',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  flipButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#f5f5f5',
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 8,
  },
  difficultyButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  difficultyButtonContent: {
    alignItems: 'center',
  },
  difficultyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  difficultyButtonSubtext: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 2,
    opacity: 0.9,
  },
  hardButton: {
    backgroundColor: '#ff4d4f',
  },
  mediumButton: {
    backgroundColor: '#faad14',
  },
  easyButton: {
    backgroundColor: '#52c41a',
  },
  againButton: {
    backgroundColor: '#8c8c8c',
  },
  spacer: {
    flex: 1,
  },
});

export default StudyDeckScreen; 
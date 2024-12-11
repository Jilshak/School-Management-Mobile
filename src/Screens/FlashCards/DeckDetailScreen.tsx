import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Alert, Image, Platform, Dimensions, ScrollView } from 'react-native';
import { Icon as AntIcon } from '@ant-design/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';

interface Card {
  id: string;
  front: string;
  back: string;
  frontImage?: string;
  backImage?: string;
  lastReviewed?: Date;
  deckId?: string;
  deckName?: string;
}

interface DeckDetailRouteParams {
  deckId: string;
  initialView?: 'cards' | 'subdecks';
}

interface DeckDetailProps {
  navigation: StackNavigationProp<any, 'DeckDetail'>;
  route: RouteProp<{ DeckDetail: DeckDetailRouteParams }, 'DeckDetail'>;
}

interface Deck {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  lastModified: Date;
  parentDeckId?: string;
  isSubdeck?: boolean;
  level?: number;
  path?: string[];
  key?: string;
}

const DeckDetailScreen: React.FC<DeckDetailProps> = ({ navigation, route }) => {
  const { deckId } = route.params;
  const [deck, setDeck] = useState<any>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [isAddCardModalVisible, setAddCardModalVisible] = useState(false);
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [frontImage, setFrontImage] = useState<string>('');
  const [backImage, setBackImage] = useState<string>('');
  const [expandedCardIds, setExpandedCardIds] = useState<string[]>([]);
  const [subdecks, setSubdecks] = useState<Deck[]>([]);
  const [isCreateSubdeckModalVisible, setCreateSubdeckModalVisible] = useState(false);
  const [newSubdeckName, setNewSubdeckName] = useState('');
  const [newSubdeckDescription, setNewSubdeckDescription] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'subdecks'>('cards');
  const [selectedDeckId, setSelectedDeckId] = useState<string>(deckId);
  const [availableDecks, setAvailableDecks] = useState<Deck[]>([]);
  const [showDeckSelector, setShowDeckSelector] = useState(false);
  const [allDeckCards, setAllDeckCards] = useState<Card[]>([]);
  const [expandedSubdeckIds, setExpandedSubdeckIds] = useState<string[]>([]);
  const [editingSubdeck, setEditingSubdeck] = useState<Deck | null>(null);
  const [isEditSubdeckModalVisible, setEditSubdeckModalVisible] = useState(false);
  const [expandedDropdownId, setExpandedDropdownId] = useState<string | null>(null);
  const [selectedSubdeckId, setSelectedSubdeckId] = useState<string>(deckId);

  useEffect(() => {
    loadDeckData();
    loadSubdecks();
    loadAvailableDecks();
  }, []);

  useEffect(() => {
    if (route.params.initialView) {
      setViewMode(route.params.initialView);
    }
  }, [route.params.initialView]);

  useEffect(() => {
    if (subdecks.length > 0) {
      loadAllCards();
    }
  }, [subdecks]);

  const loadDeckData = async () => {
    try {
      const decksData = await AsyncStorage.getItem('flashcard_decks');
      if (decksData) {
        const decks = JSON.parse(decksData);
        const currentDeck = decks.find((d: any) => d.id === deckId);
        if (currentDeck) {
          setDeck(currentDeck);
          const cardsData = await AsyncStorage.getItem(`deck_${deckId}_cards`);
          setCards(cardsData ? JSON.parse(cardsData) : []);
          loadAllCards();
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load deck data');
    }
  };

  const loadSubdecks = async () => {
    try {
      const decksData = await AsyncStorage.getItem('flashcard_decks');
      if (decksData) {
        const allDecks = JSON.parse(decksData);
        
        // Function to recursively get all subdecks
        const getNestedSubdecks = (parentId: string, level: number = 1, parentPath: string[] = []): Deck[] => {
          const directSubdecks = allDecks.filter((d: Deck) => d.parentDeckId === parentId);
          
          return directSubdecks.reduce((acc: Deck[], deck: Deck) => {
            const currentPath = [...parentPath, deck.name];
            const enrichedDeck = {
              ...deck,
              level,
              path: currentPath,
              key: `${parentId}_${deck.id}_${level}`
            };
            
            const nestedSubdecks = getNestedSubdecks(deck.id, level + 1, currentPath);
            return [...acc, enrichedDeck, ...nestedSubdecks];
          }, []);
        };

        const allNestedSubdecks = getNestedSubdecks(deckId);
        setSubdecks(allNestedSubdecks);
      }
    } catch (error) {
      console.error('Error loading subdecks:', error);
    }
  };

  const loadAvailableDecks = async () => {
    try {
      const decksData = await AsyncStorage.getItem('flashcard_decks');
      if (decksData) {
        const allDecks = JSON.parse(decksData);
        setAvailableDecks(allDecks);
      }
    } catch (error) {
      console.error('Error loading available decks:', error);
    }
  };

  const loadAllCards = async () => {
    try {
      const mainDeckCardsData = await AsyncStorage.getItem(`deck_${deckId}_cards`);
      const mainDeckCards = mainDeckCardsData ? JSON.parse(mainDeckCardsData) : [];

      const subdeckCards = await Promise.all(
        subdecks.map(async (subdeck) => {
          const subdeckCardsData = await AsyncStorage.getItem(`deck_${subdeck.id}_cards`);
          const cards = subdeckCardsData ? JSON.parse(subdeckCardsData) : [];
          return cards.map((card: Card) => ({
            ...card,
            deckId: subdeck.id,
            deckName: subdeck.name
          }));
        })
      );

      const allCards = [
        ...mainDeckCards.map((card: Card) => ({
          ...card,
          deckId: deckId,
          deckName: deck?.name
        })),
        ...subdeckCards.flat()
      ];

      const sortedCards = allCards.sort((a, b) => Number(b.id) - Number(a.id));
      setAllDeckCards(sortedCards);
    } catch (error) {
      console.error('Error loading all cards:', error);
    }
  };

  const saveCard = async () => {
    if (!newCardFront.trim() || !newCardBack.trim()) {
      Alert.alert('Error', 'Please fill in both sides of the card');
      return;
    }

    try {
      const newCard: Card = {
        id: editingCard?.id || Date.now().toString(),
        front: newCardFront.trim(),
        back: newCardBack.trim(),
        frontImage: frontImage || undefined,
        backImage: backImage || undefined,
      };

      if (editingCard && selectedDeckId !== deckId) {
        const updatedCurrentDeckCards = cards.filter(card => card.id !== editingCard.id);
        await AsyncStorage.setItem(`deck_${deckId}_cards`, JSON.stringify(updatedCurrentDeckCards));
        setCards(updatedCurrentDeckCards);
      }

      const targetDeckCardsData = await AsyncStorage.getItem(`deck_${selectedDeckId}_cards`);
      let targetDeckCards: Card[] = targetDeckCardsData ? JSON.parse(targetDeckCardsData) : [];
      
      if (editingCard) {
        if (selectedDeckId === deckId) {
          targetDeckCards = cards.map(card => card.id === editingCard.id ? newCard : card);
        } else {
          targetDeckCards = [...targetDeckCards, newCard];
        }
      } else {
        targetDeckCards = [...targetDeckCards, newCard];
      }

      await AsyncStorage.setItem(`deck_${selectedDeckId}_cards`, JSON.stringify(targetDeckCards));

      const decksData = await AsyncStorage.getItem('flashcard_decks');
      if (decksData) {
        const allDecks = JSON.parse(decksData);
        const updatedDecks = allDecks.map((d: Deck) => {
          if (d.id === selectedDeckId) {
            return { ...d, cardCount: targetDeckCards.length };
          }
          if (editingCard && d.id === deckId && selectedDeckId !== deckId) {
            const currentDeckCards = cards.filter(card => card.id !== editingCard.id);
            return { ...d, cardCount: currentDeckCards.length };
          }
          return d;
        });
        await AsyncStorage.setItem('flashcard_decks', JSON.stringify(updatedDecks));
      }

      if (selectedDeckId === deckId) {
        setCards(targetDeckCards);
      }

      resetCardModal();
      loadDeckData();
      loadAvailableDecks();
    } catch (error) {
      console.error('Error saving card:', error);
      Alert.alert('Error', 'Failed to save card');
    }
  };

  const resetCardModal = () => {
    setNewCardFront('');
    setNewCardBack('');
    setFrontImage('');
    setBackImage('');
    setEditingCard(null);
    setSelectedDeckId(deckId);
    setAddCardModalVisible(false);
    setShowDeckSelector(false);
  };

  const deleteCard = async (cardId: string, cardDeckId: string) => {
    try {
      const deckCardsData = await AsyncStorage.getItem(`deck_${cardDeckId}_cards`);
      if (deckCardsData) {
        const deckCards = JSON.parse(deckCardsData);
        const updatedCards = deckCards.filter((card: Card) => card.id !== cardId);
        await AsyncStorage.setItem(`deck_${cardDeckId}_cards`, JSON.stringify(updatedCards));
        
        const decksData = await AsyncStorage.getItem('flashcard_decks');
        if (decksData) {
          const decks = JSON.parse(decksData);
          const updatedDecks = decks.map((d: any) => 
            d.id === cardDeckId ? { ...d, cardCount: updatedCards.length } : d
          );
          await AsyncStorage.setItem('flashcard_decks', JSON.stringify(updatedDecks));
        }

        loadAllCards();
        if (cardDeckId === deckId) {
          setCards(updatedCards);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete card');
    }
  };

  const editCard = (card: Card) => {
    setEditingCard(card);
    setNewCardFront(card.front);
    setNewCardBack(card.back);
    setFrontImage(card.frontImage || '');
    setBackImage(card.backImage || '');
    setAddCardModalVisible(true);
  };

  const pickImage = async (side: 'front' | 'back') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        if (side === 'front') {
          setFrontImage(result.assets[0].uri);
        } else {
          setBackImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCardIds(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handleOutsideClick = () => {
    if (expandedDropdownId) {
      setExpandedDropdownId(null);
    }
  };

  const renderCard = ({ item, index }: { item: Card & { deckId?: string; deckName?: string }, index: number }) => {
    const isExpanded = expandedCardIds.includes(item.id);
    
    return (
      <View style={styles.cardItem}>
        <TouchableOpacity 
          style={styles.cardContent}
          onPress={() => toggleCardExpansion(item.id)}
          activeOpacity={0.8}
        >
          <View style={styles.cardSide}>
            <View style={styles.cardHeaderContainer}>
              <View style={styles.headerLeft}>
                <View style={styles.questionNumber}>
                  <Text style={styles.questionNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.cardLabelContainer}>
                  <AntIcon name="book" size={16} color="#001529" />
                  <Text style={styles.cardLabel}>Front</Text>
                </View>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    editCard(item);
                  }}
                >
                  <AntIcon name="edit" size={20} color="#001529" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    deleteCard(item.id, item.deckId || deckId);
                  }}
                >
                  <AntIcon name="delete" size={20} color="#ff4d4f" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => toggleCardExpansion(item.id)}
                >
                  <AntIcon 
                    name={isExpanded ? "up" : "down"} 
                    size={20} 
                    color="#001529" 
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.cardMainContent}>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardText}>{item.front}</Text>
              </View>
            </View>
            {item.deckId !== deckId && (
              <View style={styles.cardFooter}>
                <View style={styles.cardDeckInfo}>
                  <AntIcon name="folder" size={14} color="#666" />
                  <Text style={styles.cardDeckName}>{item.deckName}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Expanded Content */}
          {isExpanded && (
            <>
              {/* Front Image */}
              {item.frontImage && (
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: item.frontImage }} 
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                </View>
              )}

              {/* Back Side */}
              <View style={styles.cardSide}>
                <View style={styles.cardHeaderContainer}>
                  <View style={styles.cardLabelContainer}>
                    <AntIcon name="bulb" size={16} color="#001529" />
                    <Text style={styles.cardLabel}>Back</Text>
                  </View>
                </View>
                <View style={styles.cardMainContent}>
                  <View style={styles.cardTextContainer}>
                    <Text style={styles.cardText}>{item.back}</Text>
                  </View>
                  {item.backImage && (
                    <View style={styles.imageContainer}>
                      <Image 
                        source={{ uri: item.backImage }} 
                        style={styles.cardImage}
                        resizeMode="contain"
                      />
                    </View>
                  )}
                </View>
              </View>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const createSubdeck = async () => {
    if (!newSubdeckName.trim()) {
      Alert.alert('Error', 'Please enter a subdeck name');
      return;
    }

    const newSubdeck: Deck = {
      id: Date.now().toString(),
      name: newSubdeckName.trim(),
      description: newSubdeckDescription.trim(),
      cardCount: 0,
      lastModified: new Date(),
      parentDeckId: selectedSubdeckId,
      isSubdeck: true
    };

    try {
      const decksData = await AsyncStorage.getItem('flashcard_decks');
      const allDecks = decksData ? JSON.parse(decksData) : [];
      const updatedDecks = [...allDecks, newSubdeck];
      
      await AsyncStorage.setItem('flashcard_decks', JSON.stringify(updatedDecks));
      await loadSubdecks();
      setCreateSubdeckModalVisible(false);
      setNewSubdeckName('');
      setNewSubdeckDescription('');
      setSelectedSubdeckId(deckId);
    } catch (error) {
      Alert.alert('Error', 'Failed to create subdeck');
    }
  };

  const renderSubdeck = ({ item }: { item: Deck }) => {
    const isExpanded = expandedSubdeckIds.includes(item.id);
    const subdeckCards = allDeckCards.filter(card => card.deckId === item.id);
    
    return (
      <View 
        key={item.key || item.id}
        style={[
          styles.subdeckCard,
          { marginLeft: (item.level || 1) * 20 }
        ]}
      >
        <View style={styles.subdeckContent}>
          <View style={styles.subdeckHeader}>
            <TouchableOpacity 
              style={styles.expandButton}
              onPress={() => toggleSubdeckExpansion(item.id)}
            >
              <AntIcon 
                name={isExpanded ? "down" : "right"} 
                size={20} 
                color="#001529" 
              />
            </TouchableOpacity>
            <View style={styles.subdeckTitleContainer}>
              <AntIcon name="folder" size={24} color="#001529" />
              <View style={styles.subdeckPathContainer}>
                {item.path && item.path.length > 1 && (
                  <Text style={styles.subdeckPath}>
                    {item.path.slice(0, -1).join(' > ')}
                  </Text>
                )}
                <Text style={styles.subdeckTitle}>{item.name}</Text>
              </View>
            </View>
            <View style={styles.subdeckActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => editSubdeck(item)}
              >
                <AntIcon name="edit" size={20} color="#001529" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  setSelectedSubdeckId(item.id);
                  setCreateSubdeckModalVisible(true);
                }}
              >
                <AntIcon name="folder-add" size={20} color="#001529" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => Alert.alert(
                  'Delete Subdeck',
                  'Are you sure you want to delete this subdeck and all its nested subdecks?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Delete', 
                      style: 'destructive',
                      onPress: () => deleteSubdeck(item.id)
                    }
                  ]
                )}
              >
                <AntIcon name="delete" size={20} color="#ff4d4f" />
              </TouchableOpacity>
            </View>
          </View>
          {item.description && (
            <Text style={styles.subdeckDescription}>{item.description}</Text>
          )}
          <View style={styles.subdeckStats}>
            <View style={styles.statContainer}>
              <AntIcon name="profile" size={16} color="#666" />
              <Text style={styles.statText}>{item.cardCount} cards</Text>
            </View>
            <Text style={styles.subdeckLastModified}>
              Last modified: {new Date(item.lastModified).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {isExpanded && (
          <View style={styles.subdeckCardsList}>
            {subdeckCards.map(card => (
              <View key={card.id} style={styles.subdeckCardItem}>
                <Text style={styles.subdeckCardFront}>{card.front}</Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => editCard(card)}
                  >
                    <AntIcon name="edit" size={16} color="#001529" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => deleteCard(card.id, item.id)}
                  >
                    <AntIcon name="delete" size={16} color="#ff4d4f" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {subdeckCards.length === 0 && (
              <Text style={styles.noCardsText}>No cards in this subdeck</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  const deleteSubdeck = async (subdeckId: string) => {
    try {
      // Get all subdecks to be deleted (including nested ones)
      const getAllNestedSubdeckIds = (parentId: string): string[] => {
        const directSubdecks = subdecks.filter(d => d.parentDeckId === parentId);
        return directSubdecks.reduce((acc: string[], deck) => {
          return [...acc, deck.id, ...getAllNestedSubdeckIds(deck.id)];
        }, []);
      };

      const subdecksToDelete = [subdeckId, ...getAllNestedSubdeckIds(subdeckId)];

      // Delete all cards from all affected subdecks
      await Promise.all(
        subdecksToDelete.map(id => AsyncStorage.removeItem(`deck_${id}_cards`))
      );
      
      // Delete subdecks from decks list
      const decksData = await AsyncStorage.getItem('flashcard_decks');
      if (decksData) {
        const allDecks = JSON.parse(decksData);
        const updatedDecks = allDecks.filter((d: Deck) => !subdecksToDelete.includes(d.id));
        await AsyncStorage.setItem('flashcard_decks', JSON.stringify(updatedDecks));
        
        // Update local state
        setSubdecks(prev => prev.filter(d => !subdecksToDelete.includes(d.id)));
      }

      // Reload all cards to update the view
      loadAllCards();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete subdeck');
    }
  };

  const toggleSubdeckExpansion = (subdeckId: string) => {
    setExpandedSubdeckIds(prev => 
      prev.includes(subdeckId) 
        ? prev.filter(id => id !== subdeckId)
        : [...prev, subdeckId]
    );
  };

  const editSubdeck = (subdeck: Deck) => {
    setEditingSubdeck(subdeck);
    setNewSubdeckName(subdeck.name);
    setNewSubdeckDescription(subdeck.description || '');
    setEditSubdeckModalVisible(true);
  };

  const saveSubdeckEdit = async () => {
    if (!newSubdeckName.trim() || !editingSubdeck) {
      Alert.alert('Error', 'Please enter a subdeck name');
      return;
    }

    try {
      const decksData = await AsyncStorage.getItem('flashcard_decks');
      if (decksData) {
        const allDecks = JSON.parse(decksData);
        const updatedDecks = allDecks.map((d: Deck) => 
          d.id === editingSubdeck.id 
            ? {
                ...d,
                name: newSubdeckName.trim(),
                description: newSubdeckDescription.trim(),
                lastModified: new Date()
              }
            : d
        );
        
        await AsyncStorage.setItem('flashcard_decks', JSON.stringify(updatedDecks));
        setSubdecks(prev => prev.map(d => 
          d.id === editingSubdeck.id 
            ? {
                ...d,
                name: newSubdeckName.trim(),
                description: newSubdeckDescription.trim(),
                lastModified: new Date()
              }
            : d
        ));
        
        setEditSubdeckModalVisible(false);
        setEditingSubdeck(null);
        setNewSubdeckName('');
        setNewSubdeckDescription('');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update subdeck');
    }
  };

  const DeckSelector = () => (
    <View style={styles.deckSelectorContainer}>
      <Text style={styles.sectionLabel}>Select Deck</Text>
      <TouchableOpacity
        style={[
          styles.deckOption,
          selectedDeckId === deckId ? styles.selectedDeckOption : null
        ]}
        onPress={() => setSelectedDeckId(deckId)}
      >
        <AntIcon 
          name="book" 
          size={16} 
          color={selectedDeckId === deckId ? '#ffffff' : '#001529'} 
        />
        <Text style={[
          styles.deckOptionText,
          selectedDeckId === deckId && styles.selectedDeckOptionText
        ]}>
          Current Deck
        </Text>
      </TouchableOpacity>
      
      {subdecks.map(subdeck => (
        <TouchableOpacity
          key={subdeck.id}
          style={[
            styles.deckOption,
            styles.subdeckOption,
            selectedDeckId === subdeck.id ? styles.selectedDeckOption : null
          ]}
          onPress={() => setSelectedDeckId(subdeck.id)}
        >
          <AntIcon 
            name="folder" 
            size={16} 
            color={selectedDeckId === subdeck.id ? '#ffffff' : '#001529'} 
          />
          <Text style={[
            styles.deckOptionText,
            selectedDeckId === subdeck.id && styles.selectedDeckOptionText
          ]}>
            {subdeck.name}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.showAllDecksButton}
        onPress={() => setShowDeckSelector(true)}
      >
        <AntIcon name="swap" size={16} color="#001529" />
        <Text style={styles.showAllDecksText}>Move to Another Deck</Text>
      </TouchableOpacity>
    </View>
  );

  const AllDecksSelector = () => (
    <Modal
      visible={showDeckSelector}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowDeckSelector(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Deck</Text>
            <TouchableOpacity onPress={() => setShowDeckSelector(false)}>
              <AntIcon name="close" size={24} color="#001529" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.deckList}>
            {availableDecks.map(deck => (
              <TouchableOpacity
                key={deck.id}
                style={[
                  styles.deckOption,
                  selectedDeckId === deck.id ? styles.selectedDeckOption : null,
                  deck.parentDeckId ? styles.subdeckOption : null
                ]}
                onPress={() => {
                  setSelectedDeckId(deck.id);
                  setShowDeckSelector(false);
                }}
              >
                <AntIcon 
                  name={deck.parentDeckId ? "folder" : "book"} 
                  size={16} 
                  color={selectedDeckId === deck.id ? '#ffffff' : '#001529'} 
                />
                <Text style={[
                  styles.deckOptionText,
                  selectedDeckId === deck.id && styles.selectedDeckOptionText
                ]}>
                  {deck.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntIcon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{deck?.name}</Text>
        <View style={styles.headerActions}>
          {viewMode === 'cards' ? (
            <TouchableOpacity onPress={() => setAddCardModalVisible(true)}>
              <AntIcon name="plus-circle" size={24} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setCreateSubdeckModalVisible(true)}>
              <AntIcon name="folder-add" size={24} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.viewToggle}>
        <TouchableOpacity 
          style={[styles.toggleButton, viewMode === 'cards' && styles.toggleButtonActive]}
          onPress={() => setViewMode('cards')}
        >
          <AntIcon 
            name="profile" 
            size={16} 
            color={viewMode === 'cards' ? '#ffffff' : '#666'} 
          />
          <Text style={[
            styles.toggleButtonText, 
            viewMode === 'cards' && styles.toggleButtonTextActive
          ]}>
            All Cards
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, viewMode === 'subdecks' && styles.toggleButtonActive]}
          onPress={() => setViewMode('subdecks')}
        >
          <AntIcon 
            name="folder" 
            size={16} 
            color={viewMode === 'subdecks' ? '#ffffff' : '#666'} 
          />
          <Text style={[
            styles.toggleButtonText, 
            viewMode === 'subdecks' && styles.toggleButtonTextActive
          ]}>
            Subdecks
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'cards' ? (
        <FlatList
          data={allDeckCards}
          renderItem={renderCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.cardList}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <AntIcon name="profile" size={64} color="#001529" />
              <Text style={styles.emptyStateText}>No cards in this deck</Text>
              <TouchableOpacity 
                style={styles.addFirstCardButton}
                onPress={() => setAddCardModalVisible(true)}
              >
                <Text style={styles.addFirstCardButtonText}>Add Your First Card</Text>
              </TouchableOpacity>
            </View>
          }
        />
      ) : (
        <FlatList
          data={subdecks}
          renderItem={renderSubdeck}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.cardList}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <AntIcon name="folder" size={64} color="#001529" />
              <Text style={styles.emptyStateText}>No subdecks yet</Text>
              <TouchableOpacity 
                style={styles.addFirstCardButton}
                onPress={() => setCreateSubdeckModalVisible(true)}
              >
                <Text style={styles.addFirstCardButtonText}>Create Your First Subdeck</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <Modal
        visible={isAddCardModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={resetCardModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCard ? 'Edit Card' : 'Add New Card'}
              </Text>
              <TouchableOpacity onPress={resetCardModal}>
                <AntIcon name="close" size={24} color="#001529" />
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              <DeckSelector />
              <AllDecksSelector />
              
              <Text style={styles.inputLabel}>Front Side</Text>
              <View style={styles.inputSection}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter front side content"
                  value={newCardFront}
                  onChangeText={setNewCardFront}
                  multiline
                  placeholderTextColor="#999"
                />
                <TouchableOpacity 
                  style={styles.imageButton}
                  onPress={() => pickImage('front')}
                >
                  <AntIcon name="picture" size={20} color="#001529" />
                  <Text style={styles.imageButtonText}>Add Image</Text>
                </TouchableOpacity>
                {frontImage && (
                  <View style={styles.imagePreviewContainer}>
                    <Image 
                      source={{ uri: frontImage }} 
                      style={styles.imagePreview}
                      resizeMode="contain"
                    />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => setFrontImage('')}
                    >
                      <AntIcon name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              
              <Text style={styles.inputLabel}>Back Side</Text>
              <View style={styles.inputSection}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter back side content"
                  value={newCardBack}
                  onChangeText={setNewCardBack}
                  multiline
                  placeholderTextColor="#999"
                />
                <TouchableOpacity 
                  style={styles.imageButton}
                  onPress={() => pickImage('back')}
                >
                  <AntIcon name="picture" size={20} color="#001529" />
                  <Text style={styles.imageButtonText}>Add Image</Text>
                </TouchableOpacity>
                {backImage && (
                  <View style={styles.imagePreviewContainer}>
                    <Image 
                      source={{ uri: backImage }} 
                      style={styles.imagePreview}
                      resizeMode="contain"
                    />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => setBackImage('')}
                    >
                      <AntIcon name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={resetCardModal}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveCard}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isCreateSubdeckModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateSubdeckModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Subdeck</Text>
            <TextInput
              style={styles.input}
              placeholder="Subdeck Name"
              value={newSubdeckName}
              onChangeText={setNewSubdeckName}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={newSubdeckDescription}
              onChangeText={setNewSubdeckDescription}
              multiline
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCreateSubdeckModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.createButton]}
                onPress={createSubdeck}
              >
                <Text style={styles.buttonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isEditSubdeckModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditSubdeckModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Subdeck</Text>
              <TouchableOpacity onPress={() => setEditSubdeckModalVisible(false)}>
                <AntIcon name="close" size={24} color="#001529" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Subdeck Name"
              value={newSubdeckName}
              onChangeText={setNewSubdeckName}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={newSubdeckDescription}
              onChangeText={setNewSubdeckDescription}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditSubdeckModalVisible(false)}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveSubdeckEdit}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  cardList: {
    padding: 20,
  },
  cardItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    padding: 12,
  },
  cardSide: {
    marginBottom: 8,
  },
  cardHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardLabel: {
    fontSize: 12,
    color: '#001529',
    fontWeight: 'bold',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  cardMainContent: {
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    overflow: 'hidden',
  },
  cardTextContainer: {
    padding: 12,
    backgroundColor: '#f5f5f5',
  },
  cardText: {
    fontSize: 15,
    color: '#001529',
    lineHeight: 22,
  },

  imageContainer: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#ffffff',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 16,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#fff1f0',
    borderRadius: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f0f5ff',
  },
  editButtonText: {
    marginLeft: 6,
    color: '#1890ff',
    fontSize: 14,
    fontWeight: '600',
  },
  studyButton: {
    backgroundColor: '#001529',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studyButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    marginBottom: 20,
  },
  addFirstCardButton: {
    backgroundColor: '#001529',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  addFirstCardButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#001529',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  createButton: {  // Add this style
    backgroundColor: '#001529',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#001529',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  imagePreviewContainer: {
    marginTop: 8,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  imageButtonText: {
    marginLeft: 8,
    color: '#001529',
    fontSize: 14,
    fontWeight: '600',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 4,
  },
  cancelButtonText: {
    color: '#001529',
  },
  inputSection: {
    marginBottom: 20,
    width: '100%',
  },
  toggleIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  toggleIndicatorText: {
    fontSize: 14,
    color: '#001529',
    fontWeight: '500',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 15,
    padding: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#001529',
  },
  toggleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  toggleButtonTextActive: {
    color: '#ffffff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 15,
  },
  subdeckCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
    marginLeft: 0,
  },
  subdeckContent: {
    padding: 16,
  },
  subdeckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subdeckTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subdeckTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#001529',
    marginLeft: 12,
  },
  subdeckStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  subdeckDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 12,
    marginLeft: 36, // Aligns with the title after icon
  },
  subdeckFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  subdeckLastModified: {
    fontSize: 12,
    color: '#999',
    marginLeft: 36,
  },
  deckSelectorContainer: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  deckOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  selectedDeckOption: {
    backgroundColor: '#001529',
  },
  deckOptionText: {
    fontSize: 14,
    color: '#001529',
    fontWeight: '500',
  },
  selectedDeckOptionText: {
    color: '#ffffff',
  },
  subdeckOption: {
    marginLeft: 20,
    borderLeftWidth: 2,
    borderLeftColor: '#e8e8e8',
  },
  showAllDecksButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0f5ff',
    borderRadius: 8,
    gap: 8,
  },
  showAllDecksText: {
    fontSize: 14,
    color: '#001529',
    fontWeight: '500',
  },
  deckList: {
    maxHeight: 400,
  },
  cardDeckInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f5ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardDeckName: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  expandButton: {
    padding: 8,
    marginRight: 5,
  },
  subdeckCardsList: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  subdeckCardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  subdeckCardFront: {
    flex: 1,
    fontSize: 14,
    color: '#001529',
    marginRight: 10,
  },
  subdeckActions: {
    flexDirection: 'row',
    gap: 8,
  },
  noCardsText: {
    textAlign: 'center',
    color: '#666',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  dropdownContainer: {
    position: 'relative',
  },

  dropdownButton: {
    padding: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },

  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },

  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
    gap: 8,
  },

  dropdownItemText: {
    fontSize: 14,
    color: '#001529',
    fontWeight: '500',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  questionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#001529',
    justifyContent: 'center',
    alignItems: 'center',
  },

  questionNumberText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  subdeckPathContainer: {
    flex: 1,
  },

  subdeckPath: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
});

export default DeckDetailScreen; 
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';

interface Book {
  id: string;
  title: string;
  author: string;
  available: boolean;
  borrowedBy?: string;
  dueDate?: string;
  genre: string;
}

type LibraryScreenProps = {
  navigation: StackNavigationProp<any, 'Library'>;
};

const LibraryScreen: React.FC<LibraryScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([
    { id: '1', title: 'To Kill a Mockingbird', author: 'Harper Lee', available: true, genre: 'Fiction' },
    { id: '2', title: '1984', author: 'George Orwell', available: false, borrowedBy: 'John Doe', dueDate: '2023-06-15', genre: 'Science Fiction' },
    { id: '3', title: 'Pride and Prejudice', author: 'Jane Austen', available: true, genre: 'Romance' },
    { id: '4', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', available: false, borrowedBy: 'Jane Smith', dueDate: '2023-06-20', genre: 'Fiction' },
  ]);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterAvailable, setFilterAvailable] = useState<boolean | null>(null);
  const [filterGenre, setFilterGenre] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchBooks = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        // Here you would typically fetch the books from an API
        // For now, we'll use the static data
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching books:', error);
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const filteredBooks = books.filter(book =>
    (book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterAvailable === null || book.available === filterAvailable) &&
    (filterGenre === null || book.genre === filterGenre)
  );

  const renderBookItem = ({ item }: { item: Book }) => (
    <View style={styles.bookItem}>
      <View style={styles.bookHeader}>
        <Text style={styles.bookTitle} numberOfLines={2} ellipsizeMode="tail">{item.title}</Text>
        <View style={[styles.statusIndicator, item.available ? styles.statusAvailable : styles.statusBorrowed]} />
      </View>
      <Text style={styles.bookAuthor} numberOfLines={1} ellipsizeMode="tail">{item.author}</Text>
      <Text style={styles.bookGenre}>{item.genre}</Text>
      <View style={styles.bookFooter}>
        <Text style={[styles.statusText, item.available ? styles.statusTextAvailable : styles.statusTextBorrowed]}>
          {item.available ? 'Available' : 'Borrowed'}
        </Text>
        {!item.available && (
          <View style={styles.borrowInfo}>
            <Text style={styles.borrowedBy}>{item.borrowedBy}</Text>
            <Text style={styles.dueDate}>Due: {item.dueDate}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const genres = Array.from(new Set(books.map(book => book.genre)));

  const resetFilters = () => {
    setFilterAvailable(null);
    setFilterGenre(null);
  };

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonSearchBar} />
      <View style={styles.skeletonSummary}>
        <View style={styles.skeletonSummaryItem} />
        <View style={styles.skeletonSummaryItem} />
        <View style={styles.skeletonSummaryItem} />
      </View>
      {[...Array(4)].map((_, index) => (
        <View key={index} style={styles.skeletonBookItem}>
          <View style={styles.skeletonBookTitle} />
          <View style={styles.skeletonBookAuthor} />
          <View style={styles.skeletonBookFooter} />
        </View>
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Icon name="book" size={80} color="#001529" />
      <Text style={styles.emptyStateTitle}>No Books Available</Text>
      <Text style={styles.emptyStateDescription}>There are no books in the library at this time. Check back later for updates.</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Library</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderSkeletonLoader()}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (books.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Library</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderEmptyState()}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Library</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#001529" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#4a4a4a"
          />
          <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={styles.filterButton}>
            <Icon name="options" size={24} color="#001529" />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryTitle}>Total Books</Text>
            <Text style={styles.summaryValue}>{books.length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryTitle}>Available</Text>
            <Text style={styles.summaryValue}>{books.filter(book => book.available).length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryTitle}>Borrowed</Text>
            <Text style={styles.summaryValue}>{books.filter(book => !book.available).length}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Book List</Text>
        <FlatList
          data={filteredBooks}
          renderItem={renderBookItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.bookList}
          scrollEnabled={false}
        />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Books</Text>
            
            <Text style={styles.filterLabel}>Availability:</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[styles.filterOption, filterAvailable === null && styles.filterOptionActive]}
                onPress={() => setFilterAvailable(null)}
              >
                <Text style={[styles.filterOptionText, filterAvailable === null && styles.filterOptionTextActive]}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, filterAvailable === true && styles.filterOptionActive]}
                onPress={() => setFilterAvailable(true)}
              >
                <Text style={[styles.filterOptionText, filterAvailable === true && styles.filterOptionTextActive]}>Available</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, filterAvailable === false && styles.filterOptionActive]}
                onPress={() => setFilterAvailable(false)}
              >
                <Text style={[styles.filterOptionText, filterAvailable === false && styles.filterOptionTextActive]}>Borrowed</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.filterLabel}>Genre:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroll}>
              <TouchableOpacity
                style={[styles.filterOption, filterGenre === null && styles.filterOptionActive]}
                onPress={() => setFilterGenre(null)}
              >
                <Text style={[styles.filterOptionText, filterGenre === null && styles.filterOptionTextActive]}>All</Text>
              </TouchableOpacity>
              {genres.map(genre => (
                <TouchableOpacity
                  key={genre}
                  style={[styles.filterOption, filterGenre === genre && styles.filterOptionActive]}
                  onPress={() => setFilterGenre(genre)}
                >
                  <Text style={[styles.filterOptionText, filterGenre === genre && styles.filterOptionTextActive]}>{genre}</Text>
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
  scrollContent: {
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
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
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    color: '#4a4a4a',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
    marginBottom: 10,
  },
  bookList: {
    paddingBottom: 20,
  },
  bookItem: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
    flex: 1,
    marginRight: 10,
  },
  bookAuthor: {
    fontSize: 16,
    color: '#4a4a4a',
    marginBottom: 4,
  },
  bookGenre: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bookFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  statusAvailable: {
    backgroundColor: '#52c41a',
  },
  statusBorrowed: {
    backgroundColor: '#f5222d',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusTextAvailable: {
    color: '#52c41a',
  },
  statusTextBorrowed: {
    color: '#f5222d',
  },
  borrowInfo: {
    alignItems: 'flex-end',
  },
  borrowedBy: {
    fontSize: 12,
    color: '#666',
  },
  dueDate: {
    fontSize: 12,
    color: '#f5222d',
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
  genreScroll: {
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
  skeletonContainer: {
    padding: 20,
  },
  skeletonSearchBar: {
    height: 50,
    backgroundColor: '#E1E9EE',
    borderRadius: 10,
    marginBottom: 20,
  },
  skeletonSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  skeletonSummaryItem: {
    width: '25%',
    height: 60,
    backgroundColor: '#E1E9EE',
    borderRadius: 10,
  },
  skeletonBookItem: {
    backgroundColor: '#E1E9EE',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  skeletonBookTitle: {
    height: 20,
    width: '80%',
    backgroundColor: '#D0D0D0',
    borderRadius: 4,
    marginBottom: 10,
  },
  skeletonBookAuthor: {
    height: 15,
    width: '60%',
    backgroundColor: '#D0D0D0',
    borderRadius: 4,
    marginBottom: 10,
  },
  skeletonBookFooter: {
    height: 15,
    width: '40%',
    backgroundColor: '#D0D0D0',
    borderRadius: 4,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#001529',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#8c8c8c',
    textAlign: 'center',
  },
});

export default LibraryScreen;
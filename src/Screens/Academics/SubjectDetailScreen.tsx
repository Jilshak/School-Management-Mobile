import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, TextInput, Modal, TouchableWithoutFeedback } from 'react-native';
import { Text, Icon, Card } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

interface Chapter {
    chapterId: string;
    chapterName: string;
    chapterDescription: string;
    filePath: string;
    _id: string;
    completed?: boolean;
    estimatedHours?: number;
    resources?: Resource[];  // Changed from topics to resources
}

type SubjectDetailScreenProps = {
  navigation: StackNavigationProp<any, 'SubjectDetail'>;
  route: RouteProp<{
    SubjectDetail: {
      subject: string;
      subjectId: string;
      chapters: Chapter[];
    }
  }, 'SubjectDetail'>;
};

type Resource = {
    resourceId: string;
    resourceName: string;
    resourceType: string;  // e.g., 'pdf', 'video', 'link'
    resourceUrl: string;
};

type SyllabusItem = {
    id: string;
    title: string;
    chapterDescription: string;
    completed: boolean;
    estimatedHours: number;
    resources: Resource[];  // Changed from topics to resources
};

const SubjectDetailScreen: React.FC<SubjectDetailScreenProps> = ({ navigation, route }) => {
  const { subject, chapters } = route.params;
  const [activeTab, setActiveTab] = useState<'chapters' | 'resources'>('chapters'); // Changed from 'syllabus'
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [highlightedResourceId, setHighlightedResourceId] = useState<string | null>(null);


  // Transform chapters data to match your syllabus structure
  const formattedSyllabus: SyllabusItem[] = chapters.map((chapter) => ({
    id: chapter._id,  // Use _id instead of chapterId
    title: chapter.chapterName,
    chapterDescription: chapter.chapterDescription || 'No description available',
    completed: chapter.completed || false,
    estimatedHours: chapter.estimatedHours || 2,
    resources: [
        {
            resourceId: chapter._id,
            resourceName: `${chapter.chapterName} PDF`,
            resourceType: 'pdf',
            resourceUrl: chapter.filePath
        },
        ...(chapter.resources || [])
    ]
  }));

  const renderSyllabusItem = ({ item }: { item: SyllabusItem }) => {
    if (!item) return null;

    const isExpanded = expandedId === item.id;

    const toggleExpand = () => {
      setExpandedId(isExpanded ? null : item.id);
    };

    const handleResourceClick = (resource: Resource) => {
      setActiveTab('resources');
      setHighlightedResourceId(resource.resourceId);
      
      // Remove highlight after 2 seconds
      setTimeout(() => {
        setHighlightedResourceId(null);
      }, 2000);
    };

    return (
      <TouchableOpacity 
        style={styles.syllabusItem} 
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.syllabusContent}>
          <View style={[
            styles.syllabusHeader,
            isExpanded && styles.syllabusHeaderExpanded
          ]}>
            <View style={styles.titleContainer}>
              <View style={styles.chapterIconContainer}>
                <Icon name="read" size={24} color="#001529" />
              </View>
              <View style={styles.titleTextContainer}>
                <Text style={styles.chapterTitle}>{item.title}</Text>
                {!isExpanded && (
                  <Text style={styles.resourcesCount}>
                    {item.resources.length} {item.resources.length === 1 ? 'Resource' : 'Resources'}
                  </Text>
                )}
              </View>
            </View>
            <Icon 
              name={isExpanded ? "up" : "down"} 
              size={20} 
              color="#001529" 
            />
          </View>

          {isExpanded && (
            <>
              <View style={styles.descriptionContainer}>
                <View style={styles.descriptionHeader}>
                  <Icon 
                    name="info-circle" 
                    size={16} 
                    color="#001529" 
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.descriptionTitle}>Description</Text>
                </View>
                <Text style={styles.chapterDescription}>{item.chapterDescription}</Text>
              </View>

              {item.resources && item.resources.length > 0 && (
                <View style={styles.resourcesContainer}>
                  <View style={styles.resourcesHeader}>
                    <View style={styles.resourcesIconContainer}>
                      <Icon name="folder" size={16} color="#001529" />
                    </View>
                    <Text style={styles.resourcesHeaderText}>
                      Resources ({item.resources.length})
                    </Text>
                  </View>
                  <View style={styles.resourcesList}>
                    {item.resources.map((resource) => (
                      <TouchableOpacity 
                        key={resource.resourceId} 
                        style={styles.resourceItem}
                        onPress={() => handleResourceClick(resource)}
                      >
                        <Icon 
                          name="file-pdf"
                          size={20} 
                          color="#001529" 
                          style={styles.resourceIcon} 
                        />
                        <Text style={styles.resourceText}>
                          {resource.resourceName}
                        </Text>
                        <Icon name="right" size={16} color="#001529" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const filteredContent = () => {
    let content = formattedSyllabus;
    if (selectedFilter === 'Completed') content = content.filter(item => item.completed);
    if (selectedFilter === 'Incomplete') content = content.filter(item => !item.completed);
    
    return content.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilterOptions = () => ['All', 'Completed', 'Incomplete'];

  const renderResourcesContent = () => {
    // Group resources by chapter
    const resourcesByChapter = formattedSyllabus.map(chapter => ({
        chapterName: chapter.title,
        resources: chapter.resources
    }));
    
    if (resourcesByChapter.every(chapter => chapter.resources.length === 0)) {
        return (
            <View style={styles.emptyStateContainer}>
                <Icon name="file-text" size={80} color="#001529" />
                <Text style={styles.emptyStateTitle}>No Resources Available</Text>
                <Text style={styles.emptyStateDescription}>
                    There are no learning resources available for this subject at this time.
                </Text>
            </View>
        );
    }

    const handleResourcePress = (resource: Resource) => {
        console.log('Opening resource:', resource.resourceUrl);
    };

    return (
        <FlatList
            data={resourcesByChapter}
            keyExtractor={(item, index) => `chapter-${index}`}
            renderItem={({ item: chapter }) => (
                chapter.resources.length > 0 ? (
                    <View style={styles.chapterResourcesContainer}>
                        <Text style={styles.chapterResourcesTitle}>{chapter.chapterName}</Text>
                        {chapter.resources.map(resource => (
                            <TouchableOpacity 
                                key={resource.resourceId}
                                style={[
                                    styles.resourceListItem,
                                    highlightedResourceId === resource.resourceId && styles.highlightedResource
                                ]}
                                onPress={() => handleResourcePress(resource)}
                            >
                                <View style={styles.resourceIconContainer}>
                                    <Icon 
                                        name={resource.resourceType === 'pdf' ? 'file-pdf' : 'file-text'} 
                                        size={24} 
                                        color="#001529" 
                                    />
                                </View>
                                <View style={styles.resourceItemContent}>
                                    <Text style={styles.resourceItemTitle}>{resource.resourceName}</Text>
                                    <Text style={styles.resourceItemType}>
                                        {resource.resourceType.toUpperCase()}
                                    </Text>
                                </View>
                                <Icon name="right" size={16} color="#001529" />
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : null
            )}
            contentContainerStyle={styles.resourcesList}
            ItemSeparatorComponent={() => <View style={styles.resourceSeparator} />}
        />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{subject}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#001529" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.filterButton}>
            <Icon name="filter" size={24} color="#001529" />
          </TouchableOpacity>
        </View>

        {/* Add back the tab container */}
        <View style={styles.tabContainer}>
          {['chapters', 'resources'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab as 'chapters' | 'resources')}
            >
              <Icon 
                name={tab === 'chapters' ? 'book' : 'folder'} 
                size={18} 
                color={activeTab === tab ? '#ffffff' : '#8c8c8c'} 
                style={styles.tabIcon}
              />
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'chapters' ? (
          <FlatList
            data={filteredContent()}
            extraData={expandedId}
            keyExtractor={(item) => item.id}
            renderItem={renderSyllabusItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => (
              <View style={styles.emptyStateContainer}>
                <Icon name="file-unknown" size={80} color="#001529" />
                <Text style={styles.emptyStateTitle}>No Chapters Available</Text>
                <Text style={styles.emptyStateDescription}>
                  There are no chapters available for this subject at this time.
                </Text>
              </View>
            )}
          />
        ) : (
          renderResourcesContent()
        )}
      </View>

      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowFilterModal(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Filter Syllabus</Text>
                <View style={styles.filterOptions}>
                  {getFilterOptions().map((filter) => (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.filterOption,
                        selectedFilter === filter && styles.filterOptionActive
                      ]}
                      onPress={() => {
                        setSelectedFilter(filter);
                        setShowFilterModal(false);
                      }}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        selectedFilter === filter && styles.filterOptionTextActive
                      ]}>
                        {filter}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={() => setShowFilterModal(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
    height: 60,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    marginTop: 90,
    paddingHorizontal: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#001529', // Changed to header color
  },
  tabIcon: {
    marginRight: 4,
  },
  tabText: {
    fontSize: 15,
    color: '#8c8c8c',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#ffffff', // Changed to white for contrast
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  syllabusItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  syllabusContent: {
    padding: 12,
  },
  syllabusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  syllabusHeaderExpanded: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chapterIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0', // Lighter background for black icons
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#001529',
    flex: 1,
  },
  descriptionContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#001529',
    marginLeft: 8,
  },
  chapterDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    paddingLeft: 24, // Aligns with the description title
  },
  resourcesContainer: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 12,
  },
  resourcesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resourcesIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0', // Lighter background for black icons
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  resourcesHeaderText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#001529',
  },
  resourcesList: {
    paddingLeft: 4,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f5ff',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    paddingRight: 12, // Added to give some space for the arrow
  },
  resourceIcon: {
    marginRight: 8,
  },
  resourceText: {
    fontSize: 14,
    color: '#001529',
    flex: 1,
    marginLeft: 8,
    marginRight: 8, // Added to give space between text and arrow
  },
  resourceInfo: {
    flex: 1,
    marginLeft: 10,
  },
  resourceTitle: {
    fontSize: 16,
    color: '#001529',
  },
  resourceDetails: {
    fontSize: 12,
    color: '#4a4a4a',
  },
  assignmentCard: {
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#001529',
  },
  assignmentDueDate: {
    fontSize: 14,
    color: '#4a4a4a',
    marginBottom: 5,
  },
  assignmentDetails: {
    fontSize: 14,
    color: '#4a4a4a',
    marginBottom: 5,
  },
  assignmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  assignmentStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  assignmentGrade: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1890ff',
  },
  filterButton: {
    padding: 5,
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
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
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
  closeButton: {
    backgroundColor: '#001529',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skeletonContainer: {
    padding: 20,
  },
  skeletonSearchBar: {
    height: 40,
    backgroundColor: '#E1E9EE',
    borderRadius: 10,
    marginBottom: 20,
  },
  skeletonTabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  skeletonTab: {
    width: '30%',
    height: 40,
    backgroundColor: '#E1E9EE',
    borderRadius: 10,
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  skeletonCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  skeletonTitle: {
    width: '70%',
    height: 20,
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
  },
  skeletonIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#E1E9EE',
    borderRadius: 10,
  },
  skeletonDescription: {
    height: 15,
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
    marginBottom: 10,
  },
  skeletonDetails: {
    height: 15,
    backgroundColor: '#E1E9EE',
    width: '50%',
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
  titleTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  resourcesCount: {
    fontSize: 12,
    color: '#8c8c8c',
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resourceListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  resourceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0', // Lighter background for black icons
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceItemContent: {
    flex: 1,
  },
  resourceItemTitle: {
    fontSize: 16,
    color: '#001529',
    fontWeight: '500',
  },
  resourceItemType: {
    fontSize: 12,
    color: '#8c8c8c',
    marginTop: 4,
  },
  resourceSeparator: {
    height: 16,
  },

  highlightedResource: {
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 4,
    borderLeftColor: '#001529',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chapterResourcesContainer: {
    marginBottom: 20,
  },
  chapterResourcesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#001529',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
});

export default SubjectDetailScreen;

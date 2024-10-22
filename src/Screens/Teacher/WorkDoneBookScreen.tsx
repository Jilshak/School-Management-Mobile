import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Animated, Dimensions, Modal, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Icon, List } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Calendar, DateData } from 'react-native-calendars';
import { fetchAllClassrooms } from '../../Services/Classroom/ClassroomService';
import useProfileStore from '../../store/profileStore';
import { createWorkDoneBook } from '../../Services/WorkDoneBook/WorkDoneBookService';

type WorkDoneBookScreenProps = {
  navigation: StackNavigationProp<any, 'WorkDoneBook'>;
};

const { height } = Dimensions.get('window');

interface WorkLogEntry {
  class: string;
  subject: string;
  topics: string[];
  activities: string[];
  homework: string[];
  showActivities: boolean;
  showHomework: boolean;
}

interface ClassSubjectPair {
  class: string;
  subject: string;
}

interface Classroom {
  _id: string;
  name: string;
  subjects: Subject[];
}

interface Subject {
  _id: string;
  name: string;
  code: string;
}

// Add these interfaces at the top of the file, after the existing interfaces
interface WorkDoneBookEntry {
  classroomId: string;
  subjectId: string;
  date: Date;
  topics: string[];
  activities: string[];
  homework: string[];
}

const WorkDoneBookScreen: React.FC<WorkDoneBookScreenProps> = ({ navigation }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [markedDates, setMarkedDates] = useState<{[key: string]: any}>({});
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [currentTopic, setCurrentTopic] = useState('');
  const [activities, setActivities] = useState<string[]>([]);
  const [homework, setHomework] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'class' | 'subject' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [slideAnim] = useState(new Animated.Value(-height));
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [classSubjectPairs, setClassSubjectPairs] = useState<ClassSubjectPair[]>([]);
  const [workLogs, setWorkLogs] = useState<(WorkLogEntry & { classroomId?: string; subjectId?: string })[]>([]);
  const [currentActivity, setCurrentActivity] = useState('');
  const [currentHomework, setCurrentHomework] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSelection, setActiveSelection] = useState<'class' | 'subject' | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  const { profile } = useProfileStore();

  useEffect(() => {
    fetchClassroomsData();
    setMarkedDates({
      [date]: { selected: true, selectedColor: '#001529' }
    });
  }, []);

  const fetchClassroomsData = async () => {
    try {
      const response = await fetchAllClassrooms();
      setClassrooms(response.classrooms);
      const classNames = response.classrooms.map(classroom => classroom.name);
      setClasses(classNames);
      
      const allSubjects = new Set<string>();
      response.classrooms.forEach(classroom => {
        classroom.subjects.forEach(subject => {
          allSubjects.add(subject.name);
        });
      });
      setSubjects(Array.from(allSubjects));
    } catch (error) {
      console.error('Error fetching classrooms:', error);
    }
  };

  const handleDayPress = (day: DateData) => {
    setDate(day.dateString);
    setMarkedDates({
      [day.dateString]: { selected: true, selectedColor: '#001529' }
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const addTopic = () => {
    if (currentTopic.trim() && !topics.includes(currentTopic.trim())) {
      setTopics([...topics, currentTopic.trim()]);
      setCurrentTopic('');
    }
  };

  const removeTopic = (topicToRemove: string) => {
    setTopics(topics.filter(topic => topic !== topicToRemove));
  };

  const openDropdown = (type: 'class' | 'subject') => {
    setActiveDropdown(type);
    setSearchQuery('');
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDropdown = () => {
    Animated.timing(slideAnim, {
      toValue: -height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setActiveDropdown(null));
  };

  const renderSlider = () => {
    const items = activeDropdown === 'class' ? classes : subjects;
    const filteredItems = items.filter(item => 
      item.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <Animated.View 
        style={[
          styles.sliderContainer, 
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.sliderHeader}>
          <Text style={styles.sliderTitle}>
            Select {activeDropdown === 'class' ? 'Class' : 'Subject'}
          </Text>
          <TouchableOpacity onPress={closeDropdown}>
            <Icon name="close" size={24} color="#001529" />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <ScrollView>
          <List>
            {filteredItems.map((item, index) => (
              <List.Item
                key={index}
                onPress={() => {
                  activeDropdown === 'class' ? setClassName(item) : setSubject(item);
                  closeDropdown();
                }}
              >
                <Text style={
                  (activeDropdown === 'class' ? className : subject) === item 
                    ? styles.selectedItem 
                    : null
                }>
                  {item}
                </Text>
              </List.Item>
            ))}
          </List>
        </ScrollView>
      </Animated.View>
    );
  };

  const toggleSelection = (item: string, selectedItems: string[], setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>) => {
    setSelectedItems(prevSelected => 
      prevSelected.includes(item)
        ? prevSelected.filter(i => i !== item)
        : [...prevSelected, item]
    );
  };

  const openModal = (type: 'class' | 'subject') => {
    setActiveSelection(type);
    setModalVisible(true);
    setSearchQuery('');
  };

  const closeModal = () => {
    setModalVisible(false);
    setActiveSelection(null);
  };

  const renderSelectionModal = () => {
    const items = activeSelection === 'class' ? classes : subjects;
    const selectedItems = activeSelection === 'class' ? selectedClasses : selectedSubjects;
    const setSelectedItems = activeSelection === 'class' ? setSelectedClasses : setSelectedSubjects;

    const filteredItems = items.filter(item => 
      item.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select {activeSelection === 'class' ? 'Classes' : 'Subjects'}</Text>
                <View style={styles.searchContainer}>
                  <Icon name="search" size={20} color="#001529" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#8c8c8c"
                  />
                </View>
                <ScrollView style={styles.optionsList}>
                  {filteredItems.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.filterOption,
                        selectedItems.includes(item) && styles.filterOptionActive,
                      ]}
                      onPress={() => toggleSelection(item, selectedItems, setSelectedItems)}
                    >
                      <Text style={styles.filterOptionText}>{item}</Text>
                      {selectedItems.includes(item) && (
                        <Icon name="check" size={20} color="#001529" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={closeModal}
                >
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  const addClassSubjectPair = () => {
    if (selectedClasses.length > 0 && selectedSubjects.length > 0) {
      const newPairs = selectedClasses.flatMap(className => 
        selectedSubjects.map(subject => ({
          class: className,
          subject: subject
        }))
      );
      
      // Filter out pairs that already exist
      const uniqueNewPairs = newPairs.filter(newPair => 
        !classSubjectPairs.some(existingPair => 
          existingPair.class === newPair.class && existingPair.subject === newPair.subject
        )
      );

      if (uniqueNewPairs.length > 0) {
        setClassSubjectPairs([...classSubjectPairs, ...uniqueNewPairs]);
      }
    }
  };

  const removeClassSubjectPair = (index: number) => {
    const pairToRemove = classSubjectPairs[index];
    const updatedPairs = classSubjectPairs.filter((_, i) => i !== index);
    setClassSubjectPairs(updatedPairs);

    // Remove corresponding work log entry
    const updatedWorkLogs = workLogs.filter(
      entry => !(entry.class === pairToRemove.class && entry.subject === pairToRemove.subject)
    );
    setWorkLogs(updatedWorkLogs);
  };

  const addWorkLogEntry = () => {
    const newEntries = classSubjectPairs.map(pair => {
      const classroom = classrooms.find(c => c.name === pair.class);
      const subject = classroom?.subjects.find(s => s.name === pair.subject);
      return {
        class: pair.class,
        subject: pair.subject,
        classroomId: classroom?._id,
        subjectId: subject?._id,
        topics: [],
        activities: [],
        homework: [],
        showActivities: false,
        showHomework: false
      };
    });

    const uniqueNewEntries = newEntries.filter(newEntry => 
      !workLogs.some(existingEntry => 
        existingEntry.classroomId === newEntry.classroomId && existingEntry.subjectId === newEntry.subjectId
      )
    );

    if (uniqueNewEntries.length > 0) {
      setWorkLogs([...workLogs, ...uniqueNewEntries]);
    }
  };

  const updateWorkLogEntry = (index: number, field: keyof WorkLogEntry, value: any) => {
    const updatedLogs = [...workLogs];
    updatedLogs[index] = { ...updatedLogs[index], [field]: value };
    setWorkLogs(updatedLogs);
  };

  const removeWorkLogEntry = (index: number) => {
    const entryToRemove = workLogs[index];
    const updatedLogs = workLogs.filter((_, i) => i !== index);
    setWorkLogs(updatedLogs);

    const updatedPairs = classSubjectPairs.filter(
      pair => !(pair.class === entryToRemove.class && pair.subject === entryToRemove.subject)
    );
    setClassSubjectPairs(updatedPairs);
  };

  const areAllWorkLogsValid = () => {
    return workLogs.every(entry => 
      entry.topics.length > 0 || entry.activities.length > 0 || entry.homework.length > 0
    );
  };

  const handleSubmit = () => {
    if (areAllWorkLogsValid()) {
      setShowConfirmationModal(true);
    } else {
      // Show an error message or toast
      console.log('Please ensure all work log entries have at least one topic, activity, or homework.');
    }
  };

  const formatDateToLocalTimeZone = (): string => {
    const inputDate = new Date(date);
    const localDate = new Date(inputDate.getTime() - inputDate.getTimezoneOffset() * 60000);
    return localDate.toISOString().split('T')[0];
  };


  const confirmSubmission = async () => {
    const formattedWorkLogs: WorkDoneBookEntry[] = workLogs
      .filter(entry => entry.classroomId && entry.subjectId) // Ensure we only include entries with valid IDs
      .map(entry => ({
        classroomId: entry.classroomId!,
        subjectId: entry.subjectId!,
        date: new Date(formatDateToLocalTimeZone()),
        topics: entry.topics,
        activities: entry.activities,
        homework: entry.homework,
      }));

    try {
      const response = await createWorkDoneBook(formattedWorkLogs);
      setShowConfirmationModal(false);
      navigation.goBack();
    } catch (error) {
      console.error('Error submitting work logs:', error);
    }
  };

  const renderConfirmationModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showConfirmationModal}
      onRequestClose={() => setShowConfirmationModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Confirm Submission</Text>
          <ScrollView style={styles.confirmationScrollView}>
            <Text style={styles.confirmationDate}>Date: {formatDate(date)}</Text>
            {workLogs.map((entry, index) => (
              <View key={index} style={styles.confirmationEntry}>
                <Text style={styles.confirmationHeader}>{entry.class} - {entry.subject}</Text>
                {entry.topics.length > 0 && (
                  <View style={styles.confirmationSection}>
                    <View style={styles.sectionHeaderContainer}>
                      <Icon name="book" size={16} color="#001529" />
                      <Text style={styles.confirmationSubHeader}>Topics:</Text>
                    </View>
                    <View style={styles.itemsContainer}>
                      {entry.topics.map((topic, i) => (
                        <Text key={i} style={styles.confirmationItem}>• {topic}</Text>
                      ))}
                    </View>
                  </View>
                )}
                {entry.activities.length > 0 && (
                  <View style={styles.confirmationSection}>
                    <View style={styles.sectionHeaderContainer}>
                      <Icon name="experiment" size={16} color="#001529" />
                      <Text style={styles.confirmationSubHeader}>Activities:</Text>
                    </View>
                    <View style={styles.itemsContainer}>
                      {entry.activities.map((activity, i) => (
                        <Text key={i} style={styles.confirmationItem}>• {activity}</Text>
                      ))}
                    </View>
                  </View>
                )}
                {entry.homework.length > 0 && (
                  <View style={styles.confirmationSection}>
                    <View style={styles.sectionHeaderContainer}>
                      <Icon name="home" size={16} color="#001529" />
                      <Text style={styles.confirmationSubHeader}>Homework:</Text>
                    </View>
                    <View style={styles.itemsContainer}>
                      {entry.homework.map((hw, i) => (
                        <Text key={i} style={styles.confirmationItem}>• {hw}</Text>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowConfirmationModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={confirmSubmission}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderWorkLogEntries = () => {
    // ... (existing code remains the same)

    // After rendering all entries, call areAllWorkLogsValid
    const allValid = areAllWorkLogsValid();

    // Return the rendered entries
    return (
      <>
        {workLogs.map((entry, index) => (
          <View key={index} style={styles.workLogEntry}>
            <Text style={styles.workLogHeader}>{entry.class} - {entry.subject}</Text>
            <TouchableOpacity style={styles.removeEntryButton} onPress={() => removeWorkLogEntry(index)}>
              <Icon name="close" size={20} color="#001529" />
            </TouchableOpacity>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Topics Covered</Text>
              <View style={styles.topicInputContainer}>
                <TextInput
                  style={styles.topicInput}
                  value={currentTopic}
                  onChangeText={setCurrentTopic}
                  placeholder="Enter a topic"
                  onSubmitEditing={() => {
                    if (currentTopic.trim()) {
                      updateWorkLogEntry(index, 'topics', [...entry.topics, currentTopic.trim()]);
                      setCurrentTopic('');
                    }
                  }}
                />
                <TouchableOpacity 
                  style={styles.addTopicButton} 
                  onPress={() => {
                    if (currentTopic.trim()) {
                      updateWorkLogEntry(index, 'topics', [...entry.topics, currentTopic.trim()]);
                      setCurrentTopic('');
                    }
                  }}
                >
                  <Icon name="plus" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
              <View style={styles.topicsContainer}>
                {entry.topics.map((topic, topicIndex) => (
                  <View key={topicIndex} style={styles.topicChip}>
                    <Text style={styles.topicChipText}>{topic}</Text>
                    <TouchableOpacity onPress={() => {
                      const updatedTopics = entry.topics.filter((_, i) => i !== topicIndex);
                      updateWorkLogEntry(index, 'topics', updatedTopics);
                    }}>
                      <Icon name="close" size={16} color="#001529" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.activitiesButton}
              onPress={() => {
                updateWorkLogEntry(index, 'showActivities', !entry.showActivities);
              }}
            >
              <Text style={styles.activitiesButtonText}>
                {entry.showActivities ? 'Hide Activities' : 'Add Activities'}
              </Text>
              <Icon name={entry.showActivities ? 'up' : 'down'} size={16} color="#ffffff" />
            </TouchableOpacity>
            {entry.showActivities && (
              <View>
                <View style={styles.topicInputContainer}>
                  <TextInput
                    style={styles.topicInput}
                    value={currentActivity}
                    onChangeText={setCurrentActivity}
                    placeholder="Enter an activity"
                    onSubmitEditing={() => {
                      if (currentActivity.trim()) {
                        updateWorkLogEntry(index, 'activities', [...entry.activities, currentActivity.trim()]);
                        setCurrentActivity('');
                      }
                    }}
                  />
                  <TouchableOpacity 
                    style={styles.addTopicButton} 
                    onPress={() => {
                      if (currentActivity.trim()) {
                        updateWorkLogEntry(index, 'activities', [...entry.activities, currentActivity.trim()]);
                        setCurrentActivity('');
                      }
                    }}
                  >
                    <Icon name="plus" size={24} color="#ffffff" />
                  </TouchableOpacity>
                </View>
                <View style={styles.topicsContainer}>
                  {entry.activities.map((activity, activityIndex) => (
                    <View key={activityIndex} style={styles.topicChip}>
                      <Text style={styles.topicChipText}>{activity}</Text>
                      <TouchableOpacity onPress={() => {
                        const updatedActivities = entry.activities.filter((_, i) => i !== activityIndex);
                        updateWorkLogEntry(index, 'activities', updatedActivities);
                      }}>
                        <Icon name="close" size={16} color="#001529" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.activitiesButton}
              onPress={() => {
                updateWorkLogEntry(index, 'showHomework', !entry.showHomework);
              }}
            >
              <Text style={styles.activitiesButtonText}>
                {entry.showHomework ? 'Hide Homework' : 'Add Homework'}
              </Text>
              <Icon name={entry.showHomework ? 'up' : 'down'} size={16} color="#ffffff" />
            </TouchableOpacity>
            {entry.showHomework && (
              <View>
                <View style={styles.topicInputContainer}>
                  <TextInput
                    style={styles.topicInput}
                    value={currentHomework}
                    onChangeText={setCurrentHomework}
                    placeholder="Enter homework"
                    onSubmitEditing={() => {
                      if (currentHomework.trim()) {
                        updateWorkLogEntry(index, 'homework', [...entry.homework, currentHomework.trim()]);
                        setCurrentHomework('');
                      }
                    }}
                  />
                  <TouchableOpacity 
                    style={styles.addTopicButton} 
                    onPress={() => {
                      if (currentHomework.trim()) {
                        updateWorkLogEntry(index, 'homework', [...entry.homework, currentHomework.trim()]);
                        setCurrentHomework('');
                      }
                    }}
                  >
                    <Icon name="plus" size={24} color="#ffffff" />
                  </TouchableOpacity>
                </View>
                <View style={styles.topicsContainer}>
                  {entry.homework.map((homework, homeworkIndex) => (
                    <View key={homeworkIndex} style={styles.topicChip}>
                      <Text style={styles.topicChipText}>{homework}</Text>
                      <TouchableOpacity onPress={() => {
                        const updatedHomework = entry.homework.filter((_, i) => i !== homeworkIndex);
                        updateWorkLogEntry(index, 'homework', updatedHomework);
                      }}>
                        <Icon name="close" size={16} color="#001529" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}
        <TouchableOpacity 
          style={[
            styles.submitButton,
            (!workLogs.length || !allValid) && styles.disabledButton
          ]} 
          onPress={handleSubmit}
          disabled={!workLogs.length || !allValid}
        >
          <Icon name="check-circle" size={20} color="#ffffff" style={styles.buttonIcon} />
          <Text style={styles.submitButtonText}>Submit Work Log</Text>
        </TouchableOpacity>
      </>
    );
  };

  const renderClassSubjectPairs = () => {
    return classSubjectPairs.map((pair, index) => (
      <View key={index} style={styles.pairContainer}>
        <Text style={styles.pairText}>{pair.class} - {pair.subject}</Text>
        <TouchableOpacity 
          style={styles.removePairButton} 
          onPress={() => removeClassSubjectPair(index)}
        >
          <Icon name="close" size={20} color="#001529" />
        </TouchableOpacity>
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{flex: 1}}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Work Done Book</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.contentContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Daily Work Log</Text>

            <View style={styles.dateContainer}>
              <Calendar
                style={styles.calendar}
                onDayPress={handleDayPress}
                markedDates={markedDates}
                theme={{
                  backgroundColor: '#ffffff',
                  calendarBackground: '#ffffff',
                  textSectionTitleColor: '#b6c1cd',
                  selectedDayBackgroundColor: '#001529',
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: '#001529',
                  dayTextColor: '#2d4150',
                  textDisabledColor: '#d9e1e8',
                  dotColor: '#001529',
                  selectedDotColor: '#ffffff',
                  arrowColor: '#001529',
                  monthTextColor: '#001529',
                  indicatorColor: '#001529',
                  textDayFontWeight: '300',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '300',
                  textDayFontSize: 16,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 16
                }}
              />
              <View style={styles.selectedDateContainer}>
                <Text style={styles.selectedDateText}>Selected Date: {formatDate(date)}</Text>
                <TouchableOpacity 
                  style={styles.clearDateButton}
                  onPress={() => {
                    const currentDate = new Date().toISOString().split('T')[0];
                    setDate(currentDate);
                    setMarkedDates({
                      [currentDate]: { selected: true, selectedColor: '#001529' }
                    });
                  }}
                >
                  <Icon name="reload" size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Classes</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => openModal('class')}
              >
                <Text>{selectedClasses.length > 0 ? selectedClasses.join(', ') : 'Select classes'}</Text>
                <Icon name="down" size={16} color="#001529" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Subjects</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => openModal('subject')}
              >
                <Text>{selectedSubjects.length > 0 ? selectedSubjects.join(', ') : 'Select subjects'}</Text>
                <Icon name="down" size={16} color="#001529" />
              </TouchableOpacity>
            </View>

            {selectedClasses.length > 0 && selectedSubjects.length > 0 && (
              <TouchableOpacity 
                style={styles.addEntryButton}
                onPress={addClassSubjectPair}
              >
                <Icon name="plus-circle" size={20} color="#ffffff" style={styles.buttonIcon} />
                <Text style={styles.addEntryButtonText}>Add Class-Subject Pair</Text>
              </TouchableOpacity>
            )}

            {renderClassSubjectPairs()}

            {classSubjectPairs.length > 0 && (
              <TouchableOpacity 
                style={styles.addEntryButton}
                onPress={addWorkLogEntry}
              >
                <Icon name="form" size={20} color="#ffffff" style={styles.buttonIcon} />
                <Text style={styles.addEntryButtonText}>Generate Work Log Entries</Text>
              </TouchableOpacity>
            )}

            {renderWorkLogEntries()}
          </View>
        </ScrollView>

        {renderSelectionModal()}
        {renderConfirmationModal()}
      </KeyboardAvoidingView>
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
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#4a4a4a',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#001529',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateContainer: {
    marginBottom: 20,
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  selectedDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e6f7ff',
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#001529',
  },
  clearDateButton: {
    backgroundColor: '#001529',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedItem: {
    fontWeight: 'bold',
    color: '#001529',
  },
  sliderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    zIndex: 1000,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sliderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#ffffff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#001529',
    marginBottom: 15,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    color: '#001529',
  },
  optionsList: {
    maxHeight: '60%',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterOptionActive: {
    backgroundColor: '#e6f7ff',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#001529',
  },
  applyButton: {
    backgroundColor: '#001529',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  workLogEntry: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  workLogHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001529',
    marginBottom: 10,
  },
  removeEntryButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  addEntryButton: {
    backgroundColor: '#001529',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  addEntryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pairContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e6f7ff',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  pairText: {
    fontSize: 16,
    color: '#001529',
  },
  removePairButton: {
    padding: 5,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonIcon: {
    marginRight: 8,
  },
  topicInputContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  topicInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginRight: 10,
  },
  addTopicButton: {
    backgroundColor: '#001529',
    borderRadius: 5,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7ff',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  topicChipText: {
    color: '#001529',
    marginRight: 5,
    flexShrink: 1,
  },
  activitiesButton: {
    backgroundColor: '#001529',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  activitiesButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmationScrollView: {
    flexGrow: 1,
    marginBottom: 10,
    maxHeight: '90%', // Changed from 70% to 90%
  },
  confirmationDate: {
    fontSize: 16, // Reduced from 18
    fontWeight: 'bold',
    marginBottom: 8, // Reduced from 10
    color: '#001529',
  },
  confirmationEntry: {
    marginBottom: 15,
    backgroundColor: '#f0f2f5',
    borderRadius: 10,
    padding: 15,
  },
  confirmationHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#001529',
  },
  confirmationSection: {
    marginBottom: 10,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  confirmationSubHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001529',
    marginLeft: 5,
  },
  itemsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    padding: 10,
  },
  confirmationItem: {
    fontSize: 14,
    color: '#4a4a4a',
    marginBottom: 3,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 10, // Reduced from 12
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#001529',
  },
  cancelButtonText: {
    fontSize: 14, // Reduced from 16
    fontWeight: 'bold',
    color: '#001529',
  },
  confirmButtonText: {
    fontSize: 14, // Reduced from 16
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
});

export default WorkDoneBookScreen;

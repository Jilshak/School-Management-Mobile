import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Text, Icon, Button } from "@ant-design/react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Calendar, DateData } from "react-native-calendars";
import { fetchAllClassrooms } from "../../Services/Classroom/ClassroomService";
import { createWorkDoneBook } from "../../Services/WorkDoneBook/WorkDoneBookService";
import AsyncStorage from "@react-native-async-storage/async-storage";

type LessonPlanScreenProps = {
  navigation: StackNavigationProp<any, "WorkDoneBook">;
};

const { height } = Dimensions.get("window");

interface WorkLogEntry {
  class: string;
  subject: string;
  topics: string[];
  activities: string[];
  chapters: string[]; // New field
  objectives: string[]; // New field
  corePoints: string[]; // New field
  evaluations: string[]; // New field
  learningOutcomes: string[]; // New field
  showActivities: boolean;
  showChapters: boolean; // New field
  showObjectives: boolean; // New field
  showCorePoints: boolean; // New field
  showEvaluations: boolean; // New field
  showLearningOutcomes: boolean; // New field
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
  chapters: string[]; // New field
  objectives: string[]; // New field
  corePoints: string[]; // New field
  evaluations: string[]; // New field
  learningOutcomes: string[]; // New field
  homework: string[]; // Add this line
}

const FallbackCard: React.FC<{ style?: any; children: React.ReactNode }> = ({
  style,
  children,
}) => <View style={[styles.card, style]}>{children}</View>;

const LessonPlanScreen: React.FC<LessonPlanScreenProps> = ({ navigation }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [currentTopic, setCurrentTopic] = useState("");
  const [activities, setActivities] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<
    "class" | "subject" | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [slideAnim] = useState(new Animated.Value(-height));
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [classSubjectPairs, setClassSubjectPairs] = useState<
    ClassSubjectPair[]
  >([]);
  const [workLogs, setWorkLogs] = useState<
    (WorkLogEntry & { classroomId?: string; subjectId?: string })[]
  >([]);
  const [currentActivity, setCurrentActivity] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSelection, setActiveSelection] = useState<
    "class" | "subject" | null
  >(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isCachedData, setIsCachedData] = useState(false);
  const [showClassSubjectPairs, setShowClassSubjectPairs] = useState(false);
  const [showWorkLogEntries, setShowWorkLogEntries] = useState(false);
  const [isCacheCleared, setIsCacheCleared] = useState(false);
  const [showCacheClearedMessage, setShowCacheClearedMessage] = useState(false);
  const [currentChapter, setCurrentChapter] = useState("");
  const [currentObjective, setCurrentObjective] = useState("");
  const [currentCorePoint, setCurrentCorePoint] = useState("");
  const [currentEvaluation, setCurrentEvaluation] = useState("");
  const [currentLearningOutcome, setCurrentLearningOutcome] = useState("");

  useEffect(() => {
    fetchClassroomsData();
    loadCachedData();
  }, []);

  useEffect(() => {
    let timer: number;
    if (showCacheClearedMessage) {
      timer = setTimeout(() => {
        setShowCacheClearedMessage(false);
      }, 5000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [showCacheClearedMessage]);

  // Add this useEffect to auto-select current week's range when component mounts
  useEffect(() => {
    selectCurrentWeek();
  }, []);

  // Add this function to select the current week
  const selectCurrentWeek = () => {
    const currentDate = new Date();
    const currentDay = {
      dateString: currentDate.toISOString().split('T')[0],
      day: currentDate.getDate(),
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
    };
    handleDayPress({ ...currentDay, timestamp: currentDate.getTime() });
  };

  const fetchClassroomsData = async () => {
    try {
      const response = await fetchAllClassrooms();
      setClassrooms(response.classrooms);
      const classNames = response.classrooms.map((classroom) => classroom.name);
      setClasses(classNames);

      const allSubjects = new Set<string>();
      response.classrooms.forEach((classroom) => {
        classroom.subjects.forEach((subject) => {
          allSubjects.add(subject.name);
        });
      });
      setSubjects(Array.from(allSubjects));
    } catch (error) {
      console.error("Error fetching classrooms:", error);
    }
  };

  const handleDayPress = (day: DateData) => {
    const selectedDate = new Date(day.dateString);
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay()); // Set to Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to Saturday

    const range: { [key: string]: any } = {};
    for (
      let d = new Date(startOfWeek);
      d <= endOfWeek;
      d.setDate(d.getDate() + 1)
    ) {
      const dateString = d.toISOString().split("T")[0];
      if (d.getTime() === startOfWeek.getTime()) {
        range[dateString] = {
          startingDay: true,
          color: "#001529",
          textColor: "white",
        };
      } else if (d.getTime() === endOfWeek.getTime()) {
        range[dateString] = {
          endingDay: true,
          color: "#001529",
          textColor: "white",
        };
      } else {
        range[dateString] = { color: "#001529", textColor: "white" };
      }
    }

    setStartDate(startOfWeek.toISOString().split("T")[0]);
    setEndDate(endOfWeek.toISOString().split("T")[0]);
    setMarkedDates(range);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const toggleSelection = (
    item: string,
    selectedItems: string[],
    setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(item)
        ? prevSelected.filter((i) => i !== item)
        : [...prevSelected, item]
    );
  };

  // Modify the openModal function to check for date selection
  const openModal = (type: "class" | "subject") => {
    if (!startDate || !endDate) {
      // You might want to show an alert or message here
      Alert.alert(
        "Select Date Range",
        "Please select a week before choosing classes and subjects."
      );
      return;
    }
    setActiveSelection(type);
    setModalVisible(true);
    setSearchQuery("");
  };

  const closeModal = () => {
    setModalVisible(false);
    setActiveSelection(null);
  };

  const renderSelectionModal = () => {
    const items = activeSelection === "class" ? classes : subjects;
    const selectedItems =
      activeSelection === "class" ? selectedClasses : selectedSubjects;
    const setSelectedItems =
      activeSelection === "class" ? setSelectedClasses : setSelectedSubjects;

    const filteredItems = items.filter((item) =>
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
                <Text style={styles.modalTitle}>
                  Select {activeSelection === "class" ? "Classes" : "Subjects"}
                </Text>
                <View style={styles.searchContainer}>
                  <Icon
                    name="search"
                    size={20}
                    color="#001529"
                    style={styles.searchIcon}
                  />
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
                        selectedItems.includes(item) &&
                          styles.filterOptionActive,
                      ]}
                      onPress={() =>
                        toggleSelection(item, selectedItems, setSelectedItems)
                      }
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
      const newPairs = selectedClasses.flatMap((className) =>
        selectedSubjects.map((subject) => ({
          class: className,
          subject: subject,
        }))
      );

      const uniqueNewPairs = newPairs.filter(
        (newPair) =>
          !classSubjectPairs.some(
            (existingPair) =>
              existingPair.class === newPair.class &&
              existingPair.subject === newPair.subject
          )
      );

      if (uniqueNewPairs.length > 0) {
        setClassSubjectPairs([...classSubjectPairs, ...uniqueNewPairs]);
      }
    }
    setShowClassSubjectPairs(true);
  };

  const removeClassSubjectPair = (index: number) => {
    const pairToRemove = classSubjectPairs[index];
    const updatedPairs = classSubjectPairs.filter((_, i) => i !== index);
    setClassSubjectPairs(updatedPairs);

    const updatedWorkLogs = workLogs.filter(
      (entry) =>
        !(
          entry.class === pairToRemove.class &&
          entry.subject === pairToRemove.subject
        )
    );
    setWorkLogs(updatedWorkLogs);
  };

  const addWorkLogEntry = () => {
    const newEntries = classSubjectPairs.map((pair) => {
      const classroom = classrooms.find((c) => c.name === pair.class);
      const subject = classroom?.subjects.find((s) => s.name === pair.subject);
      return {
        class: pair.class,
        subject: pair.subject,
        classroomId: classroom?._id,
        subjectId: subject?._id,
        topics: [],
        activities: [],
        chapters: [], // New field
        objectives: [], // New field
        corePoints: [], // New field
        evaluations: [], // New field
        learningOutcomes: [], // New field
        showActivities: false,
        showChapters: false, // New field
        showObjectives: false, // New field
        showCorePoints: false, // New field
        showEvaluations: false, // New field
        showLearningOutcomes: false, // New field
      };
    });

    const uniqueNewEntries = newEntries.filter(
      (newEntry) =>
        !workLogs.some(
          (existingEntry) =>
            existingEntry.classroomId === newEntry.classroomId &&
            existingEntry.subjectId === newEntry.subjectId
        )
    );

    if (uniqueNewEntries.length > 0) {
      setWorkLogs([...workLogs, ...uniqueNewEntries]);
    }
    setShowWorkLogEntries(true);
  };

  const updateWorkLogEntry = (
    index: number,
    field: keyof WorkLogEntry,
    value: any
  ) => {
    const updatedLogs = [...workLogs];
    updatedLogs[index] = { ...updatedLogs[index], [field]: value };
    setWorkLogs(updatedLogs);
  };

  const removeWorkLogEntry = (index: number) => {
    const entryToRemove = workLogs[index];
    const updatedLogs = workLogs.filter((_, i) => i !== index);
    setWorkLogs(updatedLogs);

    const updatedPairs = classSubjectPairs.filter(
      (pair) =>
        !(
          pair.class === entryToRemove.class &&
          pair.subject === entryToRemove.subject
        )
    );
    setClassSubjectPairs(updatedPairs);
  };

  const areAllWorkLogsValid = () => {
    return (
      workLogs &&
      workLogs.length > 0 &&
      workLogs.every(
        (entry) =>
          entry.topics.length > 0 ||
          entry.activities.length > 0 ||
          entry.chapters.length > 0
      )
    );
  };

  const handleSubmit = () => {
    if (areAllWorkLogsValid()) {
      setShowConfirmationModal(true);
    } else {
      // Show an error message or toast
      console.log(
        "Please ensure all work log entries have at least one topic, activity, or chapter."
      );
    }
  };

  const formatDateToLocalTimeZone = (inputDate: string): string => {
    const date = new Date(inputDate);
    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );
    return localDate.toISOString().split("T")[0];
  };

  const loadCachedData = async () => {
    try {
      const cachedData = await AsyncStorage.getItem("lessonPlanCache");
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        const currentTime = new Date().getTime();
        const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000;

        if (currentTime - parsedData.timestamp < oneWeekInMilliseconds) {
          setWorkLogs(parsedData.workLogs || []);
          setClassSubjectPairs(parsedData.classSubjectPairs || []);
          setStartDate(parsedData.startDate || "");
          setEndDate(parsedData.endDate || "");
          setSelectedClasses(parsedData.selectedClasses || []);
          setSelectedSubjects(parsedData.selectedSubjects || []);
          setClasses(parsedData.classes || []);
          setSubjects(parsedData.subjects || []);
          setMarkedDates(parsedData.markedDates || {});
          setIsCachedData(true);
        } else {
          await AsyncStorage.removeItem("lessonPlanCache");
          setIsCachedData(false);
        }
      }
    } catch (error) {
      console.error("Error loading cached data:", error);
      setIsCachedData(false);
    }
  };

  const cacheData = async () => {
    try {
      const dataToCache = {
        workLogs,
        classSubjectPairs,
        startDate,
        endDate,
        selectedClasses,
        selectedSubjects,
        classes,
        subjects,
        markedDates,
        timestamp: new Date().getTime(),
      };
      await AsyncStorage.setItem(
        "lessonPlanCache",
        JSON.stringify(dataToCache)
      );
    } catch (error) {
      console.error("Error caching Lesson Plan data:", error);
    }
  };

  const clearCache = async () => {
    try {
      await AsyncStorage.removeItem("lessonPlanCache");
      setIsCachedData(false);
      setShowCacheClearedMessage(true); // Change this line
      setWorkLogs([]);
      setClassSubjectPairs([]);
      setStartDate("");
      setEndDate("");
      setSelectedClasses([]);
      setSelectedSubjects([]);
      setMarkedDates({});
    } catch (error) {
      console.error("Error clearing Lesson Plan cache:", error);
    }
  };

  const confirmSubmission = async () => {
    const formattedWorkLogs: WorkDoneBookEntry[] = workLogs
      .filter((entry) => entry.classroomId && entry.subjectId)
      .map((entry) => ({
        classroomId: entry.classroomId!,
        subjectId: entry.subjectId!,
        date: new Date(formatDateToLocalTimeZone(startDate)),
        topics: entry.topics,
        activities: entry.activities,
        chapters: entry.chapters, // New field
        objectives: entry.objectives, // New field
        corePoints: entry.corePoints, // New field
        evaluations: entry.evaluations, // New field
        learningOutcomes: entry.learningOutcomes, // New field
        homework: [], // Add empty homework array or implement homework functionality
      }));

    try {
      const response = await createWorkDoneBook(formattedWorkLogs);
      await cacheData();
      setIsCachedData(false);
      setShowConfirmationModal(false);
      navigation.goBack();
    } catch (error) {
      console.error("Error submitting work logs:", error);
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
            <Text style={styles.confirmationDate}>
              Date: {formatDate(startDate)} - {formatDate(endDate)}
            </Text>
            {workLogs.map((entry, index) => (
              <View key={index} style={styles.confirmationEntry}>
                <Text style={styles.confirmationHeader}>
                  {entry.class} - {entry.subject}
                </Text>
                {entry.topics.length > 0 && (
                  <View style={styles.confirmationSection}>
                    <View style={styles.sectionHeaderContainer}>
                      <Icon name="book" size={16} color="#001529" />
                      <Text style={styles.confirmationSubHeader}>Topics:</Text>
                    </View>
                    <View style={styles.itemsContainer}>
                      {entry.topics.map((topic, i) => (
                        <Text key={i} style={styles.confirmationItem}>
                          • {topic}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}
                {entry.chapters.length > 0 && (
                  <View style={styles.confirmationSection}>
                    <View style={styles.sectionHeaderContainer}>
                      <Icon name="book" size={16} color="#001529" />
                      <Text style={styles.confirmationSubHeader}>
                        Chapters:
                      </Text>
                    </View>
                    <View style={styles.itemsContainer}>
                      {entry.chapters.map((chapter, i) => (
                        <Text key={i} style={styles.confirmationItem}>
                          • {chapter}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}
                {entry.activities.length > 0 && (
                  <View style={styles.confirmationSection}>
                    <View style={styles.sectionHeaderContainer}>
                      <Icon name="experiment" size={16} color="#001529" />
                      <Text style={styles.confirmationSubHeader}>
                        Activities:
                      </Text>
                    </View>
                    <View style={styles.itemsContainer}>
                      {entry.activities.map((activity, i) => (
                        <Text key={i} style={styles.confirmationItem}>
                          • {activity}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}

                {entry.objectives.length > 0 && (
                  <View style={styles.confirmationSection}>
                    <View style={styles.sectionHeaderContainer}>
                      <Icon name="book" size={16} color="#001529" />
                      <Text style={styles.confirmationSubHeader}>
                        Objectives:
                      </Text>
                    </View>
                    <View style={styles.itemsContainer}>
                      {entry.objectives.map((objective, i) => (
                        <Text key={i} style={styles.confirmationItem}>
                          • {objective}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}
                {entry.corePoints.length > 0 && (
                  <View style={styles.confirmationSection}>
                    <View style={styles.sectionHeaderContainer}>
                      <Icon name="book" size={16} color="#001529" />
                      <Text style={styles.confirmationSubHeader}>
                        Core Points:
                      </Text>
                    </View>
                    <View style={styles.itemsContainer}>
                      {entry.corePoints.map((corePoint, i) => (
                        <Text key={i} style={styles.confirmationItem}>
                          • {corePoint}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}
                {entry.evaluations.length > 0 && (
                  <View style={styles.confirmationSection}>
                    <View style={styles.sectionHeaderContainer}>
                      <Icon name="book" size={16} color="#001529" />
                      <Text style={styles.confirmationSubHeader}>
                        Evaluations:
                      </Text>
                    </View>
                    <View style={styles.itemsContainer}>
                      {entry.evaluations.map((evaluation, i) => (
                        <Text key={i} style={styles.confirmationItem}>
                          • {evaluation}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}
                {entry.learningOutcomes.length > 0 && (
                  <View style={styles.confirmationSection}>
                    <View style={styles.sectionHeaderContainer}>
                      <Icon name="book" size={16} color="#001529" />
                      <Text style={styles.confirmationSubHeader}>
                        Learning Outcomes:
                      </Text>
                    </View>
                    <View style={styles.itemsContainer}>
                      {entry.learningOutcomes.map((learningOutcome, i) => (
                        <Text key={i} style={styles.confirmationItem}>
                          • {learningOutcome}
                        </Text>
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
    return (
      <>
        {workLogs.map((entry, index) => (
          <View key={index} style={styles.workLogEntry}>
            {/* Header Section */}
            <View style={styles.workLogHeaderContainer}>
              <View style={styles.workLogHeaderLeft}>
                <Text style={styles.workLogClass}>{entry.class}</Text>
                <Text style={styles.workLogSubject}>{entry.subject}</Text>
              </View>
              <TouchableOpacity
                style={styles.removeEntryButton}
                onPress={() => removeWorkLogEntry(index)}
              >
                <Icon name="delete" size={20} color="#ff4d4f" />
              </TouchableOpacity>
            </View>

            {/* Content Sections */}
            <View style={styles.workLogContent}>
              {/* Topics Section */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Icon name="book" size={20} color="#001529" />
                  <Text style={styles.sectionTitle}>Topics</Text>
                </View>
                <View style={styles.inputWithButton}>
                  <TextInput
                    style={styles.sectionInput}
                    value={currentTopic}
                    onChangeText={setCurrentTopic}
                    placeholder="Add a topic"
                    onSubmitEditing={() => {
                      if (currentTopic.trim()) {
                        updateWorkLogEntry(index, "topics", [
                          ...entry.topics,
                          currentTopic.trim(),
                        ]);
                        setCurrentTopic("");
                      }
                    }}
                  />
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      if (currentTopic.trim()) {
                        updateWorkLogEntry(index, "topics", [
                          ...entry.topics,
                          currentTopic.trim(),
                        ]);
                        setCurrentTopic("");
                      }
                    }}
                  >
                    <Icon name="plus" size={20} color="#ffffff" />
                  </TouchableOpacity>
                </View>
                <View style={styles.chipsContainer}>
                  {entry.topics.map((topic, topicIndex) => (
                    <View key={topicIndex} style={styles.chip}>
                      <Text style={styles.chipText} numberOfLines={1}>
                        {topic}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          const updatedTopics = entry.topics.filter(
                            (_, i) => i !== topicIndex
                          );
                          updateWorkLogEntry(index, "topics", updatedTopics);
                        }}
                        style={styles.chipRemoveButton}
                      >
                        <Icon name="close" size={16} color="#666666" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              {renderCollapsibleSection(
                "Chapters",
                "read",
                entry.showChapters,
                () =>
                  updateWorkLogEntry(
                    index,
                    "showChapters",
                    !entry.showChapters
                  ),
                entry.chapters,
                currentChapter,
                setCurrentChapter,
                (value) => updateWorkLogEntry(index, "chapters", value),
                index
              )}

              {renderCollapsibleSection(
                "Objectives",
                "aim",
                entry.showObjectives,
                () =>
                  updateWorkLogEntry(
                    index,
                    "showObjectives",
                    !entry.showObjectives
                  ),
                entry.objectives,
                currentObjective,
                setCurrentObjective,
                (value) => updateWorkLogEntry(index, "objectives", value),
                index
              )}

              {renderCollapsibleSection(
                "Activities",
                "experiment",
                entry.showActivities,
                () =>
                  updateWorkLogEntry(
                    index,
                    "showActivities",
                    !entry.showActivities
                  ),
                entry.activities,
                currentActivity,
                setCurrentActivity,
                (value) => updateWorkLogEntry(index, "activities", value),
                index
              )}

              {renderCollapsibleSection(
                "Core Points",
                "bulb",
                entry.showCorePoints,
                () =>
                  updateWorkLogEntry(
                    index,
                    "showCorePoints",
                    !entry.showCorePoints
                  ),
                entry.corePoints,
                currentCorePoint,
                setCurrentCorePoint,
                (value) => updateWorkLogEntry(index, "corePoints", value),
                index
              )}

              {renderCollapsibleSection(
                "Evaluations",
                "check-square",
                entry.showEvaluations,
                () =>
                  updateWorkLogEntry(
                    index,
                    "showEvaluations",
                    !entry.showEvaluations
                  ),
                entry.evaluations,
                currentEvaluation,
                setCurrentEvaluation,
                (value) => updateWorkLogEntry(index, "evaluations", value),
                index
              )}

              {renderCollapsibleSection(
                "Learning Outcomes",
                "trophy",
                entry.showLearningOutcomes,
                () =>
                  updateWorkLogEntry(
                    index,
                    "showLearningOutcomes",
                    !entry.showLearningOutcomes
                  ),
                entry.learningOutcomes,
                currentLearningOutcome,
                setCurrentLearningOutcome,
                (value) => updateWorkLogEntry(index, "learningOutcomes", value),
                index
              )}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!workLogs.length || !areAllWorkLogsValid()) &&
              styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={!workLogs.length || !areAllWorkLogsValid()}
        >
          <Icon
            name="check-circle"
            size={20}
            color="#ffffff"
            style={styles.buttonIcon}
          />
          <Text style={styles.submitButtonText}>Submit Lesson Plan</Text>
        </TouchableOpacity>
      </>
    );
  };

  const renderCollapsibleSection = (
    title: string,
    iconName:
      | "experiment"
      | "read"
      | "aim"
      | "bulb"
      | "check-square"
      | "trophy", // Specify valid icon names
    isVisible: boolean,
    onToggle: () => void,
    items: string[],
    currentValue: string,
    setCurrentValue: (value: string) => void,
    updateItems: (items: string[]) => void,
    entryIndex: number
  ) => (
    <View style={styles.collapsibleSection}>
      <TouchableOpacity
        style={[
          styles.collapsibleHeader,
          isVisible && styles.collapsibleHeaderActive,
        ]}
        onPress={onToggle}
      >
        <View style={styles.collapsibleHeaderLeft}>
          <Icon
            name={iconName}
            size={20}
            color={isVisible ? "#ffffff" : "#001529"}
          />
          <Text
            style={[
              styles.collapsibleTitle,
              isVisible && styles.collapsibleTitleActive,
            ]}
          >
            {title}
          </Text>
        </View>
        <Icon
          name={isVisible ? "up" : "down"}
          size={16}
          color={isVisible ? "#ffffff" : "#001529"}
        />
      </TouchableOpacity>

      {isVisible && (
        <View style={styles.collapsibleContent}>
          <View style={styles.inputWithButton}>
            <TextInput
              style={styles.sectionInput}
              value={currentValue}
              onChangeText={setCurrentValue}
              placeholder={`Add ${title.toLowerCase()}`}
              onSubmitEditing={() => {
                if (currentValue.trim()) {
                  updateItems([...items, currentValue.trim()]);
                  setCurrentValue("");
                }
              }}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                if (currentValue.trim()) {
                  updateItems([...items, currentValue.trim()]);
                  setCurrentValue("");
                }
              }}
            >
              <Icon name="plus" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <View style={styles.chipsContainer}>
            {items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.chip}>
                <Text style={styles.chipText} numberOfLines={1}>
                  {item}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    const updatedItems = items.filter(
                      (_, i) => i !== itemIndex
                    );
                    updateItems(updatedItems);
                  }}
                  style={styles.chipRemoveButton}
                >
                  <Icon name="close" size={16} color="#666666" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderClassSubjectPairs = () => {
    return classSubjectPairs.map((pair, index) => (
      <View key={index} style={styles.pairContainer}>
        <Text style={styles.pairText}>
          {pair.class} - {pair.subject}
        </Text>
        <TouchableOpacity
          style={styles.removePairButton}
          onPress={() => removeClassSubjectPair(index)}
        >
          <Icon name="close" size={20} color="#001529" />
        </TouchableOpacity>
      </View>
    ));
  };

  const renderCachedDataWarning = () => {
    if (isCachedData) {
      return (
        <View style={styles.infoContainer}>
          <Icon name="info-circle" size={20} color="#faad14" />
          <Text style={styles.infoText}>
            Showing cached data (available for one week)
          </Text>
          <TouchableOpacity
            style={styles.clearCacheButton}
            onPress={clearCache}
          >
            <Text style={styles.clearCacheButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  const renderCacheClearedInfo = () => {
    if (showCacheClearedMessage) {
      // Change this line
      return (
        <View style={[styles.infoContainer, styles.successContainer]}>
          <Icon name="check-circle" size={20} color="#52c41a" />
          <Text style={styles.infoText}>Cache cleared successfully</Text>
        </View>
      );
    }
    return null;
  };

  const formatDateRange = (start: string, end: string) => {
    if (!start || !end)
      return {
        startDay: "",
        startDate: "",
        endDay: "",
        endDate: "",
        month: "",
        year: "",
      };
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return {
      startDay: days[startDate.getDay()],
      startDate: startDate.getDate().toString().padStart(2, "0"),
      endDay: days[endDate.getDay()],
      endDate: endDate.getDate().toString().padStart(2, "0"),
      month: months[startDate.getMonth()],
      year: startDate.getFullYear().toString(),
    };
  };

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const renderDateRangeWithIcon = () => (
    <View style={styles.dateRangeContainer}>
      <View style={styles.calendarIconContainer}>
        <Icon name="calendar" size={24} color="#001529" />
      </View>
      <View style={styles.dateRangeContent}>
        <View style={styles.dateColumn}>
          <Text style={styles.dayText}>
            {formatDateRange(startDate, endDate).startDay}
          </Text>
          <Text style={styles.dateText}>
            {formatDateRange(startDate, endDate).startDate}
          </Text>
        </View>
        <View style={styles.dateSeperator}>
          <Icon name="arrow-right" size={20} color="#001529" />
        </View>
        <View style={styles.dateColumn}>
          <Text style={styles.dayText}>
            {formatDateRange(startDate, endDate).endDay}
          </Text>
          <Text style={styles.dateText}>
            {formatDateRange(startDate, endDate).endDate}
          </Text>
        </View>
        <View style={styles.monthYearColumn}>
          <Text style={styles.monthText}>
            {formatDateRange(startDate, endDate).month}
          </Text>
          <Text style={styles.yearText}>
            {formatDateRange(startDate, endDate).year}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.clearDateButton}
        onPress={() => {
          setStartDate("");
          setEndDate("");
          setMarkedDates({});
        }}
      >
        <Icon name="close" size={20} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lesson Plan</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.contentContainer}>
          <FallbackCard style={styles.calendarCard}>
            <Text style={styles.sectionTitle}>Select Week</Text>
            <Calendar
              style={styles.calendar}
              onDayPress={handleDayPress}
              markedDates={markedDates}
              markingType={"period"}
              theme={{
                backgroundColor: "#ffffff",
                calendarBackground: "#ffffff",
                textSectionTitleColor: "#b6c1cd",
                selectedDayBackgroundColor: "#001529",
                selectedDayTextColor: "#ffffff",
                todayTextColor: "#001529",
                dayTextColor: "#2d4150",
                textDisabledColor: "#d9e1e8",
                dotColor: "#001529",
                selectedDotColor: "#ffffff",
                arrowColor: "#001529",
                monthTextColor: "#001529",
                indicatorColor: "#001529",
                textDayFontWeight: "300",
                textMonthFontWeight: "bold",
                textDayHeaderFontWeight: "300",
                textDayFontSize: 16,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 16,
              }}
            />
            {startDate && endDate && renderDateRangeWithIcon()}
          </FallbackCard>

          {renderCachedDataWarning()}
          {renderCacheClearedInfo()}
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Lesson Plan</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Classes</Text>
              <TouchableOpacity
                style={[
                  styles.dropdownButton,
                  (!startDate || !endDate) && styles.dropdownButtonDisabled
                ]}
                onPress={() => openModal("class")}
              >
                <Text style={(!startDate || !endDate) ? styles.dropdownTextDisabled : undefined}>
                  {selectedClasses.length > 0
                    ? selectedClasses.join(", ")
                    : "Select classes"}
                </Text>
                <Icon name="down" size={16} color={(!startDate || !endDate) ? "#d9d9d9" : "#001529"} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Subjects</Text>
              <TouchableOpacity
                style={[
                  styles.dropdownButton,
                  (!startDate || !endDate) && styles.dropdownButtonDisabled
                ]}
                onPress={() => openModal("subject")}
              >
                <Text style={(!startDate || !endDate) ? styles.dropdownTextDisabled : undefined}>
                  {selectedSubjects.length > 0
                    ? selectedSubjects.join(", ")
                    : "Select subjects"}
                </Text>
                <Icon name="down" size={16} color={(!startDate || !endDate) ? "#d9d9d9" : "#001529"} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.addEntryButton}
              onPress={addClassSubjectPair}
            >
              <Icon
                name="plus-circle"
                size={20}
                color="#ffffff"
                style={styles.buttonIcon}
              />
              <Text style={styles.addEntryButtonText}>
                {showClassSubjectPairs
                  ? "Update Class-Subject Pairs"
                  : "Add Class-Subject Pair"}
              </Text>
            </TouchableOpacity>

            {showClassSubjectPairs && renderClassSubjectPairs()}

            {showClassSubjectPairs && (
              <TouchableOpacity
                style={styles.addEntryButton}
                onPress={addWorkLogEntry}
              >
                <Icon
                  name="form"
                  size={20}
                  color="#ffffff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.addEntryButtonText}>
                  {showWorkLogEntries
                    ? "Update Work Log Entries"
                    : "Generate Work Log Entries"}
                </Text>
              </TouchableOpacity>
            )}

            {showWorkLogEntries && renderWorkLogEntries()}
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
    backgroundColor: "#f0f2f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#001529",
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
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  formContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#001529",
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#4a4a4a",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#001529",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dateContainer: {
    marginBottom: 20,
  },
  calendar: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
  },
  selectedDateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e6f7ff",
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#001529",
  },
  clearDateButton: {
    backgroundColor: "#001529",
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedItem: {
    fontWeight: "bold",
    color: "#001529",
  },
  sliderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#ffffff",
    zIndex: 1000,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  sliderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#001529",
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#ffffff",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
    marginTop: "auto", // Add this line
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#001529",
    marginBottom: 15,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d9d9d9",
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
    color: "#001529",
  },
  optionsList: {
    maxHeight: "60%",
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterOptionActive: {
    backgroundColor: "#e6f7ff",
  },
  filterOptionText: {
    fontSize: 16,
    color: "#001529",
  },
  applyButton: {
    backgroundColor: "#001529",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  applyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end", // Changed from 'center' to 'flex-end'
    alignItems: "stretch", // Changed from 'center' to 'stretch'
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: "#001529",
  },
  cancelButtonText: {
    color: "#001529",
    fontSize: 16,
    fontWeight: "bold",
  },
  confirmButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Card styles
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarCard: {
    marginBottom: 20,
  },

  // Work log entry styles
  workLogEntry: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  workLogHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
    paddingBottom: 10,
  },
  workLogHeaderLeft: {
    flex: 1,
  },
  workLogClass: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#001529",
  },
  workLogSubject: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  workLogContent: {
    gap: 15,
  },

  // Section styles
  sectionContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  sectionHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  sectionInput: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#d9d9d9",
  },

  // Input and button styles
  inputWithButton: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#001529",
    width: 40,
    height: 40,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  removeEntryButton: {
    padding: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },

  // Chip styles
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#d9d9d9",
  },
  chipText: {
    fontSize: 14,
    color: "#333333",
    marginRight: 6,
    maxWidth: 150,
  },
  chipRemoveButton: {
    padding: 2,
  },

  // Collapsible section styles
  collapsibleSection: {
    marginTop: 8,
  },
  collapsibleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 6,
  },
  collapsibleHeaderActive: {
    backgroundColor: "#001529",
  },
  collapsibleHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  collapsibleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#001529",
  },
  collapsibleTitleActive: {
    color: "#ffffff",
  },
  collapsibleContent: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },

  // Confirmation styles
  confirmationScrollView: {
    maxHeight: "70%",
  },
  confirmationEntry: {
    marginBottom: 15,
    backgroundColor: "#f0f2f5",
    borderRadius: 10,
    padding: 15,
  },
  confirmationHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#001529",
  },
  confirmationSection: {
    marginBottom: 10,
  },
  confirmationSubHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#001529",
    marginLeft: 5,
  },
  confirmationItem: {
    fontSize: 14,
    color: "#4a4a4a",
    marginBottom: 3,
  },
  confirmationDate: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#001529",
  },

  // Date range styles
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  
  calendarIconContainer: {
    marginRight: 15,
    borderRightWidth: 1,
    borderRightColor: '#d9d9d9',
    paddingRight: 15,
  },
  
  dateRangeContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateColumn: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  
  dateSeperator: {
    marginHorizontal: 10,
  },
  
  monthYearColumn: {
    flex: 1,
    marginLeft: 15,
  },
  
  dayText: {
    fontSize: 14,
    color: "#4a4a4a",
    fontWeight: "600",
  },
  dateText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#001529",
  },
  monthText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#001529",
  },
  yearText: {
    fontSize: 14,
    color: "#4a4a4a",
    fontWeight: "500",
  },

  // Cache info styles
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbe6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  successContainer: {
    backgroundColor: "#f6ffed",
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#4a4a4a",
  },
  clearCacheButton: {
    backgroundColor: "#ff4d4f",
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearCacheButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },

  // Disabled button style
  disabledButton: {
    backgroundColor: "#cccccc",
  },

  // Class-Subject pair styles
  pairContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#d9d9d9",
  },
  pairText: {
    fontSize: 16,
    color: "#001529",
  },
  removePairButton: {
    padding: 5,
  },

  // Add entry button styles
  addEntryButton: {
    backgroundColor: "#001529",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "center",
  },
  addEntryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Items container
  itemsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 5,
    padding: 10,
  },

  dropdownButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#d9d9d9',
  },
  
  dropdownTextDisabled: {
    color: '#d9d9d9',
  },
});

export default LessonPlanScreen;

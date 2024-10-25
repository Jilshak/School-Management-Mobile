import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Share,
  TextInput,
} from "react-native";
import { Text } from "@ant-design/react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Calendar, DateData } from "react-native-calendars";
import { fetchWorkDoneLogs } from "../../Services/WorkDoneBook/WorkDoneBookService";
import useProfileStore from "../../store/profileStore";
import Icon from "react-native-vector-icons/AntDesign";
import { fetchLessonPlan } from "../../Services/LessonPlan/LessonPlan";

type WorkDoneLogScreenProps = {
  navigation: StackNavigationProp<any, "WorkDoneLog">;
};

interface WorkDoneEntry {
  _id: string;
  classroomId: string;
  classroomName: string;
  subjectId: string;
  subjectName: string;
  topics: string[];
  activities: string[];
  homework: string[];
}

interface WorkDoneLog {
  _id: string;
  date: string;
  teacherId: string;
  schoolId: string;
  teacherName: string;
  entries: WorkDoneEntry[];
}

// Add this interface at the top with other interfaces
interface LessonPlanEntry {
  classroomId: string;
  classroomName: string;
  subjectId: string;
  subjectName: string;
  topics: string[];
  activities: string[];
  chapters: string[];
  objectives: string[];
  corePoints: string[];
  evaluations: string[];
  learningOutcomes: string[];
}

interface LessonPlan {
  _id: string;
  schoolId: string;
  teacherId: string;
  teacherName: string;
  entries: LessonPlanEntry[];
}

// Add this near the top of the file, after the imports
const FallbackCard: React.FC<{ style?: any; children: React.ReactNode }> = ({
  style,
  children,
}) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

// Add this helper function near the top of the file
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

const WorkDoneLogScreen: React.FC<WorkDoneLogScreenProps> = ({
  navigation,
}) => {
  const [workDoneLogs, setWorkDoneLogs] = useState<WorkDoneLog[]>([]);
  const [loading, setLoading] = useState(false); // Changed from true to false
  const [refreshing, setRefreshing] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WorkDoneLog | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    // Add IST offset (5 hours and 30 minutes)
    now.setHours(now.getHours() + 5);
    now.setMinutes(now.getMinutes() + 30);
    return now.toISOString().split('T')[0];
  });
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("logs"); // Add this line
  const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [weeklyLogs, setWeeklyLogs] = useState<WorkDoneLog[]>([]);
  const [currentWeekDates, setCurrentWeekDates] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [lessonPlans, setLessonPlans] = useState<LessonPlanEntry[]>([]); // Add this line
  const [expandedLessonPlanId, setExpandedLessonPlanId] = useState<string | null>(null);

  const { profile } = useProfileStore();

  const fetchLogs = useCallback(async (date?: string, isInitialLoad: boolean = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }
      const now = new Date();
      now.setHours(now.getHours() + 5);
      now.setMinutes(now.getMinutes() + 30);
      const targetDate = date || now.toISOString().split('T')[0];
      
      const response = await fetchWorkDoneLogs(targetDate);
      
      if (response && Array.isArray(response)) {
        setWorkDoneLogs(response);
      } else {
        console.error("Invalid response format from fetchWorkDoneLogs");
        setWorkDoneLogs([]);
      }
    } catch (error) {
      console.error("Error fetching work done logs:", error);
      setWorkDoneLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWeeklyLessonPlans = useCallback(async (startDate: string, endDate: string) => {
    try {
      const response = await fetchLessonPlan(startDate, endDate);
      if (Array.isArray(response) && response.length > 0) {
        const lessonPlan = response[0];
        setLessonPlans(lessonPlan.entries);
      } else {
        setLessonPlans([]);
      }
    } catch (error) {
      console.error("Error fetching weekly lesson plans:", error);
      setLessonPlans([]);
    }
  }, []);

  const handleWeekSelection = useCallback((day: DateData) => {
    const selectedDate = new Date(day.dateString);
    const start = new Date(selectedDate);
    // Get the first day of the week (Sunday)
    start.setDate(selectedDate.getDate() - selectedDate.getDay());
    const end = new Date(start);
    // Get the last day of the week (Saturday)
    end.setDate(start.getDate() + 6);

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    setStartDate(startStr);
    setEndDate(endStr);
    setCurrentWeekDates({ start: startStr, end: endStr });

    // Create marked dates object for the selected week
    const marked: { [key: string]: any } = {};
    const current = new Date(start);

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      if (current.getTime() === start.getTime()) {
        marked[dateStr] = {
          startingDay: true,
          color: '#001529',
          textColor: 'white',
        };
      } else if (current.getTime() === end.getTime()) {
        marked[dateStr] = {
          endingDay: true,
          color: '#001529',
          textColor: 'white',
        };
      } else {
        marked[dateStr] = {
          color: '#001529',
          textColor: 'white',
        };
      }
      current.setDate(current.getDate() + 1);
    }

    setMarkedDates(marked);
    fetchWeeklyLessonPlans(startStr, endStr);
  }, [fetchWeeklyLessonPlans]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLogs(selectedDate);
    setRefreshing(false);
  }, [selectedDate, fetchLogs]);

  // Add this function before the useEffect
  const selectCurrentWeek = useCallback(() => {
    const currentDate = new Date();
    const currentDay = {
      dateString: currentDate.toISOString().split('T')[0],
      day: currentDate.getDate(),
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      timestamp: currentDate.getTime()
    };
    handleWeekSelection(currentDay);
  }, [handleWeekSelection]);

  

  // Update the useEffect
  useEffect(() => {
    if (activeTab === "logs") {
      fetchLogs(undefined, true); // Pass true for initial load
    } else if (activeTab === "anotherTab" && !startDate && !endDate) {
      selectCurrentWeek();
    }
  }, [activeTab, fetchLogs, selectCurrentWeek]);

  // Add a separate useEffect for fetching lesson plans
  useEffect(() => {
    if (activeTab === "anotherTab" && startDate && endDate) {
      fetchWeeklyLessonPlans(startDate, endDate);
    }
  }, [activeTab, startDate, endDate, fetchWeeklyLessonPlans]);

  useEffect(() => {
    if (workDoneLogs.length > 0 && selectedDate) {
      const todayLog = workDoneLogs.find(
        (log) => new Date(log.date).toISOString().split("T")[0] === selectedDate
      );
      if (todayLog) {
        setExpandedLogId(todayLog._id);
      }
    }
  }, [workDoneLogs]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return {
      day: date.getDate(),
      month: months[date.getMonth()],
      year: date.getFullYear(),
      dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
    };
  };

  const handleShare = async (log: WorkDoneLog) => {
    try {
      const shareText = generateShareText(log);
      await Share.share({
        message: shareText,
        title: `Work Done Log - ${formatDate(log.date)}`,
      });
    } catch (error) {
      console.error("Error sharing log:", error);
    }
  };

  const generateShareText = (log: WorkDoneLog): string => {
    let text = `Work Done Log - ${formatDate(log.date)}\n\n`;

    log.entries.forEach((entry) => {
      text += `${entry.classroomName} - ${entry.subjectName}\n`;

      if (entry.topics.length > 0) {
        text += "Topics:\n";
        entry.topics.forEach((topic) => (text += `✓ ${topic}\n`));
      }

      if (entry.activities.length > 0) {
        text += "Activities:\n";
        entry.activities.forEach((activity) => (text += `✓ ${activity}\n`));
      }

      if (entry.homework.length > 0) {
        text += "Homework:\n";
        entry.homework.forEach((hw) => (text += `✓ ${hw}\n`));
      }

      text += "\n";
    });

    return text;
  };

  const renderDetailsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showDetailsModal}
      onRequestClose={() => setShowDetailsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Daily Work Done Log</Text>
            <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
              <Icon name="close" size={24} color="#001529" />
            </TouchableOpacity>
          </View>

          {selectedLog && (
            <ScrollView style={styles.modalScrollView}>
              <Text style={styles.modalDate}>
                {`${formatDate(selectedLog.date).dayName}, ${
                  formatDate(selectedLog.date).day
                } ${formatDate(selectedLog.date).month} ${
                  formatDate(selectedLog.date).year
                }`}
              </Text>

              {selectedLog.entries.map((entry, entryIndex) => (
                <View key={entryIndex} style={styles.entryContainer}>
                  <View style={styles.classSubjectContainer}>
                    <View style={styles.infoBox}>
                      <Icon name="book" size={20} color="#001529" />
                      <Text style={styles.infoText}>
                        {entry.classroomName}
                      </Text>
                    </View>
                    <View style={styles.infoBox}>
                      <Icon name="profile" size={20} color="#001529" />
                      <Text style={styles.infoText}>
                        {entry.subjectName}
                      </Text>
                    </View>
                  </View>

                  {entry.topics.length > 0 && entry.topics[0] !== "None" && (
                    <View style={styles.sectionContainer}>
                      <View style={styles.sectionHeader}>
                        <Icon name="book" size={20} color="#001529" />
                        <Text style={styles.sectionTitle}>Topics Covered</Text>
                      </View>
                      {entry.topics.map((topic, index) => (
                        <View key={index} style={styles.itemContainer}>
                          <Text style={styles.bulletPoint}>✓</Text>
                          <Text style={styles.itemText}>{topic}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {entry.activities.length > 0 && (
                    <View style={styles.sectionContainer}>
                      <View style={styles.sectionHeader}>
                        <Icon name="solution1" size={20} color="#001529" />
                        <Text style={styles.sectionTitle}>Activities</Text>
                      </View>
                      {entry.activities.map((activity, index) => (
                        <View key={index} style={styles.itemContainer}>
                          <Text style={styles.bulletPoint}>✓</Text>
                          <Text style={styles.itemText}>{activity}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {entry.homework.length > 0 && (
                    <View style={styles.sectionContainer}>
                      <View style={styles.sectionHeader}>
                        <Icon name="home" size={20} color="#001529" />
                        <Text style={styles.sectionTitle}>Homework</Text>
                      </View>
                      {entry.homework.map((hw, index) => (
                        <View key={index} style={styles.itemContainer}>
                          <Text style={styles.bulletPoint}>✓</Text>
                          <Text style={styles.itemText}>{hw}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Icon name="arrowleft" size={24} color="#ffffff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Work Log</Text>
      <TouchableOpacity onPress={() => navigation.navigate("WorkDoneBook")}>
        <Icon name="plus" size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );

  const renderCalendar = useCallback(() => {
    const now = new Date();
    now.setHours(now.getHours() + 5);
    now.setMinutes(now.getMinutes() + 30);
    const today = now.toISOString().split('T')[0];

    return (
      <View style={styles.calendarContainer}>
        <Calendar
          current={today}
          initialDate={today}
          onDayPress={(day: any) => {
            setSelectedDate(day.dateString);
            fetchLogs(day.dateString, false); // Pass false for isInitialLoad
          }}
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: "#001529" },
          }}
          theme={{
            backgroundColor: "#ffffff",
            calendarBackground: "#ffffff",
            textSectionTitleColor: "#001529",
            selectedDayBackgroundColor: "#001529",
            selectedDayTextColor: "#ffffff",
            todayTextColor: "#001529",
            dayTextColor: "#2d4150",
            textDisabledColor: "#d9e1e8",
            dotColor: "#001529",
            selectedDotColor: "#ffffff",
            arrowColor: "#001529",
            monthTextColor: "#001529",
            textDayFontWeight: "300",
            textMonthFontWeight: "bold",
            textDayHeaderFontWeight: "300",
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 16,
          }}
        />
      </View>
    );
  }, [selectedDate, fetchLogs]);

  const renderLogCard = useCallback((log: WorkDoneLog) => {
    const isExpanded = expandedLogId === log._id;
    const dateStr = new Date(log.date).toISOString().split('T')[0];
    const isCurrentDay = dateStr === selectedDate;
    const formattedDate = formatDate(log.date);

    return (
      <View
        key={log._id}
        style={[
          styles.logCard,
          isCurrentDay && styles.selectedLogCard,
          isExpanded && styles.expandedLogCard,
        ]}
      >
        <TouchableOpacity
          onPress={() => setExpandedLogId(isExpanded ? null : log._id)}
          style={styles.logHeader}
        >
          <View style={styles.logHeaderContent}>
            <View style={styles.dateContainer}>
              <View style={styles.dateBox}>
                <Text style={styles.dayName}>{formattedDate.dayName}</Text>
                <Text style={styles.dayNumber}>{formattedDate.day}</Text>
                <Text style={styles.monthYear}>
                  {formattedDate.month} {formattedDate.year}
                </Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Icon name="profile" size={16} color="#1890ff" />
                  <Text style={styles.statText}>
                    {log.entries.length} Classes
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="book" size={16} color="#52c41a" />
                  <Text style={styles.statText}>
                    {log.entries.reduce(
                      (sum, entry) => sum + entry.topics.filter(topic => topic !== "None").length,
                      0
                    )}{" "}
                    Topics
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="solution1" size={16} color="#faad14" />
                  <Text style={styles.statText}>
                    {log.entries.reduce(
                      (sum, entry) => sum + entry.activities.length,
                      0
                    )}{" "}
                    Activities
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="home" size={16} color="#f5222d" />
                  <Text style={styles.statText}>
                    {log.entries.reduce(
                      (sum, entry) => sum + entry.homework.length,
                      0
                    )}{" "}
                    Homework
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleShare(log);
                }}
              >
                <Icon name="sharealt" size={20} color="#001529" />
              </TouchableOpacity>
              <Icon
                name={isExpanded ? "up" : "down"}
                size={20}
                color="#001529"
              />
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            {log.entries.map((entry, index) => (
              <View key={index} style={styles.entryContainer}>
                <View style={styles.classSubjectContainer}>
                  <View style={styles.infoBox}>
                    <Icon name="book" size={20} color="#001529" />
                    <Text style={styles.infoText}>
                      {entry.classroomName}
                    </Text>
                  </View>
                  <View style={styles.infoBox}>
                    <Icon name="profile" size={20} color="#001529" />
                    <Text style={styles.infoText}>{entry.subjectName}</Text>
                  </View>
                </View>

                {entry.topics.length > 0 && entry.topics[0] !== "None" && (
                  <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                      <Icon name="book" size={20} color="#001529" />
                      <Text style={styles.sectionTitle}>Topics Covered</Text>
                    </View>
                    {entry.topics.map((topic, index) => (
                      <View key={index} style={styles.itemContainer}>
                        <Text style={styles.bulletPoint}>✓</Text>
                        <Text style={styles.itemText}>{topic}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {entry.activities.length > 0 && (
                  <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                      <Icon name="solution1" size={20} color="#001529" />
                      <Text style={styles.sectionTitle}>Activities</Text>
                    </View>
                    {entry.activities.map((activity, index) => (
                      <View key={index} style={styles.itemContainer}>
                        <Text style={styles.bulletPoint}>✓</Text>
                        <Text style={styles.itemText}>{activity}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {entry.homework.length > 0 && (
                  <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                      <Icon name="home" size={20} color="#001529" />
                      <Text style={styles.sectionTitle}>Homework</Text>
                    </View>
                    {entry.homework.map((hw, index) => (
                      <View key={index} style={styles.itemContainer}>
                        <Text style={styles.bulletPoint}>✓</Text>
                        <Text style={styles.itemText}>{hw}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }, [expandedLogId, selectedDate, handleShare]);

  // Memoize the log card rendering
  const memoizedLogCard = useMemo(() => {
    const todayLog = workDoneLogs.find(
      (log) => new Date(log.date).toISOString().split("T")[0] === selectedDate
    );

    if (todayLog) {
      return renderLogCard(todayLog);
    } else {
      return (
        <View style={styles.emptyLogCard}>
          <Icon name="profile" size={40} color="#bfbfbf" />
          <Text style={styles.emptyLogTitle}>No Work Done Log</Text>
          <Text style={styles.emptyLogText}>
            No work done log has been created for{" "}
            {`${formatDate(selectedDate).dayName}, ${
              formatDate(selectedDate).day
            } ${formatDate(selectedDate).month} ${
              formatDate(selectedDate).year
            }`}
          </Text>
          <TouchableOpacity
            style={styles.addLogButton}
            onPress={() => navigation.navigate("WorkDoneBook")}
          >
            <Icon name="plus" size={20} color="#ffffff" />
            <Text style={styles.addLogButtonText}>Add Work Done Log</Text>
          </TouchableOpacity>
        </View>
      );
    }
  }, [workDoneLogs, selectedDate, renderLogCard, navigation]);

  // Memoize the calendar component
  const memoizedCalendar = useMemo(() => renderCalendar(), [selectedDate, fetchLogs]);

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "logs" && styles.activeTab]}
        onPress={() => setActiveTab("logs")}
      >
        <Icon
          name="profile"
          size={20}
          color={activeTab === "logs" ? "#ffffff" : "#001529"}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "logs" && styles.activeTabText,
          ]}
        >
          Work Done Log
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "anotherTab" && styles.activeTab]}
        onPress={() => setActiveTab("anotherTab")}
      >
        <Icon
          name="clockcircleo"
          size={20}
          color={activeTab === "anotherTab" ? "#ffffff" : "#001529"}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "anotherTab" && styles.activeTabText,
          ]}
        >
          Lesson Plan Log
        </Text>
      </TouchableOpacity>
    </View>
  );

  // First, define renderSection before renderLessonPlanCard
  const renderSection = useCallback((title: string, items: string[]) => {
    if (items.length === 0) return null;
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Icon name="book" size={20} color="#001529" />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {items.map((item, index) => (
          <View key={`${title}-${index}`} style={styles.itemContainer}>
            <Text style={styles.bulletPoint}>✓</Text>
            <Text style={styles.itemText}>{item}</Text>
          </View>
        ))}
      </View>
    );
  }, []);

  const renderLessonPlanCard = useCallback((entry: LessonPlanEntry, index: number) => {
    const isExpanded = expandedLessonPlanId === `${entry.classroomId}-${entry.subjectId}-${index}`;
    
    return (
      <View key={`${entry.classroomId}-${entry.subjectId}-${index}`} style={[styles.logCard, isExpanded && styles.expandedLogCard]}>
        <TouchableOpacity
          style={styles.logHeader}
          onPress={() => setExpandedLessonPlanId(
            isExpanded ? null : `${entry.classroomId}-${entry.subjectId}-${index}`
          )}
        >
          <View style={styles.logHeaderContent}>
            <View style={styles.dateContainer}>
              <View style={styles.dateBox}>
                <Text style={styles.dayName}>{entry.classroomName}</Text>
                <Text style={styles.dayNumber}>{entry.subjectName}</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Icon name="book" size={16} color="#1890ff" />
                  <Text style={styles.statText}>
                    {entry.topics.length} Topics
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="solution1" size={16} color="#52c41a" />
                  <Text style={styles.statText}>
                    {entry.activities.length} Activities
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="profile" size={16} color="#faad14" />
                  <Text style={styles.statText}>
                    {entry.chapters.length} Chapters
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="book" size={16} color="#f5222d" />
                  <Text style={styles.statText}>
                    {entry.objectives.length} Objectives
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  // Add share functionality here
                  Share.share({
                    message: `Lesson Plan for ${entry.classroomName} - ${entry.subjectName}\n\n` +
                      `Topics: ${entry.topics.join(', ')}\n` +
                      `Activities: ${entry.activities.join(', ')}\n` +
                      `Chapters: ${entry.chapters.join(', ')}\n` +
                      `Objectives: ${entry.objectives.join(', ')}\n` +
                      `Core Points: ${entry.corePoints.join(', ')}\n` +
                      `Evaluations: ${entry.evaluations.join(', ')}\n` +
                      `Learning Outcomes: ${entry.learningOutcomes.join(', ')}`
                  });
                }}
              >
                <Icon name="sharealt" size={20} color="#001529" />
              </TouchableOpacity>
              <Icon
                name={isExpanded ? "up" : "down"}
                size={20}
                color="#001529"
              />
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            {renderSection("Topics", entry.topics)}
            {renderSection("Activities", entry.activities)}
            {renderSection("Chapters", entry.chapters)}
            {renderSection("Objectives", entry.objectives)}
            {renderSection("Core Points", entry.corePoints)}
            {renderSection("Evaluations", entry.evaluations)}
            {renderSection("Learning Outcomes", entry.learningOutcomes)}
          </View>
        )}
      </View>
    );
  }, [expandedLessonPlanId, renderSection]);

  // Update the renderDateRangeWithIcon function to use the correct icon name
  const renderDateRangeWithIcon = useCallback(() => (
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
          <Icon name="arrowright" size={20} color="#001529" />
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
        <Icon name="close" size={16} color="#ffffff" />
      </TouchableOpacity>
    </View>
  ), [startDate, endDate]);

  const renderWeeklyLogs = useCallback(() => {
    return (
      <>
        <View style={styles.calendarContainer}>
          <Calendar
            current={currentWeekDates.start || undefined}
            initialDate={currentWeekDates.start || undefined}
            onDayPress={handleWeekSelection}
            markedDates={markedDates}
            markingType="period"
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#001529',
              selectedDayBackgroundColor: '#001529',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#001529',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: '#001529',
              selectedDotColor: '#ffffff',
              arrowColor: '#001529',
              monthTextColor: '#001529',
              textDayFontWeight: '300',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '300',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 16,
              'stylesheet.calendar.period': {
                base: {
                  overflow: 'hidden',
                  height: 34,
                  alignItems: 'center',
                  width: 38,
                },
                fillers: {
                  backgroundColor: '#001529',
                  height: 34,
                  position: 'absolute',
                  left: 0,
                  right: 0,
                },
                text: {
                  color: '#ffffff',
                  marginTop: 7,
                  fontSize: 16,
                }
              }
            }}
            enableSwipeMonths={true}
            disableAllTouchEventsForDisabledDays={false}
          />
          {startDate && endDate && renderDateRangeWithIcon()}
        </View>

        <View style={styles.logsContainer}>
          {lessonPlans.length > 0 ? (
            lessonPlans.map((entry, index) => renderLessonPlanCard(entry, index))
          ) : (
            <View style={styles.emptyLogCard}>
              <Icon name="profile" size={40} color="#bfbfbf" />
              <Text style={styles.emptyLogTitle}>No Lesson Plan</Text>
              <Text style={styles.emptyLogText}>
                No lesson plan has been created for this week
              </Text>
              <TouchableOpacity
                style={styles.addLogButton}
                onPress={() => navigation.navigate("LessonPlan")}
              >
                <Icon name="plus" size={20} color="#ffffff" />
                <Text style={styles.addLogButtonText}>Add Lesson Plan</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </>
    );
  }, [lessonPlans, currentWeekDates, markedDates, navigation, handleWeekSelection, renderLessonPlanCard, startDate, endDate]);

  // Add this function before the useEffect hook
  

  // Update the loading condition in the render
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#001529" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <ScrollView
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderTabBar()}

        {activeTab === "logs" ? (
          <>
            {memoizedCalendar}
            <View style={styles.logsContainer}>{memoizedLogCard}</View>
          </>
        ) : (
          renderWeeklyLogs()
        )}
      </ScrollView>

      {renderDetailsModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#001529",
    padding: 15,
    borderRadius: 10,
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
    height: 60,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    marginTop: 80,
    padding: 20,
  },
  logsContainer: {
    flex: 1,
  },
  noLogsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginTop: 20,
  },
  noLogsText: {
    marginTop: 12,
    fontSize: 15,
    color: "#8c8c8c",
  },
  logCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  logHeader: {
    padding: 12,
  },
  logHeaderContent: {
    marginBottom: 0, // Reduced from 12
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 8, // Reduced from 10
  },
  dateBox: {
    alignItems: "center",
    minWidth: 70, // Reduced from 80
  },
  dayName: {
    fontSize: 12, // Reduced from 14
    color: "#666666",
    fontWeight: "500",
  },
  dayNumber: {
    fontSize: 20, // Reduced from 24
    fontWeight: "bold",
    color: "#001529",
    marginVertical: 1, // Reduced from 2
  },
  monthYear: {
    fontSize: 11, // Reduced from 12
    color: "#666666",
  },
  verticalDivider: {
    width: 1,
    height: "80%", // Reduced from 100%
    backgroundColor: "#e8e8e8",
    marginHorizontal: 12, // Reduced from 15
  },
  statsContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6, // Reduced from 8
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingVertical: 4, // Reduced from 6
    paddingHorizontal: 8, // Reduced from 10
    borderRadius: 16,
  },
  statText: {
    marginLeft: 4, // Reduced from 6
    fontSize: 12, // Reduced from 13
    color: "#001529",
    fontWeight: "500",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    borderTopWidth: 0, // Removed border
    marginTop: 8,
    paddingTop: 0, // Removed padding
  },
  actionButton: {
    padding: 6, // Reduced from 8
    marginRight: 8, // Reduced from 12
  },
  expandedContent: {
    padding: 15,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginBottom: 15, // Add this line
  },
  selectedLogCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#001529",
    backgroundColor: "#fafafa",
  },
  logHeaderLeft: {
    flex: 1,
  },
  entriesCount: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#001529",
  },
  modalScrollView: {
    maxHeight: "90%",
  },
  modalDate: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#001529",
    marginBottom: 15,
  },
  logDetailsContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
  },
  classSubjectContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f7ff",
    borderRadius: 8,
    padding: 10,
    flex: 0.48,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#001529",
    flex: 1,
  },
  sectionContainer: {
    marginTop: 12,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#001529",
    marginLeft: 8,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  bulletPoint: {
    fontSize: 16,
    color: "#001529",
    marginRight: 8,
  },
  itemText: {
    fontSize: 14,
    color: "#4a4a4a",
    flex: 1,
  },
  filterContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#001529",
    height: 40,
  },
  filterButton: {
    padding: 8,
    backgroundColor: "#e6f7ff",
    borderRadius: 6,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  summaryContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#001529",
    marginBottom: 10,
  },
  summaryContent: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryItemValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#001529",
  },
  summaryItemLabel: {
    fontSize: 12,
    color: "#4a4a4a",
  },
  expandedLogCard: {
    marginBottom: 35, // Increased from 25 to 35
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  activeTab: {
    backgroundColor: "#001529",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#001529",
    marginLeft: 8,
  },
  activeTabText: {
    color: "#ffffff",
  },
  anotherTabContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  anotherTabText: {
    fontSize: 18,
    color: "#001529",
  },
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
    alignItems: 'center',
    justifyContent: 'center',
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
  clearDateButton: {
    backgroundColor: "#001529",
    borderRadius: 15,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  lessonPlanTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001529',
  },
  lessonPlanDate: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  entryContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  dateSelectorContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
  },
  dateCard: {
    backgroundColor: "#e6f7ff",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#91d5ff",
  },
  dateCardText: {
    color: "#001529",
    fontSize: 14,
    fontWeight: "500",
  },
  weeklyLogsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  weeklyLogsContent: {
    marginTop: 20,
  },
  calendarCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  calendar: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
  },
  formContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
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
  emptyLogCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 50, // Add this line
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  emptyLogTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#001529",
    marginTop: 12,
    marginBottom: 8,
  },
  emptyLogText: {
    fontSize: 14,
    color: "#8c8c8c",
    textAlign: "center",
    marginBottom: 20,
  },
  addLogButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#001529",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addLogButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  calendarContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  lessonPlanCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default React.memo(WorkDoneLogScreen);

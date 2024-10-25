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
import { fetchWorkDoneLogs } from "../../Services/WorkDoneBook/WorkDoneBookService";
import useProfileStore from "../../store/profileStore";
import { Calendar } from "react-native-calendars";
import Icon from "react-native-vector-icons/AntDesign"; // Add this
import { ViewStyle, TextStyle, ImageStyle } from "react-native";

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

// Add this function after the interfaces and before the component
const generateDummyData = (): WorkDoneLog[] => {
  const dummyLogs: WorkDoneLog[] = [];

  // Generate logs for the last 5 days
  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const log: WorkDoneLog = {
      _id: `log_${i}`,
      date: date.toISOString(),
      teacherId: "teacher_123",
      schoolId: "school_123",
      teacherName: "Teacher Name",
      entries: [
        {
          _id: `entry_${i}_1`,
          classroomId: "class_1",
          classroomName: "Class 10-A",
          subjectId: "subject_1",
          subjectName: "Mathematics",
          topics: ["Quadratic Equations", "Algebraic Expressions"],
          activities: ["Group Problem Solving", "Quiz"],
          homework: ["Solve Exercise 5.1", "Practice Questions"],
        },
        {
          _id: `entry_${i}_2`,
          classroomId: "class_2",
          classroomName: "Class 10-B",
          subjectId: "subject_2",
          subjectName: "Physics",
          topics: ["Newton's Laws", "Force and Motion"],
          activities: ["Lab Experiment: Measuring Force"],
          homework: ["Complete Lab Report", "Read Chapter 3"],
        },
        {
          _id: `entry_${i}_3`,
          classroomId: "class_3",
          classroomName: "Class 9-A",
          subjectId: "subject_3",
          subjectName: "Chemistry",
          topics: ["Periodic Table"],
          activities: ["Element Classification Activity"],
          homework: ["Memorize First 20 Elements"],
        },
      ],
    };

    dummyLogs.push(log);
  }

  return dummyLogs;
};

const WorkDoneLogScreen: React.FC<WorkDoneLogScreenProps> = ({
  navigation,
}) => {
  const [workDoneLogs, setWorkDoneLogs] = useState<WorkDoneLog[]>([]);
  const [loading, setLoading] = useState(true);
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
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLogs(selectedDate);
    setRefreshing(false);
  }, [selectedDate, fetchLogs]);

  useEffect(() => {
    fetchLogs(undefined, true); // Pass true for isInitialLoad
  }, [fetchLogs]);

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
      <Text style={styles.headerTitle}>Work Done Logs</Text>
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
          Logs
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
          Another Tab
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#001529" />
      </View>
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
          <View style={styles.anotherTabContainer}>
            <Text style={styles.anotherTabText}>Content for Another Tab</Text>
          </View>
        )}
      </ScrollView>

      {renderDetailsModal()}
    </SafeAreaView>
  );
};

const additionalStyles = StyleSheet.create({
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
});

const newStyles = StyleSheet.create({
  emptyLogCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center" as const,
    marginTop: 20,
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
});

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
  calendarContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
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
  ...additionalStyles,
  ...newStyles,
});

export default React.memo(WorkDoneLogScreen);

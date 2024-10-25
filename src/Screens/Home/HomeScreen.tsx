import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  FlatList,
} from "react-native";
import { Text, Icon as AntIcon } from "@ant-design/react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import BottomNavBar from "../../Components/BottomNavBar";
import { ScrollView as GestureHandlerScrollView } from "react-native-gesture-handler";
import useProfileStore from "../../store/profileStore";
import { capitalizeText } from "../../utils/StringUtil";
import { UserRole } from "../../utils/roles";
import useEventStore from "../../store/eventStore";
import { getEvents } from "../../Services/Event/eventServices";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { fetchClassDailyRecords } from "../../Services/ClassDailyRecord/ClassDailyRecord";
import { Entry } from "../../Services/ClassDailyRecord/IClassDailyRecord";
import { useIsFocused } from '@react-navigation/native';
import { debounce } from 'lodash'; // Make sure to install lodash if not already present
import { IconName } from "../../Constants/Icons";
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAttendancePercentage } from "../../Services/Attendance/Attendance";

dayjs.extend(utc);

// ... existing imports ...



type HomeScreenProps = {
  navigation: StackNavigationProp<any, "Home">;
};

type Activity = {
  id: string;
  subject: string;
  teacherName: string;  // Add this
  topics: string[];
  activities?: string[];
  homework?: string[];
};

// Add this type definition
type AttendanceData = {
  percentage: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  streak: number;
  monthlyBreakdown: Array<{
    month: string;
    percentage: number;
    totalDays: number;
    presentDays: number;
  }>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const scrollViewRef = useRef<typeof GestureHandlerScrollView>(null);
  const profile = useProfileStore((state: any) => state.profile);
  const { events, setEvents } = useEventStore();
  const [todaysActivities, setTodaysActivities] = useState<Entry[] | []>([]);
  const [expandedItems, setExpandedItems] = useState<{[key: string]: boolean}>({});
  const isFocused = useIsFocused();
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const fetchedEvents = await getEvents();
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };
    loadEvents();
  }, []);

  const loadTodaysActivities = useCallback(async () => {
    if (profile.roles.includes(UserRole.STUDENT)) {
      const fetchedActivities = await fetchClassDailyRecords(dayjs().format("YYYY-MM-DD"));
      const allEntries = fetchedActivities.flatMap(record => record.entries);
      setTodaysActivities(allEntries);
    }
  }, [profile.roles]);

  const debouncedLoadActivities = useCallback(
    debounce(loadTodaysActivities, 1000, { leading: true, trailing: false }),
    [loadTodaysActivities]
  );

  useEffect(() => {
    if (isFocused && profile.roles.includes(UserRole.STUDENT)) {
      debouncedLoadActivities();
    }
  }, [isFocused, debouncedLoadActivities, profile.roles]);

  const mainCards: {
    icon: IconName;
    text: string;
    route: string;
    roles: string[];
  }[] = [
    {
      icon: "check-circle",
      text: "Take Attendance",
      route: "AddAttendance",
      roles: [UserRole.TEACHER],
    },
    {
      icon: "schedule",
      text: "Attendance Details",
      route: "ClassAttendanceDetails",
      roles: [UserRole.TEACHER],
    },
    {
      icon: "dollar",
      text: "Payments",
      route: "Payment",
      roles: [UserRole.STUDENT],
    },
    {
      icon: "file-text",
      text: "Marksheet",
      route: "Marksheet",
      roles: [UserRole.STUDENT],
    },
    {
      icon: "schedule",
      text: "Time Table",
      route: "Timetable",
      roles: [UserRole.STUDENT],
    },
    {
      icon: "book",
      text: "Class Details",
      route: "ClassDetails",
      roles: [UserRole.TEACHER, UserRole.ADMIN],
    },
  ];

  const academicCards: {
    icon: IconName;
    text: string;
    route: string;
    roles: string[];
  }[] = [
    {
      icon: "schedule",
      text: "Teacher Table",
      route: "TeacherTimetable",
      roles: [UserRole.TEACHER, UserRole.ADMIN],
    },
    { icon: "book", text: "Library", route: "Library", roles: [] },
    {
      icon: "user-switch",
      text: "Leave Request",
      route: "LeaveRequest",
      roles: [UserRole.STUDENT],
    },
    {
      icon: "check-circle",
      text: "Leave Approve",
      route: "LeaveApprove",
      roles: [UserRole.TEACHER, UserRole.ADMIN],
    },
    {
      icon: "audit",
      text: "Leave Request List",
      route: "LeaveRequestList",
      roles: [UserRole.STUDENT],
    },
    {
      icon: "book",
      text: "Syllabus",
      route: "Syllabus",
      roles: [UserRole.TEACHER, UserRole.ADMIN],
    },
    {
      icon: "laptop",
      text: "Work Done Book",
      route: "WorkDoneBook",
      roles: [UserRole.TEACHER, UserRole.ADMIN],
    },
    {
      icon: "highlight",
      text: "Class Summary",
      route: "ClassSummaryScreen",
      roles: [UserRole.STUDENT],
    },
    {
      icon: "book",
      text: "Lesson Plan",
      route: "LessonPlan",
      roles: [UserRole.TEACHER, UserRole.ADMIN],
    },
    {
      icon: "solution",
      text: "Work Log",
      route: "WorkDoneLog",
      roles: [UserRole.TEACHER, UserRole.ADMIN],
    },
    {
      icon: "profile",
      text: "MCQ",
      route: "SubjectSelection",
      roles: [UserRole.STUDENT],
    },
    {
      icon: "bar-chart",
      text: "MCQ Stats",
      route: "MCQStats",
      roles: [UserRole.STUDENT],
    },
    {
      icon: "container",
      text: "Flash Cards",
      route: "FlashCardScreen",
      roles: [UserRole.STUDENT],
    },
    // { icon: "chat", text: "Chat", route: "Chat", roles: [UserRole.STUDENT] },
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const viewSize = event.nativeEvent.layoutMeasurement.width;
    const contentSize = event.nativeEvent.contentSize.width;

    const cardWidth = Dimensions.get("window").width * 0.4 + 20; // Card width + margin
    const visibleCards = mainCards.filter((card) =>
      card.roles.some((role: any) => profile.roles.includes(role))
    );
    const totalCards = visibleCards.length;

    let newIndex = Math.round(contentOffset / cardWidth);

    // Ensure the index is within bounds
    newIndex = Math.max(0, Math.min(newIndex, totalCards - 1));

    // Check if we're at the end of the scroll
    if (contentOffset + viewSize >= contentSize - 1) {
      newIndex = totalCards - 1;
    }

    setActiveCardIndex(newIndex);
  };

  useEffect(() => {
    console.log(profile);
  }, [profile]);

  const formatTeacherName = (name: string) => {
    if (name.length <= 18) return name;
    
    const parts = name.split(' ');
    if (parts.length <= 1) return name.slice(0, 18);
    
    // Return everything after the first space
    return parts.slice(1).join(' ');
  };

  const renderEventItem = ({ item }: { item: any }) => {
    const startDate = dayjs(item.startDate).utc();
    const endDate = dayjs(item.endDate).utc();

    return (
      <View style={styles.eventItem}>
        <View style={styles.eventDate}>
          <Text style={styles.eventDay}>{startDate.format("D")}</Text>
          <Text style={styles.eventMonth}>
            {startDate.format("MMM").toUpperCase()}
          </Text>
        </View>
        <View style={styles.eventDetails}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventTime}>
            {startDate.format("MMM D, YYYY")} - {endDate.format("MMM D, YYYY")}
          </Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>
          {profile.firstName} {profile.lastName}
        </Text>
        <View style={styles.gradeBadge}>
          <Text style={styles.gradeText}>
            {profile?.roles?.map((role: any) => capitalizeText(role))}
          </Text>
        </View>
      </View>
      <Image
        source={{ uri: "https://example.com/profile-pic.jpg" }}
        style={styles.profilePic}
      />
    </View>
  );

  // Modify the fetchAttendanceData function
  const fetchAttendanceData = useCallback(async () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const cachedData = await AsyncStorage.getItem('attendanceData');
    const cachedUserId = await AsyncStorage.getItem('cachedUserId');
    
    if (cachedData && cachedUserId === profile._id) {
      const { data, timestamp } = JSON.parse(cachedData);
      const cachedDate = new Date(timestamp);
      
      // Check if the cached data is from today and before midnight
      if (cachedDate.toISOString().split('T')[0] === today && cachedDate.getDate() === now.getDate()) {
        setAttendanceData(data);
        return;
      }
    }
    
    try {
      const newData = await getAttendancePercentage();
      setAttendanceData(newData);
      await AsyncStorage.setItem('attendanceData', JSON.stringify({
        data: newData,
        timestamp: now.toISOString()
      }));
      await AsyncStorage.setItem('cachedUserId', profile._id);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  }, [profile._id]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  // Modify the renderAttendanceSection function
  const renderAttendanceSection = () => {
    const placeholderData = {
      percentage: 0,
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      streak: 0
    };

    const { percentage, totalDays, presentDays, absentDays, streak } = attendanceData || placeholderData;
    const isStudent = profile.roles.includes(UserRole.STUDENT);

    return (
      <View style={styles.attendanceSection}>
        <View style={styles.attendanceHeader}>
          <Text style={styles.attendanceSectionTitle}>Attendance Overview</Text>
          <View style={styles.streakBadge}>
            <MaterialCommunityIcons name="fire" size={16} color="#FF9800" />
            <Text style={styles.streakText}>{attendanceData ? streak : 'N/A'}</Text>
          </View>
        </View>
        <View style={styles.attendanceContent}>
          <View style={styles.attendanceCircle}>
            <AnimatedCircularProgress
              size={100}
              width={10}
              fill={attendanceData ? percentage : 0}
              tintColor="#ffffff"
              backgroundColor="#1E3A5F"
              rotation={0}
              lineCap="round"
            >
              {(fill) => (
                <View style={styles.attendancePercentageContainer}>
                  <Text style={styles.attendancePercentageText}>
                    {attendanceData ? `${Math.round(fill)}%` : 'N/A'}
                  </Text>
                  <Text style={styles.attendancePercentageLabel}>Present</Text>
                </View>
              )}
            </AnimatedCircularProgress>
          </View>
          <View style={styles.attendanceStats}>
            <View style={styles.attendanceStatItem}>
              <MaterialIcons name="calendar-today" size={24} color="#ffffff" />
              <Text style={styles.attendanceStatValue}>{attendanceData ? totalDays : 'N/A'}</Text>
              <Text style={styles.attendanceStatLabel}>Total Days</Text>
            </View>
            <View style={styles.attendanceStatItem}>
              <MaterialIcons name="check-circle" size={24} color="#ffffff" />
              <Text style={styles.attendanceStatValue}>{attendanceData ? presentDays : 'N/A'}</Text>
              <Text style={styles.attendanceStatLabel}>Present</Text>
            </View>
            <View style={styles.attendanceStatItem}>
              <MaterialIcons name="cancel" size={24} color="#ffffff" />
              <Text style={styles.attendanceStatValue}>{attendanceData ? absentDays : 'N/A'}</Text>
              <Text style={styles.attendanceStatLabel}>Absent</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.attendanceButton, !isStudent && styles.attendanceButtonDisabled]}
          onPress={() => isStudent && navigation.navigate("Attendance")}
          disabled={!isStudent}
        >
          <FontAwesome5 name="calendar-check" size={16} color={isStudent ? "#001529" : "#808080"} />
          <Text style={[styles.attendanceButtonText, !isStudent && styles.attendanceButtonTextDisabled]}>
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderQuickActions = () => (
    <>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsContainer}>
        <GestureHandlerScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalCardContainer}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={Dimensions.get("window").width * 0.4 + 20}
          snapToAlignment="center"
        >
          {mainCards
            .filter((card) =>
              card.roles.some((role: any) => profile.roles.includes(role))
            )
            .map((card, index) => (
              <TouchableOpacity
                key={index}
                style={styles.horizontalCard}
                onPress={() => navigation.navigate(card.route)}
              >
                <View style={styles.cardIconContainer}>
                  <AntIcon name={card.icon as any} size={28} color="#ffffff" />
                </View>
                <Text style={styles.cardText}>{card.text}</Text>
              </TouchableOpacity>
            ))}
          <View style={{ width: Dimensions.get("window").width * 0.2 }} />
        </GestureHandlerScrollView>
        <View style={styles.scrollIndicator}>
          {mainCards
            .filter((card) =>
              card.roles.some((role: any) => profile.roles.includes(role))
            )
            .map((_, index) => (
              <View
                key={index}
                style={[
                  styles.scrollDot,
                  index === activeCardIndex && styles.activeScrollDot,
                ]}
              />
            ))}
        </View>
      </View>
    </>
  );

  const renderAcademicsSection = () => (
    <View style={styles.academicsSection}>
      <Text style={styles.sectionTitle}>Academics</Text>
      <View style={styles.academicsCards}>
        {academicCards
          .filter((card) =>
            card.roles.some((role: any) => profile.roles.includes(role))
          )
          .map((card, index) => (
            <TouchableOpacity
              key={index}
              style={styles.academicCard}
              onPress={() => navigation.navigate(card.route)}
            >
              <View style={styles.academicCardIcon}>
                <AntIcon name={card.icon as any} size={24} color="#ffffff" />
              </View>
              <Text style={styles.academicCardText}>{card.text}</Text>
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );

  const renderEventsSection = () => (
    <View style={styles.eventsSection}>
      <Text style={styles.sectionTitle}>Upcoming Events</Text>
      {events.filter((event) =>
        dayjs(event.endDate).utc().isAfter(dayjs().utc())
      ).length > 0 ? (
        <FlatList
          data={events
            .filter((event) =>
              dayjs(event.endDate).utc().isAfter(dayjs().utc())
            )
            .sort((a, b) =>
              dayjs(a.endDate).utc().diff(dayjs(b.startDate).utc())
            )}
          renderItem={renderEventItem}
          keyExtractor={(item) => item._id}
          style={styles.eventList}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.noEventsContainer}>
          <Ionicons name="calendar-outline" size={40} color="#95A5A6" />
          <Text style={styles.noEventsText}>No events found</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.viewAllButton}
        onPress={() => navigation.navigate("Calendar")}
      >
        <Text style={styles.viewAllButtonText}>View All Events</Text>
      </TouchableOpacity>
    </View>
  );

  const renderActivityItem = ({ item }: { item: Activity }) => {
    const isExpanded = expandedItems[item.id] || false;

    const toggleExpand = () => {
      setExpandedItems(prev => ({
        ...prev,
        [item.id]: !prev[item.id]
      }));
    };

    return (
      <TouchableOpacity 
        style={[styles.activityItem, isExpanded && styles.activityItemExpanded]} 
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.activityHeader}>
          <View style={styles.subjectBadge}>
            <MaterialIcons name="subject" size={16} color="#ffffff" />
            <Text style={styles.activitySubjectText}>{item.subject}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.teacherBadge}>
              <Text style={styles.teacherName}>{formatTeacherName(item.teacherName)}</Text>
            </View>
            <MaterialIcons 
              name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={24} 
              color="#001529" 
            />
          </View>
        </View>
        
        {isExpanded && (
          <View style={styles.contentSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoColumn}>
                <View style={styles.sectionHeaderRow}>
                  <MaterialCommunityIcons name="book-open-variant" size={12} color="#4a4a4a" />
                  <Text style={styles.sectionLabel}>Topics</Text>
                </View>
                <View style={styles.contentList}>
                  {(isExpanded ? item.topics : item.topics.slice(0, 1)).map((topic, index) => (
                    <Text key={index} style={styles.contentText} numberOfLines={1}>• {topic}</Text>
                  ))}
                  {!isExpanded && item.topics.length > 1 && (
                    <Text style={styles.moreText}>+{item.topics.length - 1} more</Text>
                  )}
                </View>
              </View>

              {item.activities && item.activities.length > 0 && (
                <View style={styles.infoColumn}>
                  <View style={styles.sectionHeaderRow}>
                    <MaterialCommunityIcons name="clipboard-list" size={12} color="#4a4a4a" />
                    <Text style={styles.sectionLabel}>Activities</Text>
                  </View>
                  <View style={styles.contentList}>
                    {(isExpanded ? item.activities : item.activities.slice(0, 1)).map((activity, index) => (
                      <Text key={index} style={styles.contentText} numberOfLines={1}>• {activity}</Text>
                    ))}
                    {!isExpanded && item.activities.length > 1 && (
                      <Text style={styles.moreText}>+{item.activities.length - 1} more</Text>
                    )}
                  </View>
                </View>
              )}
            </View>

            {item.homework && item.homework.length > 0 && (
              <View style={styles.homeworkSection}>
                <View style={styles.sectionHeaderRow}>
                  <MaterialCommunityIcons name="notebook" size={12} color="#4a4a4a" />
                  <Text style={styles.sectionLabel}>Homework</Text>
                </View>
                <View style={styles.contentList}>
                  {(isExpanded ? item.homework : item.homework.slice(0, 1)).map((hw, index) => (
                    <Text key={index} style={styles.contentText} numberOfLines={1}>• {hw}</Text>
                  ))}
                  {!isExpanded && item.homework.length > 1 && (
                    <Text style={styles.moreText}>+{item.homework.length - 1} more</Text>
                  )}
                </View>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderTodaysActivitiesSection = () => (
    <View style={styles.activitiesSection}>
      <Text style={styles.sectionTitle}>Today's Class Summary</Text>
      {todaysActivities.length > 0 ? (
        <>
          <FlatList
            data={todaysActivities.slice(0, 4).map((entry, index) => ({  // Changed from 2 to 4
              id: `${entry.subjectId}-${index}`,
              subject: entry.subjectName,
              teacherName: entry.teacherName,
              topics: entry.topics,
              activities: entry.activities,
              homework: entry.homework
            }))}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate("ClassSummaryScreen")}
          >
            <Text style={styles.viewAllButtonText}>View All Classes</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.noActivitiesContainer}>
          <MaterialIcons name="event-busy" size={40} color="#95A5A6" />
          <Text style={styles.noActivitiesText}>No classes scheduled for today</Text>
        </View>
      )}
    </View>
  );

  const renderItem = ({ item }: { item: string }) => {
    // Only include todaysActivities in the switch case if user is a student
    if (item === "todaysActivities" && !profile.roles.includes(UserRole.STUDENT)) {
      return null;
    }

    switch (item) {
      case "header":
        return renderHeader();
      case "attendance":
        return renderAttendanceSection();
      case "quickActions":
        return renderQuickActions();
      case "academics":
        return renderAcademicsSection();
      case "todaysActivities":
        return renderTodaysActivitiesSection();
      case "events":
        return renderEventsSection();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={[
            "header",
            "attendance",
            "quickActions",
            "academics",
            "todaysActivities",
            "events"
          ].filter(item => 
            item !== "todaysActivities" || profile.roles.includes(UserRole.STUDENT)
          )}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        />
        <BottomNavBar />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001529",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "#001529",
    padding: 20,
    borderRadius: 15,
  },
  greeting: {
    color: "#ffffff",
    fontSize: 16,
    opacity: 0.8,
  },
  userName: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 5,
  },
  gradeBadge: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  gradeText: {
    color: "#001529",
    fontWeight: "bold",
  },
  profilePic: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  attendanceSection: {
    backgroundColor: "#001529",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  attendanceSectionTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A5F',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  streakText: {
    color: '#FF9800',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 5,
  },
  attendanceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  attendanceCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendancePercentageContainer: {
    alignItems: 'center',
  },
  attendancePercentageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  attendancePercentageLabel: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  attendanceStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  attendanceStatItem: {
    alignItems: 'center',
  },
  attendanceStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 5,
  },
  attendanceStatLabel: {
    fontSize: 12,
    color: '#a0a0a0',
    marginTop: 2,
  },
  attendanceButton: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
  },
  attendanceButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  attendanceButtonText: {
    color: '#001529',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  attendanceButtonTextDisabled: {
    color: '#808080',
  },
  quickActionsContainer: {
    marginBottom: 20,
  },
  horizontalCardContainer: {
    paddingLeft: 20,
  },
  horizontalCard: {
    width: Dimensions.get("window").width * 0.4,
    height: 140,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    backgroundColor: "#001529",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  scrollIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    height: 10, // Add a fixed height
  },
  scrollDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#001529",
    marginHorizontal: 3,
    opacity: 0.3,
  },
  activeScrollDot: {
    opacity: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  academicsSection: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    color: "#001529",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  academicsCards: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    // justifyContent: 'space-between',
  },
  academicCard: {
    width: "31%", // Changed from 30% to 31%
    aspectRatio: 1,
    backgroundColor: "#f0f2f5",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  academicCardIcon: {
    width: "60%", // Changed from fixed 50 to 60%
    aspectRatio: 1,
    borderRadius: 25,
    backgroundColor: "#001529",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  academicCardText: {
    color: "#001529",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  eventsSection: {
    backgroundColor: "#f0f2f5",
    borderRadius: 15,
    padding: 20,
    marginTop: 30,
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  eventDate: {
    width: 60,
    height: 60,
    backgroundColor: "#001529",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  eventDay: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  eventMonth: {
    color: "#ffffff",
    fontSize: 12,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    color: "#001529",
    fontSize: 16,
    fontWeight: "bold",
  },
  eventTime: {
    color: "#808080",
    fontSize: 14,
  },
  eventList: {
    maxHeight: 200,
  },
  noEventsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  noEventsText: {
    fontSize: 16,
    color: "#95A5A6",
    fontStyle: "italic",
    marginTop: 10,
  },
  noEventsSubText: {
    color: "#808080",
    fontSize: 14,
    marginTop: 5,
  },
  addEventButton: {
    backgroundColor: "#001529",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 15,
  },
  addEventButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  activitiesSection: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    height: 60, // Reduced height for collapsed view
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityItemExpanded: {
    height: 'auto',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    height: 60,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#001529',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  teacherBadge: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  activitySubjectText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  teacherName: {
    fontSize: 11,
    color: '#1a73e8',
    fontWeight: '500',
  },
  contentSection: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoColumn: {
    flex: 1,
    marginRight: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionLabel: {
    color: '#4a4a4a',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  contentList: {
    paddingLeft: 4,
  },
  contentText: {
    color: '#4a4a4a',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 2,
  },
  moreText: {
    color: '#6c757d',
    fontSize: 12,
    fontStyle: 'italic',
    marginLeft: 12,
  },
  homeworkSection: {
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
    paddingTop: 8,
    marginTop: 4,
  },
  noActivitiesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  noActivitiesText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 8,
  },
  viewAllButton: {
    backgroundColor: '#001529',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 12,
  },
  viewAllButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default HomeScreen;

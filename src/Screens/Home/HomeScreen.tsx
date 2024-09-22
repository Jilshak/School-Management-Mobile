import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Text, Icon as AntIcon } from "@ant-design/react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import BottomNavBar from "../../Components/BottomNavBar";
import { ScrollView as GestureHandlerScrollView } from 'react-native-gesture-handler';

type IconName = "file-text" | "schedule" | "book" | "user-switch" | "check-circle" | "dollar";

type HomeScreenProps = {
  navigation: StackNavigationProp<any, "Home">;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const scrollViewRef = useRef<GestureHandlerScrollView>(null);

  const mainCards: { icon: IconName; text: string; route: string }[] = [
    { icon: 'check-circle', text: 'Take Attendance', route: 'AddAttendance' },
    { icon: 'dollar', text: 'Payments', route: 'Payment' },
    { icon: 'book', text: 'Class Details', route: 'ClassDetails' },
    { icon: 'dollar', text: 'Payments', route: 'Payment' },
  ];

  const academicCards: { icon: IconName; text: string; route: string }[] = [
    { icon: 'file-text', text: 'Marksheet', route: 'Marksheet' },
    { icon: 'schedule', text: 'Time Table', route: 'Timetable' },
    { icon: 'schedule', text: 'Teacher Table', route: 'TeacherTimetable' },
    { icon: 'book', text: 'Library', route: 'Library' },
    { icon: 'user-switch', text: 'Leave Request', route: 'LeaveRequest' },
    { icon: 'check-circle', text: 'Leave Approve', route: 'LeaveApprove' },
    { icon: 'book', text: 'Syllabus', route: 'Syllabus' },
    { icon: 'file-text', text: 'Work Done Book', route: 'WorkDoneBook' },
    { icon: 'book', text: 'Revisions of the Week', route: 'RevisionsOfTheWeek' },
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const viewSize = event.nativeEvent.layoutMeasurement.width;
    const contentSize = event.nativeEvent.contentSize.width;
    
    const cardWidth = Dimensions.get('window').width * 0.45 + 15; // Card width + margin
    const newIndex = Math.round(contentOffset / cardWidth);
    
    if (contentOffset + viewSize >= contentSize - 1) {
      setActiveCardIndex(mainCards.length - 1);
    } else {
      setActiveCardIndex(Math.min(newIndex, mainCards.length - 1));
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>MUHAMMED AYAAN P P</Text>
              <View style={styles.gradeBadge}>
                <Text style={styles.gradeText}>UKG</Text>
              </View>
            </View>
            <Image
              source={{ uri: "https://example.com/profile-pic.jpg" }}
              style={styles.profilePic}
            />
          </View>

          <View style={styles.attendanceSection}>
            <Text style={styles.sectionTitle}>Attendance</Text>
            <View style={styles.attendanceProgress}>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: '85%' }]} />
              </View>
              <Text style={styles.attendanceText}>85% Present</Text>
            </View>
            <TouchableOpacity
              style={styles.attendanceButton}
              onPress={() => navigation.navigate("Attendance")}
            >
              <AntIcon name="check-circle" size={24} color="#ffffff" />
              <Text style={styles.attendanceButtonText}>
                View Attendance Details
              </Text>
            </TouchableOpacity>
          </View>

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
              snapToInterval={Dimensions.get('window').width * 0.45 + 15}
              snapToAlignment="center"
            >
              {mainCards.map((card, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.horizontalCard}
                  onPress={() => navigation.navigate(card.route)}
                >
                  <AntIcon name={card.icon} size={40} color="#ffffff" />
                  <Text style={styles.cardText}>{card.text}</Text>
                </TouchableOpacity>
              ))}
              <View style={{ width: Dimensions.get('window').width * 0.275 }} />
            </GestureHandlerScrollView>
            <View style={styles.scrollIndicator}>
              {mainCards.map((_, index) => (
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

          <View style={styles.academicsSection}>
            <Text style={styles.sectionTitle}>Academics</Text>
            <View style={styles.academicsCards}>
              {academicCards.map((card, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.academicCard}
                  onPress={() => navigation.navigate(card.route)}
                >
                  <View style={styles.academicCardIcon}>
                    <AntIcon name={card.icon} size={24} color="#ffffff" />
                  </View>
                  <Text style={styles.academicCardText}>{card.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.eventsSection}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <View style={styles.eventItem}>
              <View style={styles.eventDate}>
                <Text style={styles.eventDay}>15</Text>
                <Text style={styles.eventMonth}>MAY</Text>
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>Annual Sports Day</Text>
                <Text style={styles.eventTime}>9:00 AM - 4:00 PM</Text>
              </View>
            </View>
            <View style={styles.eventItem}>
              <View style={styles.eventDate}>
                <Text style={styles.eventDay}>20</Text>
                <Text style={styles.eventMonth}>MAY</Text>
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>Parent-Teacher Meeting</Text>
                <Text style={styles.eventTime}>2:00 PM - 5:00 PM</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate("Calendar")}
            >
              <Text style={styles.viewAllButtonText}>View All Events</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    backgroundColor: "#f0f2f5",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  attendanceProgress: {
    marginBottom: 15,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 5,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#001529',
    borderRadius: 2,
  },
  attendanceText: {
    color: "#001529",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  attendanceButton: {
    backgroundColor: "#001529",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
  },
  attendanceButtonText: {
    color: "#ffffff",
    marginLeft: 10,
    fontWeight: "bold",
    fontSize: 16,
  },
  quickActionsContainer: {
    marginBottom: 20,
  },
  horizontalCardContainer: {
    paddingLeft: 20,
  },
  horizontalCard: {
    width: Dimensions.get('window').width * 0.45,
    height: 150,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    backgroundColor: "#001529",
  },
  scrollIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  scrollDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#001529',
    marginHorizontal: 4,
    opacity: 0.3,
  },
  activeScrollDot: {
    opacity: 1,
  },
  cardText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  academicsSection: {
    backgroundColor: '#ffffff',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  academicCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#f0f2f5',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    paddingTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  academicCardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#001529',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  academicCardText: {
    color: '#001529',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
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
  viewAllButton: {
    backgroundColor: "#001529",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  viewAllButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default HomeScreen;

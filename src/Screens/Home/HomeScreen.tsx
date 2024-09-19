import React from 'react';
import { View, StyleSheet, ScrollView, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { Text, Icon as AntIcon, Progress } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type HomeScreenProps = {
  navigation: StackNavigationProp<any, 'Home'>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
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
              source={{ uri: 'https://example.com/profile-pic.jpg' }}
              style={styles.profilePic}
            />
          </View>

          <View style={styles.cardContainer}>
            <TouchableOpacity style={[styles.card, styles.videosCard]}>
              <AntIcon name="play-circle" size={40} color="#ffffff" />
              <Text style={styles.cardText}>Videos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.card, styles.materialsCard]}>
              <AntIcon name="book" size={40} color="#ffffff" />
              <Text style={styles.cardText}>Materials</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.attendanceSection}>
            <Text style={styles.sectionTitle}>Attendance</Text>
            <View style={styles.attendanceProgress}>
              <Progress percent={85} />
              <Text style={styles.attendanceText}>85% Present</Text>
            </View>
            <TouchableOpacity style={styles.attendanceButton}>
              <AntIcon name="check-circle" size={24} color="#ffffff" />
              <Text style={styles.attendanceButtonText}>View Attendance Details</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.academicsSection}>
            <Text style={styles.sectionTitle}>Academics</Text>
            <View style={styles.academicsCards}>
              <TouchableOpacity style={styles.academicCard}>
                <AntIcon name="file-text" size={30} color="#001529" />
                <Text style={styles.academicCardText}>Marksheet</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.academicCard}>
                <AntIcon name="schedule" size={30} color="#001529" />
                <Text style={styles.academicCardText}>Time Table</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.academicCard}>
                <AntIcon name="mail" size={30} color="#001529" />
                <Text style={styles.academicCardText}>Mailbox</Text>
              </TouchableOpacity>
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
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllButtonText}>View All Events</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <AntIcon name="home" size={24} color="#001529" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <AntIcon name="calendar" size={24} color="#808080" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <AntIcon name="notification" size={24} color="#808080" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <AntIcon name="user" size={24} color="#808080" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001529', // Set the background color for the status bar area
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#001529',
    padding: 20,
    borderRadius: 15,
  },
  greeting: {
    color: '#ffffff',
    fontSize: 16,
    opacity: 0.8,
  },
  userName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  gradeBadge: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  gradeText: {
    color: '#001529',
    fontWeight: 'bold',
  },
  profilePic: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  card: {
    width: '48%',
    height: 150,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videosCard: {
    backgroundColor: '#001529',
  },
  materialsCard: {
    backgroundColor: '#002140',
  },
  cardText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  attendanceSection: {
    backgroundColor: '#f0f2f5',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  attendanceProgress: {
    marginBottom: 15,
  },
  attendanceText: {
    color: '#001529',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  attendanceButton: {
    backgroundColor: '#001529',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
  },
  attendanceButtonText: {
    color: '#ffffff',
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 16,
  },
  academicsSection: {
    backgroundColor: '#f0f2f5',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#001529',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  academicsCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  academicCard: {
    width: '30%',
    height: 100,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  academicCardText: {
    color: '#001529',
    marginTop: 5,
    fontWeight: 'bold',
  },
  eventsSection: {
    backgroundColor: '#f0f2f5',
    borderRadius: 15,
    padding: 20,
    marginTop: 30,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  eventDate: {
    width: 60,
    height: 60,
    backgroundColor: '#001529',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  eventDay: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventMonth: {
    color: '#ffffff',
    fontSize: 12,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    color: '#001529',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventTime: {
    color: '#808080',
    fontSize: 14,
  },
  viewAllButton: {
    backgroundColor: '#001529',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  viewAllButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navItem: {
    alignItems: 'center',
  },
});

export default HomeScreen;
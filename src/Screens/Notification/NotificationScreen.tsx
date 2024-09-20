import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, SectionList, Modal, ScrollView } from 'react-native';
import { Text, Icon as AntIcon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import BottomNavBar from '../../Components/BottomNavBar';

type NotificationScreenProps = {
  navigation: StackNavigationProp<any, 'Notification'>;
};

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  date: string;
  fullMessage: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Assignment',
    message: 'You have a new Math assignment due next week.',
    timestamp: '2 hours ago',
    read: false,
    date: 'Today',
    fullMessage: 'You have a new Math assignment due next week. Please log in to the student portal to access the assignment details and submission guidelines. Make sure to complete and submit it before the deadline.',
  },
  {
    id: '2',
    title: 'Exam Schedule',
    message: 'The final exam schedule has been posted.',
    timestamp: '1 day ago',
    read: true,
    date: 'Yesterday',
    fullMessage: 'The final exam schedule for this semester has been posted. Please check the school website or bulletin board for the complete timetable. Make sure to note down the dates, times, and venues for all your exams.',
  },
  {
    id: '3',
    title: 'School Event',
    message: 'Annual sports day is scheduled for next month.',
    timestamp: '2 days ago',
    read: false,
    date: 'This Week',
    fullMessage: 'The annual sports day event is scheduled for next month. We encourage all students to participate in various sports activities. Registration for different events will begin next week. Stay tuned for more information about the event schedule and registration process.',
  },
  // Add more mock notifications as needed
];

const groupNotificationsByDate = (notifications: Notification[]) => {
  const grouped = notifications.reduce((acc, notification) => {
    if (!acc[notification.date]) {
      acc[notification.date] = [];
    }
    acc[notification.date].push(notification);
    return acc;
  }, {} as Record<string, Notification[]>);

  return Object.entries(grouped).map(([date, data]) => ({ title: date, data }));
};

const NotificationScreen: React.FC<NotificationScreenProps> = ({ navigation }) => {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      style={styles.notificationItem}
      onPress={() => setSelectedNotification(item)}
    >
      <View style={styles.notificationIcon}>
        <AntIcon name="notification" size={24} color="#001529" />
      </View>
      <View style={styles.notificationMainInfo}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.notificationTimestamp}>{item.timestamp}</Text>
      </View>
      {!item.read && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntIcon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <AntIcon name="bell" size={24} color="#ffffff" />
      </View>

      <View style={styles.contentContainer}>
        <SectionList
          sections={groupNotificationsByDate(mockNotifications)}
          renderItem={renderNotificationItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.notificationList}
        />
      </View>

      <Modal
        visible={!!selectedNotification}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedNotification(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedNotification?.title}</Text>
              <TouchableOpacity onPress={() => setSelectedNotification(null)}>
                <AntIcon name="close" size={24} color="#001529" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalTimestamp}>{selectedNotification?.timestamp}</Text>
            <ScrollView style={styles.modalScrollView}>
              <Text style={styles.modalMessage}>{selectedNotification?.fullMessage}</Text>
            </ScrollView>
            <TouchableOpacity 
              style={styles.markAsReadButton}
              onPress={() => {
                // Implement mark as read functionality here
                setSelectedNotification(null);
              }}
            >
              <Text style={styles.markAsReadButtonText}>Mark as Read</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  contentContainer: {
    flex: 1,
    marginTop: 80,
    marginBottom: 60, // Add bottom margin to accommodate BottomNavBar
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
  notificationList: {
    padding: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
    backgroundColor: '#f0f2f5',
    padding: 10,
    marginTop: 10,
    marginBottom: 5,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  notificationIcon: {
    marginRight: 15,
  },
  notificationMainInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001529',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#4a4a4a',
    marginTop: 5,
  },
  notificationTimestamp: {
    fontSize: 12,
    color: '#8c8c8c',
    marginTop: 5,
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1890ff',
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#001529',
    flex: 1,
    paddingRight: 10,
  },
  modalTimestamp: {
    fontSize: 14,
    color: '#8c8c8c',
    marginBottom: 15,
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalMessage: {
    fontSize: 16,
    color: '#4a4a4a',
    lineHeight: 24,
  },
  markAsReadButton: {
    backgroundColor: '#001529',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  markAsReadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NotificationScreen;
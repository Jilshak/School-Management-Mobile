import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { Text, Icon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Calendar, DateData } from 'react-native-calendars';

type ClassSummaryScreenProps = {
  navigation: StackNavigationProp<any, 'ClassSummary'>;
};

type Activity = {
  id: string;
  subject: string;
  topic: string;
  activity?: string;
  homework?: string;
};

type ExpandedActivities = { [key: string]: boolean };

const ClassSummaryScreen: React.FC<ClassSummaryScreenProps> = ({ navigation }) => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [markedDates, setMarkedDates] = useState<{[key: string]: any}>({
    [today]: { selected: true, selectedColor: '#001529' }
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [expandedActivities, setExpandedActivities] = useState<ExpandedActivities>({});

  useEffect(() => {
    loadActivities(selectedDate);
  }, [selectedDate]);

  const loadActivities = async (date: string) => {
    try {
      // Simulating API call with dummy data for the current date only
      if (date === today) {
        const dummyData = [
          {
            id: '1',
            subject: 'Mathematics',
            topics: ['Algebra', 'Geometry'],
            activities: 'Problem solving exercises',
            homework: 'Complete worksheet',
          },
          {
            id: '2',
            subject: 'Science',
            topics: ['Biology', 'Chemistry'],
            activities: 'Lab experiment',
            homework: 'Write lab report',
          },
        ];
        const formattedActivities: Activity[] = dummyData.map((item: any) => ({
          id: item.id,
          subject: item.subject,
          topic: item.topics.join(', '),
          activity: item.activities,
          homework: item.homework,
        }));
        setActivities(formattedActivities);
      } else {
        // For any other date, set activities to an empty array
        setActivities([]);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      setActivities([]);
    }
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    setMarkedDates({
      [day.dateString]: { selected: true, selectedColor: '#001529' }
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const toggleActivityExpansion = (id: string) => {
    setExpandedActivities(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderActivityItem = ({ item }: { item: Activity }) => (
    <TouchableOpacity onPress={() => toggleActivityExpansion(item.id)} style={styles.activityItem}>
      <View style={styles.activityHeader}>
        <Text style={styles.activitySubjectText}>{item.subject}</Text>
        <Icon name={expandedActivities[item.id] ? "up" : "down"} size={16} color="#001529" />
      </View>
      <View style={styles.activitySection}>
        <View style={styles.sectionHeaderContainer}>
          <Icon name="book" size={16} color="#001529" />
          <Text style={styles.sectionHeader}>Topics:</Text>
        </View>
        <View style={styles.itemsContainer}>
          {item.topic.split(', ').map((topic, index) => (
            <Text key={index} style={styles.activityText}>• {topic}</Text>
          ))}
        </View>
      </View>
      {expandedActivities[item.id] && (
        <>
          {item.activity && (
            <View style={styles.activitySection}>
              <View style={styles.sectionHeaderContainer}>
                <Icon name="experiment" size={16} color="#001529" />
                <Text style={styles.sectionHeader}>Activities:</Text>
              </View>
              <View style={styles.itemsContainer}>
                <Text style={styles.activityText}>• {item.activity}</Text>
              </View>
            </View>
          )}
          {item.homework && (
            <View style={styles.activitySection}>
              <View style={styles.sectionHeaderContainer}>
                <Icon name="home" size={16} color="#001529" />
                <Text style={styles.sectionHeader}>Homework:</Text>
              </View>
              <View style={styles.itemsContainer}>
                <Text style={styles.activityText}>• {item.homework}</Text>
              </View>
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Class Summary</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Daily Class Summary</Text>

          <View style={styles.dateContainer}>
            <Calendar
              style={styles.calendar}
              onDayPress={handleDayPress}
              markedDates={markedDates}
              current={today}
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
              <Text style={styles.selectedDateText}>Selected Date: {formatDate(selectedDate)}</Text>
              <TouchableOpacity 
                style={styles.clearDateButton}
                onPress={() => {
                  setSelectedDate(today);
                  setMarkedDates({
                    [today]: { selected: true, selectedColor: '#001529' }
                  });
                }}
              >
                <Icon name="reload" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.activitiesSection}>
            <Text style={styles.sectionTitle}>Activities for {formatDate(selectedDate)}</Text>
            {activities.length > 0 ? (
              <FlatList
                data={activities}
                renderItem={renderActivityItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.noActivitiesContainer}>
                <Icon name="inbox" size={40} color="#95A5A6" />
                <Text style={styles.noActivitiesText}>No activities found for this date</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
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
  activitiesSection: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
  },
  activityItem: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  activitySubjectText: {
    color: '#001529',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  activitySection: {
    marginBottom: 10,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001529',
    marginLeft: 5,
  },
  itemsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    padding: 10,
  },
  activityText: {
    color: '#4a4a4a',
    fontSize: 14,
    marginBottom: 3,
  },
  noActivitiesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noActivitiesText: {
    fontSize: 16,
    color: '#95A5A6',
    fontStyle: 'italic',
    marginTop: 10,
    textAlign: 'center',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default ClassSummaryScreen;

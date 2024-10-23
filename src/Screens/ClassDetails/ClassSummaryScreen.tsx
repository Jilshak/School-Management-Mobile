import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { Text, Icon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Calendar, DateData } from 'react-native-calendars';
import dayjs from 'dayjs';
import { fetchClassDailyRecords } from '../../Services/ClassDailyRecord/ClassDailyRecord';
import { Entry } from '../../Services/ClassDailyRecord/IClassDailyRecord';

const BADGE_COLORS = [
  '#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#eb2f96', '#13c2c2', '#f5222d',
  '#2f54eb', '#faad14', '#fadb14', '#a0d911', '#eb2f96', '#fa541c', '#36cfc9',
  '#9254de', '#ff7a45', '#ffa940', '#bae637', '#ff4d4f', '#40a9ff', '#73d13d',
  '#597ef7', '#ffc53d', '#ff85c0', '#ff9c6e', '#95de64', '#69c0ff', '#b37feb'
];

type ClassSummaryScreenProps = {
  navigation: StackNavigationProp<any, 'ClassSummary'>;
};

const ClassSummaryScreen: React.FC<ClassSummaryScreenProps> = ({ navigation }) => {
  const today = dayjs().format('YYYY-MM-DD');
  const [selectedDate, setSelectedDate] = useState(today);
  const [markedDates, setMarkedDates] = useState<{[key: string]: any}>({
    [today]: { selected: true, selectedColor: '#001529' }
  });
  const [activities, setActivities] = useState<Entry[]>([]);
  const [expandedActivities, setExpandedActivities] = useState<{[key: string]: boolean}>({});

  // Use useMemo to create a stable reference for subjectColorMap
  const memoizedSubjectColorMap = useMemo(() => new Map<string, string>(), []);

  const loadActivities = useCallback(async (date: string) => {
    try {
      const fetchedRecords = await fetchClassDailyRecords(date);
      const allEntries = fetchedRecords.flatMap(record => record.entries);
      setActivities(allEntries);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      setActivities([]);
    }
  }, []);

  useEffect(() => {
    loadActivities(selectedDate);
  }, [selectedDate, loadActivities]);

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

  const toggleActivityExpansion = (subjectId: string) => {
    setExpandedActivities(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  const getUniqueColorForSubject = useCallback((subjectName: string) => {
    if (!memoizedSubjectColorMap.has(subjectName)) {
      const availableColors = BADGE_COLORS.filter(color => !Array.from(memoizedSubjectColorMap.values()).includes(color));
      if (availableColors.length > 0) {
        const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
        memoizedSubjectColorMap.set(subjectName, randomColor);
      } else {
        let newColor;
        do {
          newColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
        } while (Array.from(memoizedSubjectColorMap.values()).includes(newColor));
        memoizedSubjectColorMap.set(subjectName, newColor);
      }
    }
    return memoizedSubjectColorMap.get(subjectName)!;
  }, [memoizedSubjectColorMap]);

  const renderActivityItem = ({ item }: { item: Entry }) => {
    const subjectColor = getUniqueColorForSubject(item.subjectName);
    
    return (
      <TouchableOpacity onPress={() => toggleActivityExpansion(item.subjectId)} style={styles.activityItem}>
        <View style={styles.activityHeader}>
          <View style={styles.subjectContainer}>
            <View style={[
              styles.subjectBadge,
              { backgroundColor: `${subjectColor}20` }  // Adding 20 for 20% opacity
            ]}>
              <Text style={[
                styles.subjectInitial,
                { color: subjectColor }  // Using solid color for the text
              ]}>{item.subjectName[0]}</Text>
            </View>
            <View>
              <Text style={styles.activitySubjectText}>{item.subjectName}</Text>
              <View style={[
                styles.teacherTag,
                { backgroundColor: `${subjectColor}20` }
              ]}>
                <Text style={[
                  styles.teacherName,
                  { color: subjectColor }
                ]}>{item.teacherName}</Text>
              </View>
            </View>
          </View>
          <Icon name={expandedActivities[item.subjectId] ? "up" : "down"} size={16} color="#001529" />
        </View>
        
        <View style={styles.activitySection}>
          <View style={styles.sectionHeaderContainer}>
            <Icon name="book" size={16} color="#001529" />
            <Text style={styles.sectionHeader}>Topics</Text>
          </View>
          <View style={styles.itemsContainer}>
            {item.topics.map((topic, index) => (
              <View key={index} style={styles.listItemContainer}>
                <Text style={styles.bulletPoint}>◆</Text>
                <Text style={styles.listItemText}>{topic}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {expandedActivities[item.subjectId] && (
          <>
            {item.activities && item.activities.length > 0 && (
              <View style={[styles.activitySection, styles.expandedSection]}>
                <View style={styles.sectionHeaderContainer}>
                  <Icon name="experiment" size={16} color="#001529" />
                  <Text style={styles.sectionHeader}>Activities</Text>
                </View>
                <View style={styles.itemsContainer}>
                  {item.activities.map((activity, index) => (
                    <View key={index} style={styles.listItemContainer}>
                      <Text style={styles.bulletPoint}>◆</Text>
                      <Text style={styles.listItemText}>{activity}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {item.homework && item.homework.length > 0 && (
              <View style={[styles.activitySection, styles.expandedSection]}>
                <View style={styles.sectionHeaderContainer}>
                  <Icon name="home" size={16} color="#001529" />
                  <Text style={styles.sectionHeader}>Homework</Text>
                </View>
                <View style={styles.itemsContainer}>
                  {item.homework.map((hw, index) => (
                    <View key={index} style={styles.listItemContainer}>
                      <Text style={styles.bulletPoint}>◆</Text>
                      <Text style={styles.listItemText}>{hw}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </TouchableOpacity>
    );
  };

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
            <View style={styles.activitiesTitleContainer}>
              <View style={styles.activitiesTitleMain}>
                <View style={styles.activitiesHeaderTop}>
                  <Text style={styles.activitiesHeaderDate}>
                    {dayjs(selectedDate).format('dddd, MMMM DD')}
                  </Text>
                  <Icon name="calendar" size={20} color="#ffffff" />
                </View>
                <Text style={styles.activitiesTitle}>Daily Activities</Text>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{activities.length}</Text>
                    <Text style={styles.statLabel}>SUBJECTS</Text>
                  </View>
                  <View style={styles.statBorder} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {activities.reduce((total, activity) => 
                        total + (activity.topics?.length || 0), 0)}
                    </Text>
                    <Text style={styles.statLabel}>TOPICS</Text>
                  </View>
                  <View style={styles.statBorder} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {activities.reduce((total, activity) => 
                        total + (activity.homework?.length || 0), 0)}
                    </Text>
                    <Text style={styles.statLabel}>HOMEWORK</Text>
                  </View>
                </View>
              </View>
            </View>
            {activities.length > 0 ? (
              <FlatList
                data={activities}
                renderItem={renderActivityItem}
                keyExtractor={(item) => item.subjectId}
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
    padding: 16,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%', // Ensure consistent width
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#001529',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  dateContainer: {
    marginBottom: 24,
  },
  calendar: {
    borderWidth: 0,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#001529',
  },
  clearDateButton: {
    backgroundColor: '#001529',
    borderRadius: 25,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activitiesSection: {
    width: '100%', // Match parent width
    marginTop: 16,
  },
  activityItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  subjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subjectBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subjectInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    // color will be set dynamically
  },
  activitySubjectText: {
    color: '#001529',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  teacherTag: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  teacherName: {
    fontSize: 12,
    fontWeight: '500',
  },
  activitySection: {
    marginBottom: 12,
  },
  expandedSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#001529',
    marginLeft: 8,
  },
  itemsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  activityText: {
    color: '#4a4a4a',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  noActivitiesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  noActivitiesText: {
    fontSize: 16,
    color: '#95A5A6',
    fontWeight: '500',
    marginTop: 12,
    textAlign: 'center',
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 8,
  },
  bulletPoint: {
    color: '#001529',
    fontSize: 12,
    marginRight: 8,
    marginTop: 4,
    width: 12,
  },
  listItemText: {
    flex: 1,
    color: '#4a4a4a',
    fontSize: 14,
    lineHeight: 20,
  },
  activitiesTitleContainer: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#001529',
    borderRadius: 16,
    overflow: 'hidden',
  },
  activitiesTitleMain: {
    padding: 16,
  },
  activitiesHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activitiesHeaderDate: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.9,
  },
  activitiesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12, // Increased padding since we have more space now
  },
  statBorder: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statValue: {
    fontSize: 20, // Increased font size back since we have more space
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
  },
});

export default ClassSummaryScreen;

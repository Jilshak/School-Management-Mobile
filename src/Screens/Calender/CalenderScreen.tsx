import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../../Components/BottomNavBar';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

interface Event {
  id: string;
  date: string;
  type: string;
  description: string;
}

const CalendarScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any, 'Calendar'>>();
  const [markedDates, setMarkedDates] = useState<{[key: string]: any}>({});
  const [selectedDate, setSelectedDate] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  type HomeScreenProps = {
    navigation: StackNavigationProp<any, 'Home'>;
  };

  const fetchEvents = async () => {
    const fetchedEvents: Event[] = [
      { id: '1', date: '2024-09-15', type: 'holiday', description: 'School Holiday' },
      { id: '2', date: '2024-09-20', type: 'event', description: 'Parent-Teacher Meeting' },
      { id: '3', date: '2024-09-25', type: 'exam', description: 'Math Exam' },
      { id: '4', date: '2024-09-28', type: 'event', description: 'School Sports Day' },
      { id: '5', date: '2024-09-01', type: 'holiday', description: 'Summer Break Begins' },
    ];

    setEvents(fetchedEvents);

    const newMarkedDates: {[key: string]: any} = {};
    fetchedEvents.forEach(event => {
      newMarkedDates[event.date] = {
        marked: true,
        dotColor: getEventColor(event.type),
      };
    });

    setMarkedDates(newMarkedDates);
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'holiday':
        return '#FF6B6B';
      case 'event':
        return '#4ECDC4';
      case 'exam':
        return '#FFA500';
      default:
        return '#95A5A6';
    }
  };

  const onDayPress = (day: {dateString: string}) => {
    setSelectedDate(day.dateString);
    const eventForDay = events.find(event => event.date === day.dateString);
    setSelectedEvent(eventForDay || null);

    const newMarkedDates: {[key: string]: any} = {};
    events.forEach(event => {
      newMarkedDates[event.date] = {
        marked: true,
        dotColor: getEventColor(event.type),
      };
    });

    if (eventForDay) {
      newMarkedDates[day.dateString] = {
        ...newMarkedDates[day.dateString],
        selected: true,
        selectedColor: 'rgba(0, 21, 41, 0.1)',
      };
    }

    setMarkedDates(newMarkedDates);
  };

  const renderEventItem = (event: Event) => (
    <TouchableOpacity key={event.id} style={styles.eventItem}>
      <View style={[styles.eventDot, { backgroundColor: getEventColor(event.type) }]} />
      <View style={styles.eventContent}>
        <Text style={styles.eventDate}>{event.date}</Text>
        <Text style={styles.eventDescription}>{event.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#95A5A6" />
    </TouchableOpacity>
  );

  const filteredEvents = events.filter(event => 
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.date.includes(searchQuery)
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>School Calendar</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.contentContainer}>
          <View style={styles.calendarContainer}>
            <Calendar
              markedDates={markedDates}
              onDayPress={onDayPress}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#b6c1cd',
                selectedDayBackgroundColor: 'rgba(0, 21, 41, 0.1)',
                selectedDayTextColor: '#001529',
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
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
              }}
            />
            {selectedEvent && (
              <View style={[
                styles.tooltip, 
                { backgroundColor: getEventColor(selectedEvent.type) }
              ]}>
                <Text style={styles.tooltipDate}>{selectedEvent.date}</Text>
                <Text style={styles.tooltipDescription}>{selectedEvent.description}</Text>
              </View>
            )}
          </View>

          <View style={styles.upcomingEventsContainer}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#001529" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search events..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            {filteredEvents.map(renderEventItem)}
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
    backgroundColor: '#001529',
  },
  safeArea: {
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
  contentContainer: {
    flex: 1,
    marginTop: 80,
  },
  calendarContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    margin: 20,
    marginBottom: 0,
  },
  upcomingEventsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  eventDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventDate: {
    fontSize: 14,
    color: '#95A5A6',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 16,
    color: '#001529',
  },
  tooltip: {
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  tooltipDate: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tooltipDescription: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default CalendarScreen;

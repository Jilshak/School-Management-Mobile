import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../../Components/BottomNavBar';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import useEventStore from '../../store/eventStore';
import { getEvents } from '../../Services/Event/eventServices';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

const CalendarScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any, 'Calendar'>>();
  const [markedDates, setMarkedDates] = useState<{[key: string]: any}>({});
  const [selectedDate, setSelectedDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const { events, setEvents } = useEventStore();

  useEffect(() => {
    fetchEvents();
  }, []);


  useEffect(() => {
    updateMarkedDates();
  }, [events]);

  const fetchEvents = async () => {
    try {
      const fetchedEvents = await getEvents();
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const updateMarkedDates = () => {
    const newMarkedDates: {[key: string]: any} = {};
    events.forEach(event => {
      const startDate = dayjs(event.startDate).startOf('day');
      const endDate = dayjs(event.endDate).endOf('day');
      let currentDate = startDate;

      while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
        const dateString = currentDate.format('YYYY-MM-DD');
        newMarkedDates[dateString] = {
          marked: true,
          dotColor: getEventColor(event),
        };
        currentDate = currentDate.add(1, 'day');
      }
    });
    setMarkedDates(newMarkedDates);
  };

  const getEventColor = (event: Event) => {
    // You can implement your own logic to determine event colors
    return '#4ECDC4';
  };

  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);

  const onDayPress = (day: {dateString: string}) => {
    setSelectedDate(day.dateString);
    const eventsForDay = events.filter(event => {
      const startDate = dayjs(event.startDate).startOf('day');
      const endDate = dayjs(event.endDate).endOf('day');
      const selectedDay = dayjs(day.dateString).startOf('day');
      
      return selectedDay.isSameOrAfter(startDate) && selectedDay.isSameOrBefore(endDate);
    });
    setSelectedEvents(eventsForDay);

    const newMarkedDates = { ...markedDates };
    if (eventsForDay.length > 0) {
      newMarkedDates[day.dateString] = {
        ...newMarkedDates[day.dateString],
        selected: true,
        selectedColor: 'rgba(0, 21, 41, 0.1)',
      };
    }

    setMarkedDates(newMarkedDates);
  };

  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity style={styles.eventItem}>
      <View style={[styles.eventDot, { backgroundColor: getEventColor(item) }]} />
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDate}>
          {dayjs(item.startDate).format('h:mm A')} - {dayjs(item.endDate).format('h:mm A')}
        </Text>
        <Text style={styles.eventDescription}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dayjs(event.startDate).format('YYYY-MM-DD').includes(searchQuery)
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
            {selectedEvents.length > 0 && (
              <View style={styles.selectedEventsContainer}>
                <Text style={styles.selectedDateText}>
                  Events for {dayjs(selectedDate).format('MMMM D, YYYY')}
                </Text>
                <FlatList
                  data={selectedEvents}
                  renderItem={renderEventItem}
                  keyExtractor={(item) => item._id}
                  style={styles.selectedEventsList}
                />
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
            {filteredEvents.map((event) => renderEventItem({ item: event }))}
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
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
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
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001529',
  },
  eventDate: {
    fontSize: 14,
    color: '#95A5A6',
    marginTop: 2,
  },
  eventDescription: {
    fontSize: 14,
    color: '#001529',
    marginTop: 4,
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
  selectedEventsContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001529',
    marginBottom: 10,
  },
  selectedEventsList: {
    maxHeight: 200,
  },
});

export default CalendarScreen;
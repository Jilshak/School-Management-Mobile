import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, FlatList } from 'react-native';
import { Text } from '@ant-design/react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import { StackNavigationProp } from '@react-navigation/stack';
import { Calendar, DateData } from 'react-native-calendars';

type RevisionsOfTheWeekScreenProps = {
  navigation: StackNavigationProp<any, 'RevisionsOfTheWeek'>;
};

type RevisionItem = {
  id: string;
  subject: string;
  topic: string;
  description: string;
};

const Card: React.FC<{ style?: any, children: React.ReactNode }> = ({ style, children }) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

const RevisionsOfTheWeekScreen: React.FC<RevisionsOfTheWeekScreenProps> = ({ navigation }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [markedDates, setMarkedDates] = useState<{[key: string]: any}>({});
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');

  const handleDayPress = (day: DateData) => {
    const selectedDate = new Date(day.dateString);
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay()); // Set to Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to Saturday

    const range: {[key: string]: any} = {};
    for (let d = new Date(startOfWeek); d <= endOfWeek; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      if (d.getTime() === startOfWeek.getTime()) {
        range[dateString] = { startingDay: true, color: '#50cebb', textColor: 'white' };
      } else if (d.getTime() === endOfWeek.getTime()) {
        range[dateString] = { endingDay: true, color: '#50cebb', textColor: 'white' };
      } else {
        range[dateString] = { color: '#70d7c7', textColor: 'white' };
      }
    }

    setStartDate(startOfWeek.toISOString().split('T')[0]);
    setEndDate(endOfWeek.toISOString().split('T')[0]);
    setMarkedDates(range);
  };

  const addRevision = () => {
    if (subject.trim() && topic.trim()) {
      const newRevision: RevisionItem = {
        id: Date.now().toString(),
        subject: subject.trim(),
        topic: topic.trim(),
        description: description.trim(),
      };
      setRevisions([...revisions, newRevision]);
      setSubject('');
      setTopic('');
      setDescription('');
    }
  };

  const removeRevision = (id: string) => {
    setRevisions(revisions.filter(revision => revision.id !== id));
  };

  const handleSubmit = () => {
    console.log('Weekly revisions submitted', { startDate, endDate, revisions });
    // Add logic here to send the request to the backend
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const renderRevisionItem = ({ item }: { item: RevisionItem }) => (
    <Card style={styles.revisionCard}>
      <View style={styles.revisionHeader}>
        <Text style={styles.revisionSubject}>{item.subject}</Text>
        <TouchableOpacity onPress={() => removeRevision(item.id)}>
          <Icon name="close" size={20} color="#001529" />
        </TouchableOpacity>
      </View>
      <Text style={styles.revisionTopic}>{item.topic}</Text>
      {item.description && <Text style={styles.revisionDescription}>{item.description}</Text>}
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrowleft" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Revisions of the Week</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.contentContainer} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.calendarCard}>
          <Text style={styles.sectionTitle}>Select Week</Text>
          <Calendar
            style={styles.calendar}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            markingType={'period'}
            // Remove the minDate prop to allow selection of past dates
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
          {startDate && endDate && (
            <View style={styles.dateRangeContainer}>
              <Text style={styles.dateRangeText}>
                {formatDate(startDate)} - {formatDate(endDate)}
              </Text>
              <TouchableOpacity 
                style={styles.clearDatesButton}
                onPress={() => {
                  setStartDate('');
                  setEndDate('');
                  setMarkedDates({});
                }}
              >
                <Icon name="close" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}
        </Card>

        <Card style={styles.revisionInputCard}>
          <Text style={styles.sectionTitle}>Add Revision</Text>
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder="Subject"
          />
          <TextInput
            style={styles.input}
            value={topic}
            onChangeText={setTopic}
            placeholder="Topic"
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={description}
            onChangeText={setDescription}
            placeholder="Description (optional)"
            multiline
          />
          <TouchableOpacity style={styles.addButton} onPress={addRevision}>
            <Text style={styles.addButtonText}>Add Revision</Text>
          </TouchableOpacity>
        </Card>

        <Text style={styles.sectionTitle}>Revisions List</Text>
        <FlatList
          data={revisions}
          renderItem={renderRevisionItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyListText}>No revisions added yet</Text>}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Weekly Revisions</Text>
        </TouchableOpacity>
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
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
    marginBottom: 15,
  },
  calendarCard: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e6f7ff',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  dateRangeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#001529',
  },
  clearDatesButton: {
    backgroundColor: '#001529',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  revisionInputCard: {
    marginBottom: 20,
    borderRadius: 10,
    padding: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#001529',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  revisionCard: {
    marginBottom: 10,
    borderRadius: 10,
    padding: 15,
  },
  revisionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  revisionSubject: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
  },
  revisionTopic: {
    fontSize: 16,
    color: '#4a4a4a',
    marginBottom: 5,
  },
  revisionDescription: {
    fontSize: 14,
    color: '#666666',
  },
  emptyListText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999999',
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: '#001529',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default RevisionsOfTheWeekScreen;
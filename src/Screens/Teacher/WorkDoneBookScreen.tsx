import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { Text, Icon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Calendar, DateData } from 'react-native-calendars';

type WorkDoneBookScreenProps = {
  navigation: StackNavigationProp<any, 'WorkDoneBook'>;
};

const WorkDoneBookScreen: React.FC<WorkDoneBookScreenProps> = ({ navigation }) => {
  const [date, setDate] = useState('');
  const [markedDates, setMarkedDates] = useState<{[key: string]: any}>({});
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [currentTopic, setCurrentTopic] = useState('');
  const [activities, setActivities] = useState('');
  const [homework, setHomework] = useState('');

  const handleDayPress = (day: DateData) => {
    setDate(day.dateString);
    setMarkedDates({
      [day.dateString]: { selected: true, selectedColor: '#001529' }
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const handleSubmit = () => {
    // TODO: Implement submission logic
    console.log('Work log submitted');
  };

  const addTopic = () => {
    if (currentTopic.trim() && !topics.includes(currentTopic.trim())) {
      setTopics([...topics, currentTopic.trim()]);
      setCurrentTopic('');
    }
  };

  const removeTopic = (topicToRemove: string) => {
    setTopics(topics.filter(topic => topic !== topicToRemove));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Work Done Book</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Daily Work Log</Text>

          <View style={styles.dateContainer}>
            <Calendar
              style={styles.calendar}
              onDayPress={handleDayPress}
              markedDates={markedDates}
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
            {date && (
              <View style={styles.selectedDateContainer}>
                <Text style={styles.selectedDateText}>Selected Date: {formatDate(date)}</Text>
                <TouchableOpacity 
                  style={styles.clearDateButton}
                  onPress={() => {
                    setDate('');
                    setMarkedDates({});
                  }}
                >
                  <Icon name="close" size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Class</Text>
            <TextInput
              style={styles.input}
              value={className}
              onChangeText={setClassName}
              placeholder="Enter class name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="Enter subject name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Topics Covered</Text>
            <View style={styles.topicInputContainer}>
              <TextInput
                style={styles.topicInput}
                value={currentTopic}
                onChangeText={setCurrentTopic}
                placeholder="Enter a topic"
                onSubmitEditing={addTopic}
              />
              <TouchableOpacity style={styles.addTopicButton} onPress={addTopic}>
                <Icon name="plus" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <View style={styles.topicsContainer}>
              {topics.map((topic, index) => (
                <View key={index} style={styles.topicChip}>
                  <Text style={styles.topicChipText}>{topic}</Text>
                  <TouchableOpacity onPress={() => removeTopic(topic)}>
                    <Icon name="close" size={16} color="#001529" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Activities Conducted</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={activities}
              onChangeText={setActivities}
              placeholder="Enter activities conducted"
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Homework Assigned</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={homework}
              onChangeText={setHomework}
              placeholder="Enter homework assigned"
              multiline
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Work Log</Text>
          </TouchableOpacity>
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
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
    height: 60,
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
    marginTop: 80,
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#4a4a4a',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  datePicker: {
    width: '100%',
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
    fontSize: 16,
    fontWeight: 'bold',
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
  topicInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  topicInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginRight: 10,
  },
  addTopicButton: {
    backgroundColor: '#001529',
    borderRadius: 5,
    padding: 10,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7ff',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  topicChipText: {
    color: '#001529',
    marginRight: 5,
  },
});

export default WorkDoneBookScreen;

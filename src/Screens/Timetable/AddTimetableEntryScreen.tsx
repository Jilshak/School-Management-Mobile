import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';

type AddTimetableEntryScreenProps = {
  navigation: StackNavigationProp<any, 'AddTimetableEntry'>;
};

const AddTimetableEntryScreen: React.FC<AddTimetableEntryScreenProps> = ({ navigation }) => {
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');
  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState('');

  const handleAddEntry = () => {
    // Implement timetable entry addition logic here
    console.log('Adding timetable entry:', { day, time, subject, teacher });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Timetable Entry</Text>
      <TextInput
        label="Day"
        value={day}
        onChangeText={setDay}
        style={styles.input}
      />
      <TextInput
        label="Time"
        value={time}
        onChangeText={setTime}
        style={styles.input}
      />
      <TextInput
        label="Subject"
        value={subject}
        onChangeText={setSubject}
        style={styles.input}
      />
      <TextInput
        label="Teacher"
        value={teacher}
        onChangeText={setTeacher}
        style={styles.input}
      />
      <Button mode="contained" onPress={handleAddEntry} style={styles.button}>
        Add Entry
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
  },
});

export default AddTimetableEntryScreen;
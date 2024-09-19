import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';

type AddAttendanceScreenProps = {
  navigation: StackNavigationProp<any, 'AddAttendance'>;
};

const AddAttendanceScreen: React.FC<AddAttendanceScreenProps> = ({ navigation }) => {
  const [date, setDate] = useState('');
  const [classGroup, setClassGroup] = useState('');
  const [present, setPresent] = useState('');
  const [absent, setAbsent] = useState('');

  const handleAddAttendance = () => {
    // Implement attendance addition logic here
    console.log('Adding attendance:', { date, classGroup, present, absent });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Attendance Record</Text>
      <TextInput
        label="Date"
        value={date}
        onChangeText={setDate}
        style={styles.input}
      />
      <TextInput
        label="Class"
        value={classGroup}
        onChangeText={setClassGroup}
        style={styles.input}
      />
      <TextInput
        label="Present"
        value={present}
        onChangeText={setPresent}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="Absent"
        value={absent}
        onChangeText={setAbsent}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button mode="contained" onPress={handleAddAttendance} style={styles.button}>
        Add Attendance
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

export default AddAttendanceScreen;
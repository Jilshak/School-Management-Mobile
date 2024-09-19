import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Button, List } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';

type TimetableScreenProps = {
  navigation: StackNavigationProp<any, 'Timetable'>;
};

const TimetableScreen: React.FC<TimetableScreenProps> = ({ navigation }) => {
  const timetableEntries = [
    { id: '1', day: 'Monday', time: '9:00 AM', subject: 'Mathematics', teacher: 'John Doe' },
    { id: '2', day: 'Monday', time: '10:30 AM', subject: 'English', teacher: 'Jane Smith' },
    // Add more timetable entries as needed
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timetable</Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('AddTimetableEntry')}
        style={styles.button}
      >
        Add New Entry
      </Button>
      <FlatList
        data={timetableEntries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={`${item.day} - ${item.time}`}
            description={`${item.subject} (${item.teacher})`}
            onPress={() => navigation.navigate('EditTimetableEntry', { entryId: item.id })}
          />
        )}
      />
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
  button: {
    marginBottom: 20,
  },
});

export default TimetableScreen;
import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Button, List } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';

type AttendanceScreenProps = {
  navigation: StackNavigationProp<any, 'Attendance'>;
};

const AttendanceScreen: React.FC<AttendanceScreenProps> = ({ navigation }) => {
  const attendanceRecords = [
    { id: '1', date: '2023-04-01', class: '10A', present: 25, absent: 5 },
    { id: '2', date: '2023-04-01', class: '11B', present: 28, absent: 2 },
    // Add more attendance records as needed
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance Records</Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('AddAttendance')}
        style={styles.button}
      >
        Add New Attendance
      </Button>
      <FlatList
        data={attendanceRecords}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={`${item.date} - Class ${item.class}`}
            description={`Present: ${item.present}, Absent: ${item.absent}`}
            onPress={() => navigation.navigate('EditAttendance', { recordId: item.id })}
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

export default AttendanceScreen;
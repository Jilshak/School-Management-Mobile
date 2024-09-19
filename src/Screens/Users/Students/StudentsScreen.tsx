import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Button, List } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';

type StudentsScreenProps = {
  navigation: StackNavigationProp<any, 'Students'>;
};

const StudentsScreen: React.FC<StudentsScreenProps> = ({ navigation }) => {
  const students = [
    { id: '1', name: 'Alice Johnson', grade: '10th' },
    { id: '2', name: 'Bob Williams', grade: '11th' },
    // Add more students as needed
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Management</Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('AddStudent')}
        style={styles.button}
      >
        Add New Student
      </Button>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={`Grade: ${item.grade}`}
            onPress={() => navigation.navigate('EditStudent', { studentId: item.id })}
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

export default StudentsScreen;
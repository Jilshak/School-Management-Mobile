import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Button, List } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';

type ClassesScreenProps = {
  navigation: StackNavigationProp<any, 'Classes'>;
};

const ClassesScreen: React.FC<ClassesScreenProps> = ({ navigation }) => {
  const classes = [
    { id: '1', name: 'Mathematics 101', teacher: 'John Doe' },
    { id: '2', name: 'English Literature', teacher: 'Jane Smith' },
    // Add more classes as needed
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Class Management</Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('AddClass')}
        style={styles.button}
      >
        Add New Class
      </Button>
      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={`Teacher: ${item.teacher}`}
            onPress={() => navigation.navigate('EditClass', { classId: item.id })}
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

export default ClassesScreen;
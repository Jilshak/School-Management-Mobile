import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';

type AddStudentScreenProps = {
  navigation: StackNavigationProp<any, 'AddStudent'>;
};

const AddStudentScreen: React.FC<AddStudentScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');

  const handleAddStudent = () => {
    // Implement student addition logic here
    console.log('Adding student:', { name, grade });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Student</Text>
      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        label="Grade"
        value={grade}
        onChangeText={setGrade}
        style={styles.input}
      />
      <Button mode="contained" onPress={handleAddStudent} style={styles.button}>
        Add Student
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

export default AddStudentScreen;
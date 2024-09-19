import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';

type AddClassScreenProps = {
  navigation: StackNavigationProp<any, 'AddClass'>;
};

const AddClassScreen: React.FC<AddClassScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [teacher, setTeacher] = useState('');

  const handleAddClass = () => {
    // Implement class addition logic here
    console.log('Adding class:', { name, teacher });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Class</Text>
      <TextInput
        label="Class Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        label="Teacher"
        value={teacher}
        onChangeText={setTeacher}
        style={styles.input}
      />
      <Button mode="contained" onPress={handleAddClass} style={styles.button}>
        Add Class
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

export default AddClassScreen;
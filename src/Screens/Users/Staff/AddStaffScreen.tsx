import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';

type AddStaffScreenProps = {
  navigation: StackNavigationProp<any, 'AddStaff'>;
};

const AddStaffScreen: React.FC<AddStaffScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const handleAddStaff = () => {
    // Implement staff addition logic here
    console.log('Adding staff:', { name, role });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Staff</Text>
      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        label="Role"
        value={role}
        onChangeText={setRole}
        style={styles.input}
      />
      <Button mode="contained" onPress={handleAddStaff} style={styles.button}>
        Add Staff
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

export default AddStaffScreen;
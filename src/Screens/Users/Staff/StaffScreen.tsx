import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Button, List } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';

type StaffScreenProps = {
  navigation: StackNavigationProp<any, 'Staff'>;
};

const StaffScreen: React.FC<StaffScreenProps> = ({ navigation }) => {
  const staffMembers = [
    { id: '1', name: 'John Doe', role: 'Teacher' },
    { id: '2', name: 'Jane Smith', role: 'Administrator' },
    // Add more staff members as needed
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Staff Management</Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('AddStaff')}
        style={styles.button}
      >
        Add New Staff
      </Button>
      <FlatList
        data={staffMembers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={item.role}
            onPress={() => navigation.navigate('EditStaff', { staffId: item.id })}
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

export default StaffScreen;
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import type { TextProps, ButtonProps } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  Staff: undefined;
  Students: undefined;
  Classes: undefined;
};

type HomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>School Management System</Text>
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('Staff')}
        style={styles.button}
      >
        Manage Staff
      </Button>
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('Students')}
        style={styles.button}
      >
        Manage Students
      </Button>
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('Classes')}
        style={styles.button}
      >
        Manage Classes
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    marginVertical: 10,
    width: '100%',
  },
});

export default HomeScreen;
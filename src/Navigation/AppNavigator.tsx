import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../Screens/Home/HomeScreen';
import StaffScreen from '../Screens/Users/Staff/StaffScreen';
import MarksheetScreen from '../Screens/Academics/MarksheetScreen';
import TimetableScreen from '../Screens/Academics/TimetableScreen';
import TeacherTimetableScreen from '../Screens/Academics/TeacherTimetableScreen';
import AttendanceScreen from '../Screens/Attendance/AttendanceScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Staff" 
          component={StaffScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Marksheet" component={MarksheetScreen} />
        <Stack.Screen name="Timetable" component={TimetableScreen} />
        <Stack.Screen name="TeacherTimetable" component={TeacherTimetableScreen} />
        <Stack.Screen name="Attendance" component={AttendanceScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
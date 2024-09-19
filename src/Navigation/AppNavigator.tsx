import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../Screens/Home/HomeScreen';
import StaffScreen from '../Screens/Users/Staff/StaffScreen';
import AddStaffScreen from '../Screens/Users/Staff/AddStaffScreen';
import StudentsScreen from '../Screens/Users/Students/StudentsScreen';
import AddStudentScreen from '../Screens/Users/Students/AddStudentScreen';
import ClassesScreen from '../Screens/Classes/ClassesScreen';
import AddClassScreen from '../Screens/Classes/AddClassScreen';
import TimetableScreen from '../Screens/Timetable/TimetableScreen';
import AddTimetableEntryScreen from '../Screens/Timetable/AddTimetableEntryScreen';
import AttendanceScreen from '../Screens/Attendance/AttendanceScreen';
import AddAttendanceScreen from '../Screens/Attendance/AddAttendanceScreen';
import LoginScreen from '../Screens/Auth/LoginScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{headerShown:false}}/>
        <Stack.Screen name="Staff" component={StaffScreen} />
        <Stack.Screen name="AddStaff" component={AddStaffScreen} />
        <Stack.Screen name="Students" component={StudentsScreen} />
        <Stack.Screen name="AddStudent" component={AddStudentScreen} />
        <Stack.Screen name="Classes" component={ClassesScreen} />
        <Stack.Screen name="AddClass" component={AddClassScreen} />
        <Stack.Screen name="Timetable" component={TimetableScreen} />
        <Stack.Screen name="AddTimetableEntry" component={AddTimetableEntryScreen} />
        <Stack.Screen name="Attendance" component={AttendanceScreen} />
        <Stack.Screen name="AddAttendance" component={AddAttendanceScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
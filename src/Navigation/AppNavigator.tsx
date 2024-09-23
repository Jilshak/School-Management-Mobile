import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../Screens/Auth/LoginScreen";
import AddAttendanceScreen from "../Screens/Attendance/AddAttendanceScreen";
import PaymentScreen from "../Screens/Payments/PaymentScreen";
import LibraryScreen from "../Screens/Academics/LibraryScreen";
import LeaveRequestScreen from "../Screens/Attendance/LeaveRequestScreen";
import LeaveApproveScreen from "../Screens/Attendance/LeaveApproveScreen";
import SyllabusScreen from "../Screens/Academics/SyllabusScreen";
import SubjectDetailScreen from "../Screens/Academics/SubjectDetailScreen";
import WorkDoneBookScreen from "../Screens/Teacher/WorkDoneBookScreen";
import RevisionsOfTheWeekScreen from "../Screens/Teacher/RevisionsOfTheWeekScreen";
import ClassDetailsScreen from "../Screens/ClassDetails/ClassDetailsScreen";
import StudentListScreen from '../Screens/StudentList/StudentListScreen';
import StudentDetailsScreen from '../Screens/StudentDetails/StudentDetailsScreen';
import SubjectSelectionScreen from '../Screens/MultipleChoiceQuestions/SubjectSelectionScreen';
import MCQScreen from '../Screens/MultipleChoiceQuestions/MCQScreen';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AddAttendance" component={AddAttendanceScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="Library" component={LibraryScreen} />
        <Stack.Screen name="Syllabus" component={SyllabusScreen} />
        <Stack.Screen name="LeaveRequest" component={LeaveRequestScreen} />
        <Stack.Screen name="LeaveApprove" component={LeaveApproveScreen} />
        <Stack.Screen name="WorkDoneBook" component={WorkDoneBookScreen} />
        <Stack.Screen
          name="SubjectDetail"
          component={SubjectDetailScreen as React.ComponentType<any>}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RevisionsOfTheWeek"
          component={RevisionsOfTheWeekScreen}
        />
        <Stack.Screen name="ClassDetails" component={ClassDetailsScreen} />
        <Stack.Screen name="StudentList" component={StudentListScreen as React.ComponentType<any>} />
        <Stack.Screen name="StudentDetails" component={StudentDetailsScreen as React.ComponentType<any>} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

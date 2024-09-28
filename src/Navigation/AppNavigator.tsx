import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import useAuthStore from "../store/authStore";
import HomeScreen from "../Screens/Home/HomeScreen";
import LoginScreen from "../Screens/Auth/LoginScreen";
import StaffScreen from "../Screens/Users/Staff/StaffScreen";
import MarksheetScreen from "../Screens/Academics/MarksheetScreen";
import TimetableScreen from "../Screens/Academics/TimetableScreen";
import TeacherTimetableScreen from "../Screens/Academics/TeacherTimetableScreen";
import AttendanceScreen from "../Screens/Attendance/AttendanceScreen";
import CalendarScreen from "../Screens/Calender/CalenderScreen";
import NotificationScreen from "../Screens/Notification/NotificationScreen";
import ProfileScreen from "../Screens/Profile/ProfileScreen";
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
import StudentListScreen from "../Screens/StudentList/StudentListScreen";
import StudentDetailsScreen from "../Screens/StudentDetails/StudentDetailsScreen";
import SubjectSelectionScreen from "../Screens/MultipleChoiceQuestions/SubjectSelectionScreen";
import MCQScreen from "../Screens/MultipleChoiceQuestions/MCQScreen";
import ChapterSelectionScreen from "../Screens/MultipleChoiceQuestions/ChapterSelectionScreen";
import QuestionListScreen from "../Screens/MultipleChoiceQuestions/QuestionListScreen";
import MCQStatsScreen from "../Screens/MultipleChoiceQuestions/MCQStatsScreen";
import FlashCardScreen from "../Screens/FlashCards/FlashCardScreen";
import FlashCardsLogicScreen from "../Screens/FlashCards/FlashCardsLogicScreen";
import FlashCardChapterListScreen from "../Screens/FlashCards/FlashCardChapterListScreen";
import { ToastProvider } from "../contexts/ToastContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleCheckAuth = async () => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }

  useEffect(() => {
    handleCheckAuth();
  }, [])

  return (
    <NavigationContainer>
      <ToastProvider>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <>
              <Stack.Screen name="Staff" component={StaffScreen} />
              <Stack.Screen name="Marksheet" component={MarksheetScreen} />
              <Stack.Screen name="Timetable" component={TimetableScreen} />
              <Stack.Screen
                name="TeacherTimetable"
                component={TeacherTimetableScreen}
              />
              <Stack.Screen name="Attendance" component={AttendanceScreen} />
              <Stack.Screen name="Calendar" component={CalendarScreen} />
              <Stack.Screen
                name="Notification"
                component={NotificationScreen}
              />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen
                name="AddAttendance"
                component={AddAttendanceScreen}
              />
              <Stack.Screen name="Payment" component={PaymentScreen} />
              <Stack.Screen name="Library" component={LibraryScreen} />
              <Stack.Screen name="Syllabus" component={SyllabusScreen} />
              <Stack.Screen
                name="LeaveRequest"
                component={LeaveRequestScreen}
              />
              <Stack.Screen
                name="LeaveApprove"
                component={LeaveApproveScreen}
              />
              <Stack.Screen
                name="WorkDoneBook"
                component={WorkDoneBookScreen}
              />
              <Stack.Screen
                name="SubjectDetail"
                component={SubjectDetailScreen as React.ComponentType<any>}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="RevisionsOfTheWeek"
                component={RevisionsOfTheWeekScreen}
              />
              <Stack.Screen
                name="ClassDetails"
                component={ClassDetailsScreen}
              />
              <Stack.Screen
                name="StudentList"
                component={StudentListScreen as React.ComponentType<any>}
              />
              <Stack.Screen
                name="StudentDetails"
                component={StudentDetailsScreen as React.ComponentType<any>}
              />
              <Stack.Screen
                name="SubjectSelection"
                component={SubjectSelectionScreen}
              />
              <Stack.Screen
                name="ChapterSelection"
                component={ChapterSelectionScreen as React.ComponentType<any>}
              />
              <Stack.Screen
                name="QuestionList"
                component={QuestionListScreen as React.ComponentType<any>}
              />
              <Stack.Screen
                name="MCQ"
                component={MCQScreen as React.ComponentType<any>}
              />
              <Stack.Screen
                name="MCQStats"
                component={MCQStatsScreen as React.ComponentType<any>}
              />
              <Stack.Screen
                name="FlashCardScreen"
                component={FlashCardScreen as React.ComponentType<any>}
              />
              <Stack.Screen name="FlashCards" component={FlashCardScreen} />
              <Stack.Screen
                name="FlashCardChapterList"
                component={
                  FlashCardChapterListScreen as React.ComponentType<any>
                }
              />
              <Stack.Screen
                name="FlashCardsLogic"
                component={FlashCardsLogicScreen as React.ComponentType<any>}
              />
            <Stack.Screen name="Login" component={LoginScreen} />
            </>
          ) : (<>
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
          )}
          <Stack.Screen name="Home" component={HomeScreen} />

        </Stack.Navigator>
      </ToastProvider>
    </NavigationContainer>
  );
};

export default AppNavigator;

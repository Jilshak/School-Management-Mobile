import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Modal,
  Animated,
  Button,
} from "react-native";
import { Text } from "@ant-design/react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchStudentsInClass,
  saveAttendance,
} from "../../Services/Attendance/ClassAttendance";
import { AttendanceStatus, IStudent } from "./Interfaces/AttendanceInterfaces";
import useProfileStore from "../../store/profileStore";
import Toast from "../../Components/common/Toast";
import { useToast } from '../../hooks/useToast';

type AddAttendanceScreenProps = {
  navigation: StackNavigationProp<any, "AddAttendance">;
  route: any;
};

const AddAttendanceScreen: React.FC<AddAttendanceScreenProps> = ({
  navigation,
  route,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [studentDetails, setStudentDetails] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [isCachedData, setIsCachedData] = useState(false);

  const { isVisible, toastProps, showToast, hideToast } = useToast();

  const { profile } = useProfileStore();
  const classId = profile?.classroom?._id;

  const handleToast = async (message: string, type: "success" | "error") => {
    showToast({
      message: message,
      type: type,
      duration: 3000,
    });
  };

  const formatDate = (date: Date): string => {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().split('T')[0];
  };

  const fetchStudents = async () => {
    if (!classId) {
      console.error("Class ID is not available");
      await handleToast("Class ID is not available", "error");
      return;
    }

    const today = formatDate(new Date());
    const cacheKey = `attendance_${classId}_${today}`;
    const cachedData = await AsyncStorage.getItem(cacheKey);

    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      setStudentDetails(parsedData);
      setIsCachedData(true);
    } else {
      const students = await fetchStudentsInClass(classId);

      const formattedStudents = students
        .filter((student: any) => student && student.studentDetails)
        .map((student: any) => ({
          _id: student._id,
          studentDetails: student.studentDetails,
          attendanceStatus: "present" as AttendanceStatus,
          comment: "",
        }));

      setStudentDetails(formattedStudents);
      setIsCachedData(false);
    }
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    if (classId) {
      fetchStudents();
    } else {
      handleToast("Class ID is not available", "error");
    }
  }, [fadeAnim, classId]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStudents, setFilteredStudents] =
    useState<IStudent[]>(studentDetails);
  const [attendanceSummary, setAttendanceSummary] = useState({
    present: 0,
    absent: 0,
    halfDay: 0,
  });
  const [isCommentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );
  const [comment, setComment] = useState("");

  useEffect(() => {
    setFilteredStudents(
      studentDetails.filter(
        (student) =>
          `${student?.studentDetails?.firstName} ${student?.studentDetails?.lastName}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          student?.studentDetails?.enrollmentNumber?.includes(searchQuery)
      )
    );
  }, [searchQuery, studentDetails]);

  useEffect(() => {
    const summary = studentDetails.reduce(
      (acc, student) => {
        acc[
          student.attendanceStatus === "half-day"
            ? "halfDay"
            : student.attendanceStatus
        ]++;
        return acc;
      },
      { present: 0, absent: 0, halfDay: 0 }
    );
    setAttendanceSummary(summary);
  }, [studentDetails]);

  const toggleAttendance = (id: string) => {
    setStudentDetails(
      studentDetails.map((student) => {
        if (student._id === id) {
          const nextStatus: { [key in AttendanceStatus]: AttendanceStatus } = {
            present: "half-day",
            "half-day": "absent",
            absent: "present",
          };
          return {
            ...student,
            attendanceStatus:
              nextStatus[student.attendanceStatus as AttendanceStatus],
          };
        }
        return student;
      })
    );
  };

  const handleSaveAttendance = async () => {
    if (!classId) {
      console.error("Class ID is not available");
      await handleToast("Class ID is not available", "error");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const attendanceData = {
      attendanceDate: formatDate(new Date()),
      classId: classId,
      teacherId: profile?._id,
      studentsAttendance: studentDetails.map((student) => ({
        studentId: student._id,
        status:
          student.attendanceStatus === "half-day"
            ? "halfday"
            : student.attendanceStatus,
        remark: student.comment || "",
      })),
    };

    try {
      await saveAttendance(attendanceData);

      const today = formatDate(new Date());
      
      const cacheKey = `attendance_${classId}_${today}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(studentDetails));
      setIsCachedData(false);
      await handleToast("Attendance saved successfully", "success");
    } catch (error) {
      await handleToast("Error saving attendance", "error");
      setSaveError("Failed to save attendance. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getAttendanceIcon = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return { name: "checkcircle", color: "#52c41a" };
      case "half-day":
        return { name: "clockcircle", color: "#faad14" };
      case "absent":
        return { name: "closecircle", color: "#f5222d" };
    }
  };

  const openCommentModal = (studentId: string) => {
    const student = studentDetails.find((s) => s._id === studentId);
    setSelectedStudentId(studentId);
    setComment(student?.comment || "");
    setCommentModalVisible(true);
  };

  const saveComment = () => {
    if (selectedStudentId) {
      setStudentDetails(
        studentDetails.map((student) =>
          student._id === selectedStudentId ? { ...student, comment } : student
        )
      );
    }
    setCommentModalVisible(false);
  };

  const bulkMarkAttendance = (status: AttendanceStatus) => {
    setStudentDetails(
      studentDetails.map((student) => ({
        ...student,
        attendanceStatus: status as AttendanceStatus,
      }))
    );
  };

  const renderStudentItem = ({ item }: { item: IStudent }) => {
    const icon = getAttendanceIcon(item.attendanceStatus);
    return (
      <TouchableOpacity
        style={[
          styles.studentItem,
          styles[
            `${item.attendanceStatus}Student` as keyof typeof styles
          ] as any,
        ]}
        onPress={() => toggleAttendance(item._id)}
      >
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>
            {`${item.studentDetails?.firstName} ${item.studentDetails?.lastName}`}
          </Text>
          <Text style={styles.studentRollNumber}>
            Enrollment No: {item.studentDetails?.enrollmentNumber}
          </Text>
          {item.comment && (
            <Text style={styles.studentComment}>{item.comment}</Text>
          )}
        </View>
        <View style={styles.studentActions}>
          <TouchableOpacity
            onPress={() => openCommentModal(item._id)}
            style={styles.commentButton}
          >
            <Icon name="edit" size={20} color="#001529" />
          </TouchableOpacity>
          <Icon name={icon.name} size={24} color={icon.color} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrowleft" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mark Attendance</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.searchContainer}>
          <Icon name="search1" size={20} color="#001529" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or roll number"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView style={styles.contentContainer}>
          {isCachedData && (
            <View style={styles.cachedDataWarning}>
              <Icon name="infocirlce" size={20} color="#faad14" />
              <Text style={styles.cachedDataWarningText}>
                Showing cached attendance data. Save to update.
              </Text>
            </View>
          )}

          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Attendance Summary</Text>
            <View style={styles.summaryContent}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryItemValue}>
                  {attendanceSummary.present}
                </Text>
                <Text style={styles.summaryItemLabel}>Present</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryItemValue}>
                  {attendanceSummary.halfDay}
                </Text>
                <Text style={styles.summaryItemLabel}>Half-day</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryItemValue}>
                  {attendanceSummary.absent}
                </Text>
                <Text style={styles.summaryItemLabel}>Absent</Text>
              </View>
            </View>
          </View>

          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <Icon name="checkcircle" size={16} color="#52c41a" />
              <Text style={styles.legendText}>Present</Text>
            </View>
            <View style={styles.legendItem}>
              <Icon name="clockcircle" size={16} color="#faad14" />
              <Text style={styles.legendText}>Half-day</Text>
            </View>
            <View style={styles.legendItem}>
              <Icon name="closecircle" size={16} color="#f5222d" />
              <Text style={styles.legendText}>Absent</Text>
            </View>
          </View>

          <View style={styles.bulkActionsContainer}>
            <TouchableOpacity
              style={[styles.bulkActionButton, styles.presentButton]}
              onPress={() => bulkMarkAttendance("present")}
            >
              <Text style={styles.bulkActionButtonText}>Mark All Present</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bulkActionButton, styles.halfDayButton]}
              onPress={() => bulkMarkAttendance("half-day")}
            >
              <Text style={styles.bulkActionButtonText}>Mark All Half-Day</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bulkActionButton, styles.absentButton]}
              onPress={() => bulkMarkAttendance("absent")}
            >
              <Text style={styles.bulkActionButtonText}>Mark All Absent</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.studentListContainer}>
            <Text style={styles.sectionTitle}>Class Attendance</Text>
            <FlatList
              data={filteredStudents}
              renderItem={renderStudentItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
            />
          </View>

          <TouchableOpacity
            onPress={handleSaveAttendance}
            style={[styles.saveButton, isSaving && styles.disabledButton]}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving
                ? "Saving..."
                : isCachedData
                ? "Update Attendance"
                : "Save Attendance"}
            </Text>
          </TouchableOpacity>
          {saveError && <Text style={styles.errorText}>{saveError}</Text>}
        </ScrollView>

        <Modal
          visible={isCommentModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setCommentModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Comment</Text>
              <TextInput
                style={styles.commentInput}
                multiline
                numberOfLines={4}
                value={comment}
                onChangeText={setComment}
                placeholder="Enter comment here"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => setCommentModalVisible(false)}
                  style={styles.modalButton}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={saveComment}
                  style={[styles.modalButton, styles.saveCommentButton]}
                >
                  <Text style={styles.saveCommentButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Toast
          isVisible={isVisible}
          message={toastProps.message}
          type={toastProps.type}
          duration={toastProps.duration}
          onClose={hideToast}
        />
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#001529",
    padding: 15,
    borderRadius: 10,
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
    height: 60,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    marginTop: 140, // Increased to accommodate the search bar
    padding: 20,
  },
  studentListContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#001529",
    marginBottom: 15,
  },
  studentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  presentStudent: {
    borderLeftWidth: 5,
    borderLeftColor: "#52c41a",
  },
  absentStudent: {
    borderLeftWidth: 5,
    borderLeftColor: "#f5222d",
  },
  "half-dayStudent": {
    borderLeftWidth: 5,
    borderLeftColor: "#faad14",
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#001529",
  },
  studentRollNumber: {
    fontSize: 14,
    color: "#4a4a4a",
  },
  saveButton: {
    backgroundColor: "#001529",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginBottom: 40, // Increased from 20 to 40
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendText: {
    marginLeft: 5,
    fontSize: 12,
    color: "#4a4a4a",
  },
  summaryContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#001529",
    marginBottom: 10,
  },
  summaryContent: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryItemValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#001529",
  },
  summaryItemLabel: {
    fontSize: 12,
    color: "#4a4a4a",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    position: "absolute",
    top: 90, // Positioned below the header
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  studentActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentButton: {
    marginRight: 10,
  },
  studentComment: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    height: 100,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalButton: {
    padding: 10,
    marginLeft: 10,
    borderRadius: 5,
  },
  saveCommentButton: {
    backgroundColor: "#001529",
  },
  modalButtonText: {
    color: "#001529",
  },
  saveCommentButtonText: {
    color: "#ffffff",
  },
  bulkActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  bulkActionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  presentButton: {
    backgroundColor: "#52c41a",
  },
  halfDayButton: {
    backgroundColor: "#faad14",
  },
  absentButton: {
    backgroundColor: "#f5222d",
  },
  bulkActionButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  cachedDataWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbe6",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  cachedDataWarningText: {
    flex: 1,
    marginLeft: 10,
    color: "#faad14",
    fontSize: 14,
  },
});

export default AddAttendanceScreen;
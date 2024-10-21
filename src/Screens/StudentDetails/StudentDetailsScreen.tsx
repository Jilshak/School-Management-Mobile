import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { Text, Tag } from "@ant-design/react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import Icon from "react-native-vector-icons/AntDesign";
import { LineChart } from "react-native-chart-kit";
import { getUserDetails } from "../../Services/User/UserService";
import { formatDate, formatDateToYear } from "../../utils/DateUtil";
import { IUser } from "../../Services/User/IUserService";
import { getExamResultByClassAndStudent,fetchStudentSubjectPerformance } from "../../Services/Marksheet/markSheetServices";
import { logJSON } from "../../utils/logger";

type StudentDetailsScreenProps = {
  navigation: StackNavigationProp<any, "StudentDetails">;
  route: RouteProp<{ StudentDetails: { studentId: string, classId: string } }, "StudentDetails">;
};

const StudentDetailsScreen: React.FC<StudentDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { studentId, classId } = route.params;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [userDetails, setUserDetails] = useState<IUser | null>(null);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; visible: boolean; exam: any } | null>(null);
  const [selectedExamResult, setSelectedExamResult] = useState<any>(null);
  const [subjectPerformance, setSubjectPerformance] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await getUserDetails(studentId);
        setUserDetails(response);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchUserDetails();
  }, []);

  useEffect(() => {
    const fetchExamResult = async () => {
      try {
        const response = await getExamResultByClassAndStudent(classId, studentId);
        setExamResults(response.exams);
        logJSON("EXAM RESULTS", response.exams);
      } catch (error) {
        console.error("Error fetching exam results:", error);
      }
    };
    fetchExamResult();
  }, [classId, studentId]);

  useEffect(() => {
    const fetchStudentSubjectWisePerformance = async () => {
      try {
        const response = await fetchStudentSubjectPerformance(studentId);
        const allSubjects = response.performance.flatMap(exam => exam.subjects);
        const aggregatedSubjects = allSubjects.reduce((acc, subject) => {
          if (!acc[subject.subjectName]) {
            acc[subject.subjectName] = {
              totalPercentage: 0,
              examCount: 0,
            };
          }
          acc[subject.subjectName].totalPercentage += subject.averagePercentage;
          acc[subject.subjectName].examCount += subject.examCount;
          return acc;
        }, {});

        const subjectPerformanceData = Object.entries(aggregatedSubjects).map(([subjectName, data]: [string, any]) => ({
          subjectName,
          averagePercentage: data.totalPercentage / data.examCount,
        }));

        setSubjectPerformance(subjectPerformanceData);
      } catch (error) {
        console.error("Error fetching student subject performance:", error);
      }
    };
    fetchStudentSubjectWisePerformance();
  }, [studentId]);

  const calculateAveragePerformance = () => {
    if (examResults.length === 0) return 0;
    const totalScore = examResults.reduce((sum, exam) => sum + exam.score, 0);
    return Math.round(totalScore / examResults.length);
  };

  const renderPerformanceChart = () => {
    if (examResults.length === 0) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Performance Trend</Text>
          <Text>No exam data available</Text>
        </View>
      );
    }

    const chartData = examResults.map(exam => ({
      label: exam.examType,
      score: exam.score
    }));

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Performance Trend</Text>
        <LineChart
          data={{
            // labels: chartData.map(item => item.label),
            datasets: [
              {
                data: chartData.map(item => item.score),
              },
            ],
          }}
          width={Dimensions.get("window").width - 40}
          height={220}
          yAxisSuffix="%"
          yAxisInterval={1}
          fromZero={true}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 21, 41, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#ffa726"
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
          onDataPointClick={({ x, y, index }) => {
            const exam = examResults[index];
            setTooltipData({ x, y, visible: true, exam });
          }}
          decorator={() => {
            return tooltipData?.visible ? (
              <View
                style={[
                  styles.tooltip,
                  {
                    left: tooltipData.x - 60,
                    top: tooltipData.y - 50,
                  },
                ]}
              >
                <Text style={styles.tooltipTitle}>{tooltipData.exam.examType}</Text>
                <Text style={styles.tooltipText}>Score: {tooltipData.exam.score}%</Text>
                <Text style={styles.tooltipText}>Date: {formatDate(tooltipData.exam.date)}</Text>
              </View>
            ) : null;
          }}
        />
      </View>
    );
  };

  const renderSubjectPerformance = () => (
    <View style={styles.subjectsContainer}>
      <Text style={styles.sectionTitle}>Subject-wise Performance</Text>
      {subjectPerformance.map((subject, index) => (
        <View key={index} style={styles.subjectItem}>
          <View style={styles.subjectInfo}>
            <Text style={styles.subjectName}>{subject.subjectName}</Text>
            <Text style={styles.subjectGrade}>
              {subject.averagePercentage >= 90 ? 'A' :
               subject.averagePercentage >= 80 ? 'B' :
               subject.averagePercentage >= 70 ? 'C' :
               subject.averagePercentage >= 60 ? 'D' : 'F'}
            </Text>
          </View>
          <View style={styles.percentageBar}>
            <View
              style={[styles.percentageFill, { width: `${subject.averagePercentage}%` }]}
            />
          </View>
          <Text style={styles.percentageText}>{subject.averagePercentage.toFixed(2)}%</Text>
        </View>
      ))}
    </View>
  );

  const renderDetailItem = (label: string, value: string | number) => (
    <View key={label} style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}: </Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  const renderExtraCurricularActivities = () => (
    <View key="extraCurricular" style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Extra-Curricular Activities</Text>
      <View style={styles.activitiesContainer}>
        {userDetails?.extraCurricular?.map(
          (activity: string, index: number) => (
            <Tag key={index} style={styles.activityTag}>
              {activity}
            </Tag>
          )
        )}
      </View>
    </View>
  );

  const handleExamClick = (examId: string) => {
    navigation.navigate('ExamDetails', { examId, studentId, isTeacher: true });
  };

  const renderExams = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Exams</Text>
      <View style={styles.examsContainer}>
        {examResults.map((exam, index) => (
          <TouchableOpacity
            key={index}
            style={styles.examTag}
            onPress={() => handleExamClick(exam._id)}
          >
            <Text style={styles.examType}>{exam.examType}</Text>
            <Text style={styles.examDate}>{formatDate(exam.date)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrowleft" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.contentContainer}
        onScroll={() => setTooltipData(null)}
        scrollEventThrottle={16}
      >
        <View style={styles.studentInfoCard}>
          <View style={styles.studentAvatar}>
            <Icon name="user" size={30} color="#ffffff" />
          </View>
          <View style={styles.studentDetails}>
            <Text style={styles.studentName}>
              {userDetails?.firstName} {userDetails?.lastName}
            </Text>
            <Text style={styles.studentClass}>
              Roll No: {userDetails?.enrollmentNumber ?? "N/A"}
            </Text>
            <Text style={styles.academicYear}>
              Academic Year:{" "}
              {formatDateToYear(
                userDetails?.classroom?.academicYear?.startDate!
              )}
              -
              {formatDateToYear(userDetails?.classroom?.academicYear?.endDate!)}
            </Text>
          </View>
        </View>

        <View style={styles.summaryContainer}>
          <View style={[styles.summaryItem, { alignItems: "center" }]}>
            <Icon name="linechart" size={20} color="#001529" />
            <Text style={styles.summaryTitle}>Performance</Text>
            <Text style={styles.summaryValue}>
              {calculateAveragePerformance()}%
            </Text>
          </View>
          <View style={[styles.summaryItem, { alignItems: "center" }]}>
            <Icon name="calendar" size={20} color="#001529" />
            <Text style={styles.summaryTitle}>Attendance</Text>
            <Text style={styles.summaryValue}>
              {userDetails?.attendance ?? 0}%
            </Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          {renderDetailItem("Phone", userDetails?.contactNumber ?? "N/A")}
          {renderDetailItem("Email", userDetails?.email ?? "N/A")}
          {renderDetailItem("Address", userDetails?.address ?? "N/A")}
        </View>

        {renderPerformanceChart()}
        {renderExams()}
        {renderSubjectPerformance()}
        {renderExtraCurricularActivities()}

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {renderDetailItem(
            "Date of Birth",
            formatDate(userDetails?.dateOfBirth || "") ?? "N/A"
          )}
          {renderDetailItem("Blood Group", userDetails?.bloodGroup ?? "N/A")}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Parent/Guardian Information</Text>
          {renderDetailItem(
            "Emergency Contact Name",
            userDetails?.emergencyContactName ?? "N/A"
          )}
          {renderDetailItem(
            "Emergency Contact Number",
            userDetails?.emergencyContactNumber ?? "N/A"
          )}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Academic Information</Text>
          {renderDetailItem("Class", userDetails?.classroom?.name ?? "N/A")}
          {renderDetailItem(
            "Class Teacher",
            userDetails?.classroom?.classTeacher[0]?.firstName +
              " " +
              userDetails?.classroom?.classTeacher[0]?.lastName ?? "N/A"
          )}
          {renderDetailItem(
            "Admission Date",
            formatDate(userDetails?.joinDate!) ?? "N/A"
          )}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          {userDetails?.achievements?.length ? userDetails?.achievements?.map((item: string, index: number) => {
            return <Text key={index} style={styles.achievementItem}>• {item}</Text>;
          }) : <Text>N/A</Text>}
        </View>

        <View style={[styles.sectionContainer, styles.remarksContainer]}>
          <Text style={styles.sectionTitle}>Remarks</Text>
          <Text style={styles.remarksText}>
            {userDetails?.remarks ?? "N/A"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    marginTop: 80, // Height of the header plus top margin
    padding: 20,
  },
  studentInfoCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    alignItems: "center",
  },
  studentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#001529",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#001529",
  },
  studentClass: {
    fontSize: 14,
    color: "#4a4a4a",
    marginTop: 5,
  },
  academicYear: {
    fontSize: 14,
    color: "#4a4a4a",
    marginTop: 5,
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryTitle: {
    fontSize: 14,
    color: "#4a4a4a",
    marginLeft: 5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#001529",
    marginLeft: 5,
  },
  chartContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  subjectsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  subjectItem: {
    marginBottom: 15,
  },
  subjectInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  subjectName: {
    fontSize: 16,
    color: "#4a4a4a",
  },
  subjectGrade: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#001529",
  },
  percentageBar: {
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    overflow: "hidden",
  },
  percentageFill: {
    height: "100%",
    backgroundColor: "#001529",
  },
  percentageText: {
    fontSize: 14,
    color: "#4a4a4a",
    marginTop: 5,
    textAlign: "right",
  },
  detailsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#001529",
    marginTop: 20,
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 16,
    color: "#4a4a4a",
  },
  detailValue: {
    fontSize: 16,
    color: "#001529",
    fontWeight: "500",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  sectionContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  remarksContainer: {
    marginBottom: 40, // Increased bottom margin for the entire remarks section
  },
  activitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  activityTag: {
    marginRight: 8,
    marginBottom: 8,
  },
  achievementItem: {
    fontSize: 14,
    color: "#4a4a4a",
    marginBottom: 5,
  },
  remarksText: {
    fontSize: 14,
    color: "#4a4a4a",
    lineHeight: 20,
  },
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 5,
    padding: 10,
    position: 'absolute',
    width: 120,
  },
  tooltipTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tooltipText: {
    color: 'white',
    fontSize: 12,
  },
  examsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: -4, // Compensate for examTag margin
  },
  examTag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    margin: 4,
    width: '31%', // Approximately 3 items per row with margins
    alignItems: 'center',
  },
  examType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#001529',
    textAlign: 'center',
  },
  examDate: {
    fontSize: 12,
    color: '#4a4a4a',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default StudentDetailsScreen;

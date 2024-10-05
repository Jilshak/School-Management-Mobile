import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  SectionList,
} from "react-native";
import { Text, Icon as AntIcon } from "@ant-design/react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { LineChart, BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { getExamMarksheet, getMarksheet } from "../../Services/Marksheet/markSheetServices";

type MarksheetScreenProps = {
  navigation: StackNavigationProp<any, "Marksheet">;
};

type Exam = {
  _id: string;
  date: string;
  subjectId?: {
    _id: string;
    name: string;
  };
  classId: {
    _id: string;
    name: string;
  };
  score?: number;
  examType: string;
  description?: string;
};

type SemExam = {
  _id: string;
  classId: {
    _id: string;
    name: string;
  };
  exams: {
    subjectId: {
      _id: string;
      name: string;
      code: string;
    };
    date: string;
    startTime: string;
    endTime: string;
    description?: string;
  }[];
  examType: 'Sem Exam';
  date: string;
  score: number;
};

type MarksheetData = {
  exams: (Exam | SemExam)[];
  total: number;
  attended: number;
};

type ExamResult = {
  _id: string;
  studentId: string;
  examId: string;
  subjectId: string;
  score: number;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
  subjectDetails: {
    _id: string;
    name: string;
    code: string;
    schoolId: string;
  };
};

const MarksheetScreen: React.FC<MarksheetScreenProps> = ({ navigation }) => {
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [marksheetData, setMarksheetData] = useState<MarksheetData | null>(null);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);

  useEffect(() => {
    getMarksheet().then((res) => {
      const { attended, total } = calculateAttendedExams();
      setMarksheetData({ ...res, attended, total });
      setFilteredExams(res.exams);
    });
  }, []);

  const fetchExamResult = async (examId: string) => {
    try {
      const res = await getExamMarksheet(examId);
      setExamResults(res);
    } catch (error) {
      console.error("Error fetching exam result:", error);
      // You might want to show an error message to the user here
    }
  }

  useEffect(() => {
    if (marksheetData) {
      setFilteredExams(
        marksheetData.exams.filter((exam) => {
          if (exam.examType === 'Sem Exam') {
            const semExam = exam as SemExam;
            return semExam.exams.some(subExam => 
              subExam.subjectId.name.toLowerCase().includes(searchQuery.toLowerCase())
            ) || semExam.date.includes(searchQuery);
          } else {
            const classTest = exam as Exam;
            return (classTest.subjectId?.name.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
              classTest.date.includes(searchQuery);
          }
        })
      );
    }
  }, [searchQuery, marksheetData]);

  const calculateSemExamAverage = () => {
    if (!marksheetData) return 0;
    const semExams = marksheetData.exams.filter(exam => exam.examType === "Sem Exam") as SemExam[];
    if (semExams.length === 0) return 0;
    const attendedExams = semExams.filter(exam => exam.score > 0);
    if (attendedExams.length === 0) return 0;
    const totalScore = attendedExams.reduce((sum, exam) => sum + exam.score, 0);
    return Math.round(totalScore / attendedExams.length);
  };

  const groupExams = (exams: (Exam | SemExam)[]): (SemExam | Exam)[] => {
    return exams.map(exam => {
      if (exam.examType === 'Sem Exam') {
        return exam as SemExam;
      } else {
        return exam as Exam;
      }
    });
  };

  const calculateAverageScore = (subjects: Exam[]) => {
    const validScores = subjects.filter(subject => subject.score !== undefined);
    if (validScores.length === 0) return 0;
    const totalScore = validScores.reduce((sum, subject) => sum + (subject.score || 0), 0);
    return Math.round(totalScore / validScores.length);
  };

  // const renderPerformanceComparison = () => (
  //   <View style={styles.chartContainer}>
  //     <Text style={styles.sectionTitle}>Performance Comparison</Text>
  //     <BarChart
  //       data={{
  //         labels: subjects.map((subject) => subject.name.substring(0, 3)),
  //         datasets: [
  //           {
  //             data: subjects.map((subject) => subject.percentage),
  //             color: (opacity = 1) => `rgba(0, 21, 41, ${opacity})`,
  //           },
  //           {
  //             data: subjects.map((subject) => classAverages[subject.name]),
  //             color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
  //           },
  //         ],
  //       }}
  //       width={Dimensions.get("window").width - 40}
  //       height={220}
  //       yAxisLabel="%"
  //       yAxisSuffix=""
  //       chartConfig={{
  //         backgroundColor: "#ffffff",
  //         backgroundGradientFrom: "#ffffff",
  //         backgroundGradientTo: "#ffffff",
  //         decimalPlaces: 0,
  //         color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  //         style: {
  //           borderRadius: 16,
  //         },
  //       }}
  //       style={{
  //         marginVertical: 8,
  //         borderRadius: 16,
  //       }}
  //     />
  //     <View style={styles.legendContainer}>
  //       <View style={styles.legendItem}>
  //         <View
  //           style={[
  //             styles.legendColor,
  //             { backgroundColor: "rgba(0, 21, 41, 1)" },
  //           ]}
  //         />
  //         <Text style={styles.legendText}>Your Score</Text>
  //       </View>
  //       <View style={styles.legendItem}>
  //         <View
  //           style={[
  //             styles.legendColor,
  //             { backgroundColor: "rgba(134, 65, 244, 1)" },
  //           ]}
  //         />
  //         <Text style={styles.legendText}>Class Average</Text>
  //       </View>
  //     </View>
  //   </View>
  // );

  // const renderExamReport = () => (
  //   <>
  //     <View style={styles.studentInfo}>
  //       <Text style={styles.studentName}>MUHAMMED AYAAN P P</Text>
  //       <Text style={styles.studentClass}>Class: UKG</Text>
  //       <Text style={styles.academicYear}>Academic Year: 2023-2024</Text>
  //     </View>

  //     <View style={styles.overallGrade}>
  //       <Text style={styles.overallGradeTitle}>Overall Grade</Text>
  //       <Text style={styles.overallGradeValue}>A</Text>
  //       <Text style={styles.overallPercentage}>93.6%</Text>
  //     </View>

  //     {renderPerformanceComparison()}

  //     <View style={styles.subjectsContainer}>
  //       <Text style={styles.sectionTitle}>Subject-wise Performance</Text>
  //       {examResults.map((subject:any, index:any) => (
  //         <View key={index} style={styles.subjectItem}>
  //           <View style={styles.subjectInfo}>
  //             <Text style={styles.subjectName}>{subject.name}</Text>
  //             <Text style={styles.subjectGrade}>{subject.grade}</Text>
  //           </View>
  //           <View style={styles.percentageBar}>
  //             <View
  //               style={[
  //                 styles.percentageFill,
  //                 { width: `${subject.percentage}%` },
  //               ]}
  //             />
  //           </View>
  //           <Text style={styles.percentageText}>{subject.percentage}%</Text>
  //         </View>
  //       ))}
  //     </View>

  //     <TouchableOpacity style={styles.downloadButton}>
  //       <AntIcon name="download" size={24} color="#ffffff" />
  //       <Text style={styles.downloadButtonText}>Download PDF</Text>
  //     </TouchableOpacity>
  //   </>
  // );

  const renderExamList = () => {
    if (!marksheetData) return null;

    const groupedExams = groupExams(marksheetData.exams);

    const sections:any = [
      {
        title: "Summary",
        data: ["summary"],
        renderItem: () => (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <AntDesign name="linechart" size={24} color="#001529" />
              <Text style={styles.summaryTitle}>Average Score (Sem Exams)</Text>
              <Text style={styles.summaryValue}>{calculateSemExamAverage()}%</Text>
            </View>
            <View style={styles.summaryItem}>
              <AntDesign name="calendar" size={24} color="#001529" />
              <Text style={styles.summaryTitle}>Exams Attended</Text>
              <Text style={styles.summaryValue}>{marksheetData.attended}/{marksheetData.total}</Text>
            </View>
          </View>
        ),
      },
      {
        title: "Performance Chart",
        data: ["chart"],
        renderItem: () => renderPerformanceChart(),
      },
      {
        title: "Sem Exams",
        data: groupedExams.filter(exam => exam.examType === 'Sem Exam') as SemExam[],
        renderItem: ({ item }: { item: SemExam }) => renderSemExamItem(item),
      },
      {
        title: "Class Tests",
        data: groupedExams.filter(exam => exam.examType === 'Class Test') as Exam[],
        renderItem: ({ item }: { item: Exam }) => renderClassTestItem(item),
      },
    ];

    return (
      <View style={styles.examListContainer}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => {
            if (typeof item === 'string') return item;
            return item._id;
          }}
          renderItem={({ item, section }:any) => section.renderItem({ item }) }
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionTitle}>{title}</Text>
          )}
          contentContainerStyle={styles.scrollContent}
          stickySectionHeadersEnabled={false}
        />
      </View>
    );
  };

  const renderPerformanceChart = () => {
    if (!marksheetData) return null;

    const semExams = marksheetData.exams.filter(exam => exam.examType === 'Sem Exam') as SemExam[];
    const sortedSemExams = semExams.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const labels = sortedSemExams.map(exam => new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const scores = sortedSemExams.map(exam => exam.score);

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Semester Exam Performance Trend</Text>
        <LineChart
          data={{
            labels,
            datasets: [{ data: scores }],
          }}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 21, 41, ${opacity})`,
            style: { borderRadius: 16 },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
    );
  };

  const formatDate = (dateString: string, includeYear = true) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    if (includeYear) {
      options.year = 'numeric';
    }
    return date.toLocaleDateString('en-US', options);
  };

  const renderSemExamItem = (semExam: SemExam) => {
    const isAttended = semExam.score > 0;
    return (
      <TouchableOpacity
        style={styles.examItem}
        onPress={() => {
          setSelectedExam(semExam._id);
          fetchExamResult(semExam._id);
        }}
      >
        <View style={styles.examMainInfo}>
          <Text style={styles.examName}>Semester Exam</Text>
          <Text style={styles.examDate}>
            {formatDate(semExam.date)}
          </Text>
        </View>
        <View style={styles.examStatus}>
          {isAttended ? (
            <Text style={styles.examScore}>{semExam.score.toFixed(2)}%</Text>
          ) : (
            <Text style={styles.examNotAttended}>Not Attended</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderClassTestItem = (classTest: Exam) => {
    const isAttended = classTest.score !== undefined && classTest.score > 0;
    return (
      <TouchableOpacity
        style={styles.examItem}
        onPress={() => {
          setSelectedExam(classTest._id);
          fetchExamResult(classTest._id);
        }}
      >
        <View style={styles.examMainInfo}>
          <Text style={styles.examName}>{classTest.subjectId?.name || 'Unknown Subject'}</Text>
          <Text style={styles.examDate}>{formatDate(classTest.date)}</Text>
        </View>
        <View style={styles.examStatus}>
          {isAttended ? (
            <Text style={styles.examScore}>{classTest.score}%</Text>
          ) : (
            <Text style={styles.examNotAttended}>Not Attended</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderExamDetails = (examId: string) => {
    const exam = marksheetData?.exams.find(e => e._id === examId);
    if (!exam) return null;

    if (exam.examType === 'Sem Exam') {
      const semExam = exam as SemExam;
      return (
        <ScrollView contentContainerStyle={styles.examDetailsContainer}>
          <Text style={styles.examDetailsTitle}>Semester Exam</Text>
          <Text style={styles.examDetailsDate}>
            Date: {formatDate(semExam.date)}
          </Text>
          {examResults.map(result => (
            <View key={result._id} style={styles.subjectItem}>
              <Text style={styles.subjectName}>{result.subjectDetails.name}</Text>
              <Text style={styles.examDetailsScore}>Score: {result.score}%</Text>
            </View>
          ))}
          <Text style={styles.examDetailsScore}>Overall Score: {semExam.score.toFixed(2)}%</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setSelectedExam(null);
              setExamResults([]);
            }}
          >
            <Text style={styles.backButtonText}>Back to Exam List</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    } else {
      const classTest = exam as Exam;
      return (
        <ScrollView contentContainerStyle={styles.examDetailsContainer}>
          <Text style={styles.examDetailsTitle}>{classTest.subjectId?.name || 'Unknown Subject'} - Class Test</Text>
          <Text style={styles.examDetailsDate}>
            Date: {formatDate(classTest.date)}
          </Text>
          {examResults.length > 0 ? (
            <Text style={styles.examDetailsScore}>Score: {examResults[0].score}%</Text>
          ) : (
            <Text style={styles.examDetailsNotAttended}>Not Attended</Text>
          )}
          {classTest.description && (
            <Text style={styles.examDetailsDescription}>
              Description: {classTest.description}
            </Text>
          )}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setSelectedExam(null);
              setExamResults([]);
            }}
          >
            <Text style={styles.backButtonText}>Back to Exam List</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const calculateAttendedExams = () => {
    if (!marksheetData) return { attended: 0, total: 0 };
    const attendedExams = marksheetData.exams.filter(exam => {
      if (exam.examType === 'Sem Exam') {
        return (exam as SemExam).score > 0;
      } else {
        return (exam as Exam).score !== undefined && (exam as Exam).score! > 0;
      }
    });
    return { attended: attendedExams.length, total: marksheetData.exams.length };
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            selectedExam ? setSelectedExam(null) : navigation.goBack()
          }
        >
          <AntIcon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Marksheet</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.contentContainer}>
        {selectedExam ? (
          renderExamDetails(selectedExam)
        ) : (
          renderExamList()
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  contentContainer: {
    flex: 1,
    marginTop: 80, // Height of the header plus top margin
  },
  scrollContent: {
    padding: 20,
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
    height: 60, // Specify a fixed height for the header
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  studentInfo: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  studentName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#001529",
  },
  studentClass: {
    fontSize: 16,
    color: "#4a4a4a",
    marginTop: 5,
  },
  academicYear: {
    fontSize: 16,
    color: "#4a4a4a",
    marginTop: 5,
  },
  overallGrade: {
    backgroundColor: "#001529",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  overallGradeTitle: {
    color: "#ffffff",
    fontSize: 16,
    marginBottom: 10,
  },
  overallGradeValue: {
    color: "#ffffff",
    fontSize: 48,
    fontWeight: "bold",
  },
  overallPercentage: {
    color: "#ffffff",
    fontSize: 18,
    marginTop: 5,
  },
  subjectsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#001529",
    marginBottom: 10,
    marginTop: 20,
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
  downloadButton: {
    backgroundColor: "#001529",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
  },
  downloadButtonText: {
    color: "#ffffff",
    marginLeft: 10,
    fontWeight: "bold",
    fontSize: 16,
  },
  examListContainer: {
    flex: 1,
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
    marginRight: 15,
  },
  studentDetails: {
    flex: 1,
  },
  examList: {
    flex: 1,
  },
  examItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  examMainInfo: {
    flex: 1,
  },
  examName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#001529",
  },
  examDate: {
    fontSize: 14,
    color: "#4a4a4a",
    marginTop: 2,
  },
  examStatus: {
    alignItems: "flex-end",
  },
  examStatusText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  examScore: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#001529",
    marginTop: 2,
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryTitle: {
    fontSize: 14,
    color: "#4a4a4a",
    marginTop: 10,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#001529",
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  chartContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: "#4a4a4a",
  },
  examReportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  examType: {
    fontSize: 14,
    color: "#4a4a4a",
    marginTop: 2,
  },
  examDetailsContainer: {
    padding: 20,
  },
  examDetailsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#001529",
    marginBottom: 10,
  },
  examDetailsDate: {
    fontSize: 16,
    color: "#4a4a4a",
    marginBottom: 5,
  },
  examDetailsStatus: {
    fontSize: 16,
    color: "#4a4a4a",
    marginBottom: 5,
  },
  examDetailsScore: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#52c41a",
    marginBottom: 5,
  },
  examDetailsDescription: {
    fontSize: 16,
    color: "#4a4a4a",
    marginTop: 10,
  },
  backButton: {
    backgroundColor: "#001529",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  examNotAttended: {
    color: '#ff4d4f',
    fontWeight: 'bold',
  },
  examDetailsNotAttended: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff4d4f',
    marginBottom: 10,
  },
});

export default MarksheetScreen;
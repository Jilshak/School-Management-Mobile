import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Text, Progress, Tag } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';
import { LineChart } from 'react-native-chart-kit';

type StudentDetailsScreenProps = {
  navigation: StackNavigationProp<any, 'StudentDetails'>;
  route: RouteProp<{ StudentDetails: { studentId: string; student: Student } }, 'StudentDetails'>;
};

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  performance: number;
  attendance: number;
  // Add more fields as needed
  dateOfBirth: string;
  gender: string;
  contactNumber: string;
  email: string;
  address: string;
  parentName: string;
  parentContact: string;
}

const StudentDetailsScreen: React.FC<StudentDetailsScreenProps> = ({ navigation, route }) => {
  const { student } = route.params;
  const scrollY = useRef(new Animated.Value(0)).current;

  const renderPerformanceChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.sectionTitle}>Performance Trend</Text>
      <LineChart
        data={{
          labels: ['Term 1', 'Term 2', 'Term 3'],
          datasets: [{
            data: [student.performance - 5, student.performance, student.performance + 2]
          }]
        }}
        width={Dimensions.get('window').width - 40}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 21, 41, ${opacity})`,
          style: {
            borderRadius: 16
          }
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      />
    </View>
  );

  const renderSubjectPerformance = () => (
    <View style={styles.subjectsContainer}>
      <Text style={styles.sectionTitle}>Subject-wise Performance</Text>
      {['Mathematics', 'Science', 'English', 'Social Studies', 'Physical Education'].map((subject, index) => (
        <View key={index} style={styles.subjectItem}>
          <View style={styles.subjectInfo}>
            <Text style={styles.subjectName}>{subject}</Text>
            <Text style={styles.subjectGrade}>A</Text>
          </View>
          <View style={styles.percentageBar}>
            <View style={[styles.percentageFill, { width: `${85 + index * 2}%` }]} />
          </View>
          <Text style={styles.percentageText}>{85 + index * 2}%</Text>
        </View>
      ))}
    </View>
  );

  const renderDetailItem = (label: string, value: string | number) => (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  const renderExtraCurricularActivities = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Extra-Curricular Activities</Text>
      <View style={styles.activitiesContainer}>
        {['Football Team', 'Debate Club', 'Science Olympiad', 'Chess Club', 'Art Society'].map((activity, index) => (
          <Tag key={index} style={styles.activityTag}>{activity}</Tag>
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
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.studentInfoCard}>
          <View style={styles.studentAvatar}>
            <Icon name="user" size={30} color="#ffffff" />
          </View>
          <View style={styles.studentDetails}>
            <Text style={styles.studentName}>{student.name}</Text>
            <Text style={styles.studentClass}>Roll No: {student.rollNumber}</Text>
            <Text style={styles.academicYear}>Academic Year: 2023-2024</Text>
          </View>
        </View>

        <View style={styles.summaryContainer}>
          <View style={[styles.summaryItem, { alignItems: 'center' }]}>
            <Icon name="linechart" size={20} color="#001529" />
            <Text style={styles.summaryTitle}>Performance</Text>
            <Text style={styles.summaryValue}>{student.performance}%</Text>
          </View>
          <View style={[styles.summaryItem, { alignItems: 'center' }]}>
            <Icon name="calendar" size={20} color="#001529" />
            <Text style={styles.summaryTitle}>Attendance</Text>
            <Text style={styles.summaryValue}>{student.attendance}%</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          {renderDetailItem('Phone', '+1 234 567 8900')}
          {renderDetailItem('Email', 'student@example.com')}
          {renderDetailItem('Address', '123 School St, Cityville, State 12345')}
        </View>

        {renderPerformanceChart()}
        {renderSubjectPerformance()}
        {renderExtraCurricularActivities()}

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {renderDetailItem('Date of Birth', '15 September 2005')}
          {renderDetailItem('Blood Group', 'O+')}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Parent/Guardian Information</Text>
          {renderDetailItem('Father\'s Name', 'John Doe')}
          {renderDetailItem('Father\'s Occupation', 'Engineer')}
          {renderDetailItem('Father\'s Contact', '+1 234 567 8901')}
          {renderDetailItem('Mother\'s Name', 'Jane Doe')}
          {renderDetailItem('Mother\'s Occupation', 'Doctor')}
          {renderDetailItem('Mother\'s Contact', '+1 234 567 8902')}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Academic Information</Text>
          {renderDetailItem('Class', 'X-A')}
          {renderDetailItem('Section', 'A')}
          {renderDetailItem('Class Teacher', 'Mr. Smith')}
          {renderDetailItem('Admission Date', '1 June 2020')}
          {renderDetailItem('Previous School', 'ABC School')}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <Text style={styles.achievementItem}>• First place in Inter-school Science Fair 2023</Text>
          <Text style={styles.achievementItem}>• Best Debater Award in Regional Debate Competition</Text>
          <Text style={styles.achievementItem}>• Captain of the school Football Team</Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Remarks</Text>
          <Text style={styles.remarksText}>
            {student.name} is a diligent and enthusiastic student who consistently demonstrates a strong work ethic and a passion for learning. Their active participation in both academic and extra-curricular activities is commendable.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#001529',
    padding: 15,
    borderRadius: 10,
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
    height: 60,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    marginTop: 80, // Height of the header plus top margin
    padding: 20,
  },
  studentInfoCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  studentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#001529',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
  },
  studentClass: {
    fontSize: 14,
    color: '#4a4a4a',
    marginTop: 5,
  },
  academicYear: {
    fontSize: 14,
    color: '#4a4a4a',
    marginTop: 5,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    color: '#4a4a4a',
    marginLeft: 5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
    marginLeft: 5,
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  subjectsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  subjectItem: {
    marginBottom: 15,
  },
  subjectInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  subjectName: {
    fontSize: 16,
    color: '#4a4a4a',
  },
  subjectGrade: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001529',
  },
  percentageBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  percentageFill: {
    height: '100%',
    backgroundColor: '#001529',
  },
  percentageText: {
    fontSize: 14,
    color: '#4a4a4a',
    marginTop: 5,
    textAlign: 'right',
  },
  detailsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
    marginTop: 20,
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 16,
    color: '#4a4a4a',
  },
  detailValue: {
    fontSize: 16,
    color: '#001529',
    fontWeight: '500',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  sectionContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  activitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  activityTag: {
    marginRight: 8,
    marginBottom: 8,
  },
  achievementItem: {
    fontSize: 14,
    color: '#4a4a4a',
    marginBottom: 5,
  },
  remarksText: {
    fontSize: 14,
    color: '#4a4a4a',
    lineHeight: 20,
  },
});

export default StudentDetailsScreen;
import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Icon as AntIcon, DatePicker } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type AttendanceScreenProps = {
  navigation: StackNavigationProp<any, 'Attendance'>;
};

const AttendanceScreen: React.FC<AttendanceScreenProps> = ({ navigation }) => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  // Sample attendance data
  const attendanceData = {
    '2023-05-01': { status: 'present' },
    '2023-05-02': { status: 'present' },
    '2023-05-03': { status: 'absent' },
    '2023-05-04': { status: 'present' },
    '2023-05-05': { status: 'present' },
    // Add more dates as needed
  };

  const calculateAttendance = () => {
    const totalDays = Object.keys(attendanceData).length;
    const presentDays = Object.values(attendanceData).filter(day => day.status === 'present').length;
    const attendancePercentage = (presentDays / totalDays) * 100;
    return {
      totalDays,
      presentDays,
      attendancePercentage: attendancePercentage.toFixed(2),
    };
  };

  const { totalDays, presentDays, attendancePercentage } = calculateAttendance();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntIcon name="left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance Records</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.datePickerContainer}>
          <DatePicker
            value={selectedMonth}
            mode="month"
            minDate={new Date(2023, 0, 1)}
            maxDate={new Date(2023, 11, 31)}
            onChange={date => setSelectedMonth(date)}
            format="YYYY-MM"
            style={styles.datePicker}
          >
            <Text style={styles.datePickerText}>Select Month</Text>
          </DatePicker>
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Days</Text>
            <Text style={styles.summaryValue}>{totalDays}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Present Days</Text>
            <Text style={styles.summaryValue}>{presentDays}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Attendance</Text>
            <Text style={styles.summaryValue}>{attendancePercentage}%</Text>
          </View>
        </View>

        <View style={styles.attendanceList}>
          {Object.entries(attendanceData).map(([date, data]) => (
            <View key={date} style={styles.attendanceItem}>
              <Text style={styles.attendanceDate}>{date}</Text>
              <View style={[styles.statusIndicator, { backgroundColor: data.status === 'present' ? '#4CAF50' : '#F44336' }]} />
              <Text style={[styles.attendanceStatus, { color: data.status === 'present' ? '#4CAF50' : '#F44336' }]}>
                {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
              </Text>
            </View>
          ))}
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
  contentContainer: {
    flex: 1,
    marginTop: 80,
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
  datePickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    margin: 20,
    padding: 10,
  },
  datePicker: {
    width: '100%',
  },
  datePickerText: {
    fontSize: 16,
    color: '#001529',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    margin: 20,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#4a4a4a',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
  },
  attendanceList: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    margin: 20,
    padding: 15,
  },
  attendanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  attendanceDate: {
    flex: 1,
    fontSize: 16,
    color: '#001529',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  attendanceStatus: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AttendanceScreen;
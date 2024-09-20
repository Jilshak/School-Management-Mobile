import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Text, Icon as AntIcon, Button } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Calendar, DateData } from 'react-native-calendars';
import { LineChart } from 'react-native-chart-kit';

type AttendanceScreenProps = {
  navigation: StackNavigationProp<any, 'Attendance'>;
};

type AttendanceStatus = 'present' | 'halfDay' | 'absent' | 'holiday';

interface AttendanceRecord {
  status: AttendanceStatus;
}

const AttendanceScreen: React.FC<AttendanceScreenProps> = ({ navigation }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedDate, setSelectedDate] = useState('');
  const [attendanceData, setAttendanceData] = useState<{ [key: string]: AttendanceRecord }>({});

  useEffect(() => {
    generateCurrentMonthAttendance();
  }, [selectedMonth]);

  const generateCurrentMonthAttendance = () => {
    const year = parseInt(selectedMonth.split('-')[0]);
    const month = parseInt(selectedMonth.split('-')[1]) - 1; // JS months are 0-indexed
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const newAttendanceData: { [key: string]: AttendanceRecord } = {};
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      if (date.getDay() === 1) { // Saturday
        newAttendanceData[dateString] = { status: 'holiday' };
      } else {
        newAttendanceData[dateString] = {
          status: Math.random() < 0.7 ? 'present' : (Math.random() < 0.5 ? 'halfDay' : 'absent')
        };
      }
    }
    
    setAttendanceData(newAttendanceData);
  };

  const markedDates = Object.keys(attendanceData).reduce((acc, date) => {
    const status = attendanceData[date].status;
    acc[date] = {
      selected: true,
      selectedColor: 
        status === 'present' ? '#4CAF50' : 
        status === 'halfDay' ? '#FFA726' : 
        status === 'holiday' ? '#A9A9A9' : '#FF6B6B', // Darker red color
      customTextStyle: {
        color: status === 'holiday' ? 'black' : 'white',
        fontWeight: 'bold',
      },
    };
    return acc;
  }, {} as any);

  const calculateAttendance = () => {
    const totalDays = Object.keys(attendanceData).length;
    const presentDays = Object.values(attendanceData).filter(day => day.status === 'present').length;
    const halfDays = Object.values(attendanceData).filter(day => day.status === 'halfDay').length;
    const absentDays = Object.values(attendanceData).filter(day => day.status === 'absent').length;
    const attendancePercentage = ((presentDays + halfDays * 0.5) / totalDays) * 100;
    return {
      totalDays,
      presentDays,
      halfDays,
      absentDays,
      attendancePercentage: attendancePercentage.toFixed(2),
    };
  };

  const { totalDays, presentDays, halfDays, absentDays, attendancePercentage } = calculateAttendance();

  const chartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        data: [80, 90, 85, 95],
        color: (opacity = 1) => `rgba(0, 128, 255, ${opacity})`,
        strokeWidth: 2
      }
    ]
  };

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
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedMonth}
            onMonthChange={(month: DateData) => {
              setSelectedMonth(month.dateString);
              setSelectedDate('');
            }}
            onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
            markedDates={{
              ...markedDates,
              [selectedDate]: {
                ...markedDates[selectedDate],
                selected: true,
                selectedColor: '#1976D2',
                customTextStyle: {
                  color: 'white',
                  fontWeight: 'bold',
                },
              },
            }}
            markingType={'custom'}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: '#00adf5',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#1976D2',
              dayTextColor: '#333333',
              textDisabledColor: '#BDBDBD',
              arrowColor: '#1976D2',
              monthTextColor: '#1976D2',
              indicatorColor: '#1976D2',
              textDayFontWeight: '400',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '400',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Present</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FFA726' }]} />
            <Text style={styles.legendText}>Half Day</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF6B6B' }]} />
            <Text style={styles.legendText}>Absent</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#A9A9A9' }]} />
            <Text style={styles.legendText}>Holiday</Text>
          </View>
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Days</Text>
            <Text style={styles.summaryValue}>{totalDays}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Present</Text>
            <Text style={styles.summaryValue}>{presentDays}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Half Day</Text>
            <Text style={styles.summaryValue}>{halfDays}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Absent</Text>
            <Text style={styles.summaryValue}>{absentDays}</Text>
          </View>
        </View>

        <View style={styles.attendancePercentage}>
          <Text style={styles.attendancePercentageLabel}>Attendance Percentage</Text>
          <Text style={styles.attendancePercentageValue}>{attendancePercentage}%</Text>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Monthly Attendance Trend</Text>
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>

        <View style={styles.reportButtonContainer}>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => {
              // Handle generating report
            }}
          >
            <Text style={styles.reportButtonText}>Generate Detailed Report</Text>
          </TouchableOpacity>
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
  calendarContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    margin: 20,
    overflow: 'hidden',
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
  attendancePercentage: {
    backgroundColor: '#001529',
    borderRadius: 10,
    padding: 15,
    margin: 20,
    alignItems: 'center',
  },
  attendancePercentageLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 5,
  },
  attendancePercentageValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 5,
  },
  legendText: {
    fontSize: 14,
    color: '#4a4a4a',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    margin: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
    marginBottom: 10,
  },
  reportButtonContainer: {
    backgroundColor: '#001529',
    borderRadius: 10,
    margin: 20,
    overflow: 'hidden',
  },
  reportButton: {
    padding: 15,
    alignItems: 'center',
  },
  reportButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default AttendanceScreen;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Dimensions, TextInput, Modal } from 'react-native';
import { Text, Icon as AntIcon, Button } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Calendar, DateData } from 'react-native-calendars';
import { LineChart } from 'react-native-chart-kit';
import { useToast } from '../../hooks/useToast';
import { getAttendance } from '../../Services/Attendance/ClassAttendance';

type AttendanceScreenProps = {
  navigation: StackNavigationProp<any, 'Attendance'>;
};

type AttendanceStatus = 'present' | 'halfDay' | 'absent' | 'holiday';

interface AttendanceRecord {
  status: AttendanceStatus;
  regularizationRequested?: boolean;
}

const AttendanceScreen: React.FC<AttendanceScreenProps> = ({ navigation }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedDate, setSelectedDate] = useState('');
  const [isRegularizeModalVisible, setIsRegularizeModalVisible] = useState(false);
  const [regularizationReason, setRegularizationReason] = useState('');
  const [attendanceData, setAttendanceData] = useState<{ [key: string]: AttendanceRecord }>({});

  const attendanceDataRef = useRef<{ [key: string]: { [key: string]: AttendanceRecord } }>({});

  const { showToast } = useToast();

  const handleFetchAttendance = useCallback(async (month: string) => {
    try {
      const [year, monthStr] = month.split('-');
      const monthIndex = parseInt(monthStr) - 1; // Convert to 0-11 range
      if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
        throw new Error('Invalid month');
      }
      const response = await getAttendance(parseInt(year), monthIndex);
      if (response && response.attendanceReport) {
        const newAttendanceData: { [key: string]: AttendanceRecord } = {};
        response.attendanceReport.forEach((record: any) => {
          if (record && record.date && record.status) {
            const date = new Date(record.date).toISOString().split('T')[0];
            newAttendanceData[date] = { status: record.status as AttendanceStatus };
          }
        });
        attendanceDataRef.current[month] = newAttendanceData;
        setAttendanceData(newAttendanceData);
      } else {
        attendanceDataRef.current[month] = {};
        setAttendanceData({});
      }
    } catch (error) {
      console.error('Error in handleFetchAttendance:', error);
      showToast({
        message: 'Failed to fetch attendance data. Please try again.',
        type: 'error',
      });
      attendanceDataRef.current[month] = {};
      setAttendanceData({});
    }
  }, [showToast]);

  useEffect(() => {
    handleFetchAttendance(selectedMonth);
  }, [selectedMonth, handleFetchAttendance]);

  useEffect(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    handleFetchAttendance(currentMonth);
  }, []);

  const markedDates = React.useMemo(() => {
    return Object.keys(attendanceData).reduce((acc, date) => {
      const status = attendanceData[date]?.status;
      if (status) {
        acc[date] = {
          selected: true,
          selectedColor: 
            status === 'present' ? '#4CAF50' : 
            status === 'halfDay' ? '#FFA726' : 
            status === 'holiday' ? '#A9A9A9' : '#FF6B6B',
          customTextStyle: {
            color: status === 'holiday' ? 'black' : 'white',
            fontWeight: 'bold',
          },
        };
      }
      return acc;
    }, {} as any);
  }, [attendanceData]);

  const calculateAttendance = () => {
    const totalDays = Object.keys(attendanceData).length;
    const presentDays = Object.values(attendanceData).filter(day => day.status === 'present').length;
    const halfDays = Object.values(attendanceData).filter(day => day.status === 'halfDay').length;
    const absentDays = Object.values(attendanceData).filter(day => day.status === 'absent').length;
    const attendancePercentage = totalDays > 0 ? ((presentDays + halfDays * 0.5) / totalDays) * 100 : 0;
    return {
      totalDays,
      presentDays,
      halfDays,
      absentDays,
      attendancePercentage: attendancePercentage.toFixed(2),
    };
  };

  const { totalDays, presentDays, halfDays, absentDays, attendancePercentage } = calculateAttendance();

  const calculateWeeklyAttendance = useCallback(() => {
    const weeks: { [key: string]: { present: number; total: number } } = {
      'Week 1': { present: 0, total: 0 },
      'Week 2': { present: 0, total: 0 },
      'Week 3': { present: 0, total: 0 },
      'Week 4': { present: 0, total: 0 },
      'Week 5': { present: 0, total: 0 },
    };

    Object.entries(attendanceData).forEach(([date, record]) => {
      const dayOfMonth = new Date(date).getDate();
      const weekNumber = Math.ceil(dayOfMonth / 7);
      const weekKey = `Week ${weekNumber}`;

      if (weeks[weekKey]) {
        weeks[weekKey].total++;
        if (record.status === 'present') {
          weeks[weekKey].present++;
        } else if (record.status === 'halfDay') {
          weeks[weekKey].present += 0.5;
        }
      }
    });

    return Object.entries(weeks).map(([week, data]) => {
      const percentage = data.total > 0 ? (data.present / data.total) * 100 : 0;
      return { week, percentage: Math.round(percentage) };
    });
  }, [attendanceData]);

  const chartData = React.useMemo(() => {
    const weeklyData = calculateWeeklyAttendance();
    return {
      labels: weeklyData.map(item => item.week),
      datasets: [
        {
          data: weeklyData.map(item => item.percentage),
          color: (opacity = 1) => `rgba(0, 21, 41, ${opacity})`,
          strokeWidth: 2
        }
      ]
    };
  }, [calculateWeeklyAttendance]);

  const handleDayPress = (day: DateData) => {
    if (day && day.dateString) {
      setSelectedDate(day.dateString);
      const status = attendanceData[day.dateString]?.status;
      if (status === 'absent' || status === 'halfDay') {
        setIsRegularizeModalVisible(true);
      }
    }
  };

  const handleRegularizeRequest = () => {
    if (selectedDate && regularizationReason.trim()) {
      console.log(`Regularization requested for ${selectedDate}. Reason: ${regularizationReason}`);
      setIsRegularizeModalVisible(false);
      setAttendanceData(prevData => ({
        ...prevData,
        [selectedDate]: { ...prevData[selectedDate], regularizationRequested: true }
      }));
      setRegularizationReason('');
      showToast({
        message: 'Regularization request submitted successfully.',
        type: 'success',
      });
    } else {
      showToast({
        message: 'Please provide a reason for regularization.',
        type: 'error',
      });
    }
  };

  const renderRegularizeModal = () => (
    <Modal
      visible={isRegularizeModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setIsRegularizeModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Regularize Attendance</Text>
          <Text style={styles.modalDate}>{selectedDate}</Text>
          <Text style={styles.modalLabel}>Reason for Absence:</Text>
          <TextInput
            style={styles.modalInput}
            multiline
            numberOfLines={4}
            value={regularizationReason}
            onChangeText={setRegularizationReason}
            placeholder="Please provide a reason for your absence"
            placeholderTextColor="#999"
          />
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setIsRegularizeModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSubmitButton}
              onPress={handleRegularizeRequest}
            >
              <Text style={[styles.modalButtonText, { color: '#ffffff' }]}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

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
              if (month && month.dateString) {
                const newSelectedMonth = month.dateString.slice(0, 7);
                console.log('Month changed to:', newSelectedMonth);
                setSelectedMonth(newSelectedMonth);
                setSelectedDate('');
                handleFetchAttendance(newSelectedMonth);
              }
            }}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            markingType={'custom'}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: '#001529',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#001529',
              dayTextColor: '#333333',
              textDisabledColor: '#001529',
              arrowColor: '#001529',
              monthTextColor: '#001529',
              indicatorColor: '#001529',
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
            <Text style={styles.summaryValue}>{totalDays || 0}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Present</Text>
            <Text style={styles.summaryValue}>{presentDays || 0}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Half Day</Text>
            <Text style={styles.summaryValue}>{halfDays || 0}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Absent</Text>
            <Text style={styles.summaryValue}>{absentDays || 0}</Text>
          </View>
        </View>

        <View style={styles.attendancePercentage}>
          <Text style={styles.attendancePercentageLabel}>Attendance Percentage</Text>
          <Text style={styles.attendancePercentageValue}>{attendancePercentage || '0.00'}%</Text>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Monthly Attendance Trend</Text>
          {chartData.labels.length > 0 ? (
            <LineChart
              data={chartData}
              width={Dimensions.get('window').width - 60}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 21, 41, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 21, 41, ${opacity})`,
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: "#001529"
                },
                style: {
                  borderRadius: 16,
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
              yAxisLabel=""
              yAxisSuffix="%"
              yAxisInterval={1}
              fromZero
              segments={5}
            />
          ) : (
            <Text style={styles.noDataText}>No data available for the selected month</Text>
          )}
        </View>

        <View style={styles.reportButtonContainer}>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => {
              showToast({
                message: 'Detailed report generation is not implemented yet.',
                type: 'info',
              });
            }}
          >
            <Text style={styles.reportButtonText}>Generate Detailed Report</Text>
          </TouchableOpacity>
        </View>

        {renderRegularizeModal()}
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001529',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalDate: {
    fontSize: 18,
    color: '#4a4a4a',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    color: '#4a4a4a',
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    textAlignVertical: 'top',
    width: '100%',
    fontSize: 16,
    color: '#001529',
    height: 100,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalCancelButton: {
    backgroundColor: '#f5f5f5',
    borderColor: '#d9d9d9',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '48%',
    alignItems: 'center',
  },
  modalSubmitButton: {
    backgroundColor: '#001529',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '48%',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#4a4a4a',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default AttendanceScreen;
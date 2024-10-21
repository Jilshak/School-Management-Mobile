import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  Modal,
} from "react-native";
import { Text, Icon as AntIcon, Button } from "@ant-design/react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Calendar, DateData } from "react-native-calendars";
import { LineChart } from "react-native-chart-kit";
import {
  getAttendance,
  regularizeAttendance,
} from "../../Services/Attendance/ClassAttendance";
import { useToast } from "../../contexts/ToastContext";
import { Picker } from "@react-native-picker/picker";

type AttendanceScreenProps = {
  navigation: StackNavigationProp<any, "Attendance">;
};

type AttendanceStatus = "present" | "halfDay" | "absent" | "holiday";

interface AttendanceRecord {
  id: string;
  status: AttendanceStatus;
  regularizationRequested?: boolean;
  regularizationDate?: string;
}
const COLORS = {
  present: '#4CAF50',    // Green
  halfDay: '#FFA726',    // Orange
  absent: '#FF5252',     // Red
  holiday: '#9E9E9E',    // Grey
  regularized: '#7986CB' // Indigo
};
const AttendanceScreen: React.FC<AttendanceScreenProps> = ({ navigation }) => {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [selectedDate, setSelectedDate] = useState("");
  const [isRegularizeModalVisible, setIsRegularizeModalVisible] =
    useState(false);
  const [regularizationReason, setRegularizationReason] = useState("");
  const [attendanceData, setAttendanceData] = useState<{
    [key: string]: AttendanceRecord;
  }>({});

  const attendanceDataRef = useRef<{
    [key: string]: { [key: string]: AttendanceRecord };
  }>({});

  const { showToast } = useToast();

  const [regularizationType, setRegularizationType] = useState<"fullDay" | "halfDay">("fullDay");
  const [currentAttendanceStatus, setCurrentAttendanceStatus] = useState<AttendanceStatus | null>(null);

  const handleFetchAttendance = useCallback(async (month: string) => {
    try {
      const [year, monthStr] = month.split("-");
      const monthIndex = parseInt(monthStr) - 1;
      if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
        throw new Error("Invalid month");
      }
      const response = await getAttendance(parseInt(year), monthIndex);
      if (response && response.attendanceReport) {
        const newAttendanceData: { [key: string]: AttendanceRecord } = {};
        response.attendanceReport.forEach((record: any) => {
          if (record && record.date && record.status) {
            const date = new Date(record.date);
            const dateString = date.toISOString().split("T")[0];
            // Normalize the status
            let normalizedStatus: AttendanceStatus = record.status.toLowerCase() as AttendanceStatus;
            if (normalizedStatus === 'halfday' as AttendanceStatus) {
              normalizedStatus = 'halfDay';
            }
            newAttendanceData[dateString] = {
              id: record._id || "",
              status: normalizedStatus,
              regularizationRequested: record.regularizationRequested || false,
              regularizationDate: record.regularizationDate,
            };
          }
        });
        setAttendanceData(newAttendanceData);
      } else {
        setAttendanceData({});
      }
    } catch (error) {
      showToast("Failed to fetch attendance data. Please try again.", "error");
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
      const record = attendanceData[date];
      if (record) {
        let color = COLORS.absent;
        if (record.status === 'present') {
          color = COLORS.present;
        } else if (record.status === 'halfDay') {
          color = COLORS.halfDay;
        } else if (record.status === 'holiday') {
          color = COLORS.holiday;
        }

        if (record.regularizationRequested) {
          color = COLORS.regularized;
        }

        acc[date] = {
          selected: true,
          selectedColor: color,
          customTextStyle: {
            color: record.status === 'holiday' ? 'black' : 'white',
            fontWeight: 'bold',
          },
        };
      }
      return acc;
    }, {} as any);
  }, [attendanceData]);

  const calculateAttendance = () => {
    const totalDays = Object.keys(attendanceData).length;
    const presentDays = Object.values(attendanceData).filter(
      (day) => day.status === "present"
    ).length;
    const halfDays = Object.values(attendanceData).filter(
      (day) => day.status === "halfDay"
    ).length;
    const absentDays = Object.values(attendanceData).filter(
      (day) => day.status === "absent"
    ).length;
    const attendancePercentage =
      totalDays > 0 ? ((presentDays + halfDays * 0.5) / totalDays) * 100 : 0;
    return {
      totalDays,
      presentDays,
      halfDays,
      absentDays,
      attendancePercentage: attendancePercentage.toFixed(2),
    };
  };

  const { totalDays, presentDays, halfDays, absentDays, attendancePercentage } =
    calculateAttendance();

  const calculateWeeklyAttendance = useCallback(() => {
    const weeks: { [key: string]: { present: number; total: number } } = {
      "Week 1": { present: 0, total: 0 },
      "Week 2": { present: 0, total: 0 },
      "Week 3": { present: 0, total: 0 },
      "Week 4": { present: 0, total: 0 },
      "Week 5": { present: 0, total: 0 },
    };

    Object.entries(attendanceData).forEach(([date, record]) => {
      const dayOfMonth = new Date(date).getDate();
      const weekNumber = Math.ceil(dayOfMonth / 7);
      const weekKey = `Week ${weekNumber}`;

      if (weeks[weekKey]) {
        weeks[weekKey].total++;
        if (record.status === "present") {
          weeks[weekKey].present++;
        } else if (record.status === "halfDay") {
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
      labels: weeklyData.map((item) => item.week),
      datasets: [
        {
          data: weeklyData.map((item) => item.percentage),
          color: (opacity = 1) => `rgba(0, 21, 41, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  }, [calculateWeeklyAttendance]);

  const handleDayPress = (day: DateData) => {
    if (day && day.dateString) {
      setSelectedDate(day.dateString);
      const status = attendanceData[day.dateString]?.status;
      setCurrentAttendanceStatus(status);
      if (status === "absent" || status === "halfDay") {
        setIsRegularizeModalVisible(true);
        // Set regularizationType to "fullDay" by default
        setRegularizationType("fullDay");
      }
    }
  };

  const handleRegularizeRequest = async () => {
    try {
      if (selectedDate && regularizationReason.trim()) {
        const selectedRecord = attendanceData[selectedDate];
        if (selectedRecord && selectedRecord.id) {
          setIsRegularizeModalVisible(false);

          const response = await regularizeAttendance({
            attendanceId: selectedRecord.id,
            reason: regularizationReason,
            date: selectedDate,
            type: regularizationType,
          });

          if (response !== undefined && response !== null) {
            const updatedAttendanceData = {
  ...attendanceData,
  [selectedDate]: {
    ...selectedRecord,
    regularizationRequested: true,
    regularizationDate: new Date().toISOString(),
    status: regularizationType === "fullDay" ? "present" : "halfDay" as AttendanceStatus,
  },
};
            setAttendanceData(updatedAttendanceData);
            setRegularizationReason("");
            setRegularizationType("fullDay");
            showToast("Regularization request submitted successfully.", "success");
          } else {
            showToast("Failed to submit regularization request. Please try again.", "error");
          }
        } else {
          showToast("Unable to find the attendance record. Please try again.", "error");
        }
      } else {
        showToast("Please provide a reason for regularization.", "error");
      }
    } catch (error: any) {
      if (error.response && error.response.data.message) {
        showToast(error.response.data.message, "error");
      } else {
        showToast("Failed to submit regularization request. Please try again.", "error");
      }
    }
  };

  const renderRegularizeModal = () => (
    <Modal
      visible={isRegularizeModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setIsRegularizeModalVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setIsRegularizeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <Text style={styles.modalTitle}>Regularize Attendance</Text>
            <Text style={styles.modalDate}>{selectedDate}</Text>
            
            <Text style={styles.modalLabel}>Regularization Type:</Text>
            <View style={styles.regularizationTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.regularizationTypeButton,
                  regularizationType === "fullDay" && styles.regularizationTypeButtonActive,
                ]}
                onPress={() => setRegularizationType("fullDay")}
              >
                <AntIcon 
                  name="calendar" 
                  size={24} 
                  color={regularizationType === "fullDay" ? "#ffffff" : "#001529"} 
                />
                <Text style={[
                  styles.regularizationTypeText,
                  regularizationType === "fullDay" && styles.regularizationTypeTextActive,
                ]}>Full Day</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.regularizationTypeButton,
                  regularizationType === "halfDay" && styles.regularizationTypeButtonActive,
                  currentAttendanceStatus === "halfDay" && styles.regularizationTypeButtonDisabled
                ]}
                onPress={() => currentAttendanceStatus !== "halfDay" && setRegularizationType("halfDay")}
                disabled={currentAttendanceStatus === "halfDay"}
              >
                <AntIcon 
                  name="schedule" 
                  size={24} 
                  color={
                    currentAttendanceStatus === "halfDay" 
                      ? "#999" 
                      : regularizationType === "halfDay" 
                        ? "#ffffff" 
                        : "#001529"
                  } 
                />
                <Text style={[
                  styles.regularizationTypeText,
                  regularizationType === "halfDay" && styles.regularizationTypeTextActive,
                  currentAttendanceStatus === "halfDay" && styles.regularizationTypeTextDisabled
                ]}>Half Day</Text>
              </TouchableOpacity>
            </View>

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
                <Text style={[styles.modalButtonText, { color: "#ffffff" }]}>
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
                setSelectedMonth(newSelectedMonth);
                setSelectedDate("");
                handleFetchAttendance(newSelectedMonth);
              }
            }}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            markingType={"custom"}
            theme={{
              backgroundColor: "#ffffff",
              calendarBackground: "#ffffff",
              textSectionTitleColor: "#b6c1cd",
              selectedDayBackgroundColor: "#001529",
              selectedDayTextColor: "#ffffff",
              todayTextColor: "#001529",
              dayTextColor: "#333333",
              textDisabledColor: "#001529",
              arrowColor: "#001529",
              monthTextColor: "#001529",
              indicatorColor: "#001529",
              textDayFontWeight: "400",
              textMonthFontWeight: "bold",
              textDayHeaderFontWeight: "400",
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendRow}>
            {Object.entries(COLORS).map(([key, color]) => (
              <View key={key} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: color }]} />
                <Text style={styles.legendText}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
              </View>
            ))}
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
          <Text style={styles.attendancePercentageLabel}>
            Attendance Percentage
          </Text>
          <Text style={styles.attendancePercentageValue}>
            {attendancePercentage || "0.00"}%
          </Text>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Monthly Attendance Trend</Text>
          {chartData.labels.length > 0 ? (
            <LineChart
              data={chartData}
              width={Dimensions.get("window").width - 60}
              height={220}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 21, 41, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 21, 41, ${opacity})`,
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: "#001529",
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
            <Text style={styles.noDataText}>
              No data available for the selected month
            </Text>
          )}
        </View>

        <View style={styles.reportButtonContainer}>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => {
              showToast("Detailed report generation is not implemented yet.", "info");
            }}
          >
            <Text style={styles.reportButtonText}>
              Generate Detailed Report
            </Text>
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
    backgroundColor: "#f0f2f5",
  },
  contentContainer: {
    flex: 1,
    marginTop: 80,
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
  calendarContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    margin: 20,
    overflow: "hidden",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    margin: 20,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#4a4a4a",
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#001529",
  },
  attendancePercentage: {
    backgroundColor: "#001529",
    borderRadius: 10,
    padding: 15,
    margin: 20,
    alignItems: "center",
  },
  attendancePercentageLabel: {
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 5,
  },
  attendancePercentageValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  legendContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#4a4a4a',
  },
  chartContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    margin: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#001529",
    marginBottom: 10,
  },
  reportButtonContainer: {
    backgroundColor: "#001529",
    borderRadius: 10,
    margin: 20,
    overflow: "hidden",
  },
  reportButton: {
    padding: 15,
    alignItems: "center",
  },
  reportButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#001529",
    marginBottom: 15,
    textAlign: "center",
  },
  modalDate: {
    fontSize: 18,
    color: "#4a4a4a",
    marginBottom: 20,
    textAlign: "center",
  },
  modalLabel: {
    fontSize: 16,
    color: "#4a4a4a",
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    textAlignVertical: "top",
    width: "100%",
    fontSize: 16,
    color: "#001529",
    height: 100,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalCancelButton: {
    backgroundColor: "#f5f5f5",
    borderColor: "#d9d9d9",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "48%",
    alignItems: "center",
  },
  modalSubmitButton: {
    backgroundColor: "#001529",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "48%",
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  noDataText: {
    fontSize: 16,
    color: "#4a4a4a",
    textAlign: "center",
    marginVertical: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderRadius: 10,
    marginBottom: 20,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  regularizationTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  regularizationTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  regularizationTypeButtonActive: {
    backgroundColor: '#001529',
  },
  regularizationTypeText: {
    color: '#001529',
    marginLeft: 8,
    fontSize: 16,
  },
  regularizationTypeTextActive: {
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  regularizationTypeButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#d9d9d9',
  },
  regularizationTypeTextDisabled: {
    color: '#999',
  },
});

export default AttendanceScreen;

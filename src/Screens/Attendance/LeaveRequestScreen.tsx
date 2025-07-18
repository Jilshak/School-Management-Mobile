import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { Text, Icon as AntIcon } from "@ant-design/react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Calendar, DateData } from "react-native-calendars";
import { createLeaveRequest } from "../../Services/Leave/Leave";
import { useToast } from "../../contexts/ToastContext";
import { isAfter10AM } from "../../utils/DateUtil";

type LeaveRequestScreenProps = {
  navigation: StackNavigationProp<any, "LeaveRequest">;
};

const LeaveRequestScreen: React.FC<LeaveRequestScreenProps> = ({
  navigation,
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
  const { showToast } = useToast();

  const handleDayPress = (day: DateData) => {
    const selectedDate = day.dateString;
    if (!startDate || (startDate && endDate)) {
      setStartDate(selectedDate);
      setEndDate("");
      setMarkedDates({
        [selectedDate]: {
          startingDay: true,
          color: "#50cebb",
          textColor: "white",
        },
      });
    } else {
      const start = new Date(startDate);
      const end = new Date(selectedDate);
      const [rangeStart, rangeEnd] = start <= end ? [start, end] : [end, start];
  
      const range: { [key: string]: any } = {};
      for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
        const dateString = d.toISOString().split("T")[0];
        range[dateString] = {
          color: "#70d7c7",
          textColor: "white",
          ...(dateString === rangeStart.toISOString().split("T")[0] && { startingDay: true }),
          ...(dateString === rangeEnd.toISOString().split("T")[0] && { endingDay: true }),
        };
      }
  
      setStartDate(rangeStart.toISOString().split("T")[0]);
      setEndDate(rangeEnd.toISOString().split("T")[0]);
      setMarkedDates(range);
    }
  };

  const validateLeaveRequest = (): boolean => {
    if (!startDate || !endDate) {
      showToast(
        "Please select both start and end dates for your leave.",
        "error"
      );
      return false;
    }

    if (new Date(startDate) > new Date(endDate)) {
      showToast("End date cannot be earlier than start date.", "error");
      return false;
    }

    if (!reason.trim()) {
      showToast("Please provide a reason for your leave request.", "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateLeaveRequest()) {
      return;
    }
    try {
      await handleCreateLeaveRequest();
      showToast(
        "Your leave request has been submitted successfully.",
        "success"
      );
      // Clear states
      setStartDate("");
      setEndDate("");
      setReason("");
      setMarkedDates({});
      // Navigate to LeaveRequestList screen
      navigation.navigate("LeaveRequestList");
    } catch (error: any) {
      console.error("Error submitting leave request:", error);
      if (
        error.message &&
        typeof error.message === "object" &&
        error.message.message
      ) {
        if (error.message.message === "Leave request already exists") {
          showToast(
            "A leave request for these dates already exists.",
            "error",
            5000
          );
        } else {
          showToast(error.message.message, "error");
        }
      } else if (error instanceof Error) {
        showToast("Server error. Please try again later.", "error");
      } else {
        showToast("Failed to submit leave request. Please try again.", "error");
      }
    }
  };

  const handleCreateLeaveRequest = async () => {
    try {
      const leaveRequest = await createLeaveRequest({
        startDate,
        endDate,
        reason,
      });
      return leaveRequest;
    } catch (error) {
      console.error("Error creating leave request:", error);
      throw error;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${
      months[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()}`;
  };

  const getDaysDifference = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
  };

  const getMinDate = (): string => {
    const today = new Date();
    if (isAfter10AM(today)) {
      today.setDate(today.getDate() + 1);
    }
    return today.toISOString().split('T')[0];
  };

  const isToday = (date: string): boolean => {
    const today = new Date();
    return date === today.toISOString().split('T')[0];
  };

  const getDisabledDates = (): { [key: string]: any } => {
    const today = new Date();
    if (isAfter10AM(today)) {
      const todayString = today.toISOString().split('T')[0];
      return {
        [todayString]: { disabled: true, disableTouchEvent: true, textColor: '#d9e1e8' }
      };
    }
    return {};
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntIcon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave Request</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Select Leave Dates</Text>

          <Calendar
            style={styles.calendar}
            onDayPress={handleDayPress}
            markedDates={{
              ...markedDates,
              ...getDisabledDates(),
            }}
            markingType={"period"}
            minDate={getMinDate()}
            theme={{
              backgroundColor: "#ffffff",
              calendarBackground: "#ffffff",
              textSectionTitleColor: "#b6c1cd",
              selectedDayBackgroundColor: "#001529",
              selectedDayTextColor: "#ffffff",
              todayTextColor: "#001529",
              dayTextColor: "#2d4150",
              textDisabledColor: "#d9e1e8",
              dotColor: "#001529",
              selectedDotColor: "#ffffff",
              arrowColor: "#001529",
              monthTextColor: "#001529",
              indicatorColor: "#001529",
              textDayFontWeight: "300",
              textMonthFontWeight: "bold",
              textDayHeaderFontWeight: "300",
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 16,
              disabledArrowColor: '#d9e1e8',
              'stylesheet.day.basic': {
                base: {
                  width: 32,
                  height: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                today: {
                  backgroundColor: isAfter10AM(new Date()) ? 'transparent' : '#001529',
                  borderRadius: 16,
                },
                todayText: {
                  color: isAfter10AM(new Date()) ? '#d9e1e8' : '#ffffff',
                  fontWeight: 'bold',
                },
              },
            }}
          />

          {startDate && endDate && (
            <View style={styles.dateRangeContainer}>
              <View style={styles.dateRangeInfo}>
                <Text style={styles.dateRangeText}>
                  {formatDate(startDate)} - {formatDate(endDate)}
                </Text>
                <Text style={styles.daysSelectedText}>
                  {getDaysDifference()} day{getDaysDifference() > 1 ? "s" : ""}{" "}
                  selected
                </Text>
              </View>
              <TouchableOpacity
                style={styles.clearDatesButton}
                onPress={() => {
                  setStartDate("");
                  setEndDate("");
                  setMarkedDates({});
                }}
              >
                <AntIcon name="close" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.dateDisplay}>
            <Text style={styles.label}>Selected Dates:</Text>
            {startDate && endDate ? (
              <View style={styles.dateRange}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateLabel}>From</Text>
                  <Text style={styles.dateText}>{startDate}</Text>
                </View>
                <View style={styles.dateSeparator} />
                <View style={styles.dateBox}>
                  <Text style={styles.dateLabel}>To</Text>
                  <Text style={styles.dateText}>{endDate}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.noDateText}>No dates selected</Text>
            )}
          </View>

          <View style={styles.reasonContainer}>
            <Text style={styles.label}>Reason for Leave</Text>
            <TextInput
              style={styles.reasonInput}
              multiline
              numberOfLines={4}
              value={reason}
              onChangeText={setReason}
              placeholder="Enter your reason for leave"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Request</Text>
          </TouchableOpacity>
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
    marginTop: 80,
  },
  scrollContent: {
    padding: 20,
  },
  formContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#001529",
    marginBottom: 15,
  },
  calendar: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },
  dateDisplay: {
    marginVertical: 15,
    padding: 15,
    backgroundColor: "#f0f2f5",
    borderRadius: 10,
  },
  label: {
    fontSize: 16,
    color: "#4a4a4a",
    marginBottom: 10,
    fontWeight: "600",
  },
  dateRange: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateBox: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 14,
    color: "#4a4a4a",
    marginBottom: 5,
  },
  dateText: {
    fontSize: 16,
    color: "#001529",
    fontWeight: "500",
  },
  dateSeparator: {
    width: 20,
    height: 2,
    backgroundColor: "#001529",
    marginHorizontal: 10,
  },
  noDateText: {
    fontSize: 16,
    color: "#999",
    fontStyle: "italic",
  },
  reasonContainer: {
    marginBottom: 20,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: "#001529",
    textAlignVertical: "top",
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: "#001529",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  dateRangeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e6f7ff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 15,
  },
  dateRangeInfo: {
    flex: 1,
  },
  dateRangeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#001529",
    marginBottom: 5,
  },
  daysSelectedText: {
    fontSize: 14,
    color: "#4a4a4a",
  },
  clearDatesButton: {
    backgroundColor: "#001529",
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LeaveRequestScreen;
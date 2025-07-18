import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Text, Icon as AntIcon } from "@ant-design/react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Calendar, DateData } from "react-native-calendars";
import {
  fetchLeaveRequestsByTeacher,
  teacherUpdateLeaveRequest,
} from "../../Services/Leave/Leave";
import {
  LeaveRequestByTeacher,
  LeaveStatus,
} from "../../Services/Leave/ILeave";
import {
  formatDate,
  formatDateTime,
  formatDateToLongFormat,
} from "../../utils/DateUtil";
import { useNavigation } from "@react-navigation/native";
import {
  RegularizationRequest,
  RegularizationStatus,
} from "../../Services/Attendance/IClassAttendance";
import {
  fetchRegularizationRequests,
  updateRegularizationRequest,
} from "../../Services/Attendance/ClassAttendance";

type LeaveApproveScreenProps = {
  navigation: StackNavigationProp<any, "LeaveApprove">;
};

const LeaveApproveScreen: React.FC<LeaveApproveScreenProps> = () => {
  const navigation = useNavigation();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestByTeacher[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<LeaveStatus | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingLeave, setEditingLeave] =
    useState<LeaveRequestByTeacher | null>(null);
  const [editStatus, setEditStatus] = useState<LeaveStatus>("pending");
  const [selectedDate, setSelectedDate] = useState<string>(
    formatDate(new Date())
  );
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("leave");
  const [regularizationRequests, setRegularizationRequests] = useState<
    RegularizationRequest[]
  >([]);
  const [regularizationFilterStatus, setRegularizationFilterStatus] =
    useState<RegularizationStatus | null>(null);
  const [editingRegularization, setEditingRegularization] =
    useState<RegularizationRequest | null>(null);

  const handleGetLeaveRequests = async () => {
    const response = await fetchLeaveRequestsByTeacher();
    setLeaveRequests(response);
  };

  useEffect(() => {
    handleGetLeaveRequests();
  }, []);

  const handleApprove = async (id: string) => {
    setLeaveRequests(
      leaveRequests.map((request) =>
        request._id === id ? { ...request, status: "approved" } : request
      )
    );
    await teacherUpdateLeaveRequest(id, "approved");
  };

  const handleReject = async (id: string) => {
    setLeaveRequests(
      leaveRequests.map((request) =>
        request._id === id ? { ...request, status: "rejected" } : request
      )
    );
    await teacherUpdateLeaveRequest(id, "rejected");
  };

  const handleEdit = (item: LeaveRequestByTeacher | RegularizationRequest) => {
    if ("startDate" in item) {
      // It's a LeaveRequestByTeacher
      setEditingLeave(item);
      setEditStatus(item.status);
    } else {
      // It's a RegularizationRequest
      setEditingRegularization(item);
      setEditStatus(item.status);
    }
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (editingLeave) {
      // Handle leave request edit
      const updatedLeave: LeaveRequestByTeacher = {
        ...editingLeave,
        status: editStatus as LeaveStatus,
      };

      await teacherUpdateLeaveRequest(
        editingLeave._id,
        editStatus as LeaveStatus
      );

      setLeaveRequests(
        leaveRequests.map((leave) =>
          leave._id === editingLeave._id ? updatedLeave : leave
        )
      );
    } else if (editingRegularization) {
      // Handle regularization request edit
      const updatedRegularization: RegularizationRequest = {
        ...editingRegularization,
        status: editStatus as RegularizationStatus,
      };

      await updateRegularizationRequest(
        editingRegularization._id,
        editStatus as RegularizationStatus,
        editingRegularization.type
      );

      setRegularizationRequests(
        regularizationRequests.map((request) =>
          request._id === editingRegularization._id
            ? updatedRegularization
            : request
        )
      );
    }

    setEditModalVisible(false);
    setEditingLeave(null);
    setEditingRegularization(null);
  };

  const handleFilter = () => {
    setFilterModalVisible(false);
  };

  const resetFilters = () => {
    setFilterStatus(null);
    setSelectedDate(formatDate(new Date()));
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDate(formatDate(new Date(day.dateString)));
    setCalendarModalVisible(false);
  };

  const filteredRequests = leaveRequests.filter((request) => {
    const matchesSearch =
      request.studentDetails?.firstName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      request.startDate.includes(searchQuery) ||
      request.endDate.includes(searchQuery) ||
      request.reason.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === null || request.status === filterStatus;

    const matchesDate = selectedDate
      ? new Date(request.startDate) <= new Date(selectedDate) &&
        new Date(request.endDate) >= new Date(selectedDate)
      : true;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleGetRegularizationRequests = async () => {
    const response = await fetchRegularizationRequests();
    setRegularizationRequests(response);
  };

  useEffect(() => {
    if (activeTab === "regularization") {
      handleGetRegularizationRequests();
    }
  }, [activeTab]);

  const handleRegularizationApprove = async (id: string, type: string) => {
    setRegularizationRequests(
      regularizationRequests.map((request) =>
        request._id === id ? { ...request, status: "approved" } : request
      )
    );
    await updateRegularizationRequest(id, "approved", type);
  };

  const handleRegularizationReject = async (id: string, type: string) => {
    setRegularizationRequests(
      regularizationRequests.map((request) =>
        request._id === id ? { ...request, status: "rejected" } : request
      )
    );
    await updateRegularizationRequest(id, "rejected", type);
  };

  const filteredRegularizationRequests = regularizationRequests.filter(
    (request) => {
      const matchesSearch =
        request.studentName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        request.date.includes(searchQuery) ||
        request.reason.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        regularizationFilterStatus === null ||
        request.status === regularizationFilterStatus;

      return matchesSearch && matchesStatus;
    }
  );

  const renderLeaveRequest = ({ item }: { item: LeaveRequestByTeacher }) => {
    const isExpanded = expandedCardId === item._id;
    const timeAgo = formatDateTime(item.createdAt);

    return (
      <TouchableWithoutFeedback
        onPress={() => setExpandedCardId(isExpanded ? null : item._id)}
      >
        <View style={styles.leaveRequestItem}>
          <View style={styles.leaveRequestHeader}>
            <Text style={styles.studentName}>
              {item.studentDetails?.firstName} {item.studentDetails?.lastName}
            </Text>
            <Text
              style={[
                styles.statusBadge,
                item.status === "pending" && styles.pendingBadge,
                item.status === "approved" && styles.approvedBadge,
                item.status === "rejected" && styles.rejectedBadge,
              ]}
            >
              {item.status.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.dateRange}>
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </Text>
          <Text
            style={styles.reason}
            numberOfLines={isExpanded ? undefined : 1}
            ellipsizeMode="tail"
          >
            {item.reason}
          </Text>
          <View style={styles.footerContainer}>
            <Text style={styles.createdAt}>Requested {timeAgo}</Text>
            {item.status === "pending" ? (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleApprove(item._id)}
                >
                  <Text style={styles.actionButtonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleReject(item._id)}
                >
                  <Text style={styles.actionButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEdit(item)}
              >
                <AntIcon name="edit" size={14} color="#001529" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const renderRegularizationRequest = ({
    item,
  }: {
    item: RegularizationRequest;
  }) => {
    const isExpanded = expandedCardId === item._id;
    const timeAgo = formatDateTime(item.createdAt);

    const isUpdatedToday = () => {
      const today = new Date();
      const updatedDate = new Date(item.updatedAt);
      return (
        today.getDate() === updatedDate.getDate() &&
        today.getMonth() === updatedDate.getMonth() &&
        today.getFullYear() === updatedDate.getFullYear()
      );
    };

    return (
      <TouchableWithoutFeedback
        onPress={() => setExpandedCardId(isExpanded ? null : item._id)}
      >
        <View style={styles.leaveRequestItem}>
          <View style={styles.leaveRequestHeader}>
            <Text style={styles.studentName}>{item.studentName}</Text>
            <View style={styles.badgeContainer}>
              {item.type && (
                <Text
                  style={[
                    styles.typeBadge,
                    styles[
                      `${item.type.toLowerCase()}Badge` as keyof typeof styles
                    ] || styles.defaultBadge,
                  ]}
                >
                  {item.type.toUpperCase()}
                </Text>
              )}
              <Text
                style={[
                  styles.statusBadge,
                  item.status === "pending" && styles.pendingBadge,
                  item.status === "approved" && styles.approvedBadge,
                  item.status === "rejected" && styles.rejectedBadge,
                ]}
              >
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.dateRange}>{formatDate(item.date)}</Text>
          <Text
            style={styles.reason}
            numberOfLines={isExpanded ? undefined : 1}
            ellipsizeMode="tail"
          >
            {item.reason}
          </Text>
          <View style={styles.footerContainer}>
            <Text style={styles.createdAt}>Requested {timeAgo}</Text>
            {item.status === "pending" ? (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() =>
                    handleRegularizationApprove(item._id, item.type)
                  }
                >
                  <Text style={styles.actionButtonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() =>
                    handleRegularizationReject(item._id, item.type)
                  }
                >
                  <Text style={styles.actionButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            ) : (
              isUpdatedToday() && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEdit(item)}
                >
                  <AntIcon name="edit" size={14} color="#001529" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const EmptyListComponent = () => (
    <View style={styles.emptyListContainer}>
      <View style={styles.emptyListContent}>
        <AntIcon name="inbox" size={80} color="#001529" />
        <Text style={styles.emptyListTitle}>No Leave Requests</Text>
        <Text style={styles.emptyListDescription}>
          There are no leave requests matching your current filters.
        </Text>
      </View>
    </View>
  );

  const handleTabPress = (tab: string) => {
    if (tab === "regularization") {
      navigation.navigate("RegularizationScreen" as never);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntIcon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "leave" && styles.activeTab]}
          onPress={() => setActiveTab("leave")}
        >
          <AntIcon
            name="calendar"
            size={20}
            color={activeTab === "leave" ? "#ffffff" : "#001529"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "leave" && styles.activeTabText,
            ]}
          >
            Leave
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "regularization" && styles.activeTab]}
          onPress={() => setActiveTab("regularization")}
        >
          <AntIcon
            name="clock-circle"
            size={20}
            color={activeTab === "regularization" ? "#ffffff" : "#001529"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "regularization" && styles.activeTabText,
            ]}
          >
            Regularization
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.searchContainer}>
          <AntIcon
            name="search"
            size={20}
            color="#001529"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search student, date, or reason..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            onPress={() => setFilterModalVisible(true)}
            style={styles.filterButton}
          >
            <AntIcon name="filter" size={24} color="#001529" />
          </TouchableOpacity>
        </View>

        {activeTab === "leave" && (
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setCalendarModalVisible(true)}
          >
            <AntIcon
              name="calendar"
              size={20}
              color="#001529"
              style={styles.dateIcon}
            />
            <Text style={styles.dateButtonText}>
              {formatDateToLongFormat(selectedDate)}
            </Text>
            <AntIcon
              name="down"
              size={16}
              color="#001529"
              style={styles.dateArrowIcon}
            />
          </TouchableOpacity>
        )}

        {activeTab === "leave" ? (
          <FlatList
            data={filteredRequests}
            renderItem={renderLeaveRequest}
            keyExtractor={(item) => item._id}
            contentContainerStyle={[
              styles.listContent,
              filteredRequests.length === 0 && styles.emptyListContentContainer,
            ]}
            ListEmptyComponent={EmptyListComponent}
          />
        ) : (
          <FlatList
            data={filteredRegularizationRequests}
            renderItem={renderRegularizationRequest}
            keyExtractor={(item) => item._id}
            contentContainerStyle={[
              styles.listContent,
              filteredRegularizationRequests.length === 0 &&
                styles.emptyListContentContainer,
            ]}
            ListEmptyComponent={EmptyListComponent}
          />
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Leave Requests</Text>

            <Text style={styles.filterLabel}>Status:</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filterStatus === null && styles.filterOptionActive,
                ]}
                onPress={() => setFilterStatus(null)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filterStatus === null && styles.filterOptionTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filterStatus === "pending" && styles.filterOptionActive,
                ]}
                onPress={() => setFilterStatus("pending")}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filterStatus === "pending" && styles.filterOptionTextActive,
                  ]}
                >
                  Pending
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filterStatus === "approved" && styles.filterOptionActive,
                ]}
                onPress={() => setFilterStatus("approved")}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filterStatus === "approved" &&
                      styles.filterOptionTextActive,
                  ]}
                >
                  Approved
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filterStatus === "rejected" && styles.filterOptionActive,
                ]}
                onPress={() => setFilterStatus("rejected")}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filterStatus === "rejected" &&
                      styles.filterOptionTextActive,
                  ]}
                >
                  Rejected
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={resetFilters}
              >
                <Text style={styles.modalButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.applyButton]}
                onPress={handleFilter}
              >
                <Text style={[styles.modalButtonText, styles.applyButtonText]}>
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modify the Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Edit {editingLeave ? "Leave" : "Regularization"} Request Status
            </Text>

            <Text style={styles.filterLabel}>Status:</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  editStatus === "approved" && styles.filterOptionActive,
                ]}
                onPress={() => setEditStatus("approved")}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    editStatus === "approved" && styles.filterOptionTextActive,
                  ]}
                >
                  Approved
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  editStatus === "rejected" && styles.filterOptionActive,
                ]}
                onPress={() => setEditStatus("rejected")}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    editStatus === "rejected" && styles.filterOptionTextActive,
                  ]}
                >
                  Rejected
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.applyButton]}
                onPress={handleSaveEdit}
                disabled={
                  editingLeave?.status === editStatus ||
                  editingRegularization?.status === editStatus
                }
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    styles.applyButtonText,
                    (editingLeave?.status === editStatus ||
                      editingRegularization?.status === editStatus) &&
                      styles.disabledButtonText,
                  ]}
                >
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={calendarModalVisible}
        onRequestClose={() => setCalendarModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date</Text>
            <Calendar
              current={selectedDate || formatDate(new Date())}
              onDayPress={handleDayPress}
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: "#001529" },
              }}
              theme={{
                backgroundColor: "#ffffff",
                calendarBackground: "#ffffff",
                textSectionTitleColor: "#001529",
                selectedDayBackgroundColor: "#001529",
                selectedDayTextColor: "#ffffff",
                todayTextColor: "#001529",
                dayTextColor: "#333333",
                textDisabledColor: "#d9e1e8",
                dotColor: "#001529",
                selectedDotColor: "#ffffff",
                arrowColor: "#001529",
                monthTextColor: "#001529",
                indicatorColor: "#001529",
                textDayFontWeight: "400",
                textMonthFontWeight: "bold",
                textDayHeaderFontWeight: "500",
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
              }}
              style={styles.calendar}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setCalendarModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  activeTab: {
    backgroundColor: "#001529",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#001529",
    marginLeft: 8,
  },
  activeTabText: {
    color: "#ffffff",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginRight: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyListContentContainer: {
    flexGrow: 1,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyListContent: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyListTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#001529",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyListDescription: {
    fontSize: 16,
    color: "#8c8c8c",
    textAlign: "center",
  },
  leaveRequestItem: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  leaveRequestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  studentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#001529",
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 10,
    fontWeight: "bold",
    overflow: "hidden",
    marginRight: 8, // Add some space between the badge and edit button
  },
  pendingBadge: {
    backgroundColor: "#faad14",
    color: "#ffffff",
  },
  approvedBadge: {
    backgroundColor: "#52c41a",
    color: "#ffffff",
  },
  rejectedBadge: {
    backgroundColor: "#f5222d",
    color: "#ffffff",
  },
  dateRange: {
    fontSize: 14,
    color: "#4a4a4a",
    marginBottom: 3,
  },
  reason: {
    fontSize: 12,
    color: "#8c8c8c",
    marginBottom: 8, // Increase bottom margin
  },
  actionButtons: {
    flexDirection: "row",
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    marginLeft: 8,
  },
  approveButton: {
    backgroundColor: "#52c41a",
  },
  rejectButton: {
    backgroundColor: "#f5222d",
  },
  actionButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 12,
  },
  filterButton: {
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filterOption: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 10,
  },
  filterOptionActive: {
    backgroundColor: "#001529",
  },
  filterOptionText: {
    color: "#001529",
  },
  filterOptionTextActive: {
    color: "#ffffff",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: "#001529",
    marginLeft: 10,
  },
  applyButtonText: {
    color: "white",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 12,
    color: "#001529",
    marginLeft: 4,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff", // White background
    borderWidth: 1,
    borderColor: "#d9d9d9", // Light gray border
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  dateIcon: {
    marginRight: 10,
    color: "#001529", // Dark color for the icon
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#001529", // Dark text color
    fontWeight: "500",
  },
  dateArrowIcon: {
    marginLeft: 10,
    color: "#001529", // Dark color for the arrow icon
  },
  calendar: {
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  closeButton: {
    backgroundColor: "#001529",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButtonText: {
    color: "#999999",
  },
  createdAt: {
    fontSize: 12,
    color: "#8c8c8c",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  regularizationTypeContainer: {
    marginBottom: 5,
  },
  regularizationType: {
    fontSize: 14,
    color: "#4a4a4a",
    fontWeight: "500",
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 10,
    fontWeight: "bold",
    marginRight: 5,
  },
  defaultBadge: {
    backgroundColor: "#d9d9d9",
    color: "#000000",
  },
  inBadge: {
    backgroundColor: "#1890ff",
    color: "#ffffff",
  },
  outBadge: {
    backgroundColor: "#13c2c2",
    color: "#ffffff",
  },
  // Add more badge styles for other regularization types if needed
});

export default LeaveApproveScreen;

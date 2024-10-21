import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { Text, Icon as AntIcon } from "@ant-design/react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  fetchLeaveRequests,
  updateLeaveRequest,
  deleteLeaveRequest,
  fetchRegularizationRequests,
  updateRegularizationRequest,
  deleteRegularizationRequest,
} from "../../Services/Leave/Leave";
import Icon from "react-native-vector-icons/Ionicons";
import { useToast } from "../../contexts/ToastContext";
import { Calendar, DateData } from "react-native-calendars";
import { formatDateTime } from "../../utils/DateUtil";
import { getAttendance } from "../../Services/Attendance/ClassAttendance";
import { Picker } from "@react-native-picker/picker";

type RequestItem = LeaveRequest | RegularizationRequest;
type LeaveRequestListScreenProps = {
  navigation: StackNavigationProp<any, "LeaveRequestList">;
};

type LeaveRequest = {
  _id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  classId: string;
  studentId: string;
};

type RegularizationRequest = {
  _id: string;
  date: string;
  reason: string;
  type: "fullDay" | "halfDay";
  status: string;
  createdAt: string;
  updatedAt: string;
  classId: string;
  studentId: string;
};

const LeaveRequestListScreen: React.FC<LeaveRequestListScreenProps> = ({
  navigation,
}) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const { showToast } = useToast();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingLeaveRequest, setEditingLeaveRequest] =
    useState<LeaveRequest | null>(null);
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editReason, setEditReason] = useState("");
  const [editMarkedDates, setEditMarkedDates] = useState<{
    [key: string]: any;
  }>({});
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"leave" | "regularization">(
    "leave"
  );
  const [regularizationRequests, setRegularizationRequests] = useState<
    RegularizationRequest[]
  >([]);
  const [regularizationLoaded, setRegularizationLoaded] = useState(false);
  const [editingRegularizationRequest, setEditingRegularizationRequest] =
    useState<RegularizationRequest | null>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]); // Initialize as an empty array
  const [regularizationPage, setRegularizationPage] = useState(1);
  const [regularizationLoading, setRegularizationLoading] = useState(false);
  const [hasMoreRegularizations, setHasMoreRegularizations] = useState(true);
  const [regularizationType, setRegularizationType] = useState<"fullDay" | "halfDay">("fullDay");

  useEffect(() => {
    fetchLeaveRequest();
  }, []);

  const fetchLeaveRequest = async () => {
    try {
      setLoading(true);
      const leaveRequests = await fetchLeaveRequests();
      setLeaveRequests(leaveRequests as unknown as LeaveRequest[]);
    } catch (error) {
      showToast("Error fetching leave requests", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchRegularizationRequest = async (page = 1) => {
    if (!hasMoreRegularizations && page !== 1) return;
    
    try {
      setRegularizationLoading(true);
      const requests = await fetchRegularizationRequests();
      
      if (page === 1) {
        setRegularizationRequests(requests as RegularizationRequest[]);
      } else {
        setRegularizationRequests(prev => [...prev, ...(requests as RegularizationRequest[])]);
      }
      
      setRegularizationPage(page);
      setHasMoreRegularizations(requests.length === 20);
      setRegularizationLoaded(true);
    } catch (error) {
      console.error("Error fetching regularization requests:", error);
      showToast("Failed to fetch regularization requests", "error");
    } finally {
      setRegularizationLoading(false);
      setRefreshing(false);
    }
  };

  const handleLoadMoreRegularizations = () => {
    if (!regularizationLoading && hasMoreRegularizations) {
      fetchRegularizationRequest(regularizationPage + 1);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (activeTab === "leave") {
      fetchLeaveRequest();
    } else {
      fetchRegularizationRequest(1);
    }
  };

  const handleCancelRequest = (id: string) => {
    setSelectedRequestId(id);
    setModalVisible(true);
  };

  const confirmCancelRequest = async () => {
    if (selectedRequestId) {
      try {
        if (activeTab === "leave") {
          await deleteLeaveRequest(selectedRequestId);
          setLeaveRequests((prevRequests) =>
            prevRequests.filter((request) => request._id !== selectedRequestId)
          );
          showToast("Leave request cancelled successfully", "success");
        } else {
          await deleteRegularizationRequest(selectedRequestId);
          setRegularizationRequests((prevRequests) =>
            prevRequests.filter((request) => request._id !== selectedRequestId)
          );
          showToast("Regularization request cancelled successfully", "success");
        }
      } catch (error) {
        console.error(`Error cancelling ${activeTab} request:`, error);
        showToast(`Failed to cancel ${activeTab} request`, "error");
      }
    }
    setModalVisible(false);
  };

  const handleEditRequest = async (leaveRequest: LeaveRequest) => {
    console.log(leaveRequest, "this is the leave request");
    if (leaveRequest.status.toLowerCase() !== "pending") {
      showToast("Only pending requests can be edited", "error");
      return;
    }

    setEditingLeaveRequest(leaveRequest);
    setEditStartDate(leaveRequest.startDate);
    setEditEndDate(leaveRequest.endDate);
    setEditReason(leaveRequest.reason);
    setEditMarkedDates(
      getMarkedDates(leaveRequest.startDate, leaveRequest.endDate)
    );
    setEditModalVisible(true);
  };

  const getMarkedDates = (start: string, end: string) => {
    let range: { [key: string]: any } = {};
    let current = new Date(start);
    const endDate = new Date(end);

    while (current <= endDate) {
      const dateString = current.toISOString().split("T")[0];
      if (start === end) {
        range[dateString] = {
          selected: true,
          color: "#50cebb",
          textColor: "white",
        };
      } else if (dateString === start) {
        range[dateString] = {
          startingDay: true,
          color: "#50cebb",
          textColor: "white",
        };
      } else if (dateString === end) {
        range[dateString] = {
          endingDay: true,
          color: "#50cebb",
          textColor: "white",
        };
      } else {
        range[dateString] = { color: "#70d7c7", textColor: "white" };
      }
      current.setDate(current.getDate() + 1);
    }
    return range;
  };

  const handleEditDayPress = (day: DateData) => {
    const selectedDate = day.dateString;

    if (activeTab === 'regularization') {
      // For regularization, only allow single date selection
      setEditStartDate(selectedDate);
      setEditEndDate(selectedDate);
      setEditMarkedDates({
        [selectedDate]: { selected: true, selectedColor: '#001529' }
      });
    } else {
      // For leave requests, keep the existing range selection logic
      if (!editStartDate || (editStartDate && editEndDate)) {
        setEditStartDate(selectedDate);
        setEditEndDate("");
        setEditMarkedDates({
          [selectedDate]: { selected: true, selectedColor: '#001529' }
        });
      } else if (editStartDate && !editEndDate) {
        let newStartDate = editStartDate;
        let newEndDate = selectedDate;

        if (new Date(newStartDate) > new Date(newEndDate)) {
          [newStartDate, newEndDate] = [newEndDate, newStartDate];
        }

        setEditStartDate(newStartDate);
        setEditEndDate(newEndDate);
        setEditMarkedDates(getMarkedDates(newStartDate, newEndDate));
      }
    }
  };

  const handleUpdateRequest = async () => {
    if (activeTab === "leave" && editingLeaveRequest) {
      try {
        const formatDate = (dateString: string) => {
          const date = new Date(dateString);
          return date.toISOString();
        };

        const updatedLeaveRequestData = {
          startDate: formatDate(editStartDate),
          endDate: formatDate(editEndDate),
          reason: editReason,
        };

        const updatedLeaveRequest = await updateLeaveRequest(
          editingLeaveRequest._id,
          updatedLeaveRequestData
        );

        setLeaveRequests((prevRequests) =>
          prevRequests.map((request) =>
            request._id === editingLeaveRequest._id
              ? {
                  ...request,
                  ...updatedLeaveRequestData,
                }
              : request
          )
        );

        showToast("Leave request updated successfully", "success");
        setEditModalVisible(false);
      } catch (error) {
        console.error("Error updating leave request:", error);
        showToast("Failed to update leave request", "error");
      }
    } else if (activeTab === "regularization" && editingRegularizationRequest) {
      try {
        const formatDate = (dateString: string) => {
          const date = new Date(dateString);
          return date.toISOString();
        };

        const updatedRegularizationRequestData = {
          date: formatDate(editStartDate),
          reason: editReason,
          type: regularizationType, // Include the regularization type
        };

        const updatedRequest = await updateRegularizationRequest(
          editingRegularizationRequest._id,
          updatedRegularizationRequestData
        );

        setRegularizationRequests((prevRequests) =>
          prevRequests.map((request) =>
            request._id === editingRegularizationRequest._id
              ? {
                  ...request,
                  ...updatedRegularizationRequestData,
                }
              : request
          )
        );

        showToast("Regularization request updated successfully", "success");
        setEditModalVisible(false);
      } catch (error) {
        console.error("Error updating regularization request:", error);
        showToast("Failed to update regularization request", "error");
      }
    }
  };

  const handleEditRegularizationRequest = async (
    request: RegularizationRequest
  ) => {
    if (request.status.toLowerCase() !== "pending") {
      showToast("Only pending requests can be edited", "error");
      return;
    }

    setEditingRegularizationRequest(request);
    setEditStartDate(request.date);
    setEditEndDate(request.date);
    setEditReason(request.reason);
    setEditMarkedDates(getMarkedDates(request.date, request.date));
    setRegularizationType(request.type || "fullDay"); // Set the regularization type
    await fetchAttendanceData();
    setEditModalVisible(true);
  };

  const fetchAttendanceData = async () => {
    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const data = await getAttendance(year, month);
      setAttendanceData(Array.isArray(data.attendanceReport) ? data.attendanceReport : []);
    } catch (error) {
      showToast("Failed to fetch attendance data", "error");
      setAttendanceData([]);
    }
  };

  const isDateDisabled = (date: string) => {
    if (!Array.isArray(attendanceData) || attendanceData.length === 0) return true;

    const attendanceRecord = attendanceData.find(
      (record: any) => new Date(record.date).toISOString().split('T')[0] === date
    );

    if (!attendanceRecord) return true;
    if (attendanceRecord.status === 'absent' || attendanceRecord.status === 'halfday') return false;

    return true;
  };

  const filteredRequests =
    activeTab === "leave"
      ? leaveRequests.filter(
          (request) =>
            (request.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
              request.startDate.includes(searchQuery) ||
              request.endDate.includes(searchQuery)) &&
            (filterStatus === null ||
              request.status.toLowerCase() === filterStatus.toLowerCase())
        )
      : regularizationRequests.filter(
          (request) =>
            (request.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
              request.date.includes(searchQuery)) &&
            (filterStatus === null ||
              request.status.toLowerCase() === filterStatus.toLowerCase())
        );

  const toggleExpandDescription = (id: string) => {
    setExpandedRequestId(expandedRequestId === id ? null : id);
  };

  const renderLeaveRequestItem = ({ item }: { item: LeaveRequest }) => (
    <TouchableWithoutFeedback onPress={() => toggleExpandDescription(item._id)}>
      <View style={styles.leaveRequestItem}>
        <View style={styles.leaveRequestContent}>
          <View style={styles.cardHeader}>
            <View style={styles.dateContainer}>
              <AntIcon
                name="calendar"
                size={20}
                color="#001529"
                style={styles.calendarIcon}
              />
              <Text style={styles.dateText}>
                {formatDate(item.startDate)}
                {item.startDate !== item.endDate
                  ? ` - ${formatDate(item.endDate)}`
                  : ""}
              </Text>
            </View>
            <View
              style={[
                styles.statusContainer,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
            </View>
          </View>
          <Text
            style={[
              styles.reasonText,
              expandedRequestId === item._id && styles.expandedReasonText,
            ]}
            numberOfLines={expandedRequestId === item._id ? undefined : 2}
          >
            {item.reason}
          </Text>
          {(item.status.toLowerCase() === "approved" ||
            item.status.toLowerCase() === "rejected") && (
            <Text style={styles.updatedAtText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)} on{" "}
              {formatDateTime(item.updatedAt)}
            </Text>
          )}
        </View>
        {item.status.toLowerCase() === "pending" && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEditRequest(item)}
            >
              <AntIcon name="edit" size={16} color="#001529" />
              <Text style={[styles.actionButtonText, styles.editButtonText]}>
                Edit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancelRequest(item._id)}
            >
              <AntIcon name="close" size={16} color="#001529" />
              <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );

  const renderRegularizationRequestItem = ({
    item,
  }: {
    item: RegularizationRequest;
  }) => (
    <TouchableWithoutFeedback onPress={() => toggleExpandDescription(item._id)}>
      <View style={styles.leaveRequestItem}>
        <View style={styles.leaveRequestContent}>
          <View style={styles.cardHeader}>
            <View style={styles.dateContainer}>
              <AntIcon
                name="calendar"
                size={20}
                color="#001529"
                style={styles.calendarIcon}
              />
              <Text style={styles.dateText}>{formatDate(item.date)}</Text>
            </View>
            <View style={styles.statusTypeContainer}>
              <View style={styles.typeContainer}>
                <Text style={styles.typeText}>{item.type === 'fullDay' ? 'FULL DAY' : 'HALF DAY'}</Text>
              </View>
              <View
                style={[
                  styles.statusContainer,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              >
                <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
              </View>
            </View>
          </View>
          <Text
            style={[
              styles.reasonText,
              expandedRequestId === item._id && styles.expandedReasonText,
            ]}
            numberOfLines={expandedRequestId === item._id ? undefined : 2}
          >
            {item.reason}
          </Text>
          {(item.status.toLowerCase() === "approved" ||
            item.status.toLowerCase() === "rejected") && (
            <Text style={styles.updatedAtText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)} on{" "}
              {formatDateTime(item.updatedAt)}
            </Text>
          )}
        </View>
        {item.status.toLowerCase() === "pending" && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEditRegularizationRequest(item)}
            >
              <AntIcon name="edit" size={16} color="#001529" />
              <Text style={[styles.actionButtonText, styles.editButtonText]}>
                Edit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancelRequest(item._id)}
            >
              <AntIcon name="close" size={16} color="#001529" />
              <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysDifference = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "#52c41a";
      case "rejected":
        return "#f5222d";
      default:
        return "#faad14";
    }
  };

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.avatarContainer}>
        <AntIcon name="calendar" size={50} color="#001529" />
      </View>
      <Text style={styles.emptyText}>No leave requests found.</Text>
      <TouchableOpacity
        style={styles.createRequestButton}
        onPress={() => navigation.navigate("LeaveRequest")}
      >
        <Text style={styles.createRequestButtonText}>Create New Request</Text>
      </TouchableOpacity>
    </View>
  );

  const resetFilters = () => {
    setFilterStatus(null);
  };

  const closeFilterModal = () => {
    setFilterModalVisible(false);
  };

  const getStats = () => {
    const requests =
      activeTab === "leave" ? leaveRequests : regularizationRequests;
    return {
      approved: requests.filter((r) => r.status.toLowerCase() === "approved")
        .length,
      pending: requests.filter((r) => r.status.toLowerCase() === "pending")
        .length,
      rejected: requests.filter((r) => r.status.toLowerCase() === "rejected")
        .length,
    };
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "leave" && styles.activeTab]}
        onPress={() => {
          setActiveTab("leave");
          setSearchQuery("");
          setFilterStatus(null);
        }}
      >
        <Icon
          name="calendar-outline"
          size={24}
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
        onPress={() => {
          setActiveTab("regularization");
          setSearchQuery("");
          setFilterStatus(null);
          if (!regularizationLoaded) {
            fetchRegularizationRequest(1);
          }
        }}
      >
        <Icon
          name="time-outline"
          size={24}
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
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntIcon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Requests</Text>
        <View style={{ width: 24 }} />
      </View>

      {renderTabBar()}

      {loading ? (
        <ActivityIndicator size="large" color="#001529" style={styles.loader} />
      ) : (
        <>
          <View style={styles.contentContainer}>
            <View style={styles.searchContainer}>
        <Icon
                name="search"
          size={20}
                color="#001529"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder={`Search ${activeTab} requests...`}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#4a4a4a"
              />
              <TouchableOpacity
                onPress={() => setFilterModalVisible(true)}
                style={styles.filterButton}
              >
                <Icon name="options" size={24} color="#001529" />
              </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{getStats().approved}</Text>
                <Text style={styles.statLabel}>Approved</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{getStats().pending}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{getStats().rejected}</Text>
                <Text style={styles.statLabel}>Rejected</Text>
              </View>
            </View>
          </View>

          <FlatList
            data={filteredRequests as RequestItem[]}
            renderItem={({ item }) =>
              activeTab === "leave"
                ? renderLeaveRequestItem({ item: item as LeaveRequest })
                : renderRegularizationRequestItem({
                    item: item as RegularizationRequest,
                  })
            }
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={EmptyListComponent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onEndReached={activeTab === "regularization" ? handleLoadMoreRegularizations : undefined}
            onEndReachedThreshold={0.1}
            ListFooterComponent={
              activeTab === "regularization" && regularizationLoading ? (
                <ActivityIndicator size="small" color="#001529" style={styles.footerLoader} />
              ) : null
            }
          />
        </>
      )}
      {activeTab === "leave" && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("LeaveRequest")}
        >
          <AntIcon name="plus" size={24} color="#ffffff" />
        </TouchableOpacity>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cancelModalContent}>
            <AntIcon
              name="exclamation-circle"
              size={50}
              color="#faad14"
              style={styles.modalIcon}
            />
            <Text style={styles.cancelModalTitle}>
              Cancel {activeTab === "leave" ? "Leave" : "Regularization"}{" "}
              Request
            </Text>
            <Text style={styles.cancelModalText}>
              Are you sure you want to cancel this {activeTab} request?
            </Text>
            <View style={styles.cancelModalButtons}>
              <TouchableOpacity
                style={[styles.cancelModalButton, styles.cancelModalKeepButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelModalKeepButtonText}>
                  No, Keep It
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.cancelModalButton,
                  styles.cancelModalConfirmButton,
                ]}
                onPress={confirmCancelRequest}
              >
                <Text style={styles.cancelModalConfirmButtonText}>
                  Yes, Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={closeFilterModal}
      >
        <TouchableWithoutFeedback onPress={closeFilterModal}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
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
                      filterStatus === "PENDING" && styles.filterOptionActive,
                    ]}
                    onPress={() => setFilterStatus("PENDING")}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filterStatus === "PENDING" &&
                          styles.filterOptionTextActive,
                      ]}
                    >
                      Pending
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      filterStatus === "APPROVED" && styles.filterOptionActive,
                    ]}
                    onPress={() => setFilterStatus("APPROVED")}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filterStatus === "APPROVED" &&
                          styles.filterOptionTextActive,
                      ]}
                    >
                      Approved
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      filterStatus === "REJECTED" && styles.filterOptionActive,
                    ]}
                    onPress={() => setFilterStatus("REJECTED")}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filterStatus === "REJECTED" &&
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
                    onPress={closeFilterModal}
                  >
                    <Text
                      style={[styles.modalButtonText, styles.applyButtonText]}
                    >
                      Apply
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.editModalContainer}
        >
          <View style={styles.editModalContent}>
            <ScrollView contentContainerStyle={styles.editModalScrollContent}>
              <Text style={styles.editModalTitle}>
                Edit {activeTab === "leave" ? "Leave" : "Regularization"}{" "}
                Request
              </Text>

              <Calendar
                style={styles.calendar}
                onDayPress={handleEditDayPress}
                markedDates={editMarkedDates}
                markingType={activeTab === 'regularization' ? "dot" : "period"}
                minDate={new Date().toISOString().split('T')[0]}
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
                  disabledDotColor: '#e0e0e0',
                  disabledTextColor: '#d9d9d9',
                  'stylesheet.day.basic': {
                    base: {
                      width: 32,
                      height: 32,
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                    selected: {
                      backgroundColor: '#001529',
                      borderRadius: 16,
                    },
                    disabled: {
                      // Remove background color for disabled days
                    },
                  },
                }}
                dayComponent={({ date, state }: { date: any; state: any }) => {
                  const isEnabled = !isDateDisabled(date.dateString);
                  return (
                    <TouchableOpacity
                      style={[
                        styles.calendarDay,
                        editMarkedDates[date.dateString] && styles.selectedDay,
                      ]}
                      onPress={() => isEnabled && handleEditDayPress(date)}
                      disabled={!isEnabled}
                    >
                      <Text style={[
                        styles.calendarDayText,
                        !isEnabled && styles.disabledDayText,
                        editMarkedDates[date.dateString] && styles.selectedDayText,
                      ]}>
                        {date.day}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />

              <View style={styles.editDateDisplay}>
                {editStartDate && (
                  <>
                    <Text style={styles.editDateLabel}>
                      Selected Date{activeTab === "leave" && "s"}:
                    </Text>
                    <Text style={styles.editDateText}>
                      {formatDate(editStartDate)}
                      {activeTab === "leave" &&
                        editEndDate !== editStartDate &&
                        ` - ${formatDate(editEndDate)}`}
                    </Text>
                    {activeTab === "leave" && (
                      <Text style={styles.editDaysCount}>
                        {getDaysDifference(editStartDate, editEndDate)} day(s)
                      </Text>
                    )}
                  </>
                )}
              </View>

              {activeTab === "regularization" && (
                <View style={styles.regularizationTypeContainer}>
                  <Text style={styles.modalLabel}>Regularization Type:</Text>
                  <View style={styles.regularizationTypeButtonContainer}>
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
                      ]}
                      onPress={() => setRegularizationType("halfDay")}
                    >
                      <AntIcon 
                        name="schedule" 
                        size={24} 
                        color={regularizationType === "halfDay" ? "#ffffff" : "#001529"} 
                      />
                      <Text style={[
                        styles.regularizationTypeText,
                        regularizationType === "halfDay" && styles.regularizationTypeTextActive,
                      ]}>Half Day</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <TextInput
                style={styles.editReasonInput}
                multiline
                numberOfLines={3}
                value={editReason}
                onChangeText={setEditReason}
                placeholder={`Reason for ${activeTab}`}
                placeholderTextColor="#999"
              />

              <View style={styles.editModalButtons}>
                <TouchableOpacity
                  style={[styles.editModalButton, styles.editModalCancelButton]}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.editModalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editModalButton, styles.editModalUpdateButton]}
                  onPress={handleUpdateRequest}
                >
                  <Text style={styles.editModalUpdateButtonText}>Update</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
    marginTop: 20,
    marginHorizontal: 20,
    zIndex: 1000,
    height: 60,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  contentContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginTop: 10,
    marginHorizontal: 20,
    padding: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#001529",
  },
  filterButton: {
    padding: 5,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#001529",
  },
  statLabel: {
    fontSize: 14,
    color: "#4a4a4a",
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
  },
  leaveRequestItem: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  leaveRequestContent: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  calendarIcon: {
    marginRight: 5,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#001529",
  },
  reasonText: {
    fontSize: 14,
    color: "#4a4a4a",
    marginTop: 5,
  },
  expandedReasonText: {
    marginBottom: 10,
  },
  statusContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e6f7ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#4a4a4a",
    marginBottom: 20,
  },
  createRequestButton: {
    backgroundColor: "#001529",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  createRequestButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#001529",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e8e8e8",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    flex: 1,
  },
  actionButtonText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "600",
    color: "#001529",
  },
  editButton: {
    borderRightWidth: 1,
    borderRightColor: "#e8e8e8",
  },
  cancelButton: {
    // No additional styles needed
  },
  editButtonText: {
    color: "#001529",
  },
  cancelButtonText: {
    color: "#001529",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  cancelModalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  modalIcon: {
    marginBottom: 20,
  },
  cancelModalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#001529",
  },
  cancelModalText: {
    fontSize: 16,
    marginBottom: 25,
    textAlign: "center",
    color: "#4a4a4a",
    lineHeight: 22,
  },
  cancelModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelModalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelModalKeepButton: {
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },
  cancelModalConfirmButton: {
    backgroundColor: "#001529",
    marginLeft: 10,
  },
  cancelModalKeepButtonText: {
    color: "#001529",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelModalConfirmButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
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
  editModalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  editModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: "90%", // Adjust this value as needed
  },
  editModalScrollContent: {
    padding: 20,
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#001529",
  },
  calendar: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  editDateDisplay: {
    marginVertical: 10,
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    borderRadius: 10,
    padding: 10,
  },
  editDateLabel: {
    fontSize: 14,
    color: "#4a4a4a",
    fontWeight: "600",
    marginBottom: 5,
  },
  editDateText: {
    fontSize: 16,
    color: "#001529",
    fontWeight: "bold",
    marginBottom: 5,
  },
  editDaysCount: {
    fontSize: 14,
    color: "#4a4a4a",
    fontStyle: "italic",
  },
  editReasonInput: {
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: "#001529",
    textAlignVertical: "top",
    minHeight: 60,
    marginBottom: 15,
  },
  editModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  editModalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  editModalCancelButton: {
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },
  editModalUpdateButton: {
    backgroundColor: "#001529",
    marginLeft: 10,
  },
  editModalCancelButtonText: {
    color: "#001529",
    fontSize: 16,
    fontWeight: "bold",
  },
  editModalUpdateButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  updatedAtText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginTop: 5,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginTop: 10,
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
  regularizationContainer: {
    flex: 1,
    padding: 20,
  },
  calendarDay: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDay: {
    backgroundColor: '#001529',
    borderRadius: 16,
  },
  calendarDayText: {
    color: '#001529',
  },
  disabledDayText: {
    color: '#d9d9d9',
  },
  selectedDayText: {
    color: '#ffffff',
  },
  footerLoader: {
    marginVertical: 20,
  },
  regularizationTypeContainer: {
    marginBottom: 20,
  },
  regularizationTypeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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
  modalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#001529',
  },
  statusTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeContainer: {
    backgroundColor: '#e6f7ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
  },
  typeText: {
    color: '#001529',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default LeaveRequestListScreen;

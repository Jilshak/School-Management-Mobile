import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, TextInput, Modal } from 'react-native';
import { Text, Icon as AntIcon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Calendar, DateData } from 'react-native-calendars';
import { fetchLeaveRequestsByTeacher, teacherUpdateLeaveRequest } from '../../Services/Leave/Leave';
import { LeaveRequestByTeacher, LeaveStatus } from '../../Services/Leave/ILeave';
import { formatDate, formatDateToLongFormat } from '../../utils/DateUtil';

type LeaveApproveScreenProps = {
  navigation: StackNavigationProp<any, 'LeaveApprove'>;
};

const LeaveApproveScreen: React.FC<LeaveApproveScreenProps> = ({ navigation }) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestByTeacher[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<LeaveStatus | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingLeave, setEditingLeave] = useState<LeaveRequestByTeacher | null>(null);
  const [editStatus, setEditStatus] = useState<LeaveStatus>('pending');
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);

  const handleGetLeaveRequests = async () => {
    const response = await fetchLeaveRequestsByTeacher();
    setLeaveRequests(response);
  };

  useEffect(() => {
    handleGetLeaveRequests();
  }, []);

  const handleApprove = async (id: string) => {
    setLeaveRequests(leaveRequests.map(request => 
      request._id === id ? { ...request, status: 'approved' } : request
    ));
    await teacherUpdateLeaveRequest(id, 'approved');
  };

  const handleReject = async (id: string) => {
    setLeaveRequests(leaveRequests.map(request => 
      request._id === id ? { ...request, status: 'rejected' } : request
    ));
    await teacherUpdateLeaveRequest(id, 'rejected');
  };

  const handleEdit = (leave: LeaveRequestByTeacher) => {
    setEditingLeave(leave);
    setEditStatus(leave.status);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (editingLeave) {
      const updatedLeave: LeaveRequestByTeacher = {
        ...editingLeave,
        status: editStatus,
      };

      // Update the leave request in the backend
      await teacherUpdateLeaveRequest(editingLeave._id, editStatus);

      // Update the local state
      setLeaveRequests(leaveRequests.map(leave =>
        leave._id === editingLeave._id ? updatedLeave : leave
      ));

      setEditModalVisible(false);
      setEditingLeave(null);
    }
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

  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = 
      request.studentDetails?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.startDate.includes(searchQuery) ||
      request.endDate.includes(searchQuery) ||
      request.reason.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === null || request.status === filterStatus;

    const matchesDate = selectedDate ? 
      (new Date(request.startDate) <= new Date(selectedDate) && new Date(request.endDate) >= new Date(selectedDate)) : true;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const renderLeaveRequest = ({ item }: { item: LeaveRequestByTeacher }) => (
    <View style={styles.leaveRequestItem}>
      <View style={styles.leaveRequestHeader}>
        <Text style={styles.studentName}>{item.studentDetails?.firstName} {item.studentDetails?.lastName}</Text>
        <Text style={[
          styles.statusBadge,
          item.status === 'pending' && styles.pendingBadge,
          item.status === 'approved' && styles.approvedBadge,
          item.status === 'rejected' && styles.rejectedBadge,
        ]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.dateRange}>{formatDate(item.startDate)} - {formatDate(item.endDate)}</Text>
      <Text style={styles.reason}>{item.reason}</Text>
      <View style={styles.actionButtons}>
        {item.status === 'pending' && (
          <>
            <TouchableOpacity style={[styles.actionButton, styles.approveButton]} onPress={() => handleApprove(item._id)}>
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => handleReject(item._id)}>
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
          <AntIcon name="edit" size={14} color="#001529" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntIcon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave Requests</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.searchContainer}>
          <AntIcon name="search" size={20} color="#001529" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search student, date, or reason..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={styles.filterButton}>
            <AntIcon name="filter" size={24} color="#001529" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.dateButton} 
          onPress={() => setCalendarModalVisible(true)}
        >
          <AntIcon name="calendar" size={20} color="#001529" style={styles.dateIcon} />
          <Text style={styles.dateButtonText}>{formatDateToLongFormat(selectedDate)}</Text>
          <AntIcon name="down" size={16} color="#001529" style={styles.dateArrowIcon} />
        </TouchableOpacity>

        <FlatList
          data={filteredRequests}
          renderItem={renderLeaveRequest}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
        />
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
                style={[styles.filterOption, filterStatus === null && styles.filterOptionActive]}
                onPress={() => setFilterStatus(null)}
              >
                <Text style={[styles.filterOptionText, filterStatus === null && styles.filterOptionTextActive]}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, filterStatus === 'pending' && styles.filterOptionActive]}
                onPress={() => setFilterStatus('pending')}
              >
                <Text style={[styles.filterOptionText, filterStatus === 'pending' && styles.filterOptionTextActive]}>Pending</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, filterStatus === 'approved' && styles.filterOptionActive]}
                onPress={() => setFilterStatus('approved')}
              >
                <Text style={[styles.filterOptionText, filterStatus === 'approved' && styles.filterOptionTextActive]}>Approved</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, filterStatus === 'rejected' && styles.filterOptionActive]}
                onPress={() => setFilterStatus('rejected')}
              >
                <Text style={[styles.filterOptionText, filterStatus === 'rejected' && styles.filterOptionTextActive]}>Rejected</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={resetFilters}>
                <Text style={styles.modalButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.applyButton]} onPress={handleFilter}>
                <Text style={[styles.modalButtonText, styles.applyButtonText]}>Apply</Text>
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
            <Text style={styles.modalTitle}>Edit Leave Request Status</Text>
            
            <Text style={styles.filterLabel}>Status:</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[styles.filterOption, editStatus === 'pending' && styles.filterOptionActive]}
                onPress={() => setEditStatus('pending')}
              >
                <Text style={[styles.filterOptionText, editStatus === 'pending' && styles.filterOptionTextActive]}>Pending</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, editStatus === 'approved' && styles.filterOptionActive]}
                onPress={() => setEditStatus('approved')}
              >
                <Text style={[styles.filterOptionText, editStatus === 'approved' && styles.filterOptionTextActive]}>Approved</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, editStatus === 'rejected' && styles.filterOptionActive]}
                onPress={() => setEditStatus('rejected')}
              >
                <Text style={[styles.filterOptionText, editStatus === 'rejected' && styles.filterOptionTextActive]}>Rejected</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.applyButton]} onPress={handleSaveEdit}>
                <Text style={[styles.modalButtonText, styles.applyButtonText]}>Save</Text>
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
                [selectedDate]: { selected: true, selectedColor: '#001529' },
              }}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#001529',
                selectedDayBackgroundColor: '#001529',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#001529',
                dayTextColor: '#333333',
                textDisabledColor: '#d9e1e8',
                dotColor: '#001529',
                selectedDotColor: '#ffffff',
                arrowColor: '#001529',
                monthTextColor: '#001529',
                indicatorColor: '#001529',
                textDayFontWeight: '400',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '500',
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
    marginTop: 80,
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
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
  leaveRequestItem: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  leaveRequestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  pendingBadge: {
    backgroundColor: '#faad14',
    color: '#ffffff',
  },
  approvedBadge: {
    backgroundColor: '#52c41a',
    color: '#ffffff',
  },
  rejectedBadge: {
    backgroundColor: '#f5222d',
    color: '#ffffff',
  },
  dateRange: {
    fontSize: 16,
    color: '#4a4a4a',
    marginBottom: 5,
  },
  reason: {
    fontSize: 14,
    color: '#8c8c8c',
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  approveButton: {
    backgroundColor: '#52c41a',
  },
  rejectButton: {
    backgroundColor: '#f5222d',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  filterButton: {
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 10,
  },
  filterOptionActive: {
    backgroundColor: '#001529',
  },
  filterOptionText: {
    color: '#001529',
  },
  filterOptionTextActive: {
    color: '#ffffff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: '#001529',
    marginLeft: 10,
  },
  applyButtonText: {
    color: 'white',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Light gray background
    borderWidth: 1,
    borderColor: '#d9d9d9', // Light gray border
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 10,
  },
  editButtonText: {
    fontSize: 12,
    color: '#001529', // Dark text color (almost black)
    marginLeft: 4,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff', // White background
    borderWidth: 1,
    borderColor: '#d9d9d9', // Light gray border
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  dateIcon: {
    marginRight: 10,
    color: '#001529', // Dark color for the icon
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#001529', // Dark text color
    fontWeight: '500',
  },
  dateArrowIcon: {
    marginLeft: 10,
    color: '#001529', // Dark color for the arrow icon
  },
  calendar: {
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  closeButton: {
    backgroundColor: '#001529',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LeaveApproveScreen;
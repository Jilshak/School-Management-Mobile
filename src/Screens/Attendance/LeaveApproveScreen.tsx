import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, TextInput, Modal, ScrollView } from 'react-native';
import { Text, Icon as AntIcon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type LeaveApproveScreenProps = {
  navigation: StackNavigationProp<any, 'LeaveApprove'>;
};

type LeaveRequest = {
  id: string;
  studentName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
};

const LeaveApproveScreen: React.FC<LeaveApproveScreenProps> = ({ navigation }) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    setLeaveRequests([
      { id: '1', studentName: 'John Doe', startDate: '2023-05-10', endDate: '2023-05-12', reason: 'Family function', status: 'pending' },
      { id: '2', studentName: 'Jane Smith', startDate: '2023-05-15', endDate: '2023-05-15', reason: 'Medical appointment', status: 'pending' },
      { id: '3', studentName: 'Alice Johnson', startDate: '2023-05-20', endDate: '2023-05-22', reason: 'Personal', status: 'approved' },
      { id: '4', studentName: 'Bob Brown', startDate: '2023-05-25', endDate: '2023-05-26', reason: 'Family emergency', status: 'rejected' },
    ]);
  }, []);

  const handleApprove = (id: string) => {
    setLeaveRequests(leaveRequests.map(request => 
      request.id === id ? { ...request, status: 'approved' } : request
    ));
  };

  const handleReject = (id: string) => {
    setLeaveRequests(leaveRequests.map(request => 
      request.id === id ? { ...request, status: 'rejected' } : request
    ));
  };

  const filteredRequests = leaveRequests.filter(request =>
    (request.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.startDate.includes(searchQuery) ||
    request.endDate.includes(searchQuery) ||
    request.reason.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterStatus === null || request.status === filterStatus)
  );

  const renderLeaveRequest = ({ item }: { item: LeaveRequest }) => (
    <View style={styles.leaveRequestItem}>
      <View style={styles.leaveRequestHeader}>
        <Text style={styles.studentName}>{item.studentName}</Text>
        <Text style={[
          styles.statusBadge,
          item.status === 'pending' && styles.pendingBadge,
          item.status === 'approved' && styles.approvedBadge,
          item.status === 'rejected' && styles.rejectedBadge,
        ]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.dateRange}>{item.startDate} - {item.endDate}</Text>
      <Text style={styles.reason}>{item.reason}</Text>
      {item.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionButton, styles.approveButton]} onPress={() => handleApprove(item.id)}>
            <Text style={styles.actionButtonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => handleReject(item.id)}>
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const resetFilters = () => {
    setFilterStatus(null);
  };

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

        <FlatList
          data={filteredRequests}
          renderItem={renderLeaveRequest}
          keyExtractor={item => item.id}
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
              <TouchableOpacity style={[styles.modalButton, styles.applyButton]} onPress={() => setFilterModalVisible(false)}>
                <Text style={[styles.modalButtonText, styles.applyButtonText]}>Apply</Text>
              </TouchableOpacity>
            </View>
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
});

export default LeaveApproveScreen;

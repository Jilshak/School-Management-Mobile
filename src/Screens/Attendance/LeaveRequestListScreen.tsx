import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Modal, TextInput } from 'react-native';
import { Text, Icon as AntIcon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getLeaveRequests } from '../../Services/Leave/Leave';
import Icon from 'react-native-vector-icons/Ionicons';

type LeaveRequestListScreenProps = {
  navigation: StackNavigationProp<any, 'LeaveRequestList'>;
};

type LeaveRequest = {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
};

const LeaveRequestListScreen: React.FC<LeaveRequestListScreenProps> = ({ navigation }) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      // Extended dummy data for demonstration
      const dummyData: LeaveRequest[] = [
        { id: '1', startDate: '2023-05-10', endDate: '2023-05-12', reason: 'Family vacation', status: 'APPROVED' },
        { id: '2', startDate: '2023-05-15', endDate: '2023-05-15', reason: 'Medical appointment', status: 'PENDING' },
        { id: '3', startDate: '2023-05-20', endDate: '2023-05-22', reason: 'Personal reasons', status: 'REJECTED' },
        { id: '4', startDate: '2023-06-01', endDate: '2023-06-02', reason: 'Attending a wedding', status: 'APPROVED' },
        { id: '5', startDate: '2023-06-10', endDate: '2023-06-10', reason: 'Car maintenance', status: 'PENDING' },
        { id: '6', startDate: '2023-06-15', endDate: '2023-06-16', reason: 'Family emergency', status: 'APPROVED' },
        { id: '7', startDate: '2023-06-20', endDate: '2023-06-20', reason: 'Dental appointment', status: 'PENDING' },
        { id: '8', startDate: '2023-06-25', endDate: '2023-06-27', reason: 'Conference attendance', status: 'APPROVED' },
        { id: '9', startDate: '2023-07-01', endDate: '2023-07-05', reason: 'Summer vacation', status: 'REJECTED' },
        { id: '10', startDate: '2023-07-10', endDate: '2023-07-10', reason: 'Home repairs', status: 'PENDING' },
        { id: '11', startDate: '2023-07-15', endDate: '2023-07-16', reason: 'Religious holiday', status: 'APPROVED' },
        { id: '12', startDate: '2023-07-20', endDate: '2023-07-21', reason: "Child's school event", status: 'PENDING' },
        { id: '13', startDate: '2023-07-25', endDate: '2023-07-25', reason: 'Visa appointment', status: 'APPROVED' },
        { id: '14', startDate: '2023-08-01', endDate: '2023-08-03', reason: 'Moving to new house', status: 'PENDING' },
        { id: '15', startDate: '2023-08-10', endDate: '2023-08-10', reason: 'Jury duty', status: 'APPROVED' },
      ];
      setLeaveRequests(dummyData);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaveRequests();
  };

  const handleCancelRequest = (id: string) => {
    setSelectedRequestId(id);
    setModalVisible(true);
  };

  const confirmCancelRequest = () => {
    if (selectedRequestId) {
      // Here you would call the API to cancel the request
      // For now, we'll just update the local state
      setLeaveRequests(prevRequests => 
        prevRequests.filter(request => request.id !== selectedRequestId)
      );
    }
    setModalVisible(false);
  };

  const handleEditRequest = (leaveRequest: LeaveRequest) => {
    navigation.navigate('LeaveRequest', { leaveRequest, isEditing: true });
  };

  const filteredLeaveRequests = leaveRequests.filter(request =>
    (request.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.startDate.includes(searchQuery) ||
    request.endDate.includes(searchQuery)) &&
    (filterStatus === null || request.status === filterStatus)
  );

  const renderLeaveRequestItem = ({ item }: { item: LeaveRequest }) => (
    <View style={styles.leaveRequestItem}>
      <TouchableOpacity 
        style={styles.leaveRequestContent}
        onPress={() => navigation.navigate('LeaveRequestDetails', { leaveRequest: item })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.dateContainer}>
            <AntIcon name="calendar" size={20} color="#001529" style={styles.calendarIcon} />
            <Text style={styles.dateText}>
              {formatDate(item.startDate)}
              {item.startDate !== item.endDate ? ` - ${formatDate(item.endDate)}` : ''}
            </Text>
          </View>
          <View style={[styles.statusContainer, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.reasonText} numberOfLines={2}>{item.reason}</Text>
      </TouchableOpacity>
      {item.status === 'PENDING' && (
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditRequest(item)}
          >
            <AntIcon name="edit" size={16} color="#001529" />
            <Text style={[styles.actionButtonText, styles.editButtonText]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleCancelRequest(item.id)}
          >
            <AntIcon name="close" size={16} color="#001529" />
            <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '#52c41a';
      case 'REJECTED':
        return '#f5222d';
      default:
        return '#faad14';
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
        onPress={() => navigation.navigate('LeaveRequest')}
      >
        <Text style={styles.createRequestButtonText}>Create New Request</Text>
      </TouchableOpacity>
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
        <Text style={styles.headerTitle}>My Leave Requests</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#001529" style={styles.loader} />
      ) : (
        <>
          <View style={styles.contentContainer}>
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color="#001529" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search leave requests..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#4a4a4a"
              />
              <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={styles.filterButton}>
                <Icon name="options" size={24} color="#001529" />
              </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{leaveRequests.filter(r => r.status === 'APPROVED').length}</Text>
                <Text style={styles.statLabel}>Approved</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{leaveRequests.filter(r => r.status === 'PENDING').length}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{leaveRequests.filter(r => r.status === 'REJECTED').length}</Text>
                <Text style={styles.statLabel}>Rejected</Text>
              </View>
            </View>
          </View>

          <FlatList
            data={filteredLeaveRequests}
            renderItem={renderLeaveRequestItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={EmptyListComponent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </>
      )}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('LeaveRequest')}
      >
        <AntIcon name="plus" size={24} color="#ffffff" />
      </TouchableOpacity>
      
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cancelModalContent}>
            <AntIcon name="exclamation-circle" size={50} color="#faad14" style={styles.modalIcon} />
            <Text style={styles.cancelModalTitle}>Cancel Leave Request</Text>
            <Text style={styles.cancelModalText}>Are you sure you want to cancel this leave request?</Text>
            <View style={styles.cancelModalButtons}>
              <TouchableOpacity
                style={[styles.cancelModalButton, styles.cancelModalKeepButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelModalKeepButtonText}>No, Keep It</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelModalButton, styles.cancelModalConfirmButton]}
                onPress={confirmCancelRequest}
              >
                <Text style={styles.cancelModalConfirmButtonText}>Yes, Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
                style={[styles.filterOption, filterStatus === 'PENDING' && styles.filterOptionActive]}
                onPress={() => setFilterStatus('PENDING')}
              >
                <Text style={[styles.filterOptionText, filterStatus === 'PENDING' && styles.filterOptionTextActive]}>Pending</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, filterStatus === 'APPROVED' && styles.filterOptionActive]}
                onPress={() => setFilterStatus('APPROVED')}
              >
                <Text style={[styles.filterOptionText, filterStatus === 'APPROVED' && styles.filterOptionTextActive]}>Approved</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, filterStatus === 'REJECTED' && styles.filterOptionActive]}
                onPress={() => setFilterStatus('REJECTED')}
              >
                <Text style={[styles.filterOptionText, filterStatus === 'REJECTED' && styles.filterOptionTextActive]}>Rejected</Text>
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
    marginTop: 20,
    marginHorizontal: 20,
    zIndex: 1000,
    height: 60,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginTop: 10,
    marginHorizontal: 20,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
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
    color: '#001529',
  },
  filterButton: {
    padding: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001529',
  },
  statLabel: {
    fontSize: 14,
    color: '#4a4a4a',
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
  },
  leaveRequestItem: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  leaveRequestContent: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    marginRight: 5,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001529',
  },
  reasonText: {
    fontSize: 14,
    color: '#4a4a4a',
  },
  statusContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e6f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#4a4a4a',
    marginBottom: 20,
  },
  createRequestButton: {
    backgroundColor: '#001529',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  createRequestButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#001529',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    flex: 1,
  },
  actionButtonText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '600',
    color: '#001529',
  },
  editButton: {
    borderRightWidth: 1,
    borderRightColor: '#e8e8e8',
  },
  cancelButton: {
    // No additional styles needed
  },
  editButtonText: {
    color: '#001529',
  },
  cancelButtonText: {
    color: '#001529',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cancelModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalIcon: {
    marginBottom: 20,
  },
  cancelModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#001529',
  },
  cancelModalText: {
    fontSize: 16,
    marginBottom: 25,
    textAlign: 'center',
    color: '#4a4a4a',
    lineHeight: 22,
  },
  cancelModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelModalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelModalKeepButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  cancelModalConfirmButton: {
    backgroundColor: '#001529',
    marginLeft: 10,
  },
  cancelModalKeepButtonText: {
    color: '#001529',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelModalConfirmButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
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

export default LeaveRequestListScreen;
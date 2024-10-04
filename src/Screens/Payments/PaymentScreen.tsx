import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, SectionList, RefreshControl, Dimensions, Modal, ScrollView, Alert } from 'react-native';
import { Text, Icon as AntIcon, Button } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LineChart } from 'react-native-chart-kit';
import PaymentFilter from '../../Components/PaymentFilter';
import Icon from 'react-native-vector-icons/AntDesign';
import { getAccountsReport } from '../../Services/Payments/paymentServices';

type PaymentScreenProps = {
  navigation: StackNavigationProp<any, 'Payment'>;
};

type PaymentStatus = 'Paid' | 'Pending' | 'Upcoming';

interface Payment {
  id: string;
  name: string;
  date: string;
  status: PaymentStatus;
  amount: number;
  dueDate?: string;
}

interface SectionData {
  title: string;
  data: (string | Payment)[];
  renderItem: ({ item, index }: { item: string | Payment; index: number }) => React.ReactElement | null;
}

// Add these interfaces to define the structure of the API response
interface Fee {
  name: string;
  amount: number;
  quantity?: number;
  description?: string;
}

interface Account {
  _id: string;
  studentId: string;
  fees: Fee[];
  paymentDate: string;
  paymentMode: string;
  createdAt: string;
}

interface FeeDetail {
  name: string;
  amount: number;
  paidAmount: number;
  remainingBalance: number;
}

interface PaymentDue {
  _id: string;
  name: string;
  feeDetails: FeeDetail[];
  dueDate: string;
  totalRemainingBalance: number;
}

interface AccountsReportResponse {
  accounts: Account[];
  paymentDues: PaymentDue[];
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | 'All'>('All');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState<string | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<string | null>(null);

  const [accountsReport, setAccountsReport] = useState<AccountsReportResponse | null>(null);

  useEffect(() => {
    fetchAccountsReport();
  }, []);

  const fetchAccountsReport = async () => {
    try {
      const response = await getAccountsReport();
      console.log('API Response:', JSON.stringify(response, null, 2)); // Log the response
      setAccountsReport(response);
      const processedPayments = processAccountsData(response.accounts);
      setFilteredPayments(processedPayments);
    } catch (error) {
      console.error('Error fetching accounts report:', error);
      Alert.alert('Error', 'Failed to fetch accounts report. Please try again.');
    }
  };

  const processAccountsData = (accounts: Account[]): Payment[] => {
    if (!Array.isArray(accounts)) {
      console.error('Accounts is not an array:', accounts);
      return [];
    }
    return accounts.map(account => ({
      id: account._id,
      name: account.fees[0]?.name || 'Unknown Payment',
      date: new Date(account.paymentDate).toISOString().split('T')[0],
      status: 'Paid',
      amount: account.fees.reduce((sum, fee) => sum + fee.amount, 0),
    }));
  };

  useEffect(() => {
    filterAndSortPayments();
  }, [searchQuery, selectedStatus, sortOrder]);

  const filterAndSortPayments = () => {
    let filtered = filteredPayments;
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(payment => payment.status === selectedStatus);
    }
    filtered = filtered.filter(payment => 
      payment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.date.includes(searchQuery)
    );
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    setFilteredPayments(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate a data refresh
    setTimeout(() => {
      filterAndSortPayments();
      setRefreshing(false);
    }, 1000);
  };

  const renderPaymentSummary = () => {
    if (!accountsReport) return null;

    const totalPaid = accountsReport.accounts.reduce((sum, account) => 
      sum + account.fees.reduce((feeSum, fee) => feeSum + fee.amount, 0), 0);
    const totalPending = accountsReport.paymentDues.reduce((sum, due) => sum + due.totalRemainingBalance, 0);

    return (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryTitle}>Total Paid</Text>
          <Text style={[styles.summaryValue, { color: '#52c41a' }]}>₹{totalPaid.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryTitle}>Pending</Text>
          <Text style={[styles.summaryValue, { color: '#faad14' }]}>₹{totalPending.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  const renderPaymentDues = () => {
    if (!accountsReport || !Array.isArray(accountsReport.paymentDues) || accountsReport.paymentDues.length === 0) return null;

    return (
      <View style={styles.duesContainer}>
        <Text style={styles.sectionTitle}>Payment Dues</Text>
        {accountsReport.paymentDues.map((due) => (
          <View key={due._id} style={styles.dueItem}>
            <Text style={styles.dueName}>{due.name}</Text>
            <Text style={styles.dueDate}>Due: {new Date(due.dueDate).toLocaleDateString()}</Text>
            <Text style={styles.dueAmount}>Total Due: ₹{due.totalRemainingBalance.toFixed(2)}</Text>
            {due.feeDetails.map((fee, index) => (
              <View key={index} style={styles.feeDetail}>
                <Text>{fee.name}: ₹{fee.remainingBalance.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderPaymentChart = () => {
    if (filteredPayments.length === 0) return null;

    // Sort payments by date
    const sortedPayments = [...filteredPayments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Prepare data for the line chart
    const labels = sortedPayments.map(payment => {
      const date = new Date(payment.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const data = {
      labels,
      datasets: [
        {
          data: sortedPayments.map(payment => payment.amount),
          color: (opacity = 1) => `rgba(0, 21, 41, ${opacity})`, // Theme color
          strokeWidth: 2,
        },
      ],
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Payment Trends</Text>
        <LineChart
          data={data}
          width={Dimensions.get('window').width - 40}
          height={220}
          yAxisLabel="₹"
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 21, 41, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 21, 41, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#001529',
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
    );
  };

  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <TouchableOpacity 
      style={styles.paymentItem}
      onPress={() => navigation.navigate('PaymentDetails', { payment: item })}
    >
      <View style={styles.paymentMainInfo}>
        <Text style={styles.paymentName}>{item.name}</Text>
        <Text style={styles.paymentDate}>{item.date}</Text>
        {item.dueDate && <Text style={styles.paymentDueDate}>Due: {item.dueDate}</Text>}
      </View>
      <View style={styles.paymentStatus}>
        <Text style={[
          styles.paymentStatusText,
          { color: item.status === 'Paid' ? '#52c41a' : item.status === 'Pending' ? '#faad14' : '#1890ff' }
        ]}>
          {item.status}
        </Text>
        <Text style={styles.paymentAmount}>₹{item.amount}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSearchAndFilter = () => (
    <View style={styles.searchContainer}>
      <Icon name="search1" size={20} color="#001529" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search payments..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#4a4a4a"
      />
      <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={styles.filterButton}>
        <Icon name="filter" size={24} color="#001529" />
      </TouchableOpacity>
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter Payments</Text>
          
          <Text style={styles.filterLabel}>Status:</Text>
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[styles.filterOption, selectedStatus === 'All' && styles.filterOptionActive]}
              onPress={() => setSelectedStatus('All')}
            >
              <Text style={[styles.filterOptionText, selectedStatus === 'All' && styles.filterOptionTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterOption, selectedStatus === 'Paid' && styles.filterOptionActive]}
              onPress={() => setSelectedStatus('Paid')}
            >
              <Text style={[styles.filterOptionText, selectedStatus === 'Paid' && styles.filterOptionTextActive]}>Paid</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterOption, selectedStatus === 'Pending' && styles.filterOptionActive]}
              onPress={() => setSelectedStatus('Pending')}
            >
              <Text style={[styles.filterOptionText, selectedStatus === 'Pending' && styles.filterOptionTextActive]}>Pending</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterOption, selectedStatus === 'Upcoming' && styles.filterOptionActive]}
              onPress={() => setSelectedStatus('Upcoming')}
            >
              <Text style={[styles.filterOptionText, selectedStatus === 'Upcoming' && styles.filterOptionTextActive]}>Upcoming</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.filterLabel}>Date Range:</Text>
          {/* Add date pickers for start and end dates here */}

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={() => {
              setSelectedStatus('All');
              setFilterStartDate(null);
              setFilterEndDate(null);
            }}>
              <Text style={styles.modalButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.applyButton]} onPress={() => {
              filterAndSortPayments();
              setFilterModalVisible(false);
            }}>
              <Text style={[styles.modalButtonText, styles.applyButtonText]}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderPaymentList = () => {
    const sections: SectionData[] = [
      {
        title: 'Overview',
        data: ['summary', 'controls'] as (string | Payment)[],
        renderItem: ({ item }) => { 
          if (item === 'summary') return renderPaymentSummary();
          if (item === 'controls') return renderPaymentChart();
          return null;
        }
      },
      {
        title: 'Payment Dues',
        data: ['dues'],
        renderItem: () => renderPaymentDues()
      },
      {
        title: 'Payment History',
        data: ['controls', ...filteredPayments],
        renderItem: ({ item, index }) => {
          if (index === 0) {
            return renderSearchAndFilter();
          }
          return renderPaymentItem({ item: item as Payment });
        }
      }
    ];

    return (
      <SectionList<string | Payment, SectionData>
        sections={sections}
        keyExtractor={(item, index) => {
          if (typeof item === 'string') return item;
          return (item as Payment).id || index.toString();
        }}
        renderItem={({ item, section, index }) => section.renderItem({ item, index })}
        renderSectionHeader={({ section: { title } }) => 
          <Text style={styles.sectionTitle}>{title}</Text>
        }
        contentContainerStyle={styles.scrollContent}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    );
  };

  const applyFilters = (status: PaymentStatus | 'All') => {
    setSelectedStatus(status);
    setIsFilterVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntIcon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments</Text>
      </View>

      <View style={styles.contentContainer}>
        {renderPaymentList()}
      </View>

      {renderFilterModal()}
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
  scrollContent: {
    padding: 20,
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
    flex: 1,
    textAlign: 'center', // Center the title
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    color: '#4a4a4a',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
    marginBottom: 10,
    marginTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
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
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  paymentMainInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001529',
  },
  paymentDate: {
    fontSize: 14,
    color: '#4a4a4a',
    marginTop: 2,
  },
  paymentStatus: {
    alignItems: 'flex-end',
  },
  paymentStatusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001529',
    marginTop: 2,
  },
  paymentDueDate: {
    fontSize: 12,
    color: '#ff4d4f',
    marginTop: 2,
  },
  duesContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  dueItem: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
  },
  dueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001529',
  },
  dueDate: {
    fontSize: 14,
    color: '#4a4a4a',
    marginTop: 2,
  },
  dueAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4d4f',
    marginTop: 5,
  },
  feeDetail: {
    marginTop: 5,
  },
});

export default PaymentScreen;
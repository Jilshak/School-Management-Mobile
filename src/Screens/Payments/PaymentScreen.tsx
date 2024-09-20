import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, SectionList, RefreshControl, Dimensions } from 'react-native';
import { Text, Icon as AntIcon, Button } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LineChart } from 'react-native-chart-kit';
import PaymentFilter from '../../Components/PaymentFilter';

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

const PaymentScreen: React.FC<PaymentScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | 'All'>('All');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const payments: Payment[] = [
    { id: '1', name: 'Tuition Fee', date: '2023-09-01', status: 'Paid', amount: 5000 },
    { id: '2', name: 'Library Fee', date: '2023-10-15', status: 'Pending', amount: 500, dueDate: '2023-10-30' },
    { id: '3', name: 'Sports Fee', date: '2023-11-01', status: 'Paid', amount: 1000 },
    { id: '4', name: 'Exam Fee', date: '2024-01-10', status: 'Upcoming', amount: 1500, dueDate: '2024-01-20' },
    // Add more payments as needed
  ];

  useEffect(() => {
    filterAndSortPayments();
  }, [searchQuery, selectedStatus, sortOrder]);

  const filterAndSortPayments = () => {
    let filtered = payments;
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

  const totalPaid = payments.reduce((sum, payment) => payment.status === 'Paid' ? sum + payment.amount : sum, 0);
  const totalPending = payments.reduce((sum, payment) => payment.status === 'Pending' ? sum + payment.amount : sum, 0);
  const totalUpcoming = payments.reduce((sum, payment) => payment.status === 'Upcoming' ? sum + payment.amount : sum, 0);

  const renderPaymentSummary = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryTitle}>Total Paid</Text>
        <Text style={[styles.summaryValue, { color: '#52c41a' }]}>₹{totalPaid}</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryTitle}>Pending</Text>
        <Text style={[styles.summaryValue, { color: '#faad14' }]}>₹{totalPending}</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryTitle}>Upcoming</Text>
        <Text style={[styles.summaryValue, { color: '#1890ff' }]}>₹{totalUpcoming}</Text>
      </View>
    </View>
  );

  const renderPaymentChart = () => {
    // Sort payments by date
    const sortedPayments = [...payments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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

  const renderPaymentList = () => {
    const sections: { title: string; data: (Payment | 'controls')[]; renderItem: ({ item, index }: { item: Payment | 'controls'; index: number }) => JSX.Element }[] = [
      {
        title: 'Overview',
        data: ['summary', 'controls'] as (Payment | 'controls')[], 
        renderItem: ({ item }: { item: Payment | 'controls' | string }) => {
          if (item === 'summary') return renderPaymentSummary();
          if (item === 'controls') return renderPaymentChart(); 
          return renderPaymentItem({ item: item as Payment }); 
        }
      },
      {
        title: 'Payment History',
        data: ['controls', ...filteredPayments],
        renderItem: ({ item, index }: { item: Payment | 'controls', index: number }) => {
          if (index === 0) {
            return (
              <>
                <View style={styles.searchContainer}>
                  <AntIcon name="search" size={20} color="#001529" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search payments..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
                <View style={styles.controlsContainer}>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => setIsFilterVisible(true)}
                  >
                    <Text style={styles.controlButtonText}>Filter</Text>
                    <AntIcon name="filter" size={16} color="#ffffff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    <Text style={styles.controlButtonText}>Sort by Date</Text>
                    <AntIcon name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </>
            );
          }
          return renderPaymentItem({ item: item as Payment });
        }
      }
    ];

    return (
      <SectionList
        sections={sections}
        keyExtractor={(item: Payment | 'controls', index) => { // Specify the type here
            if (typeof item === 'string') return item;
            return item.id || index.toString();
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

      <PaymentFilter
        isVisible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        onApply={applyFilters}
        selectedStatus={selectedStatus}
      />
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
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#001529', // Theme color
    borderRadius: 10,
    padding: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  controlButtonText: {
    fontSize: 14,
    color: '#ffffff', // White text for contrast
    marginRight: 5,
    fontWeight: 'bold', // Make the text bold for better visibility
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
});

export default PaymentScreen;
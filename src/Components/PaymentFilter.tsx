import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Text, Button } from '@ant-design/react-native';

type PaymentStatus = 'Paid' | 'Pending' | 'Upcoming';

interface PaymentFilterProps {
  isVisible: boolean;
  onClose: () => void;
  onApply: (status: PaymentStatus | 'All') => void;
  selectedStatus: PaymentStatus | 'All';
}

const PaymentFilter: React.FC<PaymentFilterProps> = ({ isVisible, onClose, onApply, selectedStatus }) => {
  const statuses: (PaymentStatus | 'All')[] = ['All', 'Paid', 'Pending', 'Upcoming'];

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Filter Payments</Text>
          {statuses.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterOption,
                selectedStatus === status && styles.filterOptionSelected
              ]}
              onPress={() => onApply(status)}
            >
              <Text style={[
                styles.filterOptionText,
                selectedStatus === status && styles.filterOptionTextSelected
              ]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
          <Button type="primary" onPress={onClose} style={styles.closeButton}>
            Close
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  filterOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  filterOptionSelected: {
    backgroundColor: '#e6f7ff',
  },
  filterOptionText: {
    fontSize: 16,
  },
  filterOptionTextSelected: {
    color: '#1890ff',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 10,
  },
});

export default PaymentFilter;
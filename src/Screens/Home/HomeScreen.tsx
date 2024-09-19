import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, WingBlank, WhiteSpace, Icon, Text } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type HomeScreenProps = {
  navigation: StackNavigationProp<any, 'Home'>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const menuItems = [
    { title: 'Staff', icon: 'team', route: 'Staff', color: '#FF6B6B' },
    { title: 'Students', icon: 'user', route: 'Students', color: '#4ECDC4' },
    { title: 'Classes', icon: 'book', route: 'Classes', color: '#45B7D1' },
    { title: 'Timetable', icon: 'calendar', route: 'Timetable', color: '#FFA07A' },
    { title: 'Attendance', icon: 'check-circle', route: 'Attendance', color: '#98D8C8' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView>
        <WingBlank size="lg">
          <WhiteSpace size="lg" />
          <Card style={styles.card}>
            <Card.Header
              title="School Management System"
              thumbStyle={{ width: 40, height: 40, borderRadius: 20 }}
              thumb="https://gw.alipayobjects.com/zos/rmsportal/MRhHctKOineMbKAZslML.jpg"
            />
            <Card.Body>
              <View style={styles.cardContainer}>
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.menuItem, { backgroundColor: item.color }]}
                    onPress={() => navigation.navigate(item.route)}
                    activeOpacity={0.8}
                  >
                    <Icon name={item.icon as any} size="lg" color="#fff" />
                    <WhiteSpace size="sm" />
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card.Body>
          </Card>
          <WhiteSpace size="lg" />
        </WingBlank>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5', // Use a solid color instead of gradient
  },
  card: {
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  menuItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  menuItemText: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export default HomeScreen;
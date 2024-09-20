import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon as AntIcon } from '@ant-design/react-native';
import { useNavigation, NavigationProp, useRoute } from '@react-navigation/native';
type RootStackParamList = {
  Home: undefined;
  Calendar: undefined;
  Notification: undefined;
  Profile: undefined;
};

const BottomNavBar: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();

  const getIconColor = (routeName: string) => {
    return route.name === routeName ? "#001529" : "#808080";
  };

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
        <AntIcon name="home" size={24} color={getIconColor('Home')} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Calendar')}>
        <AntIcon name="calendar" size={24} color={getIconColor('Calendar')} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Notification')}>
        <AntIcon name="notification" size={24} color={getIconColor('Notification')} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
        <AntIcon name="user" size={24} color={getIconColor('Profile')} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navItem: {
    alignItems: 'center',
  },
});

export default BottomNavBar;
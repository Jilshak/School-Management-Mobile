import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AppNavigator from '../Navigation/AppNavigator';
import LoginScreen from '../Screens/Auth/LoginScreen';
import useAuthStore  from '../store/authStore';

const Stack = createStackNavigator();

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="App" component={AppNavigator} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

export default ProtectedRoute;

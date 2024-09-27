import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './Navigation/AppNavigator';
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  return (
      <NavigationContainer>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </NavigationContainer>
  );
};

export default App;

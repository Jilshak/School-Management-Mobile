import React from 'react';
import { Provider as AntProvider } from '@ant-design/react-native';
import AppNavigator from './src/Navigation/AppNavigator';

export default function App() {
  return (
      <AntProvider>
        <AppNavigator />
      </AntProvider>
  );
}


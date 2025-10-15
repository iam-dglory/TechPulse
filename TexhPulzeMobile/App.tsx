import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './src/context/AuthContext';
import { QueryProvider } from './src/providers/QueryProvider';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <AppNavigator />
          <Toast />
        </NavigationContainer>
      </AuthProvider>
    </QueryProvider>
  );
}
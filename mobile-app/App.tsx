import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

// Import custom scrollbar styles for web
if (Platform.OS === 'web') {
  require('./src/theme/scrollbar.web.css');
}

export default function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f6f6f8" />
      <AppNavigator />
    </>
  );
}

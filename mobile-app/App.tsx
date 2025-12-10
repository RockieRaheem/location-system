import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import CountryListScreen from './src/screens/CountryListScreen';
import LocationSearchScreen from './src/screens/LocationSearchScreen';
import AdminLevelsScreen from './src/screens/AdminLevelsScreen';
import AdminUnitEditorScreen from './src/screens/AdminUnitEditorScreen';
import VersionHistoryScreen from './src/screens/VersionHistoryScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#f6f6f8" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#f6f6f8' },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="CountryList" component={CountryListScreen} />
        <Stack.Screen name="LocationSearch" component={LocationSearchScreen} />
        <Stack.Screen name="AdminLevels" component={AdminLevelsScreen} />
        <Stack.Screen name="AdminUnitEditor" component={AdminUnitEditorScreen} />
        <Stack.Screen name="VersionHistory" component={VersionHistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

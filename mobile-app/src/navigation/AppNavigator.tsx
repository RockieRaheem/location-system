import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  LoginScreen,
  CountryListScreen,
  LocationSearchScreen,
  AdminLevelsScreen,
  AdminUnitEditorScreen,
  VersionHistoryScreen,
} from '../screens';

export type RootStackParamList = {
  Login: undefined;
  CountryList: undefined;
  LocationSearch: undefined;
  AdminLevels: { country?: any };
  AdminUnitEditor: { unit?: any };
  VersionHistory: { unit?: any };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
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

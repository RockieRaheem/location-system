import React from 'react';
import { SafeAreaView, Text } from 'react-native';
import LocationSelector from './components/LocationSelector';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text style={{ fontSize: 18, margin: 12 }}>Location System (Expo)</Text>
      <LocationSelector onSelect={(loc) => console.log('selected', loc)} />
    </SafeAreaView>
  );
}

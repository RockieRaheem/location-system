import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fontSizes } from '../theme';

const LEVEL_LABELS = [
  'District',
  'Constituency',
  'Subcounty/Division',
  'Parish/Ward',
  'Village/Cell',
];

export default function AdminDashboardScreen() {
  const [districtName, setDistrictName] = useState('');
  const [numLevels, setNumLevels] = useState(4);
  const [levelNames, setLevelNames] = useState([
    'District',
    'Constituency',
    'Subcounty/Division',
    'Parish/Ward',
    'Village/Cell',
  ]);

  const handleNumLevelsChange = (value) => {
    setNumLevels(value);
    setLevelNames(LEVEL_LABELS.slice(0, value));
  };

  const handleRegisterDistrict = () => {
    // TODO: Save district with selected levels
    globalThis.alert(
      `Registered ${districtName} with ${numLevels} levels: ` +
        levelNames.slice(0, numLevels).join(', ')
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Register New District</Text>
        <TextInput
          style={styles.input}
          placeholder="District Name"
          value={districtName}
          onChangeText={setDistrictName}
        />
        <Text style={styles.label}>Number of Levels</Text>
        <View style={styles.pickerRow}>
          {[4, 5].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.levelButton,
                numLevels === level && styles.levelButtonSelected,
              ]}
              onPress={() => handleNumLevelsChange(level)}
            >
              <Text
                style={[
                  styles.levelButtonText,
                  numLevels === level && styles.levelButtonTextSelected,
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.levelList}>
          {levelNames.slice(0, numLevels).map((label, idx) => (
            <View key={idx} style={styles.levelRow}>
              <MaterialIcons name="chevron-right" size={20} color={colors.primary} />
              <Text style={styles.levelLabel}>{`Level ${idx + 1}: ${label}`}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.registerButton} onPress={handleRegisterDistrict}>
          <Text style={styles.registerButtonText}>Register District</Text>
        </TouchableOpacity>
      </View>
      {/* Add more admin features here */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 24,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: colors.gray[800],
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fafbfc',
  },
  label: {
    fontSize: 16,
    color: colors.gray[700],
    marginBottom: 8,
  },
  pickerRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  levelButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginRight: 12,
    backgroundColor: '#fff',
  },
  levelButtonSelected: {
    backgroundColor: colors.primary,
  },
  levelButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  levelButtonTextSelected: {
    color: '#fff',
  },
  levelList: {
    marginBottom: 24,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelLabel: {
    fontSize: 16,
    color: colors.gray[800],
    marginLeft: 8,
  },
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

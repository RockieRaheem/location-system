import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fontSizes } from '../theme';
import { Country } from '../types/location.types';
import { locationService } from '../services/firebase/locationService';

interface CountryConfigScreenProps {
  navigation: any;
  route: {
    params: {
      country: Country;
    };
  };
}

const COMMON_ECONOMIC_ZONES = [
  { id: 'EAC', name: 'East African Community' },
  { id: 'COMESA', name: 'Common Market for Eastern and Southern Africa' },
  { id: 'ECOWAS', name: 'Economic Community of West African States' },
  { id: 'SADC', name: 'Southern African Development Community' },
  { id: 'AU', name: 'African Union' },
  { id: 'EU', name: 'European Union' },
  { id: 'ASEAN', name: 'Association of Southeast Asian Nations' },
  { id: 'MERCOSUR', name: 'Southern Common Market' },
  { id: 'NAFTA', name: 'North American Free Trade Agreement' },
];

export default function CountryConfigScreen({ navigation, route }: CountryConfigScreenProps) {
  const { country } = route.params;
  
  const [name, setName] = useState(country.name);
  const [code, setCode] = useState(country.code);
  const [phoneCode, setPhoneCode] = useState(country.phoneCode || '');
  const [numberOfAdminLevels, setNumberOfAdminLevels] = useState(
    country.numberOfAdminLevels?.toString() || ''
  );
  const [numberOfElectoralLevels, setNumberOfElectoralLevels] = useState(
    country.numberOfElectoralLevels?.toString() || ''
  );
  const [selectedZones, setSelectedZones] = useState<string[]>(country.economicZones || []);
  const [adminLevelNames, setAdminLevelNames] = useState<string[]>(
    country.adminLevelNames || []
  );
  const [loading, setLoading] = useState(false);

  const toggleZone = (zoneId: string) => {
    setSelectedZones(prev =>
      prev.includes(zoneId)
        ? prev.filter(id => id !== zoneId)
        : [...prev, zoneId]
    );
  };

  const updateLevelName = (index: number, value: string) => {
    const newNames = [...adminLevelNames];
    newNames[index] = value;
    setAdminLevelNames(newNames);
  };

  const addLevelName = () => {
    setAdminLevelNames([...adminLevelNames, '']);
  };

  const removeLevelName = (index: number) => {
    setAdminLevelNames(adminLevelNames.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Error', 'Country name is required');
      return;
    }

    if (!phoneCode.trim() || !phoneCode.startsWith('+')) {
      Alert.alert('Error', 'Please enter a valid phone code starting with +');
      return;
    }

    const adminLevels = parseInt(numberOfAdminLevels);
    if (isNaN(adminLevels) || adminLevels < 1) {
      Alert.alert('Error', 'Please enter a valid number of admin levels (minimum 1)');
      return;
    }

    const electoralLevels = parseInt(numberOfElectoralLevels);
    if (isNaN(electoralLevels) || electoralLevels < 0) {
      Alert.alert('Error', 'Please enter a valid number of electoral levels');
      return;
    }

    if (adminLevelNames.length !== adminLevels) {
      Alert.alert(
        'Error',
        `Please provide exactly ${adminLevels} level names (currently ${adminLevelNames.length})`
      );
      return;
    }

    if (adminLevelNames.some(name => !name.trim())) {
      Alert.alert('Error', 'All level names must be filled');
      return;
    }

    setLoading(true);
    try {
      await locationService.updateCountry(
        country.id,
        {
          name: name.trim(),
          code: code.trim(),
          phoneCode: phoneCode.trim(),
          numberOfAdminLevels: adminLevels,
          numberOfElectoralLevels: electoralLevels,
          economicZones: selectedZones,
          adminLevelNames: adminLevelNames.map(n => n.trim()),
          isConfigured: true,
        },
        'current-user-id', // Replace with actual user ID from auth
        'Country configuration updated'
      );

      Alert.alert('Success', 'Country configuration saved successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error saving country:', error);
      Alert.alert('Error', 'Failed to save country configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configure Country</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.field}>
            <Text style={styles.label}>Country Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter country name"
              placeholderTextColor={colors.gray[400]}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Country Code (ISO 3) *</Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              placeholder="e.g., UGA"
              placeholderTextColor={colors.gray[400]}
              maxLength={3}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone Code *</Text>
            <TextInput
              style={styles.input}
              value={phoneCode}
              onChangeText={setPhoneCode}
              placeholder="e.g., +256"
              placeholderTextColor={colors.gray[400]}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Administrative Structure */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Administrative Structure</Text>
          
          <View style={styles.field}>
            <Text style={styles.label}>Number of Admin Levels *</Text>
            <TextInput
              style={styles.input}
              value={numberOfAdminLevels}
              onChangeText={(text) => {
                setNumberOfAdminLevels(text);
                const num = parseInt(text);
                if (!isNaN(num) && num > 0) {
                  // Adjust level names array
                  const current = adminLevelNames.length;
                  if (num > current) {
                    setAdminLevelNames([...adminLevelNames, ...Array(num - current).fill('')]);
                  } else if (num < current) {
                    setAdminLevelNames(adminLevelNames.slice(0, num));
                  }
                }
              }}
              placeholder="e.g., 8"
              placeholderTextColor={colors.gray[400]}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Number of Electoral Levels *</Text>
            <TextInput
              style={styles.input}
              value={numberOfElectoralLevels}
              onChangeText={setNumberOfElectoralLevels}
              placeholder="e.g., 5"
              placeholderTextColor={colors.gray[400]}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Level Names */}
        {adminLevelNames.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Administrative Level Names</Text>
            <Text style={styles.sectionDescription}>
              Define the name for each administrative level from top to bottom
            </Text>
            
            {adminLevelNames.map((levelName, index) => (
              <View key={index} style={styles.levelRow}>
                <View style={styles.levelNumber}>
                  <Text style={styles.levelNumberText}>{index + 1}</Text>
                </View>
                <TextInput
                  style={styles.levelInput}
                  value={levelName}
                  onChangeText={(text) => updateLevelName(index, text)}
                  placeholder={`Level ${index + 1} name (e.g., ${
                    index === 0 ? 'Country' : index === 1 ? 'Region' : index === 2 ? 'District' : 'Sub-district'
                  })`}
                  placeholderTextColor={colors.gray[400]}
                />
              </View>
            ))}
          </View>
        )}

        {/* Economic Zones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Economic Zones</Text>
          <Text style={styles.sectionDescription}>
            Select the economic zones this country belongs to
          </Text>
          
          <View style={styles.zonesContainer}>
            {COMMON_ECONOMIC_ZONES.map((zone) => (
              <TouchableOpacity
                key={zone.id}
                style={[
                  styles.zoneChip,
                  selectedZones.includes(zone.id) && styles.zoneChipSelected,
                ]}
                onPress={() => toggleZone(zone.id)}
              >
                <Text
                  style={[
                    styles.zoneChipText,
                    selectedZones.includes(zone.id) && styles.zoneChipTextSelected,
                  ]}
                >
                  {zone.id}
                </Text>
                {selectedZones.includes(zone.id) && (
                  <MaterialIcons name="check" size={16} color={colors.white} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Configuration'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: colors.gray[900],
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: fontSizes.sm,
    color: colors.gray[600],
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.gray[700],
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 12,
    fontSize: fontSizes.base,
    color: colors.gray[900],
    backgroundColor: colors.white,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  levelNumberText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: fontSizes.sm,
  },
  levelInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 12,
    fontSize: fontSizes.base,
    color: colors.gray[900],
    backgroundColor: colors.white,
  },
  zonesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  zoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    gap: 6,
  },
  zoneChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  zoneChipText: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.gray[700],
  },
  zoneChipTextSelected: {
    color: colors.white,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: fontSizes.base,
    fontWeight: '600',
  },
});

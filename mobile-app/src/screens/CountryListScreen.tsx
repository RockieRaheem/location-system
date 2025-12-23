import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  SectionList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme';
import { COUNTRIES, CONTINENTS, Country } from '../data/countries';
import { getScrollbarProps } from '../theme/scrollbar';
interface CountryListScreenProps {
  navigation: any;
}
  // Removed stray closing brace

export default function CountryListScreen({ navigation }: CountryListScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const sections = useMemo(() => {
    const filteredCountries = COUNTRIES.filter((country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return CONTINENTS.map((continent) => ({
      continent,
      data: filteredCountries.filter((country) => country.continent === continent),
    })).filter((section) => section.data.length > 0);
  }, [searchQuery]);

  const handleAdminDashboard = () => {
    navigation.navigate('AdminDashboard');
  };

  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity style={styles.countryItem}>
      <Image source={{ uri: item.flagUrl }} style={styles.flag} />
      <View style={styles.countryInfo}>
        <Text style={styles.countryName}>{item.name}</Text>
        <View style={styles.countryMeta}>
          <Text style={styles.countryCode}>{item.code}</Text>
          {item.phoneCode && (
            <Text style={styles.countryCode}>{item.phoneCode}</Text>
          )}
        </View>
      </View>
      {item.isConfigured ? (
        <View style={styles.configBadge}>
          <MaterialIcons name="check-circle" size={14} color={colors.success.DEFAULT} />
          <Text style={styles.configText}>Configured</Text>
        </View>
      ) : (
        <View style={[styles.configBadge, styles.notConfiguredBadge]}>
          <MaterialIcons name="settings" size={14} color={colors.gray[600]} />
          <Text style={[styles.configText, styles.notConfiguredText]}>Setup Required</Text>
        </View>
      )}
      <MaterialIcons name="chevron-right" size={24} color={colors.gray[500]} />
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: { continent: string } }) => (
    <Text style={styles.sectionHeader}>{section.continent}</Text>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Country List</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search countries..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.adminButton} onPress={handleAdminDashboard}>
          <MaterialIcons name="admin-panel-settings" size={22} color={colors.primary} />
          <Text style={styles.adminButtonText}>Admin Dashboard</Text>
        </TouchableOpacity>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderCountryItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        {...getScrollbarProps()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fafbfc',
    marginBottom: 12,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  adminButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 6,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[700],
    marginTop: 18,
    marginBottom: 6,
    marginLeft: 8,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 8,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  flag: {
    width: 40,
    height: 28,
    borderRadius: 4,
    marginRight: 12,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[900],
  },
  countryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  countryCode: {
    fontSize: 13,
    color: colors.gray[500],
    marginRight: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
  configBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.success.light,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  notConfiguredBadge: {
    backgroundColor: colors.gray[100],
  },
  configText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.success.DEFAULT,
  },
  notConfiguredText: {
    color: colors.gray[600],
  },
});

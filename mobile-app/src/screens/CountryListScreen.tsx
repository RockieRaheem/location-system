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
import { colors, fontSizes } from '../theme';
import { COUNTRIES, CONTINENTS, Country } from '../data/countries';
import { getScrollbarProps } from '../theme/scrollbar';

interface CountrySection {
  continent: string;
  data: Country[];
}

interface CountryListScreenProps {
  navigation: any;
}

export default function CountryListScreen({ navigation }: CountryListScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const sections = useMemo(() => {
    const filteredCountries = COUNTRIES.filter((country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const countrySections: CountrySection[] = CONTINENTS.map((continent) => ({
      continent,
      data: filteredCountries.filter((country) => country.continent === continent),
    })).filter((section) => section.data.length > 0);

    return countrySections;
  }, [searchQuery]);

  const handleCountryPress = (country: Country) => {
    if (country.isConfigured) {
      navigation.navigate('AdminLevels', { country });
    } else {
      navigation.navigate('CountryConfig', { country });
    }
  };

  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => handleCountryPress(item)}
    >
      <Image source={{ uri: item.flagUrl }} style={styles.flag} />
      <View style={styles.countryInfo}>
        <Text style={styles.countryName}>{item.name}</Text>
        <Text style={styles.countryCode}>{item.code}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={colors.gray[500]} />
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: CountrySection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.continent}</Text>
      <Text style={styles.sectionCount}>{section.data.length} countries</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Country</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons
          name="search"
          size={20}
          color={colors.gray[500]}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search countries..."
          placeholderTextColor={colors.gray[500]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={20} color={colors.gray[500]} />
          </TouchableOpacity>
        )}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderCountryItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={true}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.gray[900],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  sectionCount: {
    fontSize: 14,
    color: colors.gray[600],
  },
  listContent: {
    paddingBottom: 20,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  flag: {
    width: 48,
    height: 32,
    marginRight: 16,
    borderRadius: 4,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: fontSizes.base,
    fontWeight: '500',
    color: colors.gray[900],
    marginBottom: 4,
  },
  countryCode: {
    fontSize: fontSizes.sm,
    color: colors.gray[600],
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fontSizes } from '../theme';

interface Location {
  id: string;
  name: string;
  type: string;
  code: string;
  icon: string;
}

interface LocationSearchScreenProps {
  navigation: any;
}

export default function LocationSearchScreen({ navigation }: LocationSearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [locations] = useState<Location[]>([
    {
      id: '1',
      name: 'Metropolis Central',
      type: 'Capital City',
      code: 'CTY-001',
      icon: 'location-city',
    },
    {
      id: '2',
      name: 'Northwood Shire',
      type: 'Province',
      code: 'PRV-015',
      icon: 'terrain',
    },
    {
      id: '3',
      name: 'Riverbend District',
      type: 'District',
      code: 'DST-102',
      icon: 'business',
    },
    {
      id: '4',
      name: 'Sunnyvale',
      type: 'Municipality',
      code: 'MUN-340',
      icon: 'domain',
    },
    {
      id: '5',
      name: 'Oakwood Village',
      type: 'Village',
      code: 'VLG-1121',
      icon: 'cottage',
    },
  ]);

  const getIconName = (iconName: string): any => {
    const iconMap: { [key: string]: any } = {
      'location-city': 'location-city',
      'terrain': 'terrain',
      'business': 'business',
      'domain': 'domain',
      'cottage': 'cottage',
    };
    return iconMap[iconName] || 'place';
  };

  const renderLocationItem = ({ item }: { item: Location }) => (
    <TouchableOpacity style={styles.locationCard}>
      <View style={styles.iconContainer}>
        <MaterialIcons name={getIconName(item.icon)} size={24} color={colors.primary} />
      </View>
      <View style={styles.locationInfo}>
        <Text style={styles.locationName}>{item.name}</Text>
        <Text style={styles.locationType}>{item.type}</Text>
        <Text style={styles.locationCode}>ID: {item.code}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Location Search</Text>
          <TouchableOpacity style={styles.filterButton}>
            <MaterialIcons name="tune" size={24} color={colors.gray[600]} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons
            name="search"
            size={24}
            color={colors.gray[400]}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, code, or type..."
            placeholderTextColor={colors.gray[500]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Results List */}
      <FlatList
        data={locations}
        renderItem={renderLocationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    backgroundColor: colors.backgroundLight + 'CC', // 80% opacity
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: fontSizes['3xl'],
    fontWeight: '700',
    color: colors.gray[900],
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchContainer: {
    position: 'relative',
    marginHorizontal: 16,
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 1,
  },
  searchInput: {
    height: 56,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: fontSizes.base,
    color: colors.gray[900],
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 12,
  },
  locationCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary + '1A', // 10% opacity
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: fontSizes.base,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: 4,
  },
  locationType: {
    fontSize: fontSizes.sm,
    color: colors.gray[500],
    marginBottom: 4,
  },
  locationCode: {
    fontSize: fontSizes.sm,
    color: colors.gray[600],
  },
});

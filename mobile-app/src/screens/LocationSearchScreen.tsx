import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fontSizes } from '../theme';
import { locationService } from '../services/locationService';

interface Location {
  type: 'district' | 'subcounty' | 'parish' | 'village';
  name: string;
  path: string;
}

interface LocationSearchScreenProps {
  navigation: any;
}

export default function LocationSearchScreen({ navigation }: LocationSearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      setIsSearching(true);
      setTimeout(() => {
        const results = locationService.searchLocations(query);
        setLocations(results);
        setIsSearching(false);
      }, 300);
    } else {
      setLocations([]);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'district':
        return 'location-city';
      case 'subcounty':
        return 'apartment';
      case 'parish':
        return 'place';
      case 'village':
        return 'home';
      default:
        return 'location-on';
    }
  };
      code: 'VLG-1121',
  };

  const renderLocationItem = ({ item }: { item: Location }) => (
    <TouchableOpacity style={styles.locationCard}>
      <View style={styles.iconContainer}>
        <MaterialIcons name={getIconForType(item.type) as any} size={24} color={colors.primary} />
      </View>
      <View style={styles.locationInfo}>
        <Text style={styles.locationName}>{item.name}</Text>
        <Text style={styles.locationType}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Text>
        <Text style={styles.locationCode}>{item.path}</Text>
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
            placeholder="Search Uganda locations..."
            placeholderTextColor={colors.gray[500]}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Results List */}
      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={locations}
          renderItem={renderLocationItem}
          keyExtractor={(item, index) => `${item.type}-${item.name}-${index}`}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="search-off" size={48} color={colors.gray[400]} />
              <Text style={styles.emptyText}>
                {searchQuery.length >= 2 ? 'No results found' : 'Enter at least 2 characters to search'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
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
    fontSize: fontSizes.xs,
    color: colors.gray[600],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: fontSizes.base,
    color: colors.gray[500],
    textAlign: 'center',
  },
});

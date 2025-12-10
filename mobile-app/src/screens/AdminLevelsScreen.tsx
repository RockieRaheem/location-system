import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fontSizes } from '../theme';
import { locationService } from '../services/locationService';

interface AdminUnit {
  id: string;
  name: string;
  type: string;
  icon: string;
  children?: AdminUnit[];
  expanded?: boolean;
  level: number;
}

interface AdminLevelsScreenProps {
  navigation: any;
  route: any;
}

export default function AdminLevelsScreen({ navigation, route }: AdminLevelsScreenProps) {
  const country = route.params?.country || { name: 'Uganda', code: 'UGA' };
  const [adminUnits, setAdminUnits] = useState<AdminUnit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDistricts();
  }, []);

  const loadDistricts = () => {
    try {
      const districts = locationService.getDistricts();
      const units: AdminUnit[] = districts.slice(0, 50).map((district, index) => ({
        id: `district-${index}`,
        name: district,
        type: 'District',
        icon: 'location-city',
        level: 0,
        expanded: false,
        children: [],
      }));
      setAdminUnits(units);
    } catch (error) {
      console.error('Error loading districts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubcounties = async (districtName: string, districtId: string) => {
    try {
      const districtDetails = locationService.getDistrictDetails(districtName);
      if (districtDetails && districtDetails.subcounties) {
        return districtDetails.subcounties.map((subcounty, index) => ({
          id: `${districtId}-subcounty-${index}`,
          name: subcounty,
          type: 'Subcounty',
          icon: 'apartment',
          level: 1,
          expanded: false,
          children: [],
        }));
      }
    } catch (error) {
      console.error('Error loading subcounties:', error);
    }
    return [];
  };

  const loadParishes = async (districtName: string, subcountyName: string, subcountyId: string) => {
    try {
      const subcountyDetails = locationService.getSubcountyDetails(districtName, subcountyName);
      if (subcountyDetails && subcountyDetails.data) {
        return subcountyDetails.data.map((parish, index) => ({
          id: `${subcountyId}-parish-${index}`,
          name: parish.parish,
          type: 'Parish',
          icon: 'place',
          level: 2,
          expanded: false,
          children: [],
        }));
      }
    } catch (error) {
      console.error('Error loading parishes:', error);
    }
    return [];
  };

  const loadVillages = async (districtName: string, subcountyName: string, parishName: string, parishId: string) => {
    try {
      const parishDetails = locationService.getParishDetails(districtName, subcountyName, parishName);
      if (parishDetails && parishDetails.villages) {
        return parishDetails.villages.map((village, index) => ({
          id: `${parishId}-village-${index}`,
          name: village,
          type: 'Village',
          icon: 'home',
          level: 3,
          children: [],
        }));
      }
    } catch (error) {
      console.error('Error loading villages:', error);
    }
    return [];
  };

  const toggleExpand = async (id: string, unit: AdminUnit) => {
    // Load children if not already loaded
    if (!unit.children || unit.children.length === 0) {
      if (unit.type === 'District') {
        const children = await loadSubcounties(unit.name, unit.id);
        const updateUnits = (units: AdminUnit[]): AdminUnit[] => {
          return units.map((u) => {
            if (u.id === id) {
              return { ...u, children, expanded: true };
            }
            if (u.children) {
              return { ...u, children: updateUnits(u.children) };
            }
            return u;
          });
        };
        setAdminUnits(updateUnits(adminUnits));
        return;
      } else if (unit.type === 'Subcounty' && unit.level === 1) {
        // Need to get parent district name
        const districtUnit = findParentDistrict(unit.id);
        if (districtUnit) {
          const children = await loadParishes(districtUnit.name, unit.name, unit.id);
          const updateUnits = (units: AdminUnit[]): AdminUnit[] => {
            return units.map((u) => {
              if (u.id === id) {
                return { ...u, children, expanded: true };
              }
              if (u.children) {
                return { ...u, children: updateUnits(u.children) };
              }
              return u;
            });
          };
          setAdminUnits(updateUnits(adminUnits));
          return;
        }
      } else if (unit.type === 'Parish' && unit.level === 2) {
        const districtUnit = findParentDistrict(unit.id);
        const subcountyUnit = findParentSubcounty(unit.id);
        if (districtUnit && subcountyUnit) {
          const children = await loadVillages(districtUnit.name, subcountyUnit.name, unit.name, unit.id);
          const updateUnits = (units: AdminUnit[]): AdminUnit[] => {
            return units.map((u) => {
              if (u.id === id) {
                return { ...u, children, expanded: true };
              }
              if (u.children) {
                return { ...u, children: updateUnits(u.children) };
              }
              return u;
            });
          };
          setAdminUnits(updateUnits(adminUnits));
          return;
        }
      }
    }

    // Just toggle expansion
    const updateUnits = (units: AdminUnit[]): AdminUnit[] => {
      return units.map((u) => {
        if (u.id === id) {
          return { ...u, expanded: !u.expanded };
        }
        if (u.children) {
          return { ...u, children: updateUnits(u.children) };
        }
        return u;
      });
    };
    setAdminUnits(updateUnits(adminUnits));
  };

  const findParentDistrict = (childId: string): AdminUnit | null => {
    for (const unit of adminUnits) {
      if (unit.type === 'District' && childId.startsWith(unit.id)) {
        return unit;
      }
    }
    return null;
  };

  const findParentSubcounty = (childId: string): AdminUnit | null => {
    for (const district of adminUnits) {
      if (district.children) {
        for (const subcounty of district.children) {
          if (subcounty.type === 'Subcounty' && childId.startsWith(subcounty.id)) {
            return subcounty;
          }
        }
      }
    }
    return null;
  };

  const handleUnitPress = (unit: AdminUnit) => {
    if (unit.type === 'Village') {
      navigation.navigate('AdminUnitEditor', { unit });
    } else {
      toggleExpand(unit.id, unit);
    }
  };

  const renderUnit = (unit: AdminUnit, parentIndex: number = 0) => {
    const hasChildren = unit.children && unit.children.length > 0;
    const isExpanded = unit.expanded;
    const isHighlighted = unit.id === '1-2';

    return (
      <View key={unit.id}>
        <TouchableOpacity
          style={[
            styles.unitItem,
            isHighlighted && styles.unitItemHighlighted,
            { paddingLeft: 16 + unit.level * 24 },
          ]}
          onPress={() => handleUnitPress(unit)}
        >
          <MaterialIcons
            name={unit.icon as any}
            size={20}
            color={unit.level === 0 ? colors.primary : colors.gray[500]}
            style={styles.unitIcon}
          />
          <View style={styles.unitInfo}>
            <Text style={[styles.unitName, unit.level === 0 && styles.unitNameBold]}>
              {unit.name}
            </Text>
            <Text style={styles.unitType}>{unit.type}</Text>
          </View>
          {hasChildren && (
            <MaterialIcons
              name={isExpanded ? 'expand-more' : 'chevron-right'}
              size={24}
              color={colors.gray[isExpanded ? 500 : 400]}
            />
          )}
          {!hasChildren && unit.level > 0 && (
            <MaterialIcons name="chevron-right" size={24} color={colors.gray[400]} />
          )}
        </TouchableOpacity>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <View style={styles.childrenContainer}>
            {unit.children!.map((child) => renderUnit(child, parentIndex + 1))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.gray[800]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Levels</Text>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="more-horiz" size={24} color={colors.gray[800]} />
        </TouchableOpacity>
      </View>

      {/* Country Info Card */}
      <View style={styles.countryCard}>
        <Image
          source={{ uri: 'https://flagcdn.com/w80/ug.png' }}
          style={styles.countryFlag}
        />
        <View>
          <Text style={styles.countryName}>{country.name}</Text>
          <Text style={styles.countryCode}>{country.code}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading Uganda districts...</Text>
        </View>
      ) : (
        <FlatList
          data={adminUnits}
          renderItem={({ item }) => renderUnit(item)}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.gray[900],
  },
  countryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  countryFlag: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  countryLabel: {
    fontSize: fontSizes.xs,
    color: colors.gray[500],
    marginBottom: 2,
  },
  countryName: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.gray[900],
  },
  listContent: {
    paddingBottom: 32,
  },
  unitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  unitItemHighlighted: {
    backgroundColor: colors.primary + '0D', // 5% opacity
  },
  unitIcon: {
    marginRight: 12,
  },
  unitInfo: {
    flex: 1,
  },
  unitName: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.gray[700],
    marginBottom: 2,
  },
  unitNameBold: {
    fontWeight: '600',
    color: colors.gray[800],
  },
  unitType: {
    fontSize: fontSizes.xs,
    color: colors.gray[500],
  },
  childrenContainer: {
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: fontSizes.md,
    color: colors.gray[600],
  },
});

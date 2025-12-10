import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fontSizes } from '../theme';

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
  const country = route.params?.country || { name: 'Republic of Ghana', code: 'GHA' };

  const [adminUnits, setAdminUnits] = useState<AdminUnit[]>([
    {
      id: '1',
      name: 'Ashanti Region',
      type: 'Region',
      icon: 'public',
      level: 0,
      expanded: true,
      children: [
        {
          id: '1-1',
          name: 'Kumasi Metropolitan',
          type: 'Sub-region',
          icon: 'explore',
          level: 1,
        },
        {
          id: '1-2',
          name: 'Asokore Mampong',
          type: 'Sub-region',
          icon: 'explore',
          level: 1,
          expanded: true,
          children: [
            {
              id: '1-2-1',
              name: 'Asawase',
              type: 'District',
              icon: 'domain',
              level: 2,
            },
            {
              id: '1-2-2',
              name: 'Aboabo',
              type: 'District',
              icon: 'domain',
              level: 2,
            },
          ],
        },
        {
          id: '1-3',
          name: 'Kwabre East',
          type: 'Sub-region',
          icon: 'explore',
          level: 1,
        },
      ],
    },
    {
      id: '2',
      name: 'Greater Accra Region',
      type: 'Region',
      icon: 'public',
      level: 0,
    },
    {
      id: '3',
      name: 'Northern Region',
      type: 'Region',
      icon: 'public',
      level: 0,
    },
  ]);

  const toggleExpand = (id: string, parentId?: string) => {
    const updateUnits = (units: AdminUnit[]): AdminUnit[] => {
      return units.map((unit) => {
        if (unit.id === id) {
          return { ...unit, expanded: !unit.expanded };
        }
        if (unit.children) {
          return { ...unit, children: updateUnits(unit.children) };
        }
        return unit;
      });
    };
    setAdminUnits(updateUnits(adminUnits));
  };

  const handleUnitPress = (unit: AdminUnit) => {
    if (unit.children && unit.children.length > 0) {
      toggleExpand(unit.id);
    } else {
      navigation.navigate('AdminUnitEditor', { unit });
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
          source={{ uri: 'https://flagcdn.com/w80/gh.png' }}
          style={styles.countryFlag}
        />
        <View>
          <Text style={styles.countryLabel}>Country</Text>
          <Text style={styles.countryName}>{country.name}</Text>
        </View>
      </View>

      {/* Admin Units List */}
      <FlatList
        data={adminUnits}
        renderItem={({ item }) => renderUnit(item)}
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
});

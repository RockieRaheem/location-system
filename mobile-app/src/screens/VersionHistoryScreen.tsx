import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fontSizes } from '../theme';
import { StyledFlatList } from '../../components/StyledFlatList';

interface HistoryEntry {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
  admin: string;
  type: 'update' | 'create';
}

interface VersionHistoryScreenProps {
  navigation: any;
  route: any;
}

export default function VersionHistoryScreen({
  navigation,
  route,
}: VersionHistoryScreenProps) {
  const unit = route.params?.unit || { name: 'Province of Central Plains', id: '345' };

  const historyEntries: HistoryEntry[] = [
    {
      id: '1',
      field: 'Capital City',
      oldValue: 'Oldtown',
      newValue: 'New Capital City',
      timestamp: '2023-10-26 14:30',
      admin: 'J. Doe',
      type: 'update',
    },
    {
      id: '2',
      field: 'Population',
      oldValue: '1,200,000',
      newValue: '1,250,000',
      timestamp: '2023-08-15 09:12',
      admin: 'A. Smith',
      type: 'update',
    },
    {
      id: '3',
      field: 'Unit Created',
      oldValue: '',
      newValue: 'Province of Central Plains was added to the system.',
      timestamp: '2022-01-01 10:00',
      admin: 'J. Doe',
      type: 'create',
    },
  ];

  const renderHistoryItem = ({ item, index }: { item: HistoryEntry; index: number }) => {
    const isLast = index === historyEntries.length - 1;
    const isCreate = item.type === 'create';

    return (
      <View style={styles.historyItem}>
        {/* Timeline Dot */}
        <View style={styles.timelineDot}>
          <View
            style={[
              styles.dot,
              isCreate ? styles.dotGray : styles.dotPrimary,
            ]}
          />
          {!isLast && <View style={styles.timelineLine} />}
        </View>

        {/* Content */}
        <View style={styles.historyContent}>
          {/* Header */}
          <View style={styles.historyHeader}>
            <Text style={styles.fieldName}>{item.field}</Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>

          {/* Change Card */}
          <View style={styles.changeCard}>
            {isCreate ? (
              <View style={styles.createAction}>
                <MaterialIcons
                  name="add-circle"
                  size={20}
                  color={colors.gray[500]}
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.changeLabel}>Action</Text>
                  <Text style={styles.changeValue}>{item.newValue}</Text>
                </View>
              </View>
            ) : (
              <>
                {/* Old Value */}
                <View style={styles.changeItem}>
                  <View style={styles.badgeRemove}>
                    <Text style={styles.badgeText}>−</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.changeLabel}>Previous Value</Text>
                    <Text style={styles.changeValue}>{item.oldValue}</Text>
                  </View>
                </View>

                {/* New Value */}
                <View style={styles.changeItem}>
                  <View style={styles.badgeAdd}>
                    <Text style={styles.badgeText}>+</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.changeLabel}>New Value</Text>
                    <Text style={styles.changeValue}>{item.newValue}</Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Admin Info */}
          <View style={styles.adminInfo}>
            <MaterialIcons name="person" size={16} color={colors.gray[500]} />
            <Text style={styles.adminText}>
              Admin: <Text style={styles.adminName}>{item.admin}</Text>
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back-ios" size={20} color={colors.gray[800]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Version History</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Unit Info Card */}
      <View style={styles.unitCard}>
        <Text style={styles.unitLabel}>Administrative Unit</Text>
        <Text style={styles.unitName}>{unit.name}</Text>
      </View>

      {/* History Timeline */}
      <StyledFlatList
        data={historyEntries}
        renderItem={renderHistoryItem}
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.gray[900],
  },
  unitCard: {
    backgroundColor: colors.white,
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  unitLabel: {
    fontSize: fontSizes.sm,
    color: colors.gray[500],
    marginBottom: 4,
  },
  unitName: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.gray[900],
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  historyItem: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  timelineDot: {
    alignItems: 'center',
    marginRight: 24,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: colors.white,
  },
  dotPrimary: {
    backgroundColor: colors.primary,
    shadowColor: colors.gray[200],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  dotGray: {
    backgroundColor: colors.gray[400],
    shadowColor: colors.gray[200],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.gray[200],
    marginTop: 8,
  },
  historyContent: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldName: {
    fontSize: fontSizes.base,
    fontWeight: '600',
    color: colors.gray[900],
  },
  timestamp: {
    fontSize: fontSizes.xs,
    color: colors.gray[500],
  },
  changeCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 12,
    gap: 12,
  },
  changeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  createAction: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  badgeRemove: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.danger.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  badgeAdd: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  badgeText: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.gray[900],
  },
  changeLabel: {
    fontSize: fontSizes.xs,
    color: colors.gray[500],
    marginBottom: 2,
  },
  changeValue: {
    fontSize: fontSizes.base,
    color: colors.gray[800],
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  adminText: {
    fontSize: fontSizes.sm,
    color: colors.gray[600],
  },
  adminName: {
    fontWeight: '500',
  },
});

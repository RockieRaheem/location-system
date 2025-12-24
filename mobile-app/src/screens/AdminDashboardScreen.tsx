import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme';
import { ugandaApiService } from '../services/ugandaApiService';

// --- Data Structures ---
// These match the nested structure for easier state management.
interface Village { id: string; name: string; }
interface Parish { id: string; name: string; villages: Village[]; }
interface Subcounty { id: string; name: string; parishes: Parish[]; }
interface County { id: string; name: string; subcounties: Subcounty[]; }
interface District { id: string; name: string; counties: County[]; }

// This represents a single, flattened row for display.
interface TableRow {
  uid: string; // Unique ID for FlatList key
  district: string;
  county: string;
  subcounty: string;
  parish: string;
  village: string;
}

// --- Mock Data (replace with API call) ---
const MOCK_DATA: District[] = [
  {
    id: 'd1', name: 'Apac', counties: [
      {
        id: 'c1', name: 'Kwania County', subcounties: [
          {
            id: 's1', name: 'Aduku', parishes: [
              { id: 'p1', name: 'Ongoceng', villages: [{ id: 'v1', name: 'Adyeda' }, { id: 'v2', name: 'Anywal' }, { id: 'v3', name: 'Apor-Wegi ‘A’' }] },
              { id: 'p2', name: 'Abalokweri', villages: [{ id: 'v4', name: 'Abeigbuti' }, { id: 'v5', name: 'Abononyeko' }] },
            ]
          },
          {
            id: 's2', name: 'Alira', parishes: [
                { id: 'p3', name: 'Akot ‘A’', villages: [{ id: 'v6', name: 'Akot' }] },
                { id: 'p4', name: 'Akot ‘B’', villages: [{ id: 'v7', name: 'Akwodong' }] },
            ]
          }
        ]
      }
    ]
  }
];


// --- Core Logic: Data Transformation ---
const flattenHierarchy = (districts: District[]): TableRow[] => {
  const rows: TableRow[] = [];
  let lastDistrict = '', lastCounty = '', lastSubcounty = '', lastParish = '';

  districts.forEach(district => {
    let isFirstDistrictRow = true;
    district.counties.forEach(county => {
      let isFirstCountyRow = true;
      county.subcounties.forEach(subcounty => {
        let isFirstSubcountyRow = true;
        subcounty.parishes.forEach(parish => {
          let isFirstParishRow = true;
          if (parish.villages.length === 0) {
            // Handle cases where there might be no villages under a parish
            rows.push({
                uid: `${district.id}-${county.id}-${subcounty.id}-${parish.id}-no-village`,
                district: lastDistrict === district.name ? '' : district.name,
                county: lastCounty === county.name ? '' : county.name,
                subcounty: lastSubcounty === subcounty.name ? '' : subcounty.name,
                parish: lastParish === parish.name ? '' : parish.name,
                village: ''
            });
            lastDistrict = district.name; lastCounty = county.name; lastSubcounty = subcounty.name; lastParish = parish.name;
          } else {
            parish.villages.forEach(village => {
                rows.push({
                    uid: village.id,
                    district: isFirstDistrictRow ? district.name : (lastDistrict === district.name ? '' : district.name),
                    county: isFirstCountyRow ? county.name : (lastCounty === county.name ? '' : county.name),
                    subcounty: isFirstSubcountyRow ? subcounty.name : (lastSubcounty === subcounty.name ? '' : subcounty.name),
                    parish: isFirstParishRow ? parish.name : (lastParish === parish.name ? '' : parish.name),
                    village: village.name
                });
                isFirstDistrictRow = false; isFirstCountyRow = false; isFirstSubcountyRow = false; isFirstParishRow = false;
                lastDistrict = district.name; lastCounty = county.name; lastSubcounty = subcounty.name; lastParish = parish.name;
            });
          }
        });
      });
    });
  });

  return rows;
};


// --- Main Component ---
const AdminDashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // NOTE: The current API doesn't support fetching the entire nested hierarchy.
        // This is a critical limitation. We are using mock data as a fallback.
        // To integrate fully, an endpoint like `GET /api/uganda/hierarchy` is needed.
        // const fetchedData = await ugandaApiService.getFullHierarchy(); // Assuming this exists
        setDistricts(MOCK_DATA);
      } catch (e) {
        console.error(e);
        setError('Failed to fetch location data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Use useMemo to prevent re-calculating the flattened rows on every render
  const tableRows = useMemo(() => flattenHierarchy(districts), [districts]);

  const renderItem = ({ item }: { item: TableRow }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, styles.districtCell]}>{item.district}</Text>
      <Text style={[styles.tableCell, styles.countyCell]}>{item.county}</Text>
      <Text style={[styles.tableCell, styles.subcountyCell]}>{item.subcounty}</Text>
      <Text style={[styles.tableCell, styles.parishCell]}>{item.parish}</Text>
      <Text style={[styles.tableCell, styles.villageCell]}>{item.village}</Text>
      <View style={styles.actionsCell}>
          <TouchableOpacity style={styles.actionButton}><MaterialIcons name="edit" size={18} color={colors.primary} /></TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}><MaterialIcons name="delete" size={18} color={colors.danger.DEFAULT} /></TouchableOpacity>
      </View>
    </View>
  );

  const TableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, styles.districtCell]}>District</Text>
      <Text style={[styles.headerCell, styles.countyCell]}>County</Text>
      <Text style={[styles.headerCell, styles.subcountyCell]}>Subcounty</Text>
      <Text style={[styles.headerCell, styles.parishCell]}>Parish</Text>
      <Text style={[styles.headerCell, styles.villageCell]}>Village</Text>
      <Text style={[styles.headerCell, styles.actionsCell]}>Actions</Text>
    </View>
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (error) {
    return <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>;
  }

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>Uganda Administrative Units</Text>
        </View>

        <View style={styles.card}>
            <FlatList
                ListHeaderComponent={TableHeader}
                data={tableRows}
                renderItem={renderItem}
                keyExtractor={(item) => item.uid}
                contentContainerStyle={styles.listContentContainer}
                stickyHeaderIndices={[0]}
            />
        </View>
    </View>
  );
};


// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[100], padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: colors.danger.DEFAULT, fontSize: 16 },
  header: { marginBottom: 16, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.gray[800] },
  subtitle: { fontSize: 16, color: colors.gray[500], marginTop: 4 },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
      native: { elevation: 2 },
    }),
    overflow: 'hidden',
  },
  listContentContainer: { paddingBottom: 16 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.gray[50],
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerCell: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.gray[600],
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  tableCell: {
    fontSize: 14,
    color: colors.gray[800],
  },
  // Column widths
  districtCell: { flex: 2 },
  countyCell: { flex: 2.5 },
  subcountyCell: { flex: 2.5 },
  parishCell: { flex: 2.5 },
  villageCell: { flex: 2.5 },
  actionsCell: { flex: 1.5, flexDirection: 'row', justifyContent: 'flex-end'},
  actionButton: {
    padding: 4,
    marginLeft: 12,
  }
});

export default AdminDashboardScreen;
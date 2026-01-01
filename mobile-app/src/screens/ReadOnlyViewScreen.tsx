import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface Village { id: string; name: string; }
interface Parish { id: string; name: string; villages: Village[]; }
interface Subcounty { id: string; name: string; parishes: Parish[]; }
interface County { id: string; name: string; subcounties: Subcounty[]; }
interface District { id: string; name: string; counties: County[]; }

interface TableRow {
  uid: string;
  district: string;
  county: string;
  subcounty: string;
  parish: string;
  village: string;
}

const STORAGE_KEY = 'uganda_admin_districts';

const loadFromStorage = (): District[] => {
  if (Platform.OS === 'web') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
  }
  return [];
};

const processDataForDisplay = (districts: District[]): TableRow[] => {
  const rows: TableRow[] = [];
  let lastDistrict = '';
  let lastCounty = '';
  let lastSubcounty = '';
  let lastParish = '';

  districts.forEach(district => {
    if (district.counties.length === 0) {
      rows.push({
        uid: district.id,
        district: district.name,
        county: '',
        subcounty: '',
        parish: '',
        village: '',
      });
      lastDistrict = district.name;
      return;
    }

    district.counties.forEach(county => {
      if (county.subcounties.length === 0) {
        rows.push({
          uid: `${district.id}-${county.id}`,
          district: district.name !== lastDistrict ? district.name : '',
          county: county.name,
          subcounty: '',
          parish: '',
          village: '',
        });
        lastDistrict = district.name;
        lastCounty = county.name;
        return;
      }

      county.subcounties.forEach(subcounty => {
        if (subcounty.parishes.length === 0) {
          rows.push({
            uid: `${district.id}-${county.id}-${subcounty.id}`,
            district: district.name !== lastDistrict ? district.name : '',
            county: county.name !== lastCounty ? county.name : '',
            subcounty: subcounty.name,
            parish: '',
            village: '',
          });
          lastDistrict = district.name;
          lastCounty = county.name;
          lastSubcounty = subcounty.name;
          return;
        }

        subcounty.parishes.forEach(parish => {
          if (parish.villages.length === 0) {
            rows.push({
              uid: `${district.id}-${county.id}-${subcounty.id}-${parish.id}`,
              district: district.name !== lastDistrict ? district.name : '',
              county: county.name !== lastCounty ? county.name : '',
              subcounty: subcounty.name !== lastSubcounty ? subcounty.name : '',
              parish: parish.name,
              village: '',
            });
            lastDistrict = district.name;
            lastCounty = county.name;
            lastSubcounty = subcounty.name;
            lastParish = parish.name;
            return;
          }

          parish.villages.forEach((village) => {
            rows.push({
              uid: village.id,
              district: district.name !== lastDistrict ? district.name : '',
              county: county.name !== lastCounty ? county.name : '',
              subcounty: subcounty.name !== lastSubcounty ? subcounty.name : '',
              parish: parish.name !== lastParish ? parish.name : '',
              village: village.name,
            });
            
            lastDistrict = district.name;
            lastCounty = county.name;
            lastSubcounty = subcounty.name;
            lastParish = parish.name;
          });
        });
      });
    });
  });

  return rows;
};

const ReadOnlyViewScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [districts, setDistricts] = useState<District[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 300));
        const storedData = loadFromStorage();
        setDistricts(storedData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const tableRows = useMemo(() => processDataForDisplay(districts), [districts]);

  const totalCounties = districts.reduce((sum, d) => sum + d.counties.length, 0);
  const totalSubcounties = districts.reduce((sum, d) => 
    sum + d.counties.reduce((s, c) => s + c.subcounties.length, 0), 0
  );
  const totalVillages = tableRows.length;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Loading Uganda administrative data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="public" size={32} color={colors.primary[500]} />
          </View>
          <View>
            <Text style={styles.title}>🇺🇬 Uganda Administrative Units</Text>
            <Text style={styles.subtitle}>Complete hierarchical structure • Read-only view</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => navigation.navigate('Login')}
        >
          <MaterialIcons name="admin-panel-settings" size={20} color={colors.white} />
          <Text style={styles.adminButtonText}>Admin Login</Text>
        </TouchableOpacity>
      </View>

      {/* Statistics Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <MaterialIcons name="location-city" size={24} color={colors.primary[600]} />
          </View>
          <View>
            <Text style={styles.statValue}>{districts.length}</Text>
            <Text style={styles.statLabel}>Districts</Text>
          </View>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <MaterialIcons name="apartment" size={24} color={colors.success[600]} />
          </View>
          <View>
            <Text style={styles.statValue}>{totalCounties}</Text>
            <Text style={styles.statLabel}>Counties</Text>
          </View>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <MaterialIcons name="domain" size={24} color={colors.primary[600]} />
          </View>
          <View>
            <Text style={styles.statValue}>{totalSubcounties}</Text>
            <Text style={styles.statLabel}>Subcounties</Text>
          </View>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <MaterialIcons name="home-work" size={24} color={colors.success[600]} />
          </View>
          <View>
            <Text style={styles.statValue}>{totalVillages}</Text>
            <Text style={styles.statLabel}>Villages</Text>
          </View>
        </View>
      </View>

      {/* Excel-style Table */}
      <View style={styles.tableWrapper}>
        <View style={styles.tableContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={{ minWidth: 1400 }}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <View style={[styles.headerCell, styles.districtCol]}>
                  <Text style={styles.headerCellText}>DISTRICT</Text>
                </View>
                <View style={[styles.headerCell, styles.countyCol]}>
                  <Text style={styles.headerCellText}>COUNTY</Text>
                </View>
                <View style={[styles.headerCell, styles.subcountyCol]}>
                  <Text style={styles.headerCellText}>SUBCOUNTY / DIVISION</Text>
                </View>
                <View style={[styles.headerCell, styles.parishCol]}>
                  <Text style={styles.headerCellText}>PARISH / WARD</Text>
                </View>
                <View style={[styles.headerCell, styles.villageCol]}>
                  <Text style={styles.headerCellText}>VILLAGE / CELL</Text>
                </View>
              </View>

              {/* Table Body */}
              <ScrollView style={styles.tableScrollView}>
                {tableRows.map((item, index) => (
                  <View 
                    key={item.uid} 
                    style={[
                      styles.tableRow,
                      index % 2 === 1 && styles.tableRowAlt
                    ]}
                  >
                    <View style={styles.districtCol}>
                      <Text style={styles.cellText}>{item.district}</Text>
                    </View>
                    <View style={styles.countyCol}>
                      <Text style={styles.cellText}>{item.county}</Text>
                    </View>
                    <View style={styles.subcountyCol}>
                      <Text style={styles.cellText}>{item.subcounty}</Text>
                    </View>
                    <View style={styles.parishCol}>
                      <Text style={styles.cellText}>{item.parish}</Text>
                    </View>
                    <View style={styles.villageCol}>
                      <Text style={styles.cellText}>{item.village}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <MaterialIcons name="info-outline" size={18} color={colors.gray[600]} />
        <Text style={styles.footerText}>
          Showing {totalVillages.toLocaleString()} administrative units across Uganda
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.gray[600],
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
    backgroundColor: colors.white,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary[200],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: colors.gray[600],
    fontWeight: '500',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[800],
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  adminButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },

  // Statistics Bar
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 32,
    marginTop: 24,
    marginBottom: 24,
    paddingVertical: 20,
    borderRadius: 16,
    boxShadow: '0px 2px 8px rgba(0,0,0,0.06)',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    color: colors.gray[600],
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 2,
    height: 50,
    backgroundColor: colors.gray[200],
  },

  // Table (Excel-style)
  tableWrapper: {
    flex: 1,
    marginHorizontal: 32,
    marginBottom: 24,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.gray[300],
    boxShadow: '0px 4px 12px rgba(0,0,0,0.08)',
  },
  tableScrollView: {
    flex: 1,
  },

  // Table Header (Excel-style)
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary[700],
    borderBottomWidth: 3,
    borderBottomColor: colors.primary[900],
  },
  headerCell: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRightWidth: 2,
    borderRightColor: colors.primary[600],
    justifyContent: 'center',
  },
  headerCellText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
  },

  // Table Rows (Excel-style)
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
    minHeight: 48,
    backgroundColor: colors.white,
  },
  tableRowAlt: {
    backgroundColor: colors.gray[50],
  },
  cellText: {
    fontSize: 14,
    color: colors.gray[800],
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontWeight: '500',
  },

  // Column Widths
  districtCol: { 
    width: 280,
    minWidth: 280,
    borderRightWidth: 1,
    borderRightColor: colors.gray[300],
  },
  countyCol: { 
    width: 280,
    minWidth: 280,
    borderRightWidth: 1,
    borderRightColor: colors.gray[300],
  },
  subcountyCol: { 
    width: 300,
    minWidth: 300,
    borderRightWidth: 1,
    borderRightColor: colors.gray[300],
  },
  parishCol: { 
    width: 280,
    minWidth: 280,
    borderRightWidth: 1,
    borderRightColor: colors.gray[300],
  },
  villageCol: { 
    width: 280,
    minWidth: 280,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: colors.gray[600],
    fontWeight: '500',
  },
});

export default ReadOnlyViewScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ugandaApiService } from '../services/ugandaApiService';
import { colors } from '../theme';

const LEVEL_LABELS = ['District', 'County', 'Subcounty', 'Parish', 'Village'];

interface Village {
  name: string;
}

interface Parish {
  name: string;
  villages: Village[];
}

interface Subcounty {
  name: string;
  parishes: Parish[];
}

interface County {
  name: string;
  subcounties: Subcounty[];
}

interface District {
  name: string;
  counties: County[];
}

interface TableRow {
  district: string;
  county: string;
  subcounty: string;
  parish: string;
  village: string;
  dIdx: number;
  cIdx: number;
  sIdx: number;
  pIdx: number;
  vIdx: number;
}

const AdminDashboardScreen = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Handler functions
  const handleAddDistrict = () => {
    setDistricts([...districts, { name: '', counties: [] }]);
  };
  const handleAddCounty = (dIdx: number) => {
    const newDistricts = [...districts];
    newDistricts[dIdx].counties.push({ name: '', subcounties: [] });
    setDistricts(newDistricts);
  };
  const handleAddSubcounty = (dIdx: number, cIdx: number) => {
    const newDistricts = [...districts];
    newDistricts[dIdx].counties[cIdx].subcounties.push({ name: '', parishes: [] });
    setDistricts(newDistricts);
  };
  const handleAddParish = (dIdx: number, cIdx: number, sIdx: number) => {
    const newDistricts = [...districts];
    newDistricts[dIdx].counties[cIdx].subcounties[sIdx].parishes.push({ name: '', villages: [] });
    setDistricts(newDistricts);
  };
  const handleAddVillage = (dIdx: number, cIdx: number, sIdx: number, pIdx: number) => {
    const newDistricts = [...districts];
    newDistricts[dIdx].counties[cIdx].subcounties[sIdx].parishes[pIdx].villages.push({ name: '' });
    setDistricts(newDistricts);
  };
  const handleEdit = (
    level: string,
    value: string,
    dIdx: number,
    cIdx?: number,
    sIdx?: number,
    pIdx?: number,
    vIdx?: number
  ) => {
    const newDistricts = [...districts];
    if (level === 'district') newDistricts[dIdx].name = value;
    if (level === 'county' && cIdx !== undefined) newDistricts[dIdx].counties[cIdx].name = value;
    if (level === 'subcounty' && cIdx !== undefined && sIdx !== undefined) newDistricts[dIdx].counties[cIdx].subcounties[sIdx].name = value;
    if (level === 'parish' && cIdx !== undefined && sIdx !== undefined && pIdx !== undefined) newDistricts[dIdx].counties[cIdx].subcounties[sIdx].parishes[pIdx].name = value;
    if (level === 'village' && cIdx !== undefined && sIdx !== undefined && pIdx !== undefined && vIdx !== undefined) newDistricts[dIdx].counties[cIdx].subcounties[sIdx].parishes[pIdx].villages[vIdx].name = value;
    setDistricts(newDistricts);
  };
  const handleRemove = (
    level: string,
    dIdx: number,
    cIdx?: number,
    sIdx?: number,
    pIdx?: number,
    vIdx?: number
  ) => {
    const newDistricts = [...districts];
    if (level === 'district') newDistricts.splice(dIdx, 1);
    if (level === 'county' && cIdx !== undefined) newDistricts[dIdx].counties.splice(cIdx, 1);
    if (level === 'subcounty' && cIdx !== undefined && sIdx !== undefined) newDistricts[dIdx].counties[cIdx].subcounties.splice(sIdx, 1);
    if (level === 'parish' && cIdx !== undefined && sIdx !== undefined && pIdx !== undefined) newDistricts[dIdx].counties[cIdx].subcounties[sIdx].parishes.splice(pIdx, 1);
    if (level === 'village' && cIdx !== undefined && sIdx !== undefined && pIdx !== undefined && vIdx !== undefined) newDistricts[dIdx].counties[cIdx].subcounties[sIdx].parishes[pIdx].villages.splice(vIdx, 1);
    setDistricts(newDistricts);
  };

  // Flatten tree for table rendering
  const flatten = (): TableRow[] => {
    const rows: TableRow[] = [];
    districts.forEach((d, dIdx) => {
      d.counties.forEach((c, cIdx) => {
        c.subcounties.forEach((s, sIdx) => {
          s.parishes.forEach((p, pIdx) => {
            p.villages.forEach((v, vIdx) => {
              rows.push({
                district: d.name,
                county: c.name,
                subcounty: s.name,
                parish: p.name,
                village: v.name,
                dIdx, cIdx, sIdx, pIdx, vIdx
              });
            });
          });
        });
      });
    });
    return rows;
  };
  const tableRows = flatten();

  // Submit handler
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      for (const d of districts) {
        if (d.name) {
          await ugandaApiService.registerDistrict(d.name, LEVEL_LABELS);
        }
        for (const c of d.counties) {
          for (const s of c.subcounties) {
            for (const p of s.parishes) {
              await ugandaApiService.registerHierarchy({
                district: d.name,
                levels: [
                  { level: 'Constituency', items: [c.name] },
                  { level: 'Subcounty/Division', items: [s.name] },
                  { level: 'Parish/Ward', items: [p.name] },
                  { level: 'Village/Cell', items: p.villages.map(v => v.name) },
                ],
              });
            }
          }
        }
      }
      globalThis.alert('All data submitted successfully!');
      setDistricts([]);
    } catch (error) {
      globalThis.alert('Error submitting data.');
    }
    setSubmitting(false);
  };

  // Component render
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <TouchableOpacity style={styles.addDistrictButton} onPress={handleAddDistrict}>
        <MaterialIcons name="add" size={22} color={colors.primary} />
        <Text style={styles.addDistrictText}>Add District</Text>
      </TouchableOpacity>
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          {LEVEL_LABELS.map((label) => (
            <Text key={label} style={styles.tableHeaderCell}>{label}</Text>
          ))}
        </View>
        {/* Render hierarchical table, only fill parent columns when value changes */}
        {(() => {
          let prev: Partial<TableRow> = {};
          return tableRows.map((row, idx) => {
            const showDistrict = row.district !== prev.district;
            const showCounty = showDistrict || row.county !== prev.county;
            const showSubcounty = showCounty || row.subcounty !== prev.subcounty;
            const showParish = showSubcounty || row.parish !== prev.parish;
            prev = row;
            return (
              <View key={idx} style={styles.tableRow}>
                <View style={styles.tableCellGroup}>
                  <TextInput
                    style={styles.tableCell}
                    placeholder="District"
                    value={showDistrict ? row.district : ''}
                    onChangeText={(text) => handleEdit('district', text, row.dIdx)}
                  />
                  {showDistrict && (
                    <TouchableOpacity onPress={handleAddDistrict} style={styles.addChildButton}>
                      <MaterialIcons name="add" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                  {showDistrict && (
                    <TouchableOpacity onPress={() => handleRemove('district', row.dIdx)} style={styles.removeButton}>
                      <MaterialIcons name="delete" size={20} color={colors.danger.DEFAULT} />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.tableCellGroup}>
                  <TextInput
                    style={styles.tableCell}
                    placeholder="County"
                    value={showCounty ? row.county : ''}
                    onChangeText={(text) => handleEdit('county', text, row.dIdx, row.cIdx)}
                  />
                  {showCounty && (
                    <TouchableOpacity onPress={() => handleAddCounty(row.dIdx)} style={styles.addChildButton}>
                      <MaterialIcons name="add" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                  {showCounty && (
                    <TouchableOpacity onPress={() => handleRemove('county', row.dIdx, row.cIdx)} style={styles.removeButton}>
                      <MaterialIcons name="delete" size={20} color={colors.danger.DEFAULT} />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.tableCellGroup}>
                  <TextInput
                    style={styles.tableCell}
                    placeholder="Subcounty / Division"
                    value={showSubcounty ? row.subcounty : ''}
                    onChangeText={(text) => handleEdit('subcounty', text, row.dIdx, row.cIdx, row.sIdx)}
                  />
                  {showSubcounty && (
                    <TouchableOpacity onPress={() => handleAddSubcounty(row.dIdx, row.cIdx)} style={styles.addChildButton}>
                      <MaterialIcons name="add" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                  {showSubcounty && (
                    <TouchableOpacity onPress={() => handleRemove('subcounty', row.dIdx, row.cIdx, row.sIdx)} style={styles.removeButton}>
                      <MaterialIcons name="delete" size={20} color={colors.danger.DEFAULT} />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.tableCellGroup}>
                  <TextInput
                    style={styles.tableCell}
                    placeholder="Parish / Ward"
                    value={showParish ? row.parish : ''}
                    onChangeText={(text) => handleEdit('parish', text, row.dIdx, row.cIdx, row.sIdx, row.pIdx)}
                  />
                  {showParish && (
                    <TouchableOpacity onPress={() => handleAddParish(row.dIdx, row.cIdx, row.sIdx)} style={styles.addChildButton}>
                      <MaterialIcons name="add" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                  {showParish && (
                    <TouchableOpacity onPress={() => handleRemove('parish', row.dIdx, row.cIdx, row.sIdx, row.pIdx)} style={styles.removeButton}>
                      <MaterialIcons name="delete" size={20} color={colors.danger.DEFAULT} />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.tableCellGroup}>
                  <TextInput
                    style={styles.tableCell}
                    placeholder="Village / Cell"
                    value={row.village}
                    onChangeText={(text) => handleEdit('village', text, row.dIdx, row.cIdx, row.sIdx, row.pIdx, row.vIdx)}
                  />
                  <TouchableOpacity onPress={() => handleAddVillage(row.dIdx, row.cIdx, row.sIdx, row.pIdx)} style={styles.addChildButton}>
                    <MaterialIcons name="add" size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleRemove('village', row.dIdx, row.cIdx, row.sIdx, row.pIdx, row.vIdx)} style={styles.removeButton}>
                    <MaterialIcons name="delete" size={20} color={colors.danger.DEFAULT} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          });
        })()}
        <TouchableOpacity
          style={[styles.registerButton, submitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.registerButtonText}>{submitting ? 'Submitting...' : 'Submit All'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.primary,
    textAlign: 'center',
  },
  addDistrictButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'center',
  },
  addDistrictText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  tableCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    marginBottom: 4,
  },
  tableHeaderCell: {
    flex: 1,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 6,
  },
  tableCellGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  tableCell: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 6,
    padding: 6,
    marginHorizontal: 2,
    fontSize: 13,
    color: '#333',
  },
  addChildButton: {
    marginLeft: 4,
    backgroundColor: colors.primary,
    borderRadius: 6,
    padding: 2,
  },
  removeButton: {
    marginLeft: 4,
    backgroundColor: colors.danger.DEFAULT,
    borderRadius: 6,
    padding: 2,
  },
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AdminDashboardScreen;
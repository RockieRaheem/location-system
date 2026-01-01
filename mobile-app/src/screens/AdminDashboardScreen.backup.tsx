import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// --- DATA STRUCTURES ---

interface Village { id: string; name: string; }
interface Parish { id: string; name: string; villages: Village[]; }
interface Subcounty { id: string; name: string; parishes: Parish[]; }
interface County { id: string; name: string; subcounties: Subcounty[]; }
interface District { id: string; name: string; counties: County[]; }

// Represents a single, flattened row for display in the hierarchical table
interface TableRow {
  uid: string;
  district: string;
  county: string;
  subcounty: string;
  parish: string;
  village: string;
  // Store actual IDs for CRUD operations
  districtId: string;
  countyId: string;
  subcountyId: string;
  parishId: string;
  villageId: string;
  // Track which level this row represents (for proper action buttons)
  level: 'district' | 'county' | 'subcounty' | 'parish' | 'village';
}

type EditMode = {
  type: 'add' | 'edit';
  level: 'district' | 'county' | 'subcounty' | 'parish' | 'village';
  data?: any;
  parentData?: any;
};

// --- MOCK DATA ---
const INITIAL_MOCK_DATA: District[] = [
  {
    id: 'd1', name: 'Apac', counties: [
      {
        id: 'c1', name: 'Kwania County', subcounties: [
          {
            id: 's1', name: 'Aduku', parishes: [
              { id: 'p1', name: 'Ongoceng', villages: [
                { id: 'v1', name: 'Adyeda' }, 
                { id: 'v2', name: 'Anywal' }, 
                { id: 'v3', name: "Apor-Wegi 'A'" },
                { id: 'v4', name: "Apor-Wegi 'B'" }
              ]},
              { id: 'p2', name: 'Abalokweri', villages: [
                { id: 'v5', name: 'Abeigbuti' }, 
                { id: 'v6', name: 'Abononyeko' }
              ]},
            ]
          },
          {
            id: 's2', name: 'Alira', parishes: [
              { id: 'p3', name: "Akot 'A'", villages: [{ id: 'v7', name: 'Akot' }] },
              { id: 'p4', name: "Akot 'B'", villages: [{ id: 'v8', name: 'Akwodong' }] },
              { id: 'p5', name: "Bung 'A'", villages: [{ id: 'v9', name: 'Bung' }] },
              { id: 'p6', name: "Bung 'B'", villages: [{ id: 'v10', name: 'Bung' }] },
              { id: 'p7', name: "Bung 'C'", villages: [{ id: 'v11', name: 'Bung' }] },
              { id: 'p8', name: "Bung 'D'", villages: [{ id: 'v12', name: 'Bung' }] },
            ]
          }
        ]
      },
      {
        id: 'c2', name: 'Maruzi County', subcounties: [
          { id: 's3', name: 'Aboke', parishes: [
            { id: 'p9', name: 'Abaro', villages: [{ id: 'v13', name: 'Abaro'}] }
          ]}
        ]
      }
    ]
  },
  {
    id: 'd2', name: 'Lira', counties: [
      { id: 'c3', name: 'Erute County', subcounties: [
        { id: 's4', name: 'Agali', parishes: [
          { id: 'p10', name: 'Agali', villages: [{ id: 'v14', name: 'Banya'}] }
        ]}
      ]}
    ]
  }
];

// --- CORE LOGIC: DATA TRANSFORMATION ---

/**
 * Transforms nested district data into a flat hierarchical table.
 * IMPORTANT: Only creates rows for villages. Parent levels appear once and
 * subsequent rows leave them blank until they change.
 */
const processDataForDisplay = (districts: District[]): TableRow[] => {
  const rows: TableRow[] = [];
  let lastDistrict = '';
  let lastCounty = '';
  let lastSubcounty = '';
  let lastParish = '';

  districts.forEach(district => {
    district.counties.forEach(county => {
      county.subcounties.forEach(subcounty => {
        subcounty.parishes.forEach(parish => {
          // Only create rows for villages
          parish.villages.forEach((village, vIndex) => {
            const isFirstVillageInParish = vIndex === 0;
            const isFirstParishInSubcounty = parish === subcounty.parishes[0] && isFirstVillageInParish;
            const isFirstSubcountyInCounty = subcounty === county.subcounties[0] && isFirstParishInSubcounty;
            const isFirstCountyInDistrict = county === district.counties[0] && isFirstSubcountyInCounty;

            rows.push({
              uid: village.id,
              district: district.name !== lastDistrict ? district.name : '',
              county: county.name !== lastCounty ? county.name : '',
              subcounty: subcounty.name !== lastSubcounty ? subcounty.name : '',
              parish: parish.name !== lastParish ? parish.name : '',
              village: village.name,
              districtId: district.id,
              countyId: county.id,
              subcountyId: subcounty.id,
              parishId: parish.id,
              villageId: village.id,
              level: 'village',
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

// --- EDIT MODAL COMPONENT ---

const EditModal: React.FC<{
  visible: boolean;
  editMode: EditMode | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ visible, editMode, onClose, onSave }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (editMode?.type === 'edit' && editMode.data) {
      setName(editMode.data.name);
    } else {
      setName('');
    }
  }, [editMode]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    onSave({ name: name.trim() });
    setName('');
    onClose();
  };

  const getLevelLabel = () => {
    if (!editMode) return '';
    return editMode.level.charAt(0).toUpperCase() + editMode.level.slice(1);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editMode?.type === 'add' ? 'Add' : 'Edit'} {getLevelLabel()}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.gray[600]} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.inputLabel}>{getLevelLabel()} Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={`Enter ${getLevelLabel().toLowerCase()} name`}
              placeholderTextColor={colors.gray[400]}
              autoFocus
            />
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- TABLE HEADER COMPONENT ---

const TableHeader = () => (
  <View style={styles.tableHeader}>
    <Text style={[styles.headerCell, styles.districtCol]}>District</Text>
    <Text style={[styles.headerCell, styles.countyCol]}>County</Text>
    <Text style={[styles.headerCell, styles.subcountyCol]}>Subcounty / Division</Text>
    <Text style={[styles.headerCell, styles.parishCol]}>Parish / Ward</Text>
    <Text style={[styles.headerCell, styles.villageCol]}>Village / Cell</Text>
    <Text style={[styles.headerCell, styles.actionsCol]}>Actions</Text>
  </View>
);

// --- TABLE ROW COMPONENT ---

const TableRowItem: React.FC<{
  item: TableRow;
  onEdit: (level: string, data: any) => void;
  onDelete: (level: string, data: any) => void;
  onAdd: (level: string, parentData: any) => void;
}> = ({ item, onEdit, onDelete, onAdd }) => {
  
  const renderCellContent = (
    level: 'district' | 'county' | 'subcounty' | 'parish' | 'village',
    value: string,
    data: any
  ) => {
    if (!value) return null;

    return (
      <View style={styles.cellContent}>
        <Text style={styles.cellText} numberOfLines={1}>{value}</Text>
        <View style={styles.cellActions}>
          <TouchableOpacity
            style={styles.cellActionBtn}
            onPress={() => onEdit(level, data)}
          >
            <MaterialIcons name="edit" size={16} color={colors.primary[500]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cellActionBtn}
            onPress={() => onDelete(level, data)}
          >
            <MaterialIcons name="delete" size={16} color={colors.danger[500]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cellActionBtn}
            onPress={() => onAdd(level, data)}
          >
            <MaterialIcons name="add-circle" size={16} color={colors.success[500]} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.tableRow}>
      <View style={[styles.tableCell, styles.districtCol]}>
        {renderCellContent('district', item.district, {
          id: item.districtId,
          name: item.district
        })}
      </View>
      <View style={[styles.tableCell, styles.countyCol]}>
        {renderCellContent('county', item.county, {
          id: item.countyId,
          name: item.county,
          districtId: item.districtId
        })}
      </View>
      <View style={[styles.tableCell, styles.subcountyCol]}>
        {renderCellContent('subcounty', item.subcounty, {
          id: item.subcountyId,
          name: item.subcounty,
          countyId: item.countyId
        })}
      </View>
      <View style={[styles.tableCell, styles.parishCol]}>
        {renderCellContent('parish', item.parish, {
          id: item.parishId,
          name: item.parish,
          subcountyId: item.subcountyId
        })}
      </View>
      <View style={[styles.tableCell, styles.villageCol]}>
        {renderCellContent('village', item.village, {
          id: item.villageId,
          name: item.village,
          parishId: item.parishId
        })}
      </View>
      <View style={[styles.tableCell, styles.actionsCol]}>
        {/* Reserved for row-level actions if needed */}
      </View>
    </View>
  );
};

// --- MAIN SCREEN COMPONENT ---

const AdminDashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [editMode, setEditMode] = useState<EditMode | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setDistricts(INITIAL_MOCK_DATA);
      } catch (e) {
        console.error(e);
        setError('Failed to fetch location data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const tableRows = useMemo(() => processDataForDisplay(districts), [districts]);

  // --- CRUD HANDLERS ---

  const handleEdit = useCallback((level: string, data: any) => {
    setEditMode({
      type: 'edit',
      level: level as any,
      data: data
    });
    setShowModal(true);
  }, []);

  const handleDelete = useCallback((level: string, data: any) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete this ${level}? This will also delete all child units.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDistricts(prevDistricts => {
              const newDistricts = JSON.parse(JSON.stringify(prevDistricts));
              
              if (level === 'district') {
                return newDistricts.filter((d: District) => d.id !== data.id);
              }
              
              if (level === 'county') {
                return newDistricts.map((d: District) => ({
                  ...d,
                  counties: d.counties.filter((c: County) => c.id !== data.id)
                }));
              }
              
              if (level === 'subcounty') {
                return newDistricts.map((d: District) => ({
                  ...d,
                  counties: d.counties.map((c: County) => ({
                    ...c,
                    subcounties: c.subcounties.filter((s: Subcounty) => s.id !== data.id)
                  }))
                }));
              }
              
              if (level === 'parish') {
                return newDistricts.map((d: District) => ({
                  ...d,
                  counties: d.counties.map((c: County) => ({
                    ...c,
                    subcounties: c.subcounties.map((s: Subcounty) => ({
                      ...s,
                      parishes: s.parishes.filter((p: Parish) => p.id !== data.id)
                    }))
                  }))
                }));
              }
              
              if (level === 'village') {
                return newDistricts.map((d: District) => ({
                  ...d,
                  counties: d.counties.map((c: County) => ({
                    ...c,
                    subcounties: c.subcounties.map((s: Subcounty) => ({
                      ...s,
                      parishes: s.parishes.map((p: Parish) => ({
                        ...p,
                        villages: p.villages.filter((v: Village) => v.id !== data.id)
                      }))
                    }))
                  }))
                }));
              }
              
              return newDistricts;
            });
          }
        }
      ]
    );
  }, []);

  const handleAdd = useCallback((parentLevel: string, parentData: any) => {
    const levelOrder = ['district', 'county', 'subcounty', 'parish', 'village'];
    const parentIndex = levelOrder.indexOf(parentLevel);
    const childLevel = levelOrder[parentIndex + 1];

    if (!childLevel) {
      Alert.alert('Info', 'Cannot add child to village level');
      return;
    }

    setEditMode({
      type: 'add',
      level: childLevel as any,
      parentData: parentData
    });
    setShowModal(true);
  }, []);

  const generateId = (prefix: string) => {
    return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSave = useCallback((formData: any) => {
    if (!editMode) return;

    if (editMode.type === 'add') {
      // Adding new item
      setDistricts(prevDistricts => {
        const newDistricts = JSON.parse(JSON.stringify(prevDistricts));
        
        if (editMode.level === 'district') {
          const newDistrict: District = {
            id: generateId('d'),
            name: formData.name,
            counties: []
          };
          return [...newDistricts, newDistrict];
        }
        
        if (editMode.level === 'county') {
          return newDistricts.map((d: District) => {
            if (d.id === editMode.parentData.id) {
              const newCounty: County = {
                id: generateId('c'),
                name: formData.name,
                subcounties: []
              };
              return { ...d, counties: [...d.counties, newCounty] };
            }
            return d;
          });
        }
        
        if (editMode.level === 'subcounty') {
          return newDistricts.map((d: District) => ({
            ...d,
            counties: d.counties.map((c: County) => {
              if (c.id === editMode.parentData.id) {
                const newSubcounty: Subcounty = {
                  id: generateId('s'),
                  name: formData.name,
                  parishes: []
                };
                return { ...c, subcounties: [...c.subcounties, newSubcounty] };
              }
              return c;
            })
          }));
        }
        
        if (editMode.level === 'parish') {
          return newDistricts.map((d: District) => ({
            ...d,
            counties: d.counties.map((c: County) => ({
              ...c,
              subcounties: c.subcounties.map((s: Subcounty) => {
                if (s.id === editMode.parentData.id) {
                  const newParish: Parish = {
                    id: generateId('p'),
                    name: formData.name,
                    villages: []
                  };
                  return { ...s, parishes: [...s.parishes, newParish] };
                }
                return s;
              })
            }))
          }));
        }
        
        if (editMode.level === 'village') {
          return newDistricts.map((d: District) => ({
            ...d,
            counties: d.counties.map((c: County) => ({
              ...c,
              subcounties: c.subcounties.map((s: Subcounty) => ({
                ...s,
                parishes: s.parishes.map((p: Parish) => {
                  if (p.id === editMode.parentData.id) {
                    const newVillage: Village = {
                      id: generateId('v'),
                      name: formData.name
                    };
                    return { ...p, villages: [...p.villages, newVillage] };
                  }
                  return p;
                })
              }))
            }))
          }));
        }
        
        return newDistricts;
      });
    } else {
      // Editing existing item
      setDistricts(prevDistricts => {
        const newDistricts = JSON.parse(JSON.stringify(prevDistricts));
        
        if (editMode.level === 'district') {
          return newDistricts.map((d: District) => 
            d.id === editMode.data.id ? { ...d, name: formData.name } : d
          );
        }
        
        if (editMode.level === 'county') {
          return newDistricts.map((d: District) => ({
            ...d,
            counties: d.counties.map((c: County) => 
              c.id === editMode.data.id ? { ...c, name: formData.name } : c
            )
          }));
        }
        
        if (editMode.level === 'subcounty') {
          return newDistricts.map((d: District) => ({
            ...d,
            counties: d.counties.map((c: County) => ({
              ...c,
              subcounties: c.subcounties.map((s: Subcounty) => 
                s.id === editMode.data.id ? { ...s, name: formData.name } : s
              )
            }))
          }));
        }
        
        if (editMode.level === 'parish') {
          return newDistricts.map((d: District) => ({
            ...d,
            counties: d.counties.map((c: County) => ({
              ...c,
              subcounties: c.subcounties.map((s: Subcounty) => ({
                ...s,
                parishes: s.parishes.map((p: Parish) => 
                  p.id === editMode.data.id ? { ...p, name: formData.name } : p
                )
              }))
            }))
          }));
        }
        
        if (editMode.level === 'village') {
          return newDistricts.map((d: District) => ({
            ...d,
            counties: d.counties.map((c: County) => ({
              ...c,
              subcounties: c.subcounties.map((s: Subcounty) => ({
                ...s,
                parishes: s.parishes.map((p: Parish) => ({
                  ...p,
                  villages: p.villages.map((v: Village) => 
                    v.id === editMode.data.id ? { ...v, name: formData.name } : v
                  )
                }))
              }))
            }))
          }));
        }
        
        return newDistricts;
      });
    }
  }, [editMode]);

  const handleAddDistrict = useCallback(() => {
    setEditMode({
      type: 'add',
      level: 'district'
    });
    setShowModal(true);
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Loading administrative data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <MaterialIcons name="error-outline" size={64} color={colors.danger[500]} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setLoading(true);
            setTimeout(() => {
              setDistricts(INITIAL_MOCK_DATA);
              setLoading(false);
            }, 500);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="location-city" size={28} color={colors.primary[500]} />
          </View>
          <View>
            <Text style={styles.title}>Administrative Dashboard</Text>
            <Text style={styles.subtitle}>Uganda Hierarchical Units</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addDistrictButton} onPress={handleAddDistrict}>
          <MaterialIcons name="add" size={20} color={colors.white} />
          <Text style={styles.addDistrictButtonText}>Add District</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{districts.length}</Text>
          <Text style={styles.statLabel}>Districts</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {districts.reduce((sum, d) => sum + d.counties.length, 0)}
          </Text>
          <Text style={styles.statLabel}>Counties</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{tableRows.length}</Text>
          <Text style={styles.statLabel}>Villages</Text>
        </View>
      </View>

      {/* Table */}
      <View style={styles.tableWrapper}>
        <View style={styles.tableContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ minWidth: 1200 }}>
              <TableHeader />
              <ScrollView style={styles.tableScrollView}>
                {tableRows.map((item) => (
                  <TableRowItem
                    key={item.uid}
                    item={item}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAdd={handleAdd}
                  />
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Edit Modal */}
      <EditModal
        visible={showModal}
        editMode={editMode}
        onClose={() => {
          setShowModal(false);
          setEditMode(null);
        }}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
};

// --- STYLES ---

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
  errorText: {
    color: colors.danger[600],
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[600],
    fontWeight: '500',
  },
  addDistrictButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[500],
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(19, 91, 236, 0.3)',
      },
      default: {
        elevation: 3,
      },
    }),
  },
  addDistrictButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },

  // Stats Bar
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      },
      default: {
        elevation: 1,
      },
    }),
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary[600],
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.gray[600],
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.gray[200],
  },

  // Table
  tableWrapper: {
    flex: 1,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      },
      default: {
        elevation: 3,
      },
    }),
  },
  tableScrollView: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.gray[800],
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary[500],
  },
  headerCell: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    backgroundColor: colors.white,
  },
  tableCell: {
    justifyContent: 'center',
  },
  cellContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cellText: {
    fontSize: 14,
    color: colors.gray[800],
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  cellActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cellActionBtn: {
    padding: 6,
    marginLeft: 4,
    borderRadius: 4,
    backgroundColor: colors.gray[50],
  },

  // Column widths
  districtCol: { width: 180 },
  countyCol: { width: 200 },
  subcountyCol: { width: 220 },
  parishCol: { width: 200 },
  villageCol: { width: 200 },
  actionsCol: { width: 100 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    width: '90%',
    maxWidth: 500,
    ...Platform.select({
      web: {
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      },
      default: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.gray[900],
    backgroundColor: colors.gray[50],
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: colors.gray[100],
  },
  cancelButtonText: {
    color: colors.gray[700],
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: colors.primary[500],
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default AdminDashboardScreen;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
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

interface TableRow {
  uid: string;
  district: string;
  county: string;
  subcounty: string;
  parish: string;
  village: string;
  districtId: string;
  countyId: string;
  subcountyId: string;
  parishId: string;
  villageId: string;
}

type EditMode = {
  type: 'add' | 'edit';
  level: 'district' | 'county' | 'subcounty' | 'parish' | 'village';
  data?: any;
};

// --- STORAGE KEY ---
const STORAGE_KEY = 'uganda_admin_districts';

// --- STORAGE HELPERS ---
const saveToStorage = (data: District[]) => {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }
};

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

// --- DATA TRANSFORMATION ---
const processDataForDisplay = (districts: District[]): TableRow[] => {
  const rows: TableRow[] = [];
  let lastDistrict = '';
  let lastCounty = '';
  let lastSubcounty = '';
  let lastParish = '';

  districts.forEach(district => {
    // If district has no counties, show it anyway
    if (district.counties.length === 0) {
      rows.push({
        uid: district.id,
        district: district.name,
        county: '',
        subcounty: '',
        parish: '',
        village: '',
        districtId: district.id,
        countyId: '',
        subcountyId: '',
        parishId: '',
        villageId: '',
      });
      lastDistrict = district.name;
      return;
    }

    district.counties.forEach(county => {
      // If county has no subcounties, show it anyway
      if (county.subcounties.length === 0) {
        rows.push({
          uid: `${district.id}-${county.id}`,
          district: district.name !== lastDistrict ? district.name : '',
          county: county.name,
          subcounty: '',
          parish: '',
          village: '',
          districtId: district.id,
          countyId: county.id,
          subcountyId: '',
          parishId: '',
          villageId: '',
        });
        lastDistrict = district.name;
        lastCounty = county.name;
        return;
      }

      county.subcounties.forEach(subcounty => {
        // If subcounty has no parishes, show it anyway
        if (subcounty.parishes.length === 0) {
          rows.push({
            uid: `${district.id}-${county.id}-${subcounty.id}`,
            district: district.name !== lastDistrict ? district.name : '',
            county: county.name !== lastCounty ? county.name : '',
            subcounty: subcounty.name,
            parish: '',
            village: '',
            districtId: district.id,
            countyId: county.id,
            subcountyId: subcounty.id,
            parishId: '',
            villageId: '',
          });
          lastDistrict = district.name;
          lastCounty = county.name;
          lastSubcounty = subcounty.name;
          return;
        }

        subcounty.parishes.forEach(parish => {
          // If parish has no villages, show it anyway
          if (parish.villages.length === 0) {
            rows.push({
              uid: `${district.id}-${county.id}-${subcounty.id}-${parish.id}`,
              district: district.name !== lastDistrict ? district.name : '',
              county: county.name !== lastCounty ? county.name : '',
              subcounty: subcounty.name !== lastSubcounty ? subcounty.name : '',
              parish: parish.name,
              village: '',
              districtId: district.id,
              countyId: county.id,
              subcountyId: subcounty.id,
              parishId: parish.id,
              villageId: '',
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
              districtId: district.id,
              countyId: county.id,
              subcountyId: subcounty.id,
              parishId: parish.id,
              villageId: village.id,
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

// --- ADD/EDIT MODAL ---
const AddEditModal: React.FC<{
  visible: boolean;
  editMode: EditMode | null;
  districts: District[];
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ visible, editMode, districts, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedCountyId, setSelectedCountyId] = useState('');
  const [selectedSubcountyId, setSelectedSubcountyId] = useState('');
  const [selectedParishId, setSelectedParishId] = useState('');

  useEffect(() => {
    if (editMode?.type === 'edit' && editMode.data) {
      setName(editMode.data.name);
    } else {
      setName('');
      setSelectedDistrictId('');
      setSelectedCountyId('');
      setSelectedSubcountyId('');
      setSelectedParishId('');
    }
  }, [editMode]);

  const showAlert = (message: string) => {
    if (Platform.OS === 'web') {
      // @ts-ignore - window is available on web
      window.alert(message);
    } else {
      Alert.alert('Error', message);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      showAlert('Please enter a name');
      return;
    }

    // Validate parent selections based on level
    if (editMode?.type === 'add') {
      if (editMode.level === 'county' && !selectedDistrictId) {
        showAlert('Please select a district');
        return;
      }
      if (editMode.level === 'subcounty' && (!selectedDistrictId || !selectedCountyId)) {
        showAlert('Please select both district and county');
        return;
      }
      if (editMode.level === 'parish' && (!selectedDistrictId || !selectedCountyId || !selectedSubcountyId)) {
        showAlert('Please select district, county, and subcounty');
        return;
      }
      if (editMode.level === 'village' && (!selectedDistrictId || !selectedCountyId || !selectedSubcountyId || !selectedParishId)) {
        showAlert('Please select district, county, subcounty, and parish');
        return;
      }
    }

    const parentIds: any = {};
    if (editMode?.level === 'county') parentIds.districtId = selectedDistrictId;
    if (editMode?.level === 'subcounty') {
      parentIds.districtId = selectedDistrictId;
      parentIds.countyId = selectedCountyId;
    }
    if (editMode?.level === 'parish') {
      parentIds.districtId = selectedDistrictId;
      parentIds.countyId = selectedCountyId;
      parentIds.subcountyId = selectedSubcountyId;
    }
    if (editMode?.level === 'village') {
      parentIds.districtId = selectedDistrictId;
      parentIds.countyId = selectedCountyId;
      parentIds.subcountyId = selectedSubcountyId;
      parentIds.parishId = selectedParishId;
    }

    onSave({ name: name.trim(), ...parentIds });
  };

  const getLevelLabel = () => {
    if (!editMode) return '';
    return editMode.level.charAt(0).toUpperCase() + editMode.level.slice(1);
  };

  const getCounties = () => {
    const district = districts.find(d => d.id === selectedDistrictId);
    return district?.counties || [];
  };

  const getSubcounties = () => {
    const district = districts.find(d => d.id === selectedDistrictId);
    const county = district?.counties.find(c => c.id === selectedCountyId);
    return county?.subcounties || [];
  };

  const getParishes = () => {
    const district = districts.find(d => d.id === selectedDistrictId);
    const county = district?.counties.find(c => c.id === selectedCountyId);
    const subcounty = county?.subcounties.find(s => s.id === selectedSubcountyId);
    return subcounty?.parishes || [];
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editMode?.type === 'add' ? 'Add New' : 'Edit'} {getLevelLabel()}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.gray[600]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Parent Selections for Add Mode */}
            {editMode?.type === 'add' && (
              <>
                {editMode.level !== 'district' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Select District *</Text>
                    <View style={styles.pickerContainer}>
                      <ScrollView style={styles.picker} nestedScrollEnabled>
                        {districts.map(d => (
                          <TouchableOpacity
                            key={d.id}
                            style={[styles.pickerItem, selectedDistrictId === d.id && styles.pickerItemSelected]}
                            onPress={() => {
                              setSelectedDistrictId(d.id);
                              // Reset dependent selections
                              setSelectedCountyId('');
                              setSelectedSubcountyId('');
                              setSelectedParishId('');
                            }}
                          >
                            <Text style={[styles.pickerText, selectedDistrictId === d.id && styles.pickerTextSelected]}>
                              {d.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                )}

                {(editMode.level === 'subcounty' || editMode.level === 'parish' || editMode.level === 'village') && selectedDistrictId && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Select County *</Text>
                    <View style={styles.pickerContainer}>
                      <ScrollView style={styles.picker} nestedScrollEnabled>
                        {getCounties().map(c => (
                          <TouchableOpacity
                            key={c.id}
                            style={[styles.pickerItem, selectedCountyId === c.id && styles.pickerItemSelected]}
                            onPress={() => {
                              setSelectedCountyId(c.id);
                              // Reset dependent selections
                              setSelectedSubcountyId('');
                              setSelectedParishId('');
                            }}
                          >
                            <Text style={[styles.pickerText, selectedCountyId === c.id && styles.pickerTextSelected]}>
                              {c.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                )}

                {(editMode.level === 'parish' || editMode.level === 'village') && selectedCountyId && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Select Subcounty *</Text>
                    <View style={styles.pickerContainer}>
                      <ScrollView style={styles.picker} nestedScrollEnabled>
                        {getSubcounties().map(s => (
                          <TouchableOpacity
                            key={s.id}
                            style={[styles.pickerItem, selectedSubcountyId === s.id && styles.pickerItemSelected]}
                            onPress={() => {
                              setSelectedSubcountyId(s.id);
                              // Reset dependent selection
                              setSelectedParishId('');
                            }}
                          >
                            <Text style={[styles.pickerText, selectedSubcountyId === s.id && styles.pickerTextSelected]}>
                              {s.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                )}

                {editMode.level === 'village' && selectedSubcountyId && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Select Parish *</Text>
                    <View style={styles.pickerContainer}>
                      <ScrollView style={styles.picker} nestedScrollEnabled>
                        {getParishes().map(p => (
                          <TouchableOpacity
                            key={p.id}
                            style={[styles.pickerItem, selectedParishId === p.id && styles.pickerItemSelected]}
                            onPress={() => setSelectedParishId(p.id)}
                          >
                            <Text style={[styles.pickerText, selectedParishId === p.id && styles.pickerTextSelected]}>
                              {p.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                )}
              </>
            )}

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{getLevelLabel()} Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder={`Enter ${getLevelLabel().toLowerCase()} name`}
                placeholderTextColor={colors.gray[400]}
                autoFocus={editMode?.type === 'edit'}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <MaterialIcons name="check" size={18} color={colors.white} />
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- TABLE COMPONENTS ---
const TableHeader: React.FC<{
  onAddDistrict: () => void;
  onAddCounty: () => void;
  onAddSubcounty: () => void;
  onAddParish: () => void;
  onAddVillage: () => void;
}> = ({ onAddDistrict, onAddCounty, onAddSubcounty, onAddParish, onAddVillage }) => (
  <View style={styles.tableHeader}>
    <View style={[styles.headerCell, styles.districtCol]}>
      <Text style={styles.headerCellText}>District</Text>
      <TouchableOpacity style={styles.headerAddBtn} onPress={onAddDistrict}>
        <MaterialIcons name="add-circle" size={20} color={colors.white} />
      </TouchableOpacity>
    </View>
    <View style={[styles.headerCell, styles.countyCol]}>
      <Text style={styles.headerCellText}>County</Text>
      <TouchableOpacity style={styles.headerAddBtn} onPress={onAddCounty}>
        <MaterialIcons name="add-circle" size={20} color={colors.white} />
      </TouchableOpacity>
    </View>
    <View style={[styles.headerCell, styles.subcountyCol]}>
      <Text style={styles.headerCellText}>Subcounty / Division</Text>
      <TouchableOpacity style={styles.headerAddBtn} onPress={onAddSubcounty}>
        <MaterialIcons name="add-circle" size={20} color={colors.white} />
      </TouchableOpacity>
    </View>
    <View style={[styles.headerCell, styles.parishCol]}>
      <Text style={styles.headerCellText}>Parish / Ward</Text>
      <TouchableOpacity style={styles.headerAddBtn} onPress={onAddParish}>
        <MaterialIcons name="add-circle" size={20} color={colors.white} />
      </TouchableOpacity>
    </View>
    <View style={[styles.headerCell, styles.villageCol]}>
      <Text style={styles.headerCellText}>Village / Cell</Text>
      <TouchableOpacity style={styles.headerAddBtn} onPress={onAddVillage}>
        <MaterialIcons name="add-circle" size={20} color={colors.white} />
      </TouchableOpacity>
    </View>
  </View>
);

const TableRowItem: React.FC<{
  item: TableRow;
  index: number;
  onEdit: (level: string, data: any) => void;
  onDelete: (level: string, data: any) => void;
}> = ({ item, index, onEdit, onDelete }) => {
  
  const renderCell = (level: string, value: string, data: any, isLastColumn: boolean = false) => {
    if (!value) return <View style={[styles.tableCell, isLastColumn && { borderRightWidth: 0 }]} />;

    // Only show edit/delete if the item has a valid ID
    const hasValidId = data.id && data.id !== '';

    return (
      <View style={[styles.tableCell, isLastColumn && { borderRightWidth: 0 }]}>
        <Text style={styles.cellText} numberOfLines={2}>{value}</Text>
        {hasValidId && (
          <View style={styles.cellActions}>
            <TouchableOpacity style={styles.cellActionBtn} onPress={() => onEdit(level, data)}>
              <MaterialIcons name="edit" size={16} color={colors.primary[600]} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cellActionBtn} onPress={() => onDelete(level, data)}>
              <MaterialIcons name="delete" size={16} color={colors.danger[600]} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.tableRow, index % 2 === 1 && { backgroundColor: colors.gray[50] }]}>
      <View style={styles.districtCol}>
        {renderCell('district', item.district, { 
          id: item.districtId, 
          name: item.district,
          districtId: item.districtId
        })}
      </View>
      <View style={styles.countyCol}>
        {renderCell('county', item.county, { 
          id: item.countyId, 
          name: item.county,
          districtId: item.districtId,
          countyId: item.countyId
        })}
      </View>
      <View style={styles.subcountyCol}>
        {renderCell('subcounty', item.subcounty, { 
          id: item.subcountyId, 
          name: item.subcounty,
          districtId: item.districtId,
          countyId: item.countyId,
          subcountyId: item.subcountyId
        })}
      </View>
      <View style={styles.parishCol}>
        {renderCell('parish', item.parish, { 
          id: item.parishId, 
          name: item.parish,
          districtId: item.districtId,
          countyId: item.countyId,
          subcountyId: item.subcountyId,
          parishId: item.parishId
        })}
      </View>
      <View style={styles.villageCol}>
        {renderCell('village', item.village, { 
          id: item.villageId, 
          name: item.village,
          districtId: item.districtId,
          countyId: item.countyId,
          subcountyId: item.subcountyId,
          parishId: item.parishId,
          villageId: item.villageId
        }, true)}
      </View>
    </View>
  );
};

// --- MAIN SCREEN ---
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
        await new Promise(resolve => setTimeout(resolve, 300));
        const storedData = loadFromStorage();
        setDistricts(storedData);
      } catch (e) {
        console.error(e);
        setError('Failed to load location data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Save to storage whenever districts change
  useEffect(() => {
    if (!loading) {
      saveToStorage(districts);
    }
  }, [districts, loading]);

  const tableRows = useMemo(() => processDataForDisplay(districts), [districts]);

  const generateId = (prefix: string) => `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 5)}`;

  // CRUD Handlers
  const handleAdd = useCallback((level: 'district' | 'county' | 'subcounty' | 'parish' | 'village') => {
    setEditMode({ type: 'add', level });
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((level: string, data: any) => {
    setEditMode({ type: 'edit', level: level as any, data });
    setShowModal(true);
  }, []);

  const handleDelete = useCallback((level: string, data: any) => {
    const performDelete = () => {
      setDistricts(prevDistricts => {
        let newDistricts = JSON.parse(JSON.stringify(prevDistricts)) as District[];
        
        if (level === 'district') {
          newDistricts = newDistricts.filter((d: District) => d.id !== data.districtId);
        }
        else if (level === 'county') {
          newDistricts = newDistricts.map((d: District) => {
            if (d.id === data.districtId) {
              return {
                ...d,
                counties: d.counties.filter((c: County) => c.id !== data.countyId)
              };
            }
            return d;
          });
        }
        else if (level === 'subcounty') {
          newDistricts = newDistricts.map((d: District) => {
            if (d.id === data.districtId) {
              return {
                ...d,
                counties: d.counties.map((c: County) => {
                  if (c.id === data.countyId) {
                    return {
                      ...c,
                      subcounties: c.subcounties.filter((s: Subcounty) => s.id !== data.subcountyId)
                    };
                  }
                  return c;
                })
              };
            }
            return d;
          });
        }
        else if (level === 'parish') {
          newDistricts = newDistricts.map((d: District) => {
            if (d.id === data.districtId) {
              return {
                ...d,
                counties: d.counties.map((c: County) => {
                  if (c.id === data.countyId) {
                    return {
                      ...c,
                      subcounties: c.subcounties.map((s: Subcounty) => {
                        if (s.id === data.subcountyId) {
                          return {
                            ...s,
                            parishes: s.parishes.filter((p: Parish) => p.id !== data.parishId)
                          };
                        }
                        return s;
                      })
                    };
                  }
                  return c;
                })
              };
            }
            return d;
          });
        }
        else if (level === 'village') {
          newDistricts = newDistricts.map((d: District) => {
            if (d.id === data.districtId) {
              return {
                ...d,
                counties: d.counties.map((c: County) => {
                  if (c.id === data.countyId) {
                    return {
                      ...c,
                      subcounties: c.subcounties.map((s: Subcounty) => {
                        if (s.id === data.subcountyId) {
                          return {
                            ...s,
                            parishes: s.parishes.map((p: Parish) => {
                              if (p.id === data.parishId) {
                                return {
                                  ...p,
                                  villages: p.villages.filter((v: Village) => v.id !== data.villageId)
                                };
                              }
                              return p;
                            })
                          };
                        }
                        return s;
                      })
                    };
                  }
                  return c;
                })
              };
            }
            return d;
          });
        }
        
        return newDistricts;
      });
    };

    if (Platform.OS === 'web') {
      // @ts-ignore - window is available on web
      if (window.confirm(`Delete "${data.name}"? All child units will also be deleted.`)) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Confirm Delete',
        `Delete "${data.name}"? All child units will also be deleted.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete }
        ]
      );
    }
  }, []);

  const handleSave = useCallback((formData: any) => {
    if (!editMode) return;

    if (editMode.type === 'add') {
      setDistricts(prev => {
        const newDistricts = JSON.parse(JSON.stringify(prev));
        
        if (editMode.level === 'district') {
          const newDistrict: District = { id: generateId('d'), name: formData.name, counties: [] };
          return [...newDistricts, newDistrict];
        }
        
        if (editMode.level === 'county') {
          return newDistricts.map((d: District) => {
            if (d.id === formData.districtId) {
              const newCounty: County = { id: generateId('c'), name: formData.name, subcounties: [] };
              return { ...d, counties: [...d.counties, newCounty] };
            }
            return d;
          });
        }
        
        if (editMode.level === 'subcounty') {
          return newDistricts.map((d: District) => ({
            ...d,
            counties: d.counties.map((c: County) => {
              if (c.id === formData.countyId) {
                const newSubcounty: Subcounty = { id: generateId('s'), name: formData.name, parishes: [] };
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
                if (s.id === formData.subcountyId) {
                  const newParish: Parish = { id: generateId('p'), name: formData.name, villages: [] };
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
                  if (p.id === formData.parishId) {
                    const newVillage: Village = { id: generateId('v'), name: formData.name };
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
      setDistricts(prev => {
        const newDistricts = JSON.parse(JSON.stringify(prev));
        
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
    
    setShowModal(false);
    setEditMode(null);
  }, [editMode]);

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
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="location-city" size={28} color={colors.primary[500]} />
          </View>
          <View>
            <Text style={styles.title}>Administrative Dashboard</Text>
            <Text style={styles.subtitle}>Uganda Hierarchical Units • {tableRows.length} Villages</Text>
          </View>
        </View>
      </View>

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
          <Text style={styles.statValue}>
            {districts.reduce((sum, d) => 
              sum + d.counties.reduce((s, c) => s + c.subcounties.length, 0), 0
            )}
          </Text>
          <Text style={styles.statLabel}>Subcounties</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{tableRows.length}</Text>
          <Text style={styles.statLabel}>Villages</Text>
        </View>
      </View>

      <View style={styles.tableWrapper}>
        <View style={styles.tableContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={{ minWidth: 1200 }}>
              <TableHeader
                onAddDistrict={() => handleAdd('district')}
                onAddCounty={() => handleAdd('county')}
                onAddSubcounty={() => handleAdd('subcounty')}
                onAddParish={() => handleAdd('parish')}
                onAddVillage={() => handleAdd('village')}
              />
              <ScrollView style={styles.tableScrollView}>
                {tableRows.map((item, index) => (
                  <TableRowItem
                    key={item.uid}
                    item={item}
                    index={index}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </View>

      <AddEditModal
        visible={showModal}
        editMode={editMode}
        districts={districts}
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
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
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

  tableWrapper: {
    flex: 1,
    marginHorizontal: 32,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.gray[300],
  },
  tableScrollView: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.gray[800],
    paddingVertical: 18,
    borderBottomWidth: 4,
    borderBottomColor: colors.primary[500],
  },
  headerCell: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRightWidth: 2,
    borderRightColor: colors.gray[700],
  },
  headerCellText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerAddBtn: {
    padding: 7,
    borderRadius: 8,
    backgroundColor: colors.success[500],
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: colors.gray[300],
    minHeight: 60,
    backgroundColor: colors.white,
  },
  tableCell: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRightWidth: 2,
    borderRightColor: colors.gray[300],
  },
  cellText: {
    fontSize: 14,
    color: colors.gray[800],
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
    lineHeight: 20,
  },
  cellActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cellActionBtn: {
    padding: 7,
    borderRadius: 6,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.gray[300],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },

  districtCol: { 
    width: 220,
    minWidth: 220,
  },
  countyCol: { 
    width: 240,
    minWidth: 240,
  },
  subcountyCol: { 
    width: 260,
    minWidth: 260,
  },
  parishCol: { 
    width: 240,
    minWidth: 240,
  },
  villageCol: { 
    width: 240,
    minWidth: 240,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
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
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
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
    backgroundColor: colors.white,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    maxHeight: 150,
    backgroundColor: colors.white,
  },
  picker: {
    maxHeight: 150,
  },
  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  pickerItemSelected: {
    backgroundColor: colors.primary[50],
  },
  pickerText: {
    fontSize: 15,
    color: colors.gray[800],
  },
  pickerTextSelected: {
    color: colors.primary[700],
    fontWeight: '600',
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
    flexDirection: 'row',
    alignItems: 'center',
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
    marginLeft: 6,
  },
});

export default AdminDashboardScreen;




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

const LEVEL_LABELS = [
  'District',
  'Constituency',
  'Subcounty/Division',
  'Parish/Ward',
  'Village/Cell',
];

export default function AdminDashboardScreen() {
  const [rows, setRows] = useState([
    { district: '', constituency: '', subcounty: '', parish: '', village: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (idx, field, value) => {
    const newRows = [...rows];
    newRows[idx][field] = value;
    setRows(newRows);
  };

  const handleAddRow = () => {
    setRows([
      ...rows,
      { district: '', constituency: '', subcounty: '', parish: '', village: '' },
    ]);
  };

  const handleRemoveRow = (idx) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      for (const row of rows) {
        // Register district if not already present
        if (row.district) {
          await ugandaApiService.registerDistrict(row.district, LEVEL_LABELS);
        }
        // Register hierarchy for this row
        await ugandaApiService.registerHierarchy({
          district: row.district,
          levels: [
            { level: 'Constituency', items: [row.constituency] },
            { level: 'Subcounty/Division', items: [row.subcounty] },
            { level: 'Parish/Ward', items: [row.parish] },
            { level: 'Village/Cell', items: [row.village] },
          ],
        });
      }
      globalThis.alert('All rows submitted successfully!');
      setRows([
        { district: '', constituency: '', subcounty: '', parish: '', village: '' },
      ]);
    } catch (error) {
      globalThis.alert('Error submitting rows.');
    }
    setSubmitting(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          {LEVEL_LABELS.map((label) => (
            <Text key={label} style={styles.tableHeaderCell}>{label}</Text>
          ))}
          <Text style={styles.tableHeaderCell}></Text>
        </View>
        {rows.map((row, idx) => (
          <View key={idx} style={styles.tableRow}>
            <TextInput
              style={styles.tableCell}
              placeholder="District"
              value={row.district}
              onChangeText={(text) => handleInputChange(idx, 'district', text)}
            />
            <TextInput
              style={styles.tableCell}
              placeholder="Constituency"
              value={row.constituency}
              onChangeText={(text) => handleInputChange(idx, 'constituency', text)}
            />
            <TextInput
              style={styles.tableCell}
              placeholder="Subcounty/Division"
              value={row.subcounty}
              onChangeText={(text) => handleInputChange(idx, 'subcounty', text)}
            />
            <TextInput
              style={styles.tableCell}
              placeholder="Parish/Ward"
              value={row.parish}
              onChangeText={(text) => handleInputChange(idx, 'parish', text)}
            />
            <TextInput
              style={styles.tableCell}
              placeholder="Village/Cell"
              value={row.village}
              onChangeText={(text) => handleInputChange(idx, 'village', text)}
            />
            <TouchableOpacity onPress={() => handleRemoveRow(idx)} style={styles.removeButton}>
              <MaterialIcons name="delete" size={20} color={colors.error || 'red'} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addRowButton} onPress={handleAddRow}>
          <MaterialIcons name="add" size={20} color={colors.primary} />
          <Text style={styles.addRowText}>Add Row</Text>
        </TouchableOpacity>
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 24,
    alignSelf: 'center',
  },
  tableCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    // Web-friendly shadow
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: colors.gray[300],
    marginBottom: 8,
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.gray[800],
    paddingVertical: 8,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tableCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 6,
    padding: 8,
    fontSize: 15,
    marginHorizontal: 2,
    backgroundColor: '#fafbfc',
    textAlign: 'center',
  },
  removeButton: {
    marginLeft: 4,
    padding: 4,
  },
  addRowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
    marginBottom: 16,
  },
  addRowText: {
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

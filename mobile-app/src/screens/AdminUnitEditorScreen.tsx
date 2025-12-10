import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fontSizes } from '../theme';
import { StyledScrollView } from '../../components/StyledScrollView';

interface AdminUnitEditorScreenProps {
  navigation: any;
  route: any;
}

export default function AdminUnitEditorScreen({
  navigation,
  route,
}: AdminUnitEditorScreenProps) {
  const unit = route.params?.unit || {};

  const [unitId] = useState(unit.code || '345');
  const [unitName, setUnitName] = useState(unit.name || 'Central Province');
  const [parentId, setParentId] = useState('1');
  const [levelType, setLevelType] = useState(unit.type || 'Province');
  const [showLevelPicker, setShowLevelPicker] = useState(false);

  const levelTypes = ['Country', 'Province', 'District', 'City', 'Sub-county', 'Parish', 'Village'];

  const handleSave = () => {
    // TODO: Implement save logic
    console.log('Save unit', { unitId, unitName, parentId, levelType });
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleViewHistory = () => {
    navigation.navigate('VersionHistory', { unit: { id: unitId, name: unitName } });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <MaterialIcons name="arrow-back-ios" size={20} color={colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Unit</Text>
        <View style={{ width: 64 }} />
      </View>

      {/* Form */}
      <StyledScrollView contentContainerStyle={styles.content}>
        {/* Unit ID (Read-only) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Unit ID</Text>
          <TextInput
            style={[styles.input, styles.inputReadonly]}
            value={unitId}
            editable={false}
          />
        </View>

        {/* Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter unit name"
            placeholderTextColor={colors.gray[400]}
            value={unitName}
            onChangeText={setUnitName}
          />
        </View>

        {/* Parent ID */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Parent ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter parent ID"
            placeholderTextColor={colors.gray[400]}
            value={parentId}
            onChangeText={setParentId}
            keyboardType="number-pad"
          />
        </View>

        {/* Level Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Level Type</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowLevelPicker(!showLevelPicker)}
          >
            <Text style={styles.selectButtonText}>{levelType}</Text>
            <MaterialIcons name="expand-more" size={24} color={colors.gray[500]} />
          </TouchableOpacity>

          {/* Level Type Picker */}
          {showLevelPicker && (
            <View style={styles.picker}>
              {levelTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.pickerItem,
                    type === levelType && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    setLevelType(type);
                    setShowLevelPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      type === levelType && styles.pickerItemTextSelected,
                    ]}
                  >
                    {type}
                  </Text>
                  {type === levelType && (
                    <MaterialIcons name="check" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* View History Button */}
        <TouchableOpacity style={styles.historyButton} onPress={handleViewHistory}>
          <MaterialIcons name="history" size={20} color={colors.primary} />
          <Text style={styles.historyButtonText}>View Version History</Text>
        </TouchableOpacity>
      </StyledScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    fontSize: fontSizes.base,
    color: colors.primary,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.gray[900],
  },
  content: {
    padding: 24,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.gray[700],
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    fontSize: fontSizes.base,
    color: colors.gray[900],
  },
  inputReadonly: {
    backgroundColor: colors.gray[100],
    color: colors.gray[500],
  },
  selectButton: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
  },
  selectButtonText: {
    fontSize: fontSizes.base,
    color: colors.gray[900],
  },
  picker: {
    marginTop: 8,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    overflow: 'hidden',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  pickerItemSelected: {
    backgroundColor: colors.primary + '0D', // 5% opacity
  },
  pickerItemText: {
    fontSize: fontSizes.base,
    color: colors.gray[700],
  },
  pickerItemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  historyButtonText: {
    fontSize: fontSizes.base,
    fontWeight: '500',
    color: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cancelButton: {
    flex: 1,
    height: 56,
    backgroundColor: colors.gray[200],
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: fontSizes.base,
    fontWeight: '700',
    color: colors.gray[800],
    letterSpacing: 0.5,
  },
  saveButton: {
    flex: 1,
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: fontSizes.base,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
});

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  SectionList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme';
import { COUNTRIES, CONTINENTS, Country } from '../data/countries';
import { getScrollbarProps } from '../theme/scrollbar';
interface CountryListScreenProps {
  navigation: any;
}
  // Removed stray closing brace

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fafbfc',
    marginBottom: 12,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  adminButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 6,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[700],
    marginTop: 18,
    marginBottom: 6,
    marginLeft: 8,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 8,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  flag: {
    width: 40,
    height: 28,
    borderRadius: 4,
    marginRight: 12,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[900],
  },
  countryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  countryCode: {
    fontSize: 13,
    color: colors.gray[500],
    marginRight: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
  configBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.success.light,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  notConfiguredBadge: {
    backgroundColor: colors.gray[100],
  },
  configText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.success.DEFAULT,
  },
  notConfiguredText: {
    color: colors.gray[600],
  },
});

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

interface Country {
  id: string;
  name: string;
  code: string;
  flagUrl: string;
}

interface CountryListScreenProps {
  navigation: any;
}

export default function CountryListScreen({ navigation }: CountryListScreenProps) {
  const [countries] = useState<Country[]>([
    {
      id: 'UG',
      name: 'Uganda',
      code: 'UGA',
      flagUrl: 'https://flagcdn.com/w80/ug.png',
    },
  ]);

  const handleCountryPress = (country: Country) => {
    navigation.navigate('AdminLevels', { country });
  };

  const handleSearchPress = () => {
    navigation.navigate('LocationSearch');
  };

  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => handleCountryPress(item)}
    >
      <Image source={{ uri: item.flagUrl }} style={styles.flag} />
      <View style={styles.countryInfo}>
        <Text style={styles.countryName}>{item.name}</Text>
        <Text style={styles.countryCode}>{item.code}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={colors.gray[400]} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={colors.gray[800]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Countries</Text>
        <TouchableOpacity style={styles.iconButton} onPress={handleSearchPress}>
          <MaterialIcons name="search" size={24} color={colors.gray[800]} />
        </TouchableOpacity>
      </View>

      {/* Country List */}
      <FlatList
        data={countries}
        renderItem={renderCountryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    height: 64,
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
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.gray[900],
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  flag: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: fontSizes.base,
    fontWeight: '500',
    color: colors.gray[900],
    marginBottom: 4,
  },
  countryCode: {
    fontSize: fontSizes.sm,
    color: colors.gray[500],
  },
  separator: {
    height: 1,
    backgroundColor: colors.gray[200],
  },
});

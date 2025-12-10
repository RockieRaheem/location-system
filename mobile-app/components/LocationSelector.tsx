import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import ug from "ug-locations";

export default function LocationSelector({ onSelect }: any) {
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [subcounties, setSubcounties] = useState<string[]>([]);
  const [selectedSubcounty, setSelectedSubcounty] = useState<string | null>(null);
  const [parishes, setParishes] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setDistricts(ug.getDistricts());
  }, []);

  useEffect(() => {
    if (!selectedDistrict) return;
    setSubcounties(ug.getSubcountiesInDistrict(selectedDistrict));
  }, [selectedDistrict]);

  useEffect(() => {
    if (!selectedDistrict || !selectedSubcounty) return;
    setParishes(ug.getParishesInSubcounty(selectedDistrict, selectedSubcounty));
  }, [selectedDistrict, selectedSubcounty]);

  const searchResults = search ? ug.search(search, { limit: 20 }) : [];

  const onVillageSelected = (village: string) => {
    const location = ug.getLocationByVillage(village);
    onSelect && onSelect(location);
  };

  return (
    <View style={{ padding: 12 }}>
      <Text>District</Text>
      <FlatList
        data={districts}
        keyExtractor={(i) => i}
        horizontal
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedDistrict(item)}>
            <Text style={{ margin: 6, fontWeight: item === selectedDistrict ? "bold" : "normal" }}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <Text>Subcounty</Text>
      <FlatList
        data={subcounties}
        keyExtractor={(i) => i}
        horizontal
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedSubcounty(item)}>
            <Text style={{ margin: 6, fontWeight: item === selectedSubcounty ? "bold" : "normal" }}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <Text>Search (fast local)</Text>
      <TextInput value={search} onChangeText={setSearch} placeholder="Search village, parish, etc." style={{borderWidth:1,padding:6,marginVertical:8}} />

      {search ? (
        <FlatList
          data={searchResults}
          keyExtractor={(it, idx) => `${it.village}-${idx}`}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => onVillageSelected(item.village)}>
              <Text>{item.village} — {item.parish} — {item.subcounty} — {item.district}</Text>
            </TouchableOpacity>
          )}
        />
      ) : null}
    </View>
  );
}

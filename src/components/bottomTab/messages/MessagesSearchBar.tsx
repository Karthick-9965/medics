import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../../constants/Colors';
import SearchBar from '../../common/SearchBar';
import FilterChipsBar from '../../common/FilterChipsBar';

export type MessageFilter = 'all' | 'doctor' | 'clinic' | 'pharmacy';

interface MessagesSearchBarProps {
  searchQuery: string;
  onChangeSearchQuery: (text: string) => void;
  activeFilter: MessageFilter;
  onSelectFilter: (filter: MessageFilter) => void;
}

const FILTERS: { key: MessageFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'doctor', label: 'Doctors' },
  { key: 'clinic', label: 'Clinics' },
  { key: 'pharmacy', label: 'Pharmacies' },
];

/**
 * Message tab search bar combining unified SearchBar and message category filters.
 */
export default function MessagesSearchBar({
  searchQuery,
  onChangeSearchQuery,
  activeFilter,
  onSelectFilter,
}: MessagesSearchBarProps) {
  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={onChangeSearchQuery}
        placeholder="Search doctor, message..."
        containerStyle={styles.searchBarWrapper}
      />

      {/* Filter Pills */}
      <FilterChipsBar
        options={FILTERS}
        selected={activeFilter}
        onSelect={(key) => onSelectFilter(key as MessageFilter)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  searchBarWrapper: {
    marginBottom: 12,
  },
});

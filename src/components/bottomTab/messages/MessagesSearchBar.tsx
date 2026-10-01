import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../../constants/Colors';
import SearchBar from '../../common/SearchBar';

export type MessageFilter = 'all' | 'doctor' | 'clinic';

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
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterPill, isActive && styles.filterPillActive]}
              onPress={() => onSelectFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
  filterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  filterPillTextActive: {
    color: Colors.white,
  },
});

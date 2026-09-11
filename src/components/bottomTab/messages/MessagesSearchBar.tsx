import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';

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

export default function MessagesSearchBar({
  searchQuery,
  onChangeSearchQuery,
  activeFilter,
  onSelectFilter,
}: MessagesSearchBarProps) {
  return (
    <View style={styles.container}>
      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color={Colors.inputIcon}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search doctor, message..."
          placeholderTextColor={Colors.inputPlaceholder}
          value={searchQuery}
          onChangeText={onChangeSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onChangeSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={Colors.secondary} />
          </TouchableOpacity>
        )}
      </View>

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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
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
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondary,
  },
  filterPillTextActive: {
    color: Colors.white,
  },
});

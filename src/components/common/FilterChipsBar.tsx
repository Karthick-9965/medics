import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../../constants/Colors';

export interface FilterOption {
  key: string;
  label: string;
  count?: number;
}

export interface FilterChipsBarProps {
  options: (string | FilterOption)[];
  selected: string;
  onSelect: (key: string) => void;
  containerStyle?: any;
}

/**
 * Reusable horizontal scrollable filter chips bar.
 * Used for filtering lists like specialists, medicines, search categories, etc.
 */
export default function FilterChipsBar({
  options,
  selected,
  onSelect,
  containerStyle,
}: FilterChipsBarProps) {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {options.map((option) => {
          const key = typeof option === 'string' ? option : option.key;
          const label = typeof option === 'string' ? option : option.label;
          const count = typeof option === 'string' ? undefined : option.count;
          const isSelected = selected === key;

          return (
            <TouchableOpacity
              key={key}
              style={[styles.chip, isSelected && styles.chipActive]}
              onPress={() => onSelect(key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {label}
                {count !== undefined ? ` (${count})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: Colors.cardBgSecondary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
  },
  chipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
});

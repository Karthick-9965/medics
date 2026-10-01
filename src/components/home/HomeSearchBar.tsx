import React from 'react';
import { StyleSheet, View } from 'react-native';
import SearchBar, { SearchBarProps } from '../common/SearchBar';

export type HomeSearchBarProps = SearchBarProps;

/**
 * Home screen search bar wrapper that applies home screen layout margins.
 * Reuses the unified SearchBar component.
 */
export default function HomeSearchBar(props: HomeSearchBarProps) {
  return (
    <View style={styles.wrapper}>
      <SearchBar
        placeholder="Search doctor, drugs, articles..."
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
});

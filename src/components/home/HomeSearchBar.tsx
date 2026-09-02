import React, { useState } from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface HomeSearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
}

export default function HomeSearchBar({
  value,
  onChangeText,
  placeholder = 'Search doctor, drugs, articles...',
}: HomeSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, isFocused && styles.containerFocused]}>
        <Ionicons
          name="search-outline"
          size={20}
          color={isFocused ? Colors.primary : Colors.inputPlaceholder}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.inputPlaceholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          caretHidden={!isFocused}
          cursorColor={isFocused ? Colors.primary : 'transparent'}
          selectionColor={isFocused ? Colors.primary : 'transparent'}
          autoFocus={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 16,
  },
  containerFocused: {
    borderColor: Colors.primary,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.black,
    height: '100%',
  },
});

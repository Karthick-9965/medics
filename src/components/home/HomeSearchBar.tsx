import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface HomeSearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  onPress?: () => void;
  onSubmitEditing?: () => void;
  onClear?: () => void;
}

export default function HomeSearchBar({
  value,
  onChangeText,
  placeholder = 'Search doctor, drugs, articles...',
  onPress,
  onSubmitEditing,
  onClear,
}: HomeSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  // When used as a navigation trigger (e.g. on Home screen without direct typing)
  if (onPress && !onChangeText) {
    return (
      <View style={styles.wrapper}>
        <TouchableOpacity
          style={styles.container}
          activeOpacity={0.7}
          onPress={onPress}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={Colors.inputPlaceholder}
            style={styles.icon}
          />
          <Text style={styles.placeholderText} numberOfLines={1}>
            {placeholder}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Interactive typing mode
  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, isFocused ? styles.containerFocused : null]}>
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
          onSubmitEditing={onSubmitEditing}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          underlineColorAndroid="transparent"
          blurOnSubmit={false}
        />
        {value && value.length > 0 ? (
          <TouchableOpacity
            onPress={() => {
              if (onClear) onClear();
              else onChangeText?.('');
            }}
            style={styles.clearBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={18} color={Colors.secondary} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
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
  placeholderText: {
    flex: 1,
    fontSize: 14,
    color: Colors.inputPlaceholder,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.black,
    paddingVertical: 0,
    height: '100%',
  },
  clearBtn: {
    padding: 4,
  },
});

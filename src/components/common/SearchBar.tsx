import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  onPress?: () => void;
  onSubmitEditing?: () => void;
  onClear?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  autoFocus?: boolean;
}

/**
 * Fresher-friendly unified Search Bar component.
 * Supports both interactive typing and touch-to-navigate modes.
 */
export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  onPress,
  onSubmitEditing,
  onClear,
  containerStyle,
  autoFocus = false,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Read-only touchable trigger mode
  if (onPress && !onChangeText) {
    return (
      <View style={[styles.wrapper, containerStyle]}>
        <TouchableOpacity
          style={styles.container}
          activeOpacity={0.7}
          onPress={onPress}
        >
          <Ionicons
            name="search-outline"
            size={19}
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

  // Interactive input mode
  return (
    <View style={[styles.wrapper, containerStyle]}>
      <View style={[styles.container, isFocused && styles.containerFocused]}>
        <Ionicons
          name="search-outline"
          size={19}
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
          autoFocus={autoFocus}
          underlineColorAndroid="transparent"
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
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.2,
    borderColor: Colors.border,
    borderRadius: 22,
    height: 48,
    paddingHorizontal: 15,
  },
  containerFocused: {
    borderColor: Colors.primary,
  },
  icon: {
    marginRight: 9,
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
    padding: 2,
  },
});

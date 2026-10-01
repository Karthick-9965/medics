import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  iconName?: keyof typeof Ionicons.glyphMap;
}

/**
 * Reusable top navigation header for screens like Login, SignUp, etc.
 */
export default function ScreenHeader({
  title,
  onBack,
  rightElement,
  iconName = 'chevron-back',
}: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name={iconName} size={24} color={Colors.textDark} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>

      {rightElement ? (
        <View style={styles.rightWrapper}>{rightElement}</View>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: Colors.white,
  },
  backButton: {
    padding: 8,
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 6,
  },
  placeholder: {
    width: 40,
  },
  rightWrapper: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

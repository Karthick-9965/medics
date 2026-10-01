import React from 'react';
import { StyleSheet, View, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export interface DistanceBadgeProps {
  distance: string;
  size?: 'sm' | 'md';
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

/**
 * Fresher-friendly reusable Distance Badge component.
 * Displays a location marker and formatted distance string.
 */
export default function DistanceBadge({
  distance,
  size = 'sm',
  containerStyle,
  textStyle,
  numberOfLines = 1,
}: DistanceBadgeProps) {
  const iconSize = size === 'sm' ? 10 : 13;
  const fontSize = size === 'sm' ? 10 : 12;

  return (
    <View style={[styles.container, containerStyle]}>
      <Ionicons name="location-sharp" size={iconSize} color={Colors.secondary} />
      <Text
        style={[styles.text, { fontSize }, textStyle]}
        numberOfLines={numberOfLines}
      >
        {distance}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2.5,
  },
  text: {
    color: Colors.secondary,
    fontWeight: '500',
  },
});

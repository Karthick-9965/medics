import React from 'react';
import { StyleSheet, View, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export interface RatingBadgeProps {
  rating: string | number;
  variant?: 'teal' | 'gold';
  size?: 'sm' | 'md';
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

/**
 * Fresher-friendly reusable Rating Badge component.
 * Used across Doctor, Hospital, Pharmacy, and Appointment cards.
 */
export default function RatingBadge({
  rating,
  variant = 'teal',
  size = 'sm',
  containerStyle,
  textStyle,
}: RatingBadgeProps) {
  const isTeal = variant === 'teal';
  const iconColor = isTeal ? Colors.primary : Colors.starGold;
  const badgeBg = isTeal ? Colors.accentLight : Colors.warningBgLight;
  const textColor = isTeal ? Colors.primary : Colors.warningDark;

  const iconSize = size === 'sm' ? 10 : 13;
  const fontSize = size === 'sm' ? 10 : 12;

  return (
    <View style={[styles.badge, { backgroundColor: badgeBg }, containerStyle]}>
      <Ionicons name="star" size={iconSize} color={iconColor} />
      <Text style={[styles.text, { color: textColor, fontSize }, textStyle]}>
        {rating}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 5,
    gap: 3,
  },
  text: {
    fontWeight: '700',
  },
});

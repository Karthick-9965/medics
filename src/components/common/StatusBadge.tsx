import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export type BadgeStatusType =
  | 'confirmed'
  | 'completed'
  | 'delivered'
  | 'upcoming'
  | 'in_transit'
  | 'active'
  | 'rescheduled'
  | 'canceled'
  | 'cancelled'
  | 'warning'
  | 'info';

interface StatusBadgeProps {
  status: BadgeStatusType | string;
  label?: string;
  showDot?: boolean;
  style?: ViewStyle;
}

/**
 * Reusable StatusBadge pill component.
 * Standardizes status coloring (Confirmed, Completed, Delivered, Canceled, Active) across cards and lists.
 */
export default function StatusBadge({ status, label, showDot = true, style }: StatusBadgeProps) {
  const normalized = (status || '').toLowerCase();

  let bgColor = Colors.accentLight;
  let textColor = Colors.primary;
  let borderColor = Colors.border;
  let dotColor = Colors.primary;
  let defaultLabel = label || status;

  if (normalized === 'confirmed' || normalized === 'completed' || normalized === 'delivered') {
    bgColor = Colors.successBgLight;
    textColor = Colors.successGreen;
    borderColor = Colors.successBorder;
    dotColor = Colors.successGreen;
    if (!label) defaultLabel = normalized === 'confirmed' ? 'Confirmed' : normalized === 'completed' ? 'Completed' : 'Delivered';
  } else if (normalized === 'canceled' || normalized === 'cancelled') {
    bgColor = Colors.dangerBgLight;
    textColor = Colors.dangerRed;
    borderColor = Colors.dangerBorder;
    dotColor = Colors.dangerRed;
    if (!label) defaultLabel = 'Canceled';
  } else if (normalized === 'in_transit' || normalized === 'out for delivery') {
    bgColor = Colors.infoBlueBg;
    textColor = Colors.infoBlueDark;
    borderColor = Colors.infoBlueLight;
    dotColor = Colors.infoBlueDark;
    if (!label) defaultLabel = 'Out for Delivery';
  } else if (normalized === 'rescheduled') {
    bgColor = Colors.tealBg;
    textColor = Colors.tealDark;
    borderColor = Colors.tealLight;
    dotColor = Colors.tealDark;
    if (!label) defaultLabel = 'Rescheduled';
  } else if (normalized === 'upcoming' || normalized === 'active') {
    bgColor = Colors.accentLight;
    textColor = Colors.primary;
    borderColor = Colors.border;
    dotColor = Colors.primary;
    if (!label) defaultLabel = normalized === 'upcoming' ? 'Upcoming' : 'Active';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgColor, borderColor }, style]}>
      {showDot && <View style={[styles.dot, { backgroundColor: dotColor }]} />}
      <Text style={[styles.text, { color: textColor }]}>{defaultLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  text: {
    fontSize: 11.5,
    fontWeight: '700',
  },
});

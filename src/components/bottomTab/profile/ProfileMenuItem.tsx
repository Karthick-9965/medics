import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';

export interface ProfileMenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  badge?: string;
  onPress: () => void;
  isDestructive?: boolean;
}

export default function ProfileMenuItem({
  icon,
  title,
  subtitle,
  badge,
  onPress,
  isDestructive = false,
}: ProfileMenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.menuIconContainer,
          isDestructive ? styles.destructiveIconBg : styles.defaultIconBg,
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={isDestructive ? Colors.logoutRed : Colors.primary}
        />
      </View>

      <View style={styles.menuTextContainer}>
        <Text
          style={[
            styles.menuTitle,
            isDestructive && styles.destructiveMenuTitle,
          ]}
        >
          {title}
        </Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>

      {badge && (
        <View style={styles.menuBadge}>
          <Text style={styles.menuBadgeText}>{badge}</Text>
        </View>
      )}

      <Ionicons
        name="chevron-forward"
        size={18}
        color={Colors.secondary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 4,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  defaultIconBg: {
    backgroundColor: Colors.accentLight,
  },
  destructiveIconBg: {
    backgroundColor: Colors.redBg,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textSlateDark,
  },
  destructiveMenuTitle: {
    color: Colors.logoutRed,
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
  },
  menuBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  menuBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
});

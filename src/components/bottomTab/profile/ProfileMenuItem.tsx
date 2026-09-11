import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';

export interface ProfileMenuItemProps {
  icon: any;
  iconType?: 'ionicons' | 'fa5' | 'mci';
  title: string;
  subtitle?: string;
  badge?: string;
  onPress: () => void;
  isDestructive?: boolean;
}

export default function ProfileMenuItem({
  icon,
  iconType = 'ionicons',
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
        {iconType === 'ionicons' && (
          <Ionicons
            name={icon}
            size={20}
            color={isDestructive ? Colors.logoutRed : Colors.primary}
          />
        )}
        {iconType === 'fa5' && (
          <FontAwesome5
            name={icon}
            size={18}
            color={isDestructive ? Colors.logoutRed : Colors.primary}
          />
        )}
        {iconType === 'mci' && (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={isDestructive ? Colors.logoutRed : Colors.primary}
          />
        )}
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
        color={isDestructive ? Colors.logoutRed : Colors.secondary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
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
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
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

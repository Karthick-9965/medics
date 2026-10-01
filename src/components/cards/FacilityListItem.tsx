import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import RatingBadge from '../common/RatingBadge';
import DistanceBadge from '../common/DistanceBadge';

export interface FacilityBadgeConfig {
  icon?: keyof typeof Ionicons.glyphMap;
  text: string;
  backgroundColor?: string;
}

export interface FacilityActionConfig {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export interface FacilityListItemProps {
  image: ImageSourcePropType;
  title: string;
  category?: string;
  subtitle: string;
  subtitleIcon?: keyof typeof Ionicons.glyphMap;
  subtitleIconColor?: string;
  rating: string;
  distance: string;
  badge?: FacilityBadgeConfig;
  action?: FacilityActionConfig;
  onPress: () => void;
}

/**
 * Reusable vertical card for displaying facilities (Hospitals, Pharmacies, Clinics, Labs)
 * in lists like SeeAllScreen and search views.
 */
export default function FacilityListItem({
  image,
  title,
  category,
  subtitle,
  subtitleIcon,
  subtitleIconColor,
  rating,
  distance,
  badge,
  action,
  onPress,
}: FacilityListItemProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.thumbWrapper}>
        <Image source={image} style={styles.storeThumb} />
        {badge ? (
          <View
            style={[
              styles.storeRxBadge,
              badge.backgroundColor ? { backgroundColor: badge.backgroundColor } : null,
            ]}
          >
            {badge.icon && <Ionicons name={badge.icon} size={8.5} color={Colors.white} />}
            <Text style={styles.storeRxBadgeText}>{badge.text}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.cardInfo}>
        {category ? (
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>{category}</Text>
          </View>
        ) : null}
        <Text style={styles.cardTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.subtitleRow}>
          {subtitleIcon ? (
            <Ionicons
              name={subtitleIcon}
              size={12}
              color={subtitleIconColor || Colors.warningAmber}
              style={styles.subtitleIcon}
            />
          ) : null}
          <Text style={styles.cardSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <RatingBadge rating={rating} />
          <Text style={styles.dotSeparator}>•</Text>
          <DistanceBadge distance={distance} />
        </View>
        {action ? (
          <View style={styles.cardActionRow}>
            <TouchableOpacity
              style={styles.actionBtnPrimary}
              onPress={action.onPress || onPress}
              activeOpacity={0.8}
            >
              {action.icon && <Ionicons name={action.icon} size={12} color={Colors.white} />}
              <Text style={styles.actionBtnText}>{action.label}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-start',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  storeThumb: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: Colors.bgLight,
  },
  storeRxBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successGreen,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    gap: 3,
  },
  storeRxBadgeText: {
    color: Colors.white,
    fontSize: 8.5,
    fontWeight: '800',
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    marginBottom: 4,
  },
  categoryPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 2,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  subtitleIcon: {
    marginRight: 4,
  },
  cardSubtitle: {
    fontSize: 11.5,
    color: Colors.secondary,
    flexShrink: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dotSeparator: {
    marginHorizontal: 6,
    color: Colors.secondary,
    fontSize: 10,
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5.5,
    borderRadius: 8,
    gap: 5,
  },
  actionBtnText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
});

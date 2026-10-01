import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { DoctorItem } from '../../constants/doctorsData';
import RatingBadge from '../common/RatingBadge';
import DistanceBadge from '../common/DistanceBadge';

export interface DoctorListItemProps {
  doctor: DoctorItem;
  onPress: () => void;
  onBookPress?: () => void;
}

/**
 * Reusable vertical card for displaying a Doctor in lists.
 */
export default function DoctorListItem({
  doctor,
  onPress,
  onBookPress,
}: DoctorListItemProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.thumbWrapper}>
        <Image source={doctor.image} style={styles.storeThumb} />
      </View>
      <View style={styles.cardInfo}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryPillText}>{doctor.specialization}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{doctor.name}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>
          {doctor.experience || '8+ yrs exp'} • {doctor.hospital || 'Care Hospital'}
        </Text>
        <View style={styles.metaRow}>
          <RatingBadge rating={doctor.rating} />
          <Text style={styles.dotSeparator}>•</Text>
          <DistanceBadge distance={doctor.distance || '800m away'} />
        </View>
        <View style={styles.cardActionRow}>
          <TouchableOpacity
            style={styles.actionBtnPrimary}
            onPress={onBookPress || onPress}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar-outline" size={12} color={Colors.white} />
            <Text style={styles.actionBtnText}>Book Appointment</Text>
          </TouchableOpacity>
        </View>
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
  cardSubtitle: {
    fontSize: 11.5,
    color: Colors.secondary,
    marginBottom: 4,
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

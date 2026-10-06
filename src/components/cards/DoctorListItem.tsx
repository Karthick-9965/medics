import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { DoctorItem } from '../../constants/doctorsData';
import RatingBadge from '../common/RatingBadge';
import DistanceBadge from '../common/DistanceBadge';
import ContactActionButtons from '../common/ContactActionButtons';

export interface DoctorListItemProps {
  doctor: DoctorItem;
  onPress: () => void;
  onBookPress?: () => void;
  onCallPress?: () => void;
  onChatPress?: () => void;
}

/**
 * Reusable vertical card for displaying a Doctor in lists.
 * Implements Option B (full-width bottom action row) + Option 3 (horizontal Book, Call, Chat buttons).
 */
export default function DoctorListItem({
  doctor,
  onPress,
  onBookPress,
  onCallPress,
  onChatPress,
}: DoctorListItemProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* 1. Top Section: Doctor Photo + Doctor Details */}
      <View style={styles.topSection}>
        <View style={styles.thumbWrapper}>
          <Image source={doctor.image} style={styles.storeThumb} />
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>{doctor.specialization}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>{doctor.name}</Text>
          {doctor.hospital ? (
            <Text style={styles.hospitalText} numberOfLines={1}>
              {doctor.hospital}
            </Text>
          ) : null}
          <Text style={styles.cardSubtitle} numberOfLines={1}>
            {doctor.experience || '8+ yrs exp'}
          </Text>
          <View style={styles.metaRow}>
            <RatingBadge rating={doctor.rating} />
            <Text style={styles.dotSeparator}>•</Text>
            <DistanceBadge distance={doctor.distance || '800m away'} />
          </View>
        </View>
      </View>

      {/* 2. Bottom Row: [ Book Appointment ]  [ Call ]  [ Message ] */}
      <View style={styles.bottomActionRow}>
        <TouchableOpacity
          style={styles.actionBtnPrimary}
          onPress={onBookPress || onPress}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={14} color={Colors.white} />
          <Text style={styles.actionBtnText}>Book Appointment</Text>
        </TouchableOpacity>

        <ContactActionButtons
          onCall={onCallPress}
          onChat={onChatPress}
          callLabel={`Call ${doctor.name}`}
          chatLabel={`Message ${doctor.name}`}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  storeThumb: {
    width: 82,
    height: 82,
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
  hospitalText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 11,
    color: Colors.secondary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotSeparator: {
    marginHorizontal: 6,
    color: Colors.secondary,
    fontSize: 10,
  },
  bottomActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    height: 38,
    borderRadius: 10,
    gap: 6,
    paddingHorizontal: 10,
  },
  actionBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});

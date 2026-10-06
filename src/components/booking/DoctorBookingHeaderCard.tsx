import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { Colors } from '../../constants/Colors';
import { DoctorItem } from '../../constants/doctorsData';
import RatingBadge from '../common/RatingBadge';

export interface DoctorBookingHeaderCardProps {
  doctor: DoctorItem;
}

/**
 * Fresher-friendly mini summary card shown at the top of the booking wizard.
 */
export default function DoctorBookingHeaderCard({ doctor }: DoctorBookingHeaderCardProps) {
  return (
    <View style={styles.card}>
      <Image source={doctor.image} style={styles.avatar} resizeMode="cover" />
      <View style={styles.info}>
        <Text style={styles.name}>{doctor.name}</Text>
        <Text style={styles.spec}>{doctor.specialization}</Text>
        {doctor.hospital ? (
          <Text style={styles.hospitalText} numberOfLines={1}>{doctor.hospital}</Text>
        ) : null}
        <View style={styles.metaRow}>
          <RatingBadge rating={doctor.rating} variant="gold" />
          <Text style={styles.dot}>•</Text>
          <Text style={styles.experience}>{doctor.experience || '8+ yrs exp'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 14,
    backgroundColor: Colors.border,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
  },
  spec: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
    marginBottom: 2,
  },
  hospitalText: {
    fontSize: 11.5,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    color: Colors.secondary,
    fontSize: 10,
  },
  experience: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '500',
  },
});

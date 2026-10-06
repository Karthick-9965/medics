import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import RatingBadge from '../common/RatingBadge';
import DistanceBadge from '../common/DistanceBadge';

export interface DoctorCardProps {
  name: string;
  specialization: string;
  image: any;
  rating: string;
  distance: string;
  hospital?: string;
  onPress?: () => void;
}

export default function DoctorCard({
  name,
  specialization,
  image,
  rating,
  distance,
  hospital,
  onPress,
}: DoctorCardProps) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.avatarWrapper}>
        <Image source={image} style={styles.avatar} resizeMode="cover" />
      </View>
      <Text style={styles.name} numberOfLines={1}>{name}</Text>
      <Text style={styles.specialization} numberOfLines={1}>{specialization}</Text>
      {hospital ? (
        <View style={styles.hospitalRow}>
          <Text style={styles.hospitalText} numberOfLines={1}>{hospital}</Text>
        </View>
      ) : null}
      <View style={styles.bottomRow}>
        <RatingBadge rating={rating} />
        <DistanceBadge distance={distance} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 148,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginRight: 10,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  name: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.black,
    textAlign: 'center',
    width: '100%',
  },
  specialization: {
    fontSize: 10.5,
    color: Colors.secondary,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 4,
    width: '100%',
  },
  hospitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgLight,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    marginBottom: 8,
    width: '100%',
    gap: 3,
  },
  hospitalText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: Colors.primary,
    flexShrink: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 6,
  },
});


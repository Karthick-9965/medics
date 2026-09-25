import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export interface DoctorCardProps {
  name: string;
  specialization: string;
  image: any;
  rating: string;
  distance: string;
  onPress?: () => void;
}

export default function DoctorCard({
  name,
  specialization,
  image,
  rating,
  distance,
  onPress,
}: DoctorCardProps) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.avatarWrapper}>
        <Image source={image} style={styles.avatar} resizeMode="cover" />
      </View>
      <Text style={styles.name} numberOfLines={1}>{name}</Text>
      <Text style={styles.specialization} numberOfLines={1}>{specialization}</Text>
      <View style={styles.bottomRow}>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={9.5} color={Colors.primary} />
          <Text style={styles.ratingText}>{rating}</Text>
        </View>
        <View style={styles.distanceBadge}>
          <Ionicons name="location-sharp" size={9.5} color={Colors.secondary} />
          <Text style={styles.distanceText} numberOfLines={1}>{distance}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
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
    marginBottom: 8,
    width: '100%',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 5,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  ratingText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 2.5,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 9.5,
    color: Colors.secondary,
    marginLeft: 2,
    maxWidth: 55,
  },
});

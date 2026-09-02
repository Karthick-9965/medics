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
}

export default function DoctorCard({
  name,
  specialization,
  image,
  rating,
  distance,
}: DoctorCardProps) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <Image source={image} style={styles.avatar} resizeMode="cover" />
      <Text style={styles.name} numberOfLines={1}>{name}</Text>
      <Text style={styles.specialization} numberOfLines={1}>{specialization}</Text>
      <View style={styles.bottomRow}>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={9} color={Colors.primary} />
          <Text style={styles.ratingText}>{rating}</Text>
        </View>
        <View style={styles.distanceBadge}>
          <Ionicons name="location-sharp" size={9} color={Colors.secondary} />
          <Text style={styles.distanceText} numberOfLines={1}>{distance}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 130,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
  },
  name: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.black,
    textAlign: 'center',
  },
  specialization: {
    fontSize: 10,
    color: Colors.secondary,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF8F6',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 2,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 9,
    color: Colors.secondary,
    marginLeft: 2,
  },
});

import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export interface PharmacyCardProps {
  name: string;
  image: any;
  rating: string;
  distance: string;
}

export default function PharmacyCard({
  name,
  image,
  rating,
  distance,
}: PharmacyCardProps) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <Image source={image} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
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
    overflow: 'hidden',
    marginRight: 10,
  },
  image: {
    width: '100%',
    height: 60,
  },
  content: {
    padding: 8,
  },
  name: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flex: 1,
  },
  distanceText: {
    fontSize: 9,
    color: Colors.secondary,
    marginLeft: 2,
  },
});

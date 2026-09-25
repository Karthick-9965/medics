import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export interface PharmacyCardProps {
  name: string;
  image: any;
  rating: string;
  distance: string;
  deliveryTime?: string;
  onPress?: () => void;
  onScanPress?: () => void;
}

export default function PharmacyCard({
  name,
  image,
  rating,
  distance,
  onPress,
  onScanPress,
}: PharmacyCardProps) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.image} resizeMode="cover" />
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
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
    overflow: 'hidden',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 72,
    position: 'relative',
    backgroundColor: Colors.bgLight,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 10,
  },
  name: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
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

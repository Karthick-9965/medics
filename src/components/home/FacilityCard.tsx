import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { Colors } from '../../constants/Colors';
import RatingBadge from '../common/RatingBadge';
import DistanceBadge from '../common/DistanceBadge';

export interface FacilityCardProps {
  name: string;
  image: ImageSourcePropType;
  rating: string;
  distance: string;
  onPress?: () => void;
}

/**
 * Reusable card for displaying healthcare facilities (hospitals, pharmacies, clinics, labs)
 * in horizontal carousels or search results.
 */
export default function FacilityCard({
  name,
  image,
  rating,
  distance,
  onPress,
}: FacilityCardProps) {
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
          <RatingBadge rating={rating} />
          <DistanceBadge distance={distance} />
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
    marginRight: 10,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 72,
    position: 'relative',
    backgroundColor: Colors.bgLight,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: 'hidden',
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
});

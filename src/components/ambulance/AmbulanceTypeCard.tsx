import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { AmbulanceType } from '../../constants/ambulancesData';

export interface AmbulanceTypeCardProps {
  type: AmbulanceType;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * Reusable card representing an ambulance category option (BLS, ALS, ICU on Wheels, etc.)
 */
export default function AmbulanceTypeCard({
  type,
  isSelected,
  onSelect,
}: AmbulanceTypeCardProps) {
  return (
    <TouchableOpacity
      style={[styles.typeCard, isSelected && styles.typeCardSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={[styles.typeIconBox, isSelected && styles.typeIconBoxSelected]}>
        <Ionicons
          name="medical"
          size={22}
          color={isSelected ? Colors.primary : Colors.secondary}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.typeName, isSelected && styles.typeNameSelected]}>
          {type.name}
        </Text>
        <Text style={styles.typeDesc}>{type.description}</Text>
        <View style={styles.featureRow}>
          {type.features.slice(0, 2).map((feat, i) => (
            <View key={i} style={styles.featBadge}>
              <Ionicons
                name="checkmark-circle"
                size={12}
                color={Colors.primary}
                style={{ marginRight: 3 }}
              />
              <Text style={styles.featText}>{feat}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.etaText}>{type.eta}</Text>
        <Text style={styles.priceText}>{type.price}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  typeCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.successBgLight,
  },
  typeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.cardBgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  typeIconBoxSelected: {
    backgroundColor: Colors.accentLight,
  },
  typeName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 2,
  },
  typeNameSelected: {
    color: Colors.primary,
  },
  typeDesc: {
    fontSize: 11.5,
    color: Colors.secondary,
    marginBottom: 6,
    lineHeight: 16,
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  featBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
  },
  etaText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.black,
  },
});

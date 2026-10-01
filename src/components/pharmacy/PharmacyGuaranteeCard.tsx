import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export interface PharmacyGuaranteeCardProps {
  pharmacyName: string;
  deliveryTime?: string;
}

/**
 * Reusable safety and delivery assurance card for pharmacy orders.
 */
export default function PharmacyGuaranteeCard({
  pharmacyName,
  deliveryTime = '15-25 mins',
}: PharmacyGuaranteeCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
        <View style={styles.info}>
          <Text style={styles.title}>100% Genuine & Verified Medicines</Text>
          <Text style={styles.desc}>
            Every medicine sheet is verified by licensed pharmacists at {pharmacyName} before dispensing.
          </Text>
        </View>
      </View>

      <View style={[styles.row, { marginTop: 12 }]}>
        <Ionicons name="bicycle" size={20} color={Colors.tealDark} />
        <View style={styles.info}>
          <Text style={styles.title}>Express Home Delivery ({deliveryTime})</Text>
          <Text style={styles.desc}>
            Medicines are safely packed and delivered directly to your doorstep.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgPage,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
  },
  desc: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 2,
    lineHeight: 16,
  },
});

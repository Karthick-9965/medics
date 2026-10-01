import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { MedicineItem } from '../../constants/medicinesData';

export interface MedicineCardProps {
  medicine: MedicineItem;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

/**
 * Reusable Card component for displaying a medicine with quantity stepper.
 */
export default function MedicineCard({
  medicine,
  quantity,
  onAdd,
  onRemove,
}: MedicineCardProps) {
  return (
    <View style={styles.medCard}>
      {medicine.image ? (
        <Image source={medicine.image} style={styles.medImage} />
      ) : (
        <View style={styles.medIconPlaceholder}>
          <Ionicons name="medkit" size={20} color={Colors.primary} />
        </View>
      )}

      <View style={styles.medInfo}>
        <Text style={styles.medName} numberOfLines={1}>
          {medicine.name}
        </Text>
        <Text style={styles.medDosage} numberOfLines={1}>
          {medicine.dosage} • {medicine.category}
        </Text>
        <View style={styles.medPriceRow}>
          <Text style={styles.medPrice}>${medicine.price.toFixed(2)}</Text>
          {medicine.originalPrice > medicine.price && (
            <Text style={styles.medOriginalPrice}>
              ${medicine.originalPrice.toFixed(2)}
            </Text>
          )}
        </View>
      </View>

      {quantity > 0 ? (
        <View style={styles.qtyControls}>
          <TouchableOpacity onPress={onRemove} style={styles.qtyBtn} activeOpacity={0.7}>
            <Ionicons name="remove" size={15} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity onPress={onAdd} style={styles.qtyBtn} activeOpacity={0.7}>
            <Ionicons name="add" size={15} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={onAdd} style={styles.addBtn} activeOpacity={0.8}>
          <Ionicons name="add" size={15} color={Colors.white} />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  medCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  medImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  medIconPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  medName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 2,
  },
  medDosage: {
    fontSize: 11.5,
    color: Colors.secondary,
    marginBottom: 4,
  },
  medPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  medPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  medOriginalPrice: {
    fontSize: 12,
    color: Colors.secondary,
    textDecorationLine: 'line-through',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBgSecondary,
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.black,
    paddingHorizontal: 10,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    gap: 4,
  },
  addBtnText: {
    color: Colors.white,
    fontSize: 12.5,
    fontWeight: '700',
  },
});

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { PharmacyItem } from '../../constants/pharmaciesData';

export interface PharmacySuccessViewProps {
  pharmacy: PharmacyItem;
  lastOrderType: 'prescription' | 'catalog';
  orderId: string;
  prescriptionUri: string | null;
  selectedDuration: string;
  onDone: () => void;
}

/**
 * Reusable success confirmation view after placing a pharmacy order.
 */
export default function PharmacySuccessView({
  pharmacy,
  lastOrderType,
  orderId,
  prescriptionUri,
  selectedDuration,
  onDone,
}: PharmacySuccessViewProps) {
  return (
    <View style={styles.successContainer}>
      <Ionicons name="checkmark-circle" size={68} color={Colors.successGreen} />
      <Text style={styles.successTitle}>
        {lastOrderType === 'prescription' ? 'Prescription Received!' : 'Order Confirmed!'}
      </Text>
      <Text style={styles.successSubtitle}>
        {lastOrderType === 'prescription'
          ? `Your medicine sheet has been sent to ${pharmacy.name}. A licensed pharmacist is reviewing your prescription.`
          : `Your medicines from ${pharmacy.name} are being prepared for express delivery.`}
      </Text>

      {lastOrderType === 'prescription' && prescriptionUri ? (
        <View style={styles.successRxPreview}>
          <Image source={{ uri: prescriptionUri }} style={styles.successRxThumb} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.successRxLabel}>Attached Sheet</Text>
            <Text style={styles.successRxVal}>{selectedDuration} Course</Text>
            <Text style={styles.successRxStatus}>ETA: {pharmacy.deliveryTime || '15-25 mins'}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.orderBadge}>
        <Text style={styles.orderBadgeLabel}>Order Reference ID</Text>
        <Text style={styles.orderBadgeVal}>{orderId}</Text>
      </View>

      <TouchableOpacity
        style={styles.doneBtn}
        onPress={onDone}
        activeOpacity={0.8}
      >
        <Text style={styles.doneBtnText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.black,
    marginTop: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 13.5,
    color: Colors.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  successRxPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgPage,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
    marginBottom: 16,
  },
  successRxThumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  successRxLabel: {
    fontSize: 11,
    color: Colors.secondary,
  },
  successRxVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.black,
  },
  successRxStatus: {
    fontSize: 11.5,
    color: Colors.primary,
    fontWeight: '600',
  },
  orderBadge: {
    backgroundColor: Colors.cardBgSecondary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  orderBadgeLabel: {
    fontSize: 11.5,
    color: Colors.secondary,
    fontWeight: '600',
  },
  orderBadgeVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  doneBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '85%',
    marginTop: 16,
  },
  doneBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
});

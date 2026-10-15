import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Colors } from '../../constants/Colors';
import { PharmacyOrderItem } from '../bottomTab/profile/PharmacyOrdersModal';

export interface OrderReceiptBreakdownProps {
  items: PharmacyOrderItem[];
  totalAmount: string;
  paymentMethod: string;
  subtotal?: string;
  deliveryFee?: string;
}

/**
 * Reusable Order Receipt Breakdown Card.
 * Displays itemized medicines list, unit prices, total amount, and payment mode.
 */
export default function OrderReceiptBreakdown({
  items,
  totalAmount,
  paymentMethod,
  subtotal,
  deliveryFee,
}: OrderReceiptBreakdownProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeading}>Items Ordered (Tablets & Qty)</Text>

      {items.map((it, idx) => (
        <View key={idx} style={styles.row}>
          <Text style={styles.itemName} numberOfLines={1}>
            {it.name}
          </Text>
          <Text style={styles.itemQty}>Count: {it.quantity}</Text>
          <Text style={styles.itemPrice}>{it.price}</Text>
        </View>
      ))}

      <View style={styles.divider} />

      {subtotal && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Item Subtotal</Text>
          <Text style={styles.summaryVal}>{subtotal}</Text>
        </View>
      )}

      {deliveryFee && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Charge</Text>
          <Text style={[styles.summaryVal, deliveryFee === 'FREE' && styles.freeText]}>
            {deliveryFee}
          </Text>
        </View>
      )}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Paid</Text>
        <Text style={styles.totalValue}>{totalAmount}</Text>
      </View>

      <Text style={styles.paymentMethodNotice}>{paymentMethod}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  itemName: {
    flex: 1,
    fontSize: 12.5,
    color: Colors.textDark,
  },
  itemQty: {
    fontSize: 12,
    color: Colors.secondary,
    paddingHorizontal: 8,
  },
  itemPrice: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dividerLine,
    marginVertical: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  summaryLabel: {
    fontSize: 12.5,
    color: Colors.secondary,
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
  },
  freeText: {
    color: Colors.successGreen,
    fontWeight: '800',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  paymentMethodNotice: {
    fontSize: 11.5,
    color: Colors.secondary,
    marginTop: 6,
  },
});

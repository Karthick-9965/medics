import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Colors } from '../../constants/Colors';

export interface PriceLineItem {
  label: string;
  amount: string;
  isDiscount?: boolean;
  isHighlight?: boolean;
}

interface PriceSummaryProps {
  title?: string;
  items: PriceLineItem[];
  totalLabel?: string;
  totalAmount: string;
}

export default function PriceSummary({
  title = 'Payment Breakdown',
  items,
  totalLabel = 'Total Payable',
  totalAmount,
}: PriceSummaryProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.divider} />
      {items.map((item, idx) => (
        <View key={idx} style={styles.row}>
          <Text style={[styles.label, item.isHighlight && styles.highlightLabel]}>{item.label}</Text>
          <Text
            style={[
              styles.amount,
              item.isDiscount && styles.discountAmount,
              item.isHighlight && styles.highlightAmount,
            ]}
          >
            {item.amount}
          </Text>
        </View>
      ))}
      <View style={[styles.divider, { marginVertical: 10 }]} />
      <View style={styles.row}>
        <Text style={styles.totalLabel}>{totalLabel}</Text>
        <Text style={styles.totalAmount}>{totalAmount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  label: {
    fontSize: 13,
    color: Colors.secondary,
  },
  amount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
  },
  discountAmount: {
    color: '#16A34A',
  },
  highlightLabel: {
    color: Colors.primary,
    fontWeight: '600',
  },
  highlightAmount: {
    color: Colors.primary,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
  },
  totalAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
  },
});

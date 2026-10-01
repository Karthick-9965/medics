import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { PharmacyOrder } from '../bottomTab/profile/PharmacyOrdersModal';

export interface PharmacyOrderCardProps {
  order: PharmacyOrder;
  onViewDetails: (order: PharmacyOrder) => void;
  onReorder: (order: PharmacyOrder) => void;
}

/**
 * Reusable Card component representing a single pharmacy medicine order.
 * Displays pharmacy name, status badge, items summary, ETA, total price, and action buttons.
 */
export default function PharmacyOrderCard({
  order,
  onViewDetails,
  onReorder,
}: PharmacyOrderCardProps) {
  const isDelivered = order.status === 'delivered';
  const isInTransit = order.status === 'in_transit' || order.status === 'packed';

  return (
    <View style={styles.card}>
      {/* 1. Header: Pharmacy Name & Status Pill */}
      <View style={styles.headerRow}>
        <View style={styles.pharmacyInfo}>
          <View style={styles.iconCircle}>
            <Ionicons name="medkit" size={18} color={Colors.primary} />
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.pharmacyName} numberOfLines={1}>
              {order.pharmacyName}
            </Text>
            <Text style={styles.dateText}>{order.date}</Text>
          </View>
        </View>

        <View
          style={[
            styles.statusPill,
            isDelivered ? styles.statusPillDelivered : styles.statusPillInTransit,
          ]}
        >
          <Ionicons
            name={isDelivered ? 'checkmark-circle' : 'bicycle'}
            size={13}
            color={isDelivered ? Colors.successGreen : Colors.infoBlueDark}
          />
          <Text
            style={[
              styles.statusText,
              isDelivered ? styles.statusTextDelivered : styles.statusTextInTransit,
            ]}
          >
            {order.statusLabel}
          </Text>
        </View>
      </View>

      {/* 2. Medicine Items Summary */}
      <View style={styles.itemsBox}>
        {order.items.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.itemPrice}>
              x{item.quantity} ({item.price})
            </Text>
          </View>
        ))}
      </View>

      {/* 3. Delivery ETA Status */}
      <View style={styles.etaRow}>
        <Ionicons
          name={isInTransit ? 'time-outline' : 'shield-checkmark-outline'}
          size={15}
          color={isInTransit ? Colors.apolloOrange : Colors.successGreen}
        />
        <Text style={[styles.etaText, isInTransit ? styles.etaActive : styles.etaDone]}>
          {order.eta}
        </Text>
      </View>

      {/* 4. Footer: Total Amount & Action Buttons */}
      <View style={styles.footerRow}>
        <View>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>{order.totalAmount}</Text>
        </View>

        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() => onViewDetails(order)}
            activeOpacity={0.7}
          >
            <Text style={styles.detailsBtnText}>
              {isInTransit ? 'Live Track' : 'View Details'}
            </Text>
            <Ionicons
              name={isInTransit ? 'location-outline' : 'chevron-forward'}
              size={15}
              color={Colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reorderBtn}
            onPress={() => onReorder(order)}
            activeOpacity={0.7}
          >
            <Ionicons name="repeat-outline" size={14} color={Colors.white} />
            <Text style={styles.reorderBtnText}>Reorder</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pharmacyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameContainer: {
    flex: 1,
  },
  pharmacyName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
  },
  dateText: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusPillDelivered: {
    backgroundColor: Colors.successBgLight,
  },
  statusPillInTransit: {
    backgroundColor: Colors.infoBlueBg,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextDelivered: {
    color: Colors.successDark,
  },
  statusTextInTransit: {
    color: Colors.infoBlueDark,
  },
  itemsBox: {
    backgroundColor: Colors.bgLight,
    padding: 10,
    borderRadius: 10,
    gap: 4,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bullet: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '800',
  },
  itemName: {
    flex: 1,
    fontSize: 12.5,
    color: Colors.textDark,
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '600',
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  etaText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  etaActive: {
    color: Colors.apolloOrange,
  },
  etaDone: {
    color: Colors.successDark,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.dividerLine,
  },
  totalLabel: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
    marginTop: 1,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: Colors.accentLight,
  },
  detailsBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  reorderBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.white,
  },
});

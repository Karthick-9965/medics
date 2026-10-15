import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { PaymentMethodType } from '../../constants/appData';
import { MedicineItem } from '../../constants/medicinesData';
import PaymentPicker from '../common/PaymentPicker';
import PriceSummary from '../common/PriceSummary';

export interface CartEntryItem {
  medicine: MedicineItem;
  quantity: number;
}

export interface PharmacyCheckoutViewProps {
  lastOrderType: 'prescription' | 'catalog';
  prescriptionUri: string | null;
  selectedDuration: string;
  prescriptionNote: string;
  requestCall: boolean;
  deliveryAddress: string;
  deliveryPhone: string;
  paymentMethod: PaymentMethodType;
  upiId: string;
  cartItemsCount: number;
  subtotal: number;
  deliveryFee: number;
  platformFee?: number;
  totalAmount: string;
  cartEntries?: CartEntryItem[];
  isProcessing: boolean;
  onAddressChange: (address: string) => void;
  onPhoneChange: (phone: string) => void;
  onSelectPaymentMethod: (method: PaymentMethodType) => void;
  onUpiIdChange: (upi: string) => void;
  onPlaceOrder: () => void;
}

/**
 * Reusable checkout view for pharmacy orders (both prescription and catalog).
 * Displays ordered tablet names, counts, delivery fee (Free for >500, ₹40 for <500),
 * and clean bill breakdown without packaging/platform fee.
 */
export default function PharmacyCheckoutView({
  lastOrderType,
  prescriptionUri,
  selectedDuration,
  prescriptionNote,
  requestCall,
  deliveryAddress,
  deliveryPhone,
  paymentMethod,
  upiId,
  cartItemsCount,
  subtotal,
  deliveryFee,
  totalAmount,
  cartEntries = [],
  isProcessing,
  onAddressChange,
  onPhoneChange,
  onSelectPaymentMethod,
  onUpiIdChange,
  onPlaceOrder,
}: PharmacyCheckoutViewProps) {
  const isFreeDelivery = deliveryFee === 0 || subtotal >= 500;
  const remainingForFreeDelivery = Math.max(0, 500 - subtotal);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      {/* Prescription / Order Summary Banner */}
      {lastOrderType === 'prescription' && prescriptionUri ? (
        <View style={styles.checkoutRxSummary}>
          <Image source={{ uri: prescriptionUri }} style={styles.checkoutRxThumb} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.checkoutRxTitle}>Medicine Sheet Order</Text>
            <Text style={styles.checkoutRxSub}>
              Duration: <Text style={{ fontWeight: '700', color: Colors.primary }}>{selectedDuration}</Text>
            </Text>
            {prescriptionNote ? (
              <Text style={styles.checkoutRxNote} numberOfLines={2}>
                Notes: "{prescriptionNote}"
              </Text>
            ) : null}
            <Text style={styles.checkoutRxPharmacist}>
              {requestCall ? '✓ Pharmacist call requested' : '✓ Standard verification'}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Ordered Tablets / Medicines List with Name and Count */}
      {lastOrderType === 'catalog' && cartEntries.length > 0 && (
        <View style={styles.orderedItemsCard}>
          <View style={styles.itemsHeader}>
            <View style={styles.itemsHeaderLeft}>
              <Ionicons name="medkit" size={18} color={Colors.primary} />
              <Text style={styles.itemsHeaderTitle}>Ordered Tablets & Medicines</Text>
            </View>
            <View style={styles.itemsCountBadge}>
              <Text style={styles.itemsCountBadgeText}>{cartItemsCount} {cartItemsCount === 1 ? 'item' : 'items'}</Text>
            </View>
          </View>

          <View style={styles.itemsDivider} />

          {cartEntries.map(({ medicine, quantity }) => (
            <View key={medicine.id} style={styles.itemRow}>
              <View style={styles.itemBulletDot} />
              <View style={styles.itemInfoCol}>
                <Text style={styles.itemMainName} numberOfLines={1}>
                  {medicine.name}
                </Text>
                <Text style={styles.itemDosageText}>{medicine.dosage}</Text>
              </View>

              <View style={styles.itemCountContainer}>
                <Text style={styles.itemCountLabel}>Count:</Text>
                <View style={styles.itemCountPill}>
                  <Text style={styles.itemCountNumber}>{quantity}</Text>
                </View>
              </View>

              <Text style={styles.itemTotalPrice}>
                ₹{(medicine.price * quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Delivery Details */}
      <Text style={styles.sectionHeading}>Delivery Address & Contact</Text>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Delivery Address</Text>
        <TextInput
          style={styles.input}
          value={deliveryAddress}
          onChangeText={onAddressChange}
          placeholder="Enter complete address"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={deliveryPhone}
          onChangeText={onPhoneChange}
          keyboardType="phone-pad"
          placeholder="e.g. +91 98401 23456"
        />
      </View>

      {/* Payment Selection */}
      <PaymentPicker
        paymentMethod={paymentMethod}
        onSelectPaymentMethod={onSelectPaymentMethod}
        upiId={upiId}
        onChangeUpiId={onUpiIdChange}
      />

      {/* Itemized Bill / Price Summary */}
      {lastOrderType === 'catalog' ? (
        <View style={styles.billCard}>
          <View style={styles.billHeader}>
            <Ionicons name="receipt-outline" size={17} color={Colors.primary} />
            <Text style={styles.billTitle}>Bill Breakdown</Text>
          </View>

          <View style={styles.divider} />

          {/* 1. Item Total */}
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total ({cartItemsCount} medicines)</Text>
            <Text style={styles.billAmount}>₹{subtotal.toFixed(2)}</Text>
          </View>

          {/* 2. Delivery Fee */}
          <View style={styles.billRow}>
            <View style={styles.deliveryLabelWrap}>
              <Text style={styles.billLabel}>Delivery Charge</Text>
              {isFreeDelivery && (
                <View style={styles.freePillBadge}>
                  <Text style={styles.freePillBadgeText}>FREE DELIVERY</Text>
                </View>
              )}
            </View>
            <Text style={[styles.billAmount, isFreeDelivery && styles.freeAmountText]}>
              {isFreeDelivery ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
            </Text>
          </View>

          {/* Delivery fee status notification box */}
          {subtotal < 500 ? (
            <View style={styles.deliveryInfoBoxNotice}>
              <Ionicons name="bicycle" size={16} color={Colors.warningDark} />
              <Text style={styles.deliveryInfoTextNotice}>
                Add <Text style={styles.boldNotice}>₹{remainingForFreeDelivery.toFixed(2)}</Text> more for{' '}
                <Text style={styles.freeGreenText}>FREE Delivery</Text> (Orders above ₹500 get Free Delivery).
              </Text>
            </View>
          ) : (
            <View style={styles.deliveryInfoBoxSuccess}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.successGreen} />
              <Text style={styles.deliveryInfoTextSuccess}>
                 Order above ₹500! <Text style={styles.boldNotice}>FREE Delivery applied</Text> (Saved ₹40.00).
              </Text>
            </View>
          )}

          <View style={[styles.divider, { marginVertical: 10 }]} />

          {/* Final Total Amount */}
          <View style={styles.billTotalRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalAmountText}>₹{totalAmount}</Text>
          </View>
        </View>
      ) : (
        <PriceSummary
          title="Prescription Order Bill"
          items={[
            { label: 'Prescription Verification', amount: 'FREE', isDiscount: true },
            { label: 'Doorstep Delivery Fee', amount: 'FREE', isDiscount: true },
            { label: 'Medicines Bill', amount: 'Pay on Delivery / Verified' },
          ]}
          totalAmount="Pay on Delivery"
        />
      )}

      {/* Place Order Button */}
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={onPlaceOrder}
        disabled={isProcessing}
        activeOpacity={0.8}
      >
        {isProcessing ? (
          <ActivityIndicator color={Colors.white} size="small" />
        ) : (
          <Text style={styles.primaryBtnText}>
            {lastOrderType === 'prescription'
              ? 'Confirm Prescription Order'
              : `Confirm Order (₹${totalAmount})`}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  checkoutRxSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successBgLight,
    borderRadius: 16,
    padding: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.successBorder,
  },
  checkoutRxThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: Colors.bgLight,
  },
  checkoutRxTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 2,
  },
  checkoutRxSub: {
    fontSize: 12,
    color: Colors.textDark,
    marginBottom: 2,
  },
  checkoutRxNote: {
    fontSize: 11.5,
    color: Colors.secondary,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  checkoutRxPharmacist: {
    fontSize: 11,
    color: Colors.successGreen,
    fontWeight: '600',
  },
  orderedItemsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 18,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemsHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  itemsCountBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  itemsCountBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  itemsDivider: {
    height: 1,
    backgroundColor: Colors.dividerLine,
    marginVertical: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  itemBulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: 8,
  },
  itemInfoCol: {
    flex: 1,
    marginRight: 8,
  },
  itemMainName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
  },
  itemDosageText: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 1,
  },
  itemCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  itemCountLabel: {
    fontSize: 11.5,
    color: Colors.secondary,
    marginRight: 4,
  },
  itemCountPill: {
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  itemCountNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
  },
  itemTotalPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
    minWidth: 54,
    textAlign: 'right',
  },
  sectionHeading: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 10,
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.bgPage,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13.5,
    color: Colors.black,
  },
  billCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: 10,
  },
  billHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  billTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  deliveryLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  freePillBadge: {
    backgroundColor: Colors.successBgTint,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  freePillBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Colors.successDark,
    letterSpacing: 0.3,
  },
  billLabel: {
    fontSize: 13,
    color: Colors.secondary,
  },
  billAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
  },
  freeAmountText: {
    color: Colors.successGreen,
    fontWeight: '800',
  },
  deliveryInfoBoxNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.warningBgLight,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 6,
    marginBottom: 4,
  },
  deliveryInfoTextNotice: {
    fontSize: 11.5,
    color: Colors.warningDark,
    flex: 1,
    lineHeight: 16,
  },
  deliveryInfoBoxSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.successBgLight,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 6,
    marginBottom: 4,
  },
  deliveryInfoTextSuccess: {
    fontSize: 11.5,
    color: Colors.successDark,
    flex: 1,
    lineHeight: 16,
  },
  boldNotice: {
    fontWeight: '700',
    color: Colors.textDark,
  },
  freeGreenText: {
    fontWeight: '700',
    color: Colors.successGreen,
  },
  billTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
  },
  totalAmountText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  primaryBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
});

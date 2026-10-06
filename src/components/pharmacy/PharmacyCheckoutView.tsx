import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/Colors';
import { PaymentMethodType } from '../../constants/appData';
import PaymentPicker from '../common/PaymentPicker';
import PriceSummary from '../common/PriceSummary';

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
  platformFee: number;
  totalAmount: string;
  isProcessing: boolean;
  onAddressChange: (address: string) => void;
  onPhoneChange: (phone: string) => void;
  onSelectPaymentMethod: (method: PaymentMethodType) => void;
  onUpiIdChange: (upi: string) => void;
  onPlaceOrder: () => void;
}

/**
 * Reusable checkout view for pharmacy orders (both prescription and catalog).
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
  platformFee,
  totalAmount,
  isProcessing,
  onAddressChange,
  onPhoneChange,
  onSelectPaymentMethod,
  onUpiIdChange,
  onPlaceOrder,
}: PharmacyCheckoutViewProps) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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

      {/* Delivery Details */}
      <Text style={styles.sectionHeading}>Delivery Details</Text>
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
          placeholder="e.g. +1 (555) 019-2834"
        />
      </View>

      {/* Payment Selection */}
      <PaymentPicker
        paymentMethod={paymentMethod}
        onSelectPaymentMethod={onSelectPaymentMethod}
        upiId={upiId}
        onChangeUpiId={onUpiIdChange}
      />

      {/* Price Summary */}
      {lastOrderType === 'catalog' ? (
        <PriceSummary
          items={[
            { label: `Medicines Subtotal (${cartItemsCount} items)`, amount: `₹${subtotal.toFixed(2)}` },
            { label: 'Express Delivery Fee', amount: deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`, isDiscount: deliveryFee === 0 },
            { label: 'Packaging & Platform Fee', amount: `₹${platformFee.toFixed(2)}` },
          ]}
          totalAmount={`₹${totalAmount}`}
        />
      ) : (
        <PriceSummary
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
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 12,
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

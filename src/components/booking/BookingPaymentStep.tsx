import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { PaymentMethodType } from '../../constants/appData';
import PaymentPicker from '../common/PaymentPicker';
import PriceSummary from '../common/PriceSummary';

export interface BookingPaymentStepProps {
  paymentMethod: PaymentMethodType;
  onSelectPaymentMethod: (method: PaymentMethodType) => void;
  upiId: string;
  onChangeUpiId: (id: string) => void;
  cardNumber: string;
  onChangeCardNumber: (num: string) => void;
  cardExpiry: string;
  onChangeCardExpiry: (exp: string) => void;
  cardCvv: string;
  onChangeCardCvv: (cvv: string) => void;
  consultationType: string;
  baseFee: number;
  platformFee: number;
  promoDiscount: number;
  totalAmount: string;
  setReminderChecked: boolean;
  onToggleReminder: () => void;
}

/**
 * Step 3 of Doctor Booking: Payment Method, Price Breakdown & Reminder Toggle.
 */
export default function BookingPaymentStep({
  paymentMethod,
  onSelectPaymentMethod,
  upiId,
  onChangeUpiId,
  cardNumber,
  onChangeCardNumber,
  cardExpiry,
  onChangeCardExpiry,
  cardCvv,
  onChangeCardCvv,
  consultationType,
  baseFee,
  platformFee,
  promoDiscount,
  totalAmount,
  setReminderChecked,
  onToggleReminder,
}: BookingPaymentStepProps) {
  return (
    <View style={styles.container}>
      <PaymentPicker
        paymentMethod={paymentMethod}
        onSelectPaymentMethod={onSelectPaymentMethod}
        upiId={upiId}
        onChangeUpiId={onChangeUpiId}
        cardNumber={cardNumber}
        onChangeCardNumber={onChangeCardNumber}
        cardExpiry={cardExpiry}
        onChangeCardExpiry={onChangeCardExpiry}
        cardCvv={cardCvv}
        onChangeCardCvv={onChangeCardCvv}
      />

      <PriceSummary
        items={[
          { label: `${consultationType} Consultation`, amount: `₹${baseFee.toFixed(2)}` },
          { label: 'Platform & Care Fee', amount: `₹${platformFee.toFixed(2)}` },
          { label: 'First Consultation Offer', amount: `-₹${promoDiscount.toFixed(2)}`, isDiscount: true },
        ]}
        totalAmount={`₹${totalAmount}`}
      />

      <TouchableOpacity
        style={styles.reminderRow}
        onPress={onToggleReminder}
        activeOpacity={0.7}
      >
        <Ionicons
          name={setReminderChecked ? 'checkbox' : 'square-outline'}
          size={22}
          color={Colors.primary}
        />
        <Text style={styles.reminderText}>
          Send push notification & 30-min reminder before call
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    backgroundColor: Colors.bgLight,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reminderText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textDark,
    fontWeight: '500',
    lineHeight: 17,
  },
});

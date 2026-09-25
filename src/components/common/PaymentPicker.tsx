import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { PAYMENT_OPTIONS, PaymentMethodType } from '../../constants/appData';

interface PaymentPickerProps {
  paymentMethod: PaymentMethodType;
  onSelectPaymentMethod: (pm: PaymentMethodType) => void;
  upiId?: string;
  onChangeUpiId?: (val: string) => void;
  cardNumber?: string;
  onChangeCardNumber?: (val: string) => void;
  cardExpiry?: string;
  onChangeCardExpiry?: (val: string) => void;
  cardCvv?: string;
  onChangeCardCvv?: (val: string) => void;
}

export default function PaymentPicker({
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
}: PaymentPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeading}>Select Payment Method</Text>
      <View style={styles.optionsList}>
        {PAYMENT_OPTIONS.map((option) => {
          const isSelected = paymentMethod === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}
              onPress={() => onSelectPaymentMethod(option.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                <Ionicons name={option.icon} size={20} color={isSelected ? Colors.primary : Colors.secondary} />
              </View>
              <View style={styles.optionDetails}>
                <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>{option.title}</Text>
                <Text style={styles.optionDesc}>{option.desc}</Text>
              </View>
              <Ionicons
                name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={isSelected ? Colors.primary : Colors.border}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Dynamic Payment Input Fields */}
      {paymentMethod === 'upi' && onChangeUpiId && (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>UPI ID / VPA</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="at-outline" size={18} color={Colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={upiId}
              onChangeText={onChangeUpiId}
              placeholder="username@upi"
              placeholderTextColor={Colors.secondary}
              autoCapitalize="none"
            />
          </View>
        </View>
      )}

      {paymentMethod === 'card' && onChangeCardNumber && (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Card Number</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="card-outline" size={18} color={Colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={cardNumber}
              onChangeText={onChangeCardNumber}
              placeholder="4532 •••• •••• 8821"
              placeholderTextColor={Colors.secondary}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.cardSubRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Expiry</Text>
              <TextInput
                style={styles.subInput}
                value={cardExpiry}
                onChangeText={onChangeCardExpiry}
                placeholder="MM/YY"
                placeholderTextColor={Colors.secondary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>CVV</Text>
              <TextInput
                style={styles.subInput}
                value={cardCvv}
                onChangeText={onChangeCardCvv}
                placeholder="123"
                placeholderTextColor={Colors.secondary}
                secureTextEntry
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 12,
  },
  optionsList: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.accentLight,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerSelected: {
    backgroundColor: Colors.white,
  },
  optionDetails: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  optionTitleSelected: {
    color: Colors.primary,
  },
  optionDesc: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 2,
  },
  inputContainer: {
    marginTop: 14,
    padding: 14,
    backgroundColor: Colors.bgLight,
    borderRadius: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 42,
    fontSize: 13,
    color: Colors.textDark,
  },
  cardSubRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  subInput: {
    height: 42,
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    fontSize: 13,
    color: Colors.textDark,
  },
});

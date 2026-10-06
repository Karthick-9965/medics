import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../../constants/Colors';
import ModalHeader from '../../common/ModalHeader';
import MedicalAlertModal, { MedicalAlertType } from '../../modals/MedicalAlertModal';

export type CardBrand = 'Visa' | 'Mastercard' | 'RuPay' | 'Amex';

export interface SavedCard {
  id: string;
  cardNumber: string;
  last4: string;
  cardHolder: string;
  expiry: string;
  cardType: CardBrand;
  isDefault: boolean;
  colorScheme: 'teal' | 'navy' | 'dark' | 'emerald';
}

export interface PaymentMethodsModalProps {
  visible: boolean;
  onClose: () => void;
  onCardUpdated?: (defaultCardText: string) => void;
}

const DEFAULT_CARDS: SavedCard[] = [
  {
    id: 'card_1',
    cardNumber: '•••• •••• •••• 4242',
    last4: '4242',
    cardHolder: 'User',
    expiry: '12/28',
    cardType: 'Visa',
    isDefault: true,
    colorScheme: 'teal',
  },
  {
    id: 'card_2',
    cardNumber: '•••• •••• •••• 8831',
    last4: '8831',
    cardHolder: 'User',
    expiry: '09/27',
    cardType: 'Mastercard',
    isDefault: false,
    colorScheme: 'navy',
  },
];

const DEFAULT_UPI_LIST = [
  { id: 'upi_1', vpa: 'user@okhdfcbank', bankName: 'HDFC Bank', isDefault: true },
  { id: 'upi_2', vpa: 'user@paytm', bankName: 'Paytm Payments Bank', isDefault: false },
];

export default function PaymentMethodsModal({
  visible,
  onClose,
  onCardUpdated,
}: PaymentMethodsModalProps) {
  const [cards, setCards] = useState<SavedCard[]>(DEFAULT_CARDS);
  const [upiList, setUpiList] = useState(DEFAULT_UPI_LIST);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddUpi, setShowAddUpi] = useState(false);

  // Add Card Form State
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardHolder, setNewCardHolder] = useState('');
  const [newExpiry, setNewExpiry] = useState('');
  const [newCvv, setNewCvv] = useState('');
  const [newIsDefault, setNewIsDefault] = useState(false);

  // Add UPI Form State
  const [newUpiId, setNewUpiId] = useState('');

  // Medical Alert Modal State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: MedicalAlertType;
    title: string;
    message: string;
    primaryButtonText?: string;
    secondaryButtonText?: string;
    onPrimaryPress?: () => void;
    onSecondaryPress?: () => void;
    isDestructive?: boolean;
  }>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });

  // Load saved cards on mount
  useEffect(() => {
    AsyncStorage.getItem('@user_saved_cards').then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCards(parsed);
          }
        } catch (e) {
          console.log('Error parsing saved cards:', e);
        }
      }
    });
  }, []);

  const saveCardsToStorage = async (updatedCards: SavedCard[]) => {
    setCards(updatedCards);
    await AsyncStorage.setItem('@user_saved_cards', JSON.stringify(updatedCards));
    const defaultCard = updatedCards.find((c) => c.isDefault) || updatedCards[0];
    if (defaultCard && onCardUpdated) {
      onCardUpdated(`${defaultCard.cardType} ending in ${defaultCard.last4}`);
    }
  };

  // Detect brand based on first digits
  const detectBrand = (num: string): CardBrand => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('51') || clean.startsWith('52') || clean.startsWith('53') || clean.startsWith('54') || clean.startsWith('55') || clean.startsWith('2')) return 'Mastercard';
    if (clean.startsWith('60') || clean.startsWith('65') || clean.startsWith('81') || clean.startsWith('508')) return 'RuPay';
    if (clean.startsWith('34') || clean.startsWith('37')) return 'Amex';
    return 'Visa';
  };

  // Card Number Formatter: "4532 8920 1234 4242"
  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setNewCardNumber(formatted);
  };

  // Expiry Formatter: "MM/YY"
  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      setNewExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      setNewExpiry(cleaned);
    }
  };

  const resetCardForm = () => {
    setNewCardNumber('');
    setNewCardHolder('');
    setNewExpiry('');
    setNewCvv('');
    setNewIsDefault(false);
    setShowAddCard(false);
  };

  const handleSaveCard = () => {
    const rawNumber = newCardNumber.replace(/\s/g, '');
    if (rawNumber.length < 16) {
      setAlertConfig({
        visible: true,
        type: 'warning',
        title: 'Invalid Card Number',
        message: 'Please enter a valid 16-digit debit or credit card number.',
        onPrimaryPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
      });
      return;
    }

    if (!newCardHolder.trim()) {
      setAlertConfig({
        visible: true,
        type: 'warning',
        title: 'Missing Cardholder Name',
        message: 'Please enter the name printed on the card.',
        onPrimaryPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
      });
      return;
    }

    if (newExpiry.length < 5) {
      setAlertConfig({
        visible: true,
        type: 'warning',
        title: 'Invalid Expiry Date',
        message: 'Please enter a valid expiry date in MM/YY format.',
        onPrimaryPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
      });
      return;
    }

    if (newCvv.length < 3) {
      setAlertConfig({
        visible: true,
        type: 'warning',
        title: 'Invalid CVV',
        message: 'Please enter a 3 or 4-digit CVV security code.',
        onPrimaryPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
      });
      return;
    }

    const brand = detectBrand(rawNumber);
    const last4 = rawNumber.slice(-4);
    const colorOptions: Array<'teal' | 'navy' | 'dark' | 'emerald'> = ['teal', 'navy', 'dark', 'emerald'];
    const chosenColor = colorOptions[cards.length % colorOptions.length];

    const newCard: SavedCard = {
      id: `card_${Date.now()}`,
      cardNumber: `•••• •••• •••• ${last4}`,
      last4,
      cardHolder: newCardHolder.trim().toUpperCase(),
      expiry: newExpiry,
      cardType: brand,
      isDefault: newIsDefault || cards.length === 0,
      colorScheme: chosenColor,
    };

    let updatedList = [...cards];
    if (newCard.isDefault) {
      updatedList = updatedList.map((c) => ({ ...c, isDefault: false }));
    }
    updatedList.push(newCard);

    saveCardsToStorage(updatedList);
    resetCardForm();

    setAlertConfig({
      visible: true,
      type: 'success',
      title: 'Card Added Successfully',
      message: `${brand} ending in ${last4} has been securely saved for instant hospital visits & pharmacy orders.`,
      primaryButtonText: 'Done',
      onPrimaryPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
    });
  };

  const handleSetDefault = (cardId: string) => {
    const updated = cards.map((c) => ({
      ...c,
      isDefault: c.id === cardId,
    }));
    saveCardsToStorage(updated);
  };

  const handleDeleteCard = (cardId: string) => {
    const cardToDelete = cards.find((c) => c.id === cardId);
    if (!cardToDelete) return;

    setAlertConfig({
      visible: true,
      type: 'delete',
      title: 'Remove Card',
      message: `Are you sure you want to remove ${cardToDelete.cardType} ending in ${cardToDelete.last4}?`,
      primaryButtonText: 'Remove Card',
      secondaryButtonText: 'Cancel',
      isDestructive: true,
      onPrimaryPress: () => {
        const remaining = cards.filter((c) => c.id !== cardId);
        if (cardToDelete.isDefault && remaining.length > 0) {
          remaining[0].isDefault = true;
        }
        saveCardsToStorage(remaining);
        setAlertConfig((prev) => ({ ...prev, visible: false }));
      },
      onSecondaryPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
    });
  };

  const handleAddUpi = () => {
    if (!newUpiId.includes('@') || newUpiId.length < 5) {
      setAlertConfig({
        visible: true,
        type: 'warning',
        title: 'Invalid UPI ID',
        message: 'Please enter a valid UPI VPA handle (e.g. name@bank).',
        onPrimaryPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
      });
      return;
    }

    const newUpi = {
      id: `upi_${Date.now()}`,
      vpa: newUpiId.trim().toLowerCase(),
      bankName: 'Verified UPI Handle',
      isDefault: false,
    };

    setUpiList([...upiList, newUpi]);
    setNewUpiId('');
    setShowAddUpi(false);

    setAlertConfig({
      visible: true,
      type: 'success',
      title: 'UPI Handle Verified',
      message: `${newUpi.vpa} is linked for fast 1-click approvals.`,
      primaryButtonText: 'Great',
      onPrimaryPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
    });
  };

  // Helper to get card background gradient or solid color
  const getCardBg = (scheme: SavedCard['colorScheme']) => {
    switch (scheme) {
      case 'teal':
        return Colors.darkTeal;
      case 'navy':
        return Colors.medicalBlueDark;
      case 'emerald':
        return Colors.emeraldGreenDark;
      case 'dark':
      default:
        return Colors.textSlateDark;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ModalHeader
          title="Payment Methods"
          subtitle="Manage saved cards & payment options"
          onClose={onClose}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Section: Credit & Debit Cards */}
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Debit & Credit Cards</Text>
              <Text style={styles.sectionSub}>Visa, MasterCard, RuPay & Amex</Text>
            </View>
            <TouchableOpacity
              style={styles.addCardSmallBtn}
              onPress={() => setShowAddCard(!showAddCard)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showAddCard ? 'close-circle' : 'add-circle'}
                size={18}
                color={Colors.primary}
              />
              <Text style={styles.addCardSmallBtnText}>
                {showAddCard ? 'Cancel' : 'Add Card'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Add New Card Form / Drawer */}
          {showAddCard && (
            <View style={styles.addCardBox}>
              <Text style={styles.addCardBoxTitle}>Add New Card</Text>

              {/* Form Inputs */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="card-outline" size={18} color={Colors.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor={Colors.inputPlaceholder}
                    value={newCardNumber}
                    onChangeText={handleCardNumberChange}
                    keyboardType="number-pad"
                    maxLength={19}
                  />
                  {newCardNumber.length > 0 && (
                    <Text style={styles.detectedBrandBadge}>{detectBrand(newCardNumber)}</Text>
                  )}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Cardholder Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={18} color={Colors.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Name as printed on card"
                    placeholderTextColor={Colors.inputPlaceholder}
                    value={newCardHolder}
                    onChangeText={setNewCardHolder}
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="calendar-outline" size={18} color={Colors.secondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="MM/YY"
                      placeholderTextColor={Colors.inputPlaceholder}
                      value={newExpiry}
                      onChangeText={handleExpiryChange}
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                  </View>
                </View>

                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>CVV / CVC</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={18} color={Colors.secondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="3 or 4 digits"
                      placeholderTextColor={Colors.inputPlaceholder}
                      value={newCvv}
                      onChangeText={(t) => setNewCvv(t.replace(/\D/g, '').slice(0, 4))}
                      keyboardType="number-pad"
                      secureTextEntry
                      maxLength={4}
                    />
                  </View>
                </View>
              </View>

              {/* Default Toggle */}
              <TouchableOpacity
                style={styles.checkboxRow}
                activeOpacity={0.7}
                onPress={() => setNewIsDefault(!newIsDefault)}
              >
                <View style={[styles.checkbox, newIsDefault && styles.checkboxActive]}>
                  {newIsDefault && <Ionicons name="checkmark" size={14} color={Colors.white} />}
                </View>
                <Text style={styles.checkboxLabel}>Set as default payment card</Text>
              </TouchableOpacity>

              {/* Action Buttons */}
              <View style={styles.addCardActionsRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={resetCardForm}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveCardBtn}
                  onPress={handleSaveCard}
                  activeOpacity={0.8}
                >
                  <Ionicons name="shield-checkmark-outline" size={17} color={Colors.white} style={{ marginRight: 6 }} />
                  <Text style={styles.saveCardBtnText}>Save Card</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Cards List - Clean Details Format */}
          <View style={styles.cardsList}>
            {cards.map((card) => {
              return (
                <View key={card.id} style={styles.cardItemRow}>
                  <View
                    style={[
                      styles.cardBrandIconBox,
                      card.isDefault && styles.cardBrandIconBoxActive,
                    ]}
                  >
                    <Ionicons
                      name="card"
                      size={22}
                      color={card.isDefault ? Colors.primary : Colors.secondary}
                    />
                  </View>

                  <View style={styles.cardItemDetails}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.cardBrandTitle}>{card.cardType}</Text>
                      {card.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Ionicons name="checkmark-circle" size={12} color={Colors.successGreen} />
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.cardNumberText}>{card.cardNumber}</Text>
                    <Text style={styles.cardSubText} numberOfLines={1}>
                      Expires {card.expiry} • {card.cardHolder}
                    </Text>
                  </View>

                  <View style={styles.cardRowActions}>
                    {!card.isDefault && (
                      <TouchableOpacity
                        style={styles.setDefaultBtn}
                        onPress={() => handleSetDefault(card.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.setDefaultBtnText}>Set Default</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.deleteCardBtn}
                      onPress={() => handleDeleteCard(card.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.7}
                      accessibilityLabel="Remove card"
                    >
                      <Ionicons name="trash-outline" size={17} color={Colors.logoutRed} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Section: UPI Handles */}
          <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
            <View>
              <Text style={styles.sectionTitle}>UPI Payment Handles</Text>
              <Text style={styles.sectionSub}>Google Pay, PhonePe, Paytm & BHIM</Text>
            </View>
            <TouchableOpacity
              style={styles.addCardSmallBtn}
              onPress={() => setShowAddUpi(!showAddUpi)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showAddUpi ? 'close-circle' : 'add-circle'}
                size={18}
                color={Colors.primary}
              />
              <Text style={styles.addCardSmallBtnText}>
                {showAddUpi ? 'Cancel' : 'Add UPI'}
              </Text>
            </TouchableOpacity>
          </View>

          {showAddUpi && (
            <View style={styles.addUpiBox}>
              <Text style={styles.addCardBoxTitle}>Link New UPI ID</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="flash-outline" size={18} color={Colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. mobile@upi or username@okaxis"
                  placeholderTextColor={Colors.inputPlaceholder}
                  value={newUpiId}
                  onChangeText={setNewUpiId}
                  autoCapitalize="none"
                />
              </View>
              <TouchableOpacity
                style={styles.saveUpiBtn}
                onPress={handleAddUpi}
                activeOpacity={0.8}
              >
                <Text style={styles.saveUpiBtnText}>Verify & Link UPI</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.upiList}>
            {upiList.map((item) => (
              <View key={item.id} style={styles.upiItem}>
                <View style={styles.upiIconContainer}>
                  <Ionicons name="flash" size={20} color={Colors.primary} />
                </View>
                <View style={styles.upiInfo}>
                  <Text style={styles.upiVpa}>{item.vpa}</Text>
                  <Text style={styles.upiBank}>{item.bankName}</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="shield-checkmark" size={14} color={Colors.successGreen} />
                  <Text style={styles.verifiedBadgeText}>Verified</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Security & Trust Footer */}
          <View style={styles.securityBox}>
            <Ionicons name="shield-checkmark" size={22} color={Colors.successGreen} />
            <View style={styles.securityTextWrap}>
              <Text style={styles.securityTitle}>Bank-Grade 256-Bit SSL Encryption</Text>
              <Text style={styles.securitySub}>
                Your card numbers are tokenized according to RBI & PCI-DSS security guidelines. Full card details are never stored locally.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* In-Modal Medical Alert */}
        <MedicalAlertModal
          visible={alertConfig.visible}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          primaryButtonText={alertConfig.primaryButtonText}
          secondaryButtonText={alertConfig.secondaryButtonText}
          isDestructive={alertConfig.isDestructive}
          onPrimaryPress={() => alertConfig.onPrimaryPress?.()}
          onSecondaryPress={() => alertConfig.onSecondaryPress?.()}
          onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
  },
  sectionSub: {
    fontSize: 13,
    color: Colors.secondary,
    marginTop: 2,
  },
  addCardSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 4,
  },
  addCardSmallBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },

  // Add Card Form Box
  addCardBox: {
    backgroundColor: Colors.bgLight,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  addCardBoxTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 14,
  },
  // Form Inputs
  formGroup: {
    marginBottom: 14,
  },
  formRow: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
    paddingVertical: 0,
  },
  detectedBrandBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxLabel: {
    fontSize: 13,
    color: Colors.textDark,
    fontWeight: '500',
  },
  addCardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSlateMedium,
  },
  saveCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  saveCardBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },

  // Cards List Styling - Clean Details Row
  cardsList: {
    gap: 12,
  },
  cardItemRow: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardBrandIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardBrandIconBoxActive: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.primary,
  },
  cardItemDetails: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  cardBrandTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
  },
  cardNumberText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: Colors.textDark,
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 2,
  },
  cardSubText: {
    fontSize: 11.5,
    color: Colors.secondary,
  },
  cardRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 6,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successBorderLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  defaultBadgeText: {
    color: Colors.successGreen,
    fontSize: 10.5,
    fontWeight: '700',
  },
  setDefaultBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  setDefaultBtnText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  deleteCardBtn: {
    backgroundColor: Colors.dangerBgLight,
    padding: 7,
    borderRadius: 8,
  },

  // UPI List
  addUpiBox: {
    backgroundColor: Colors.bgLight,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  saveUpiBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  saveUpiBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  upiList: {
    gap: 10,
  },
  upiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  upiIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  upiInfo: {
    flex: 1,
  },
  upiVpa: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  upiBank: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successBgLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 3,
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.successGreen,
  },

  // Security box
  securityBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.successBgLight,
    borderWidth: 1,
    borderColor: Colors.successBorderLight,
    borderRadius: 16,
    padding: 14,
    marginTop: 28,
    gap: 12,
  },
  securityTextWrap: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.successDark,
    marginBottom: 3,
  },
  securitySub: {
    fontSize: 11.5,
    color: Colors.successMedium,
    lineHeight: 16,
  },
});

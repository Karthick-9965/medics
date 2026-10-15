import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { PharmacyItem } from '../../constants/pharmaciesData';
import { CartEntryItem } from './PharmacyCheckoutView';
import { downloadBillAsPdf, BillItem } from '../../utils/billPdfGenerator';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PharmacySuccessViewProps {
  pharmacy: PharmacyItem;
  lastOrderType: 'prescription' | 'catalog';
  orderId: string;
  prescriptionUri: string | null;
  selectedDuration: string;
  cartEntries?: CartEntryItem[];
  subtotal?: number;
  deliveryFee?: number;
  totalAmount?: string;
  deliveryAddress?: string;
  deliveryPhone?: string;
  paymentMethod?: string;
  onDone: () => void;
}

/**
 * Reusable Order Confirmation Popup & Receipt View.
 * Displays order confirmation, itemized tablet details with counts,
 * final bill breakdown, and a real PDF "Download Bill" button along with "Close".
 */
export default function PharmacySuccessView({
  pharmacy,
  lastOrderType,
  orderId,
  prescriptionUri,
  selectedDuration,
  cartEntries = [],
  subtotal = 0,
  deliveryFee = 0,
  totalAmount = '0.00',
  deliveryAddress = '742 Evergreen Terrace, Medical District',
  deliveryPhone = '+91 98401 23456',
  paymentMethod = 'Cash on Delivery',
  onDone,
}: PharmacySuccessViewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const isFreeDelivery = deliveryFee === 0 || subtotal >= 500;

  const handleDownloadBill = async () => {
    try {
      setIsDownloading(true);

      const billItems: BillItem[] =
        lastOrderType === 'catalog' && cartEntries.length > 0
          ? cartEntries.map(({ medicine, quantity }) => ({
              name: medicine.name,
              dosage: medicine.dosage,
              quantity,
              unitPrice: `₹${medicine.price.toFixed(2)}`,
              totalPrice: `₹${(medicine.price * quantity).toFixed(2)}`,
            }))
          : [
              {
                name: 'Prescription Verified Dispense',
                dosage: `${selectedDuration} Course`,
                quantity: 1,
                unitPrice: 'Pay on Delivery',
                totalPrice: 'Pay on Delivery',
              },
            ];

      // Pre-persist active session so if the external PDF reader app takes over memory, returning back restores this view instantly
      try {
        const activeSession = {
          pharmacy,
          orderId,
          lastOrderType,
          viewState: 'success',
          prescriptionUri,
          selectedDuration,
          cartEntries,
          subtotal,
          deliveryFee,
          totalAmount,
          deliveryAddress,
          deliveryPhone,
          paymentMethod,
        };
        await AsyncStorage.setItem('@app_active_order_session', JSON.stringify(activeSession));
      } catch (err) {
        // ignore
      }

      await downloadBillAsPdf({
        orderId,
        date: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        pharmacyName: pharmacy.name,
        pharmacyAddress: pharmacy.address,
        pharmacyPhone: pharmacy.phone,
        customerName: 'Karthick (Patient)',
        deliveryAddress,
        deliveryPhone,
        paymentMethod,
        items: billItems,
        subtotal: `₹${subtotal.toFixed(2)}`,
        deliveryFee: isFreeDelivery ? 'FREE' : `₹${deliveryFee.toFixed(2)}`,
        totalAmount: `₹${totalAmount}`,
        eta: pharmacy.deliveryTime || '15-25 mins',
      });

      setDownloadSuccess(true);
    } catch (e) {
      console.error('Error generating PDF bill:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {/* 1. Header Confirmation Badge */}
      <View style={styles.successHeaderCard}>
        <View style={styles.successIconBubble}>
          <Ionicons name="checkmark" size={38} color={Colors.white} />
        </View>
        <Text style={styles.successTitle}>
          {lastOrderType === 'prescription' ? 'Prescription Order Placed!' : 'Order Confirmed!'}
        </Text>
        <Text style={styles.successSubtitle}>
          {lastOrderType === 'prescription'
            ? `Your prescription has been received by ${pharmacy.name}. Verified pharmacist is preparing your dosage.`
            : `Your medicine order has been successfully placed with ${pharmacy.name}.`}
        </Text>

        <View style={styles.orderIdBadge}>
          <Text style={styles.orderIdLabel}>Order ID:</Text>
          <Text style={styles.orderIdValue}>{orderId}</Text>
        </View>
      </View>

      {/* 2. Prescription Thumbnail if uploaded */}
      {lastOrderType === 'prescription' && prescriptionUri && (
        <View style={styles.prescriptionCard}>
          <Image source={{ uri: prescriptionUri }} style={styles.rxThumb} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.rxCardTitle}>Prescription Attached</Text>
            <Text style={styles.rxCardSub}>Course Duration: {selectedDuration}</Text>
            <Text style={styles.rxCardStatus}>Status: Under Pharmacist Review</Text>
          </View>
        </View>
      )}

      {/* 3. Ordered Tablets Details (Name & Count) */}
      {lastOrderType === 'catalog' && cartEntries.length > 0 && (
        <View style={styles.detailsCard}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="medkit-outline" size={17} color={Colors.primary} />
              <Text style={styles.cardHeaderTitle}>Ordered Tablets & Medicines</Text>
            </View>
            <Text style={styles.itemCountText}>
              {cartEntries.reduce((acc, it) => acc + it.quantity, 0)} items
            </Text>
          </View>

          <View style={styles.divider} />

          {cartEntries.map(({ medicine, quantity }) => (
            <View key={medicine.id} style={styles.tabletRow}>
              <View style={styles.bulletDot} />
              <View style={styles.tabletInfo}>
                <Text style={styles.tabletName} numberOfLines={1}>
                  {medicine.name}
                </Text>
                <Text style={styles.tabletDosage}>{medicine.dosage}</Text>
              </View>

              <View style={styles.countPill}>
                <Text style={styles.countPillText}>Count: {quantity}</Text>
              </View>

              <Text style={styles.tabletPrice}>
                ₹{(medicine.price * quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* 4. Full Bill Summary */}
      <View style={styles.detailsCard}>
        <View style={styles.cardHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="receipt-outline" size={17} color={Colors.primary} />
            <Text style={styles.cardHeaderTitle}>Bill Details</Text>
          </View>
          <Text style={styles.pharmacyNameBadge}>{pharmacy.name}</Text>
        </View>

        <View style={styles.divider} />

        {lastOrderType === 'catalog' ? (
          <>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Item Subtotal</Text>
              <Text style={styles.billValue}>₹{subtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.billRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.billLabel}>Delivery Charge</Text>
                {isFreeDelivery && (
                  <View style={styles.freeBadge}>
                    <Text style={styles.freeBadgeText}>FREE DELIVERY</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.billValue, isFreeDelivery && styles.freeValueText]}>
                {isFreeDelivery ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
              </Text>
            </View>

            <View style={[styles.divider, { marginVertical: 8 }]} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{totalAmount}</Text>
            </View>
          </>
        ) : (
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Medicines Bill</Text>
            <Text style={styles.billValue}>Pay on Delivery / Verified</Text>
          </View>
        )}

        {/* Delivery Destination & Payment */}
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={Colors.secondary} />
          <Text style={styles.metaText} numberOfLines={1}>
            {deliveryAddress}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="card-outline" size={14} color={Colors.secondary} />
          <Text style={styles.metaText}>Payment Mode: {paymentMethod}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={14} color={Colors.secondary} />
          <Text style={styles.metaText}>ETA: {pharmacy.deliveryTime || '15-25 mins'}</Text>
        </View>
      </View>

      {/* 5. Action Buttons: Download Bill (PDF) & Close */}
      <View style={styles.actionButtonsContainer}>
        {/* Download Bill Button */}
        <TouchableOpacity
          style={styles.downloadBillBtn}
          onPress={handleDownloadBill}
          disabled={isDownloading}
          activeOpacity={0.8}
        >
          {isDownloading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <>
              <Ionicons
                name={downloadSuccess ? 'checkmark-done-circle' : 'download-outline'}
                size={20}
                color={Colors.white}
              />
              <Text style={styles.downloadBillBtnText}>
                {downloadSuccess ? 'Bill PDF Downloaded' : 'Download Bill (PDF)'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onDone}
          activeOpacity={0.8}
        >
          <Ionicons name="close-circle-outline" size={20} color={Colors.textDark} />
          <Text style={styles.closeBtnText}>Close</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 18,
    paddingBottom: 36,
  },
  successHeaderCard: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  successIconBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.successGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 12.5,
    color: Colors.secondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 14,
  },
  orderIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderIdLabel: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '600',
  },
  orderIdValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  prescriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgPage,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  rxThumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  rxCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.black,
  },
  rxCardSub: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
  },
  rxCardStatus: {
    fontSize: 11.5,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.textDark,
  },
  itemCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
  pharmacyNameBadge: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dividerLine,
    marginVertical: 10,
  },
  tabletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: 8,
  },
  tabletInfo: {
    flex: 1,
    marginRight: 8,
  },
  tabletName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
  },
  tabletDosage: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 1,
  },
  countPill: {
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginRight: 10,
  },
  countPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.textDark,
  },
  tabletPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
    minWidth: 54,
    textAlign: 'right',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
  },
  billLabel: {
    fontSize: 13,
    color: Colors.secondary,
  },
  billValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
  },
  freeBadge: {
    backgroundColor: Colors.successBgTint,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  freeBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Colors.successDark,
  },
  freeValueText: {
    color: Colors.successGreen,
    fontWeight: '800',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.textDark,
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  metaText: {
    fontSize: 11.5,
    color: Colors.secondary,
    flex: 1,
  },
  actionButtonsContainer: {
    gap: 10,
    marginTop: 6,
  },
  downloadBillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  downloadBillBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: Colors.white,
  },
  closeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingVertical: 13,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
});

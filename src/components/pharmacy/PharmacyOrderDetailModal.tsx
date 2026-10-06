import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { PharmacyOrder } from '../bottomTab/profile/PharmacyOrdersModal';
import DeliveryProgressTracker from './DeliveryProgressTracker';
import DeliveryAgentCard from './DeliveryAgentCard';
import OrderReceiptBreakdown from './OrderReceiptBreakdown';

export interface PharmacyOrderDetailModalProps {
  order: PharmacyOrder | null;
  onClose: () => void;
  onCallPharmacy: (phone: string) => void;
  onCallDeliveryAgent: (phone: string) => void;
  onReorder: (order: PharmacyOrder) => void;
}

/**
 * Reusable modal/overlay displaying full pharmacy order tracker,
 * delivery progress, delivery partner information, and receipt breakdown.
 */
export default function PharmacyOrderDetailModal({
  order,
  onClose,
  onCallPharmacy,
  onCallDeliveryAgent,
  onReorder,
}: PharmacyOrderDetailModalProps) {
  if (!order) return null;

  return (
    <View style={styles.detailsOverlay}>
      <View style={styles.detailsModalContent}>
        {/* Overlay Header */}
        <View style={styles.detailsHeader}>
          <View>
            <Text style={styles.detailsHeaderTitle}>Order Tracker</Text>
            <Text style={styles.detailsHeaderSub}>{order.id}</Text>
          </View>
          <TouchableOpacity
            style={styles.detailsCloseBtn}
            onPress={onClose}
          >
            <Ionicons name="close" size={22} color={Colors.textDark} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.detailsBody}
        >
          {/* Pharmacy Summary Banner */}
          <View style={styles.pharmacyBanner}>
            <View style={styles.bannerIconBox}>
              <Ionicons name="storefront-outline" size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerPharmacyName}>
                {order.pharmacyName}
              </Text>
              <Text style={styles.bannerPharmacyAddress}>
                {order.pharmacyAddress}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.callIconBtn}
              onPress={() => onCallPharmacy(order.pharmacyPhone)}
            >
              <Ionicons name="call" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Reusable 4-Step Visual Timeline */}
          <DeliveryProgressTracker
            trackingStep={order.trackingStep}
            eta={order.eta}
            deliveryAddress={order.deliveryAddress}
          />

          {/* Reusable Delivery Agent Card */}
          {order.deliveryAgent && (
            <DeliveryAgentCard
              agent={order.deliveryAgent}
              onCall={onCallDeliveryAgent}
            />
          )}

          {/* Reusable Order Items Breakdown */}
          <OrderReceiptBreakdown
            items={order.items}
            totalAmount={order.totalAmount}
            paymentMethod={order.paymentMethod}
          />

          {/* Modal Action Buttons */}
          <View style={styles.modalActionButtons}>
            <TouchableOpacity
              style={styles.repeatOrderBtn}
              onPress={() => onReorder(order)}
            >
              <Ionicons name="repeat-outline" size={17} color={Colors.white} />
              <Text style={styles.repeatOrderBtnText}>Order Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.supportBtn}
              onPress={() => onCallPharmacy(order.pharmacyPhone)}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={17}
                color={Colors.primary}
              />
              <Text style={styles.supportBtnText}>Pharmacy Help</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  detailsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.modalOverlay,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  detailsModalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailsHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
  },
  detailsHeaderSub: {
    fontSize: 12.5,
    color: Colors.secondary,
    marginTop: 2,
    fontWeight: '600',
  },
  detailsCloseBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: Colors.bgLight,
  },
  detailsBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  pharmacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    padding: 12,
    borderRadius: 14,
    gap: 12,
  },
  bannerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerPharmacyName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.textDark,
  },
  bannerPharmacyAddress: {
    fontSize: 11.5,
    color: Colors.secondary,
    marginTop: 2,
  },
  callIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  repeatOrderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  repeatOrderBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  supportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.accentLight,
    paddingVertical: 12,
    borderRadius: 12,
  },
  supportBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});

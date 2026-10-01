import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../../constants/Colors';
import ModalHeader from '../../common/ModalHeader';
import SearchBar from '../../common/SearchBar';
import EmptyState from '../../common/EmptyState';
import MedicalAlertModal, { MedicalAlertType } from '../../modals/MedicalAlertModal';
import PharmacyOrderCard from '../../pharmacy/PharmacyOrderCard';
import DeliveryProgressTracker from '../../pharmacy/DeliveryProgressTracker';
import DeliveryAgentCard from '../../pharmacy/DeliveryAgentCard';
import OrderReceiptBreakdown from '../../pharmacy/OrderReceiptBreakdown';

export interface PharmacyOrderItem {
  name: string;
  quantity: number;
  price: string;
}

export interface PharmacyOrder {
  id: string;
  pharmacyName: string;
  pharmacyAddress: string;
  pharmacyPhone: string;
  date: string;
  status: 'in_transit' | 'packed' | 'delivered' | 'cancelled';
  statusLabel: string;
  items: PharmacyOrderItem[];
  totalAmount: string;
  paymentMethod: string;
  deliveryAddress: string;
  eta: string;
  trackingStep: number; // 1: Confirmed, 2: Packed, 3: Out for delivery, 4: Delivered
  deliveryAgent?: {
    name: string;
    phone: string;
    vehicle: string;
  };
}

const DEFAULT_ORDERS: PharmacyOrder[] = [
  {
    id: '#MED-ORD-74912',
    pharmacyName: 'Apollo Pharmacy - Anna Nagar',
    pharmacyAddress: '2nd Avenue, Anna Nagar, Chennai',
    pharmacyPhone: '+91 44 2621 8900',
    date: 'Today, 01:25 PM',
    status: 'in_transit',
    statusLabel: 'Out for Delivery',
    items: [
      { name: 'Paracetamol 650mg (Strip of 15)', quantity: 2, price: '$7.00' },
      { name: 'Amoxicillin 500mg (Strip of 10)', quantity: 1, price: '$12.50' },
      { name: 'Vitamin C Chewable (Bottle of 30)', quantity: 1, price: '$9.00' },
    ],
    totalAmount: '$28.50',
    paymentMethod: 'UPI Paid (Transaction #991024)',
    deliveryAddress: '742 Evergreen Terrace, Medical District, Chennai',
    eta: 'Arriving in 15-20 mins',
    trackingStep: 3,
    deliveryAgent: {
      name: 'Ramesh Kumar',
      phone: '+91 98401 23456',
      vehicle: 'Hero Electric (TN 09 AZ 4192)',
    },
  },
  {
    id: '#MED-ORD-68310',
    pharmacyName: 'Care Pharma Store',
    pharmacyAddress: 'Kilpauk Garden Road, Chennai',
    pharmacyPhone: '+91 44 2836 1200',
    date: '28 Sep 2026, 04:15 PM',
    status: 'delivered',
    statusLabel: 'Delivered',
    items: [
      { name: 'Atorvastatin 10mg (Strip of 10)', quantity: 2, price: '$16.00' },
      { name: 'Aspirin 75mg Gastro-resistant', quantity: 1, price: '$5.50' },
    ],
    totalAmount: '$21.50',
    paymentMethod: 'Cash on Delivery (Paid)',
    deliveryAddress: '742 Evergreen Terrace, Medical District, Chennai',
    eta: 'Delivered on 28 Sep, 05:02 PM',
    trackingStep: 4,
    deliveryAgent: {
      name: 'Vignesh Sundar',
      phone: '+91 97902 34567',
      vehicle: 'TVS Jupiter (TN 02 BK 7821)',
    },
  },
  {
    id: '#MED-ORD-51924',
    pharmacyName: 'MedPlus Health & Wellness',
    pharmacyAddress: 'Poonamallee High Road, Chennai',
    pharmacyPhone: '+91 44 2645 3300',
    date: '18 Sep 2026, 10:40 AM',
    status: 'delivered',
    statusLabel: 'Delivered',
    items: [
      { name: 'Omeprazole 20mg Capsules', quantity: 1, price: '$8.00' },
      { name: 'Electrolyte Hydration Powder (Pack of 5)', quantity: 2, price: '$6.00' },
    ],
    totalAmount: '$14.00',
    paymentMethod: 'Visa Card ending in 4242',
    deliveryAddress: '742 Evergreen Terrace, Medical District, Chennai',
    eta: 'Delivered on 18 Sep, 11:22 AM',
    trackingStep: 4,
  },
];

interface PharmacyOrdersModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Main Pharmacy Orders & Medicine Tracker Modal.
 * Clean, modular architecture composed of PharmacyOrderCard, DeliveryProgressTracker,
 * DeliveryAgentCard, and OrderReceiptBreakdown.
 */
export default function PharmacyOrdersModal({
  visible,
  onClose,
}: PharmacyOrdersModalProps) {
  const [orders, setOrders] = useState<PharmacyOrder[]>(DEFAULT_ORDERS);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'delivered'>('all');
  const [selectedOrder, setSelectedOrder] = useState<PharmacyOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type?: MedicalAlertType;
    icon?: keyof typeof Ionicons.glyphMap;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  useEffect(() => {
    if (visible) {
      loadOrders();
    }
  }, [visible]);

  const loadOrders = async () => {
    try {
      const stored = await AsyncStorage.getItem('@app_pharmacy_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOrders(parsed);
          return;
        }
      }
      setOrders(DEFAULT_ORDERS);
    } catch (e) {
      console.log('Error loading pharmacy orders:', e);
    }
  };

  const saveOrders = async (newOrders: PharmacyOrder[]) => {
    setOrders(newOrders);
    try {
      await AsyncStorage.setItem('@app_pharmacy_orders', JSON.stringify(newOrders));
    } catch (e) {
      console.log('Error saving pharmacy orders:', e);
    }
  };

  const handleCallPharmacy = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      setAlertConfig({
        visible: true,
        type: 'info',
        icon: 'call-outline',
        title: 'Call Pharmacy',
        message: `Pharmacy support line: ${phone}`,
      });
    });
  };

  const handleCallDeliveryAgent = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      setAlertConfig({
        visible: true,
        type: 'info',
        icon: 'bicycle-outline',
        title: 'Delivery Partner',
        message: `Driver Contact: ${phone}`,
      });
    });
  };

  const handleReorder = (order: PharmacyOrder) => {
    const newOrderId = `#MED-ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: PharmacyOrder = {
      ...order,
      id: newOrderId,
      date: 'Just Now',
      status: 'in_transit',
      statusLabel: 'Order Confirmed',
      trackingStep: 1,
      eta: 'Estimated delivery: 25-35 mins',
    };

    const updated = [newOrder, ...orders];
    saveOrders(updated);
    setSelectedOrder(newOrder);

    setAlertConfig({
      visible: true,
      type: 'success',
      icon: 'checkmark-circle',
      title: 'Order Placed!',
      message: `Re-order ${newOrderId} has been sent to ${order.pharmacyName}. Delivery partner will be assigned shortly.`,
    });
  };

  const filteredOrders = orders.filter((ord) => {
    if (filterTab === 'active') {
      if (ord.status !== 'in_transit' && ord.status !== 'packed') return false;
    } else if (filterTab === 'delivered') {
      if (ord.status !== 'delivered') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = ord.pharmacyName.toLowerCase().includes(q);
      const matchId = ord.id.toLowerCase().includes(q);
      const matchItem = ord.items.some((it) => it.name.toLowerCase().includes(q));
      if (!matchName && !matchId && !matchItem) return false;
    }

    return true;
  });

  const activeCount = orders.filter(
    (o) => o.status === 'in_transit' || o.status === 'packed'
  ).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <ModalHeader
          title="Pharmacy Orders"
          subtitle="Track medicines & live deliveries"
          onClose={onClose}
        />

        {/* Tab Filters */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, filterTab === 'all' && styles.tabButtonActive]}
            onPress={() => setFilterTab('all')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabButtonText,
                filterTab === 'all' && styles.tabButtonTextActive,
              ]}
            >
              All Orders ({orders.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, filterTab === 'active' && styles.tabButtonActive]}
            onPress={() => setFilterTab('active')}
            activeOpacity={0.7}
          >
            <View style={styles.tabBadgeRow}>
              <Text
                style={[
                  styles.tabButtonText,
                  filterTab === 'active' && styles.tabButtonTextActive,
                ]}
              >
                Active
              </Text>
              {activeCount > 0 && (
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>{activeCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              filterTab === 'delivered' && styles.tabButtonActive,
            ]}
            onPress={() => setFilterTab('delivered')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabButtonText,
                filterTab === 'delivered' && styles.tabButtonTextActive,
              ]}
            >
              Delivered
            </Text>
          </TouchableOpacity>
        </View>

        {/* Reusable Search Bar */}
        <View style={styles.searchWrapper}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search medicine or pharmacy..."
            onClear={() => setSearchQuery('')}
          />
        </View>

        {/* Orders Scroll List */}
        <ScrollView
          style={styles.ordersList}
          contentContainerStyle={styles.ordersListContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredOrders.length === 0 ? (
            <EmptyState
              icon="cart-outline"
              title="No Orders Found"
              subtitle={
                searchQuery
                  ? 'No orders match your search keyword.'
                  : 'You have not placed any medicine orders in this category yet.'
              }
            />
          ) : (
            filteredOrders.map((order) => (
              <PharmacyOrderCard
                key={order.id}
                order={order}
                onViewDetails={(ord) => setSelectedOrder(ord)}
                onReorder={handleReorder}
              />
            ))
          )}
        </ScrollView>

        {/* Live Tracking / Order Details Overlay */}
        {selectedOrder && (
          <View style={styles.detailsOverlay}>
            <View style={styles.detailsModalContent}>
              {/* Overlay Header */}
              <View style={styles.detailsHeader}>
                <View>
                  <Text style={styles.detailsHeaderTitle}>Order Tracker</Text>
                  <Text style={styles.detailsHeaderSub}>{selectedOrder.id}</Text>
                </View>
                <TouchableOpacity
                  style={styles.detailsCloseBtn}
                  onPress={() => setSelectedOrder(null)}
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
                      {selectedOrder.pharmacyName}
                    </Text>
                    <Text style={styles.bannerPharmacyAddress}>
                      {selectedOrder.pharmacyAddress}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.callIconBtn}
                    onPress={() => handleCallPharmacy(selectedOrder.pharmacyPhone)}
                  >
                    <Ionicons name="call" size={16} color={Colors.primary} />
                  </TouchableOpacity>
                </View>

                {/* Reusable 4-Step Visual Timeline */}
                <DeliveryProgressTracker
                  trackingStep={selectedOrder.trackingStep}
                  eta={selectedOrder.eta}
                  deliveryAddress={selectedOrder.deliveryAddress}
                />

                {/* Reusable Delivery Agent Card */}
                {selectedOrder.deliveryAgent && (
                  <DeliveryAgentCard
                    agent={selectedOrder.deliveryAgent}
                    onCall={handleCallDeliveryAgent}
                  />
                )}

                {/* Reusable Order Items Breakdown */}
                <OrderReceiptBreakdown
                  items={selectedOrder.items}
                  totalAmount={selectedOrder.totalAmount}
                  paymentMethod={selectedOrder.paymentMethod}
                />

                {/* Modal Action Buttons */}
                <View style={styles.modalActionButtons}>
                  <TouchableOpacity
                    style={styles.repeatOrderBtn}
                    onPress={() => handleReorder(selectedOrder)}
                  >
                    <Ionicons name="repeat-outline" size={17} color={Colors.white} />
                    <Text style={styles.repeatOrderBtnText}>Order Again</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.supportBtn}
                    onPress={() => handleCallPharmacy(selectedOrder.pharmacyPhone)}
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
        )}

        {/* Medical Alert Modal */}
        <MedicalAlertModal
          visible={alertConfig.visible}
          type={alertConfig.type}
          icon={alertConfig.icon}
          title={alertConfig.title}
          message={alertConfig.message}
          onPrimaryPress={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
          onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondary,
  },
  tabButtonTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  tabBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  activePill: {
    backgroundColor: Colors.white,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    marginVertical: 8,
  },
  ordersList: {
    flex: 1,
  },
  ordersListContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 14,
  },
  detailsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
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

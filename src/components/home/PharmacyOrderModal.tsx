import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '../../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PharmacyItem } from '../../constants/pharmaciesData';
import { MEDICINES_DATA } from '../../constants/medicinesData';
import { PaymentMethodType } from '../../constants/appData';
import ModalHeader from '../common/ModalHeader';
import MedicineCatalogSection from '../pharmacy/MedicineCatalogSection';
import PrescriptionUploadSection from '../pharmacy/PrescriptionUploadSection';
import PharmacyCheckoutView from '../pharmacy/PharmacyCheckoutView';
import PharmacySuccessView from '../pharmacy/PharmacySuccessView';
import { sendPharmacyOrderNotificationAndReminder } from '../../services/notificationManager';
import MedicalAlertModal, { MedicalAlertType } from '../modals/MedicalAlertModal';
import { generateReferenceId } from '../../utils/formatters';

export interface PharmacyOrderModalProps {
  visible: boolean;
  pharmacy: PharmacyItem | null;
  initialMode?: 'catalog' | 'prescription';
  onClose: () => void;
  onOrderPlaced?: (order: any) => void;
}

const COURSE_DURATIONS = ['3 Days', '5 Days', '10 Days', '1 Month', 'Full Sheet'];

/**
 * Main Pharmacy Order Modal.
 * Orchestrates catalog browsing, prescription uploads, checkout, and order success.
 */
export default function PharmacyOrderModal({
  visible,
  pharmacy,
  initialMode = 'catalog',
  onClose,
  onOrderPlaced,
}: PharmacyOrderModalProps) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'prescription' | 'catalog'>(initialMode);
  const [viewState, setViewState] = useState<'main' | 'checkout' | 'success'>('main');

  // Catalog State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<{ [id: string]: number }>({});

  // Prescription Upload State
  const [prescriptionUri, setPrescriptionUri] = useState<string | null>(null);
  const [prescriptionNote, setPrescriptionNote] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('Full Sheet');
  const [requestCall, setRequestCall] = useState(true);

  // Delivery & Payment State
  const [deliveryAddress, setDeliveryAddress] = useState('742 Evergreen Terrace, Medical District');
  const [deliveryPhone, setDeliveryPhone] = useState('+1 (555) 019-2834');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cod');
  const [upiId, setUpiId] = useState('sathish@okaxis');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState('');
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
  const [lastOrderType, setLastOrderType] = useState<'prescription' | 'catalog'>('catalog');

  useEffect(() => {
    if (visible) {
      setActiveTab(initialMode || 'catalog');
      setViewState('main');
      setCart({});
      setSearchQuery('');
      setActiveCategory('All');
    }
  }, [visible, initialMode, pharmacy?.id]);

  if (!pharmacy) return null;

  // Cart operations
  const handleAddToCart = (id: string) =>
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: current - 1 };
    });
  };

  const cartEntries = Object.entries(cart)
    .map(([id, qty]) => {
      const med = MEDICINES_DATA.find((m) => m.id === id);
      return med ? { medicine: med, quantity: qty } : null;
    })
    .filter(Boolean) as { medicine: (typeof MEDICINES_DATA)[0]; quantity: number }[];

  const cartItemsCount = cartEntries.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartEntries.reduce((acc, item) => acc + item.medicine.price * item.quantity, 0);
  const deliveryFee = activeTab === 'prescription' ? 0.0 : subtotal > 25 ? 0.0 : 3.0;
  const platformFee = activeTab === 'prescription' ? 0.0 : 1.5;
  const totalAmount = (subtotal + deliveryFee + platformFee).toFixed(2);

  const filteredMedicines = MEDICINES_DATA.filter((med) => {
    const matchQuery =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.dosage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat =
      activeCategory === 'All' ||
      med.category.toLowerCase() === activeCategory.toLowerCase();
    return matchQuery && matchCat;
  });

  // Camera, Gallery & Document Upload Handlers
  const handleScanWithCamera = async () => {
    try {
      const res = await ImagePicker.requestCameraPermissionsAsync();
      if (!res.granted) {
        setAlertConfig({
          visible: true,
          type: 'warning',
          icon: 'camera-outline',
          title: 'Camera Access Needed',
          message: 'Camera permission is required to photograph or scan your prescription sheet.',
        });
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.85 });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setPrescriptionUri(result.assets[0].uri);
      }
    } catch (e) {
      console.log('Camera error:', e);
      setAlertConfig({
        visible: true,
        type: 'info',
        icon: 'camera-outline',
        title: 'Camera Unavailable',
        message: 'Camera could not be launched. Please choose from your photo gallery or upload a PDF document.',
      });
    }
  };

  const handleUploadFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.85 });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setPrescriptionUri(result.assets[0].uri);
      }
    } catch (e) {
      console.log('Direct gallery launch failed, trying with permission:', e);
      try {
        const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (res.granted) {
          const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.85 });
          if (!result.canceled && result.assets?.[0]?.uri) {
            setPrescriptionUri(result.assets[0].uri);
          }
        } else {
          setAlertConfig({
            visible: true,
            type: 'warning',
            icon: 'images-outline',
            title: 'Gallery Access Needed',
            message: 'Gallery permission is required to upload your prescription sheet or medicine photo.',
          });
        }
      } catch (err) {
        console.log('Gallery error:', err);
      }
    }
  };

  const handleUploadDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setPrescriptionUri(result.assets[0].uri);
      }
    } catch (e) {
      console.log('Document picker error:', e);
    }
  };

  const handleResetAndClose = () => {
    setViewState('main');
    setIsProcessing(false);
    onClose();
  };

  const handleHeaderBack = () => {
    if (viewState === 'checkout') setViewState('main');
    else if (viewState === 'success') handleResetAndClose();
    else onClose();
  };

  const handleProceedToCheckout = (type: 'prescription' | 'catalog') => {
    setLastOrderType(type);
    setViewState('checkout');
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    const genOrderId = lastOrderType === 'prescription'
      ? generateReferenceId('MED-RX')
      : generateReferenceId('MED-ORD');

    setOrderId(genOrderId);

    try {
      await sendPharmacyOrderNotificationAndReminder({
        pharmacyName: pharmacy.name,
        orderId: genOrderId,
        estimatedDelivery: pharmacy.deliveryTime || '15-25 mins',
        totalAmount: lastOrderType === 'catalog' ? `₹${totalAmount}` : 'Pay on Delivery',
        itemCount: lastOrderType === 'catalog' ? cartItemsCount : 1,
      });

      // Save newly placed order to @app_pharmacy_orders so it reflects in profile orders
      const orderItems = lastOrderType === 'catalog'
        ? Object.entries(cart)
            .map(([medId, qty]) => {
              const med = MEDICINES_DATA.find((m) => m.id === medId);
              return med ? { name: med.name, quantity: qty, price: `₹${(med.price * qty).toFixed(2)}` } : null;
            })
            .filter(Boolean)
        : [{ name: 'Prescription Verification & Dispense', quantity: 1, price: 'Pay on Delivery' }];

      const newOrder = {
        id: genOrderId,
        pharmacyName: pharmacy.name,
        pharmacyAddress: pharmacy.address || 'Medical District, Chennai',
        pharmacyPhone: pharmacy.phone || '+91 44 2621 8900',
        date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'in_transit',
        statusLabel: 'Out for Delivery',
        items: orderItems,
        totalAmount: lastOrderType === 'catalog' ? `₹${totalAmount}` : 'Pay on Delivery',
        paymentMethod: paymentMethod === 'upi' ? `UPI (${upiId || 'Paid'})` : paymentMethod === 'card' ? 'Card Paid' : 'Cash on Delivery',
        deliveryAddress: deliveryAddress || '742 Evergreen Terrace, Medical District',
        eta: `Arriving in ${pharmacy.deliveryTime || '15-25 mins'}`,
        trackingStep: 3,
        deliveryAgent: {
          name: 'Ramesh Kumar',
          phone: '+91 98401 23456',
          vehicle: 'Hero Electric (TN 09 AZ 4192)',
        },
      };

      const existingOrdersStr = await AsyncStorage.getItem('@app_pharmacy_orders');
      const existingOrders = existingOrdersStr ? JSON.parse(existingOrdersStr) : [];
      await AsyncStorage.setItem('@app_pharmacy_orders', JSON.stringify([newOrder, ...existingOrders]));

      if (lastOrderType === 'catalog') {
        setCart({});
      }

      setIsProcessing(false);
      setViewState('success');
      onOrderPlaced?.({ orderId: genOrderId, pharmacy: pharmacy.name });
    } catch (e) {
      console.log(e);
      setIsProcessing(false);
      setViewState('success');
    }
  };

  const getHeaderTitle = () => {
    if (viewState === 'checkout') return 'Order Checkout';
    if (viewState === 'success') return 'Order Confirmation';
    return pharmacy.name;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={handleResetAndClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <ModalHeader
            title={getHeaderTitle()}
            subtitle={
              viewState === 'main'
                ? `Delivering in ${pharmacy.deliveryTime || '15-25 mins'} • ${pharmacy.rating} ★`
                : undefined
            }
            onBack={viewState !== 'main' ? handleHeaderBack : undefined}
            onClose={handleResetAndClose}
          />

          {viewState === 'main' && (
            <View style={{ flex: 1 }}>
              {/* Segmented Control Tabs */}
              <View style={styles.tabBar}>
                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'catalog' && styles.tabButtonActive]}
                  onPress={() => setActiveTab('catalog')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="medkit-outline"
                    size={16}
                    color={activeTab === 'catalog' ? Colors.white : Colors.primary}
                  />
                  <Text style={[styles.tabButtonText, activeTab === 'catalog' && styles.tabButtonTextActive]}>
                    Browse Medicines
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'prescription' && styles.tabButtonActive]}
                  onPress={() => setActiveTab('prescription')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={16}
                    color={activeTab === 'prescription' ? Colors.white : Colors.primary}
                  />
                  <Text style={[styles.tabButtonText, activeTab === 'prescription' && styles.tabButtonTextActive]}>
                    Scan / Upload Rx
                  </Text>
                </TouchableOpacity>
              </View>

              {activeTab === 'prescription' ? (
                <PrescriptionUploadSection
                  pharmacy={pharmacy}
                  prescriptionUri={prescriptionUri}
                  prescriptionNote={prescriptionNote}
                  selectedDuration={selectedDuration}
                  requestCall={requestCall}
                  courseDurations={COURSE_DURATIONS}
                  onScanCamera={handleScanWithCamera}
                  onUploadGallery={handleUploadFromGallery}
                  onUploadDocument={handleUploadDocument}
                  onRemovePrescription={() => setPrescriptionUri(null)}
                  onDurationChange={setSelectedDuration}
                  onNoteChange={setPrescriptionNote}
                  onRequestCallToggle={() => setRequestCall(!requestCall)}
                  onProceedToCheckout={() => handleProceedToCheckout('prescription')}
                />
              ) : (
                <MedicineCatalogSection
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  activeCategory={activeCategory}
                  onSelectCategory={setActiveCategory}
                  filteredMedicines={filteredMedicines}
                  cart={cart}
                  cartItemsCount={cartItemsCount}
                  totalAmount={totalAmount}
                  onAddToCart={handleAddToCart}
                  onRemoveFromCart={handleRemoveFromCart}
                  onProceedToCheckout={() => handleProceedToCheckout('catalog')}
                />
              )}
            </View>
          )}

          {viewState === 'checkout' && (
            <PharmacyCheckoutView
              lastOrderType={lastOrderType}
              prescriptionUri={prescriptionUri}
              selectedDuration={selectedDuration}
              prescriptionNote={prescriptionNote}
              requestCall={requestCall}
              deliveryAddress={deliveryAddress}
              deliveryPhone={deliveryPhone}
              paymentMethod={paymentMethod}
              upiId={upiId}
              cartItemsCount={cartItemsCount}
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              platformFee={platformFee}
              totalAmount={totalAmount}
              isProcessing={isProcessing}
              onAddressChange={setDeliveryAddress}
              onPhoneChange={setDeliveryPhone}
              onSelectPaymentMethod={setPaymentMethod}
              onUpiIdChange={setUpiId}
              onPlaceOrder={handlePlaceOrder}
            />
          )}

          {viewState === 'success' && (
            <PharmacySuccessView
              pharmacy={pharmacy}
              lastOrderType={lastOrderType}
              orderId={orderId}
              prescriptionUri={prescriptionUri}
              selectedDuration={selectedDuration}
              onDone={handleResetAndClose}
            />
          )}
        </View>
      </View>

      {/* Project Themed Medical Alert Modal */}
      <MedicalAlertModal
        visible={alertConfig.visible}
        type={alertConfig.type}
        icon={alertConfig.icon}
        title={alertConfig.title}
        message={alertConfig.message}
        onPrimaryPress={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.modalOverlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '92%',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: Colors.cardBgSecondary,
    borderRadius: 14,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  tabButtonTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
});

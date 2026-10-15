import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppStatusBar from '../common/AppStatusBar';
import { PharmacyItem } from '../../constants/pharmaciesData';
import { MEDICINES_DATA } from '../../constants/medicinesData';
import { PaymentMethodType } from '../../constants/appData';
import ModalHeader from '../common/ModalHeader';
import MedicineCatalogSection from '../pharmacy/MedicineCatalogSection';
import PharmacyCheckoutView from '../pharmacy/PharmacyCheckoutView';
import PharmacySuccessView from '../pharmacy/PharmacySuccessView';
import { sendPharmacyOrderNotificationAndReminder } from '../../services/notificationManager';
import { generateReferenceId } from '../../utils/formatters';

export interface PharmacyOrderModalProps {
  visible: boolean;
  pharmacy: PharmacyItem | null;
  initialMode?: 'catalog' | 'prescription';
  onClose: () => void;
  onOrderPlaced?: (order: any) => void;
}

/**
 * Main Pharmacy Order Modal.
 * Orchestrates medicine catalog browsing, checkout, and order success.
 */
export default function PharmacyOrderModal({
  visible,
  pharmacy,
  initialMode = 'catalog',
  onClose,
  onOrderPlaced,
}: PharmacyOrderModalProps) {
  const [viewState, setViewState] = useState<'main' | 'checkout' | 'success'>('main');

  // Catalog State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<{ [id: string]: number }>({});

  // Delivery & Payment State
  const [deliveryAddress, setDeliveryAddress] = useState('742 Evergreen Terrace, Medical District');
  const [deliveryPhone, setDeliveryPhone] = useState('+1 (555) 019-2834');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cod');
  const [upiId, setUpiId] = useState('sathish@okaxis');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [lastOrderType] = useState<'catalog'>('catalog');
  const [confirmedCartEntries, setConfirmedCartEntries] = useState<
    { medicine: (typeof MEDICINES_DATA)[0]; quantity: number }[]
  >([]);
  const [confirmedSubtotal, setConfirmedSubtotal] = useState(0);
  const [confirmedDeliveryFee, setConfirmedDeliveryFee] = useState(0);
  const [confirmedTotalAmount, setConfirmedTotalAmount] = useState('0.00');

  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const stored = await AsyncStorage.getItem('@app_active_order_session');
        if (stored) {
          const session = JSON.parse(stored);
          if (session && session.orderId && session.pharmacy?.id === pharmacy?.id) {
            setOrderId(session.orderId);
            setConfirmedCartEntries(session.cartEntries || []);
            setConfirmedSubtotal(session.subtotal || 0);
            setConfirmedDeliveryFee(session.deliveryFee || 0);
            setConfirmedTotalAmount(session.totalAmount || '0.00');
            setViewState('success');
            return;
          }
        }
      } catch (e) {
        // ignore
      }

      if (visible) {
        setViewState('main');
        setCart({});
        setSearchQuery('');
        setActiveCategory('All');
      }
    };

    if (visible) {
      checkActiveSession();
    }
  }, [visible, pharmacy?.id]);

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
  // Delivery Fee: Free if subtotal >= 500, else ₹40
  const deliveryFee = subtotal >= 500 ? 0.0 : 40.0;
  const totalAmount = (subtotal + deliveryFee).toFixed(2);

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

  const handleResetAndClose = async () => {
    try {
      await AsyncStorage.removeItem('@app_active_order_session');
    } catch (e) {
      // ignore
    }
    setViewState('main');
    setIsProcessing(false);
    onClose();
  };

  const handleHeaderBack = () => {
    if (viewState === 'checkout') setViewState('main');
    else if (viewState === 'success') handleResetAndClose();
    else onClose();
  };

  const handleProceedToCheckout = () => {
    setViewState('checkout');
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    const genOrderId = generateReferenceId('MED-ORD');
    setOrderId(genOrderId);

    try {
      await sendPharmacyOrderNotificationAndReminder({
        pharmacyName: pharmacy.name,
        orderId: genOrderId,
        estimatedDelivery: pharmacy.deliveryTime || '15-25 mins',
        totalAmount: `₹${totalAmount}`,
        itemCount: cartItemsCount,
      });

      // Save newly placed order to @app_pharmacy_orders so it reflects in profile orders
      const orderItems = Object.entries(cart)
        .map(([medId, qty]) => {
          const med = MEDICINES_DATA.find((m) => m.id === medId);
          return med ? { name: med.name, quantity: qty, price: `₹${(med.price * qty).toFixed(2)}` } : null;
        })
        .filter(Boolean);

      const newOrder = {
        id: genOrderId,
        pharmacyName: pharmacy.name,
        pharmacyAddress: pharmacy.address || 'Medical District, Chennai',
        pharmacyPhone: pharmacy.phone || '+91 44 2621 8900',
        date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'in_transit',
        statusLabel: 'Out for Delivery',
        items: orderItems,
        totalAmount: `₹${totalAmount}`,
        subtotal: `₹${subtotal.toFixed(2)}`,
        deliveryFee: deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`,
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

      setConfirmedCartEntries(cartEntries);
      setConfirmedSubtotal(subtotal);
      setConfirmedDeliveryFee(deliveryFee);
      setConfirmedTotalAmount(totalAmount);

      // Persist active order session so backgrounding or app switching does not lose the confirmation popup
      try {
        const paymentStr = paymentMethod === 'upi' ? `UPI (${upiId || 'Paid'})` : paymentMethod === 'card' ? 'Card Paid' : 'Cash on Delivery';
        const activeSession = {
          pharmacy,
          orderId: genOrderId,
          lastOrderType: 'catalog',
          viewState: 'success',
          cartEntries,
          subtotal,
          deliveryFee,
          totalAmount,
          deliveryAddress: deliveryAddress || '742 Evergreen Terrace, Medical District',
          deliveryPhone: deliveryPhone || '+91 98401 23456',
          paymentMethod: paymentStr,
        };
        await AsyncStorage.setItem('@app_active_order_session', JSON.stringify(activeSession));
      } catch (err) {
        console.log('Error caching active order session:', err);
      }

      setCart({});
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
      presentationStyle="fullScreen"
      onRequestClose={handleResetAndClose}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <AppStatusBar style="dark" forceApply />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <View style={styles.contentWrapper}>
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
              <MedicineCatalogSection
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                filteredMedicines={filteredMedicines}
                cart={cart}
                cartItemsCount={cartItemsCount}
                subtotal={subtotal}
                totalAmount={totalAmount}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                onProceedToCheckout={handleProceedToCheckout}
              />
            </View>
          )}

          {viewState === 'checkout' && (
            <PharmacyCheckoutView
              lastOrderType={lastOrderType}
              prescriptionUri={null}
              selectedDuration=""
              prescriptionNote=""
              requestCall={false}
              deliveryAddress={deliveryAddress}
              deliveryPhone={deliveryPhone}
              paymentMethod={paymentMethod}
              upiId={upiId}
              cartItemsCount={cartItemsCount}
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              totalAmount={totalAmount}
              cartEntries={cartEntries}
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
              prescriptionUri={null}
              selectedDuration=""
              cartEntries={confirmedCartEntries}
              subtotal={confirmedSubtotal}
              deliveryFee={confirmedDeliveryFee}
              totalAmount={confirmedTotalAmount}
              deliveryAddress={deliveryAddress}
              deliveryPhone={deliveryPhone}
              paymentMethod={paymentMethod === 'upi' ? `UPI (${upiId || 'Paid'})` : paymentMethod === 'card' ? 'Card Paid' : 'Cash on Delivery'}
              onDone={handleResetAndClose}
            />
          )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardAvoid: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});

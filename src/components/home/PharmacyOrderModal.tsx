import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/Colors';
import { PharmacyItem } from '../../constants/pharmaciesData';
import { MEDICINES_DATA, MedicineItem } from '../../constants/medicinesData';
import { MEDICINE_CATEGORIES, PaymentMethodType } from '../../constants/appData';
import ModalHeader from '../common/ModalHeader';
import PaymentPicker from '../common/PaymentPicker';
import PriceSummary from '../common/PriceSummary';
import { sendPharmacyOrderNotificationAndReminder } from '../../services/notificationManager';

export interface PharmacyOrderModalProps {
  visible: boolean;
  pharmacy: PharmacyItem | null;
  initialMode?: 'catalog' | 'prescription';
  onClose: () => void;
  onOrderPlaced?: (order: any) => void;
}

const SAMPLE_PRESCRIPTIONS = [
  {
    id: 'sample_rx_1',
    label: 'Doctor Rx Sheet',
    uri: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    title: 'Dr. Sarah Wilson - General Medicine Rx',
    note: 'Paracetamol 500mg (2 strips), Amoxicillin 250mg, Vitamin C',
  },
  {
    id: 'sample_rx_2',
    label: 'Tablet Strip Photo',
    uri: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80',
    title: 'Tablet Strip (Fever & Pain Relief)',
    note: 'Need 1 box / 2 strips for 5 days course',
  },
];

const COURSE_DURATIONS = ['3 Days', '5 Days', '10 Days', '1 Month', 'Full Sheet'];

export default function PharmacyOrderModal({
  visible,
  pharmacy,
  initialMode = 'catalog',
  onClose,
  onOrderPlaced,
}: PharmacyOrderModalProps) {
  const [activeTab, setActiveTab] = useState<'prescription' | 'catalog'>(initialMode);
  const [viewState, setViewState] = useState<'main' | 'checkout' | 'success'>('main');

  // Catalog State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<{ [id: string]: number }>({ m1: 1, m4: 1 });

  // Prescription / Medicine Sheet Upload State
  const [prescriptionUri, setPrescriptionUri] = useState<string | null>(null);
  const [prescriptionNote, setPrescriptionNote] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('Full Sheet');
  const [requestCall, setRequestCall] = useState(true);

  // Delivery & Payment
  const [deliveryAddress, setDeliveryAddress] = useState('742 Evergreen Terrace, Medical District');
  const [deliveryPhone, setDeliveryPhone] = useState('+1 (555) 019-2834');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cod');
  const [upiId, setUpiId] = useState('sathish@okaxis');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [lastOrderType, setLastOrderType] = useState<'prescription' | 'catalog'>('catalog');

  // Reset tab to initialMode when modal opens
  React.useEffect(() => {
    if (visible) {
      setActiveTab(initialMode || 'catalog');
      setViewState('main');
    }
  }, [visible, initialMode]);

  if (!pharmacy) return null;

  // --- Cart Calculations ---
  const handleAddToCart = (id: string) => setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
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
    .filter(Boolean) as { medicine: MedicineItem; quantity: number }[];

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

  // --- Image Pickers for Prescription / Medicine Sheet ---
  const handleScanWithCamera = async () => {
    try {
      const res = await ImagePicker.requestCameraPermissionsAsync();
      if (!res.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to scan prescription or tablet photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.85,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPrescriptionUri(result.assets[0].uri);
      }
    } catch (e) {
      console.log('Camera error:', e);
      Alert.alert('Camera Error', 'Could not open camera. Please try gallery upload.');
    }
  };

  const handleUploadFromGallery = async () => {
    try {
      const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!res.granted) {
        Alert.alert('Permission Denied', 'Media gallery permission is required to upload medicine sheets.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPrescriptionUri(result.assets[0].uri);
      }
    } catch (e) {
      console.log('Gallery upload error:', e);
      Alert.alert('Gallery Error', 'Could not access gallery.');
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_PRESCRIPTIONS[0]) => {
    setPrescriptionUri(sample.uri);
    if (!prescriptionNote) {
      setPrescriptionNote(sample.note);
    }
  };

  const handleRemovePrescription = () => {
    setPrescriptionUri(null);
  };

  const handleResetAndClose = () => {
    setViewState('main');
    setIsProcessing(false);
    onClose();
  };

  const handleProceedToCheckout = (mode: 'prescription' | 'catalog') => {
    if (mode === 'prescription' && !prescriptionUri) {
      Alert.alert('No Photo Attached', 'Please take a photo or upload your medicine sheet / tablet image first.');
      return;
    }
    if (mode === 'catalog' && cartItemsCount === 0) {
      Alert.alert('Cart Empty', 'Please add medicines to cart.');
      return;
    }
    setLastOrderType(mode);
    setViewState('checkout');
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    const genOrderId = `#PHARM-${Math.floor(10000 + Math.random() * 90000)}`;
    setOrderId(genOrderId);

    try {
      await sendPharmacyOrderNotificationAndReminder({
        pharmacyName: pharmacy.name,
        orderId: genOrderId,
        totalAmount: lastOrderType === 'prescription' ? 'Calculated on Review (Free Delivery)' : `$${totalAmount}`,
        estimatedDelivery: pharmacy.deliveryTime || '15-25 mins',
        itemsCount: lastOrderType === 'prescription' ? 1 : cartItemsCount,
        setReminder: true,
      });
    } catch (e) {
      console.log('Error triggering pharmacy notification:', e);
    }

    setTimeout(() => {
      setIsProcessing(false);
      setViewState('success');
      if (onOrderPlaced) {
        onOrderPlaced({
          orderId: genOrderId,
          pharmacyName: pharmacy.name,
          orderType: lastOrderType,
          prescriptionUri: lastOrderType === 'prescription' ? prescriptionUri : null,
          notes: prescriptionNote,
          total: lastOrderType === 'prescription' ? 'Pay on Delivery' : `$${totalAmount}`,
        });
      }
    }, 1000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleResetAndClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <ModalHeader
            title={viewState === 'main' ? pharmacy.name : viewState === 'checkout' ? 'Order Checkout' : 'Order Placed!'}
            subtitle={viewState === 'main' ? `Delivering in ${pharmacy.deliveryTime || '15-25 mins'} • ${pharmacy.rating} ★` : undefined}
            onClose={handleResetAndClose}
          />

          {viewState === 'main' && (
            <View style={{ flex: 1 }}>
              {/* Mode Segmented Control Tabs */}
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

              {/* 1. PRESCRIPTION / MEDICINE SHEET / TABLET SCAN & UPLOAD TAB */}
              {activeTab === 'prescription' && (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
                  {/* Upload Container */}
                  {!prescriptionUri ? (
                    <View style={styles.uploadPlaceholderCard}>
                      <View style={styles.uploadIconCircle}>
                        <MaterialCommunityIcons name="camera-document" size={36} color={Colors.primary} />
                      </View>
                      <Text style={styles.uploadTitle}>Scan or Upload Medicine Sheet / Tablet</Text>
                      <Text style={styles.uploadSubtitle}>
                        Take a photo of your doctor's prescription sheet or tablet strip to order directly from {pharmacy.name}.
                      </Text>

                      {/* Primary Action Buttons */}
                      <View style={styles.actionButtonsRow}>
                        <TouchableOpacity
                          style={styles.cameraActionBtn}
                          onPress={handleScanWithCamera}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="camera" size={20} color={Colors.white} />
                          <Text style={styles.cameraActionText}>Take Photo / Scan</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.galleryActionBtn}
                          onPress={handleUploadFromGallery}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="images-outline" size={20} color={Colors.primary} />
                          <Text style={styles.galleryActionText}>Upload from Gallery</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Sample Prescriptions for Testing / Simulator */}
                      <View style={styles.samplesWrapper}>
                        <Text style={styles.samplesLabel}>Or try a sample medicine sheet:</Text>
                        <View style={styles.sampleChipsRow}>
                          {SAMPLE_PRESCRIPTIONS.map((s) => (
                            <TouchableOpacity
                              key={s.id}
                              style={styles.sampleChip}
                              onPress={() => handleSelectSample(s)}
                              activeOpacity={0.7}
                            >
                              <Ionicons name="checkmark-circle-outline" size={14} color={Colors.primary} />
                              <Text style={styles.sampleChipText}>{s.label}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </View>
                  ) : (
                    /* Attached Image Preview Card */
                    <View style={styles.previewContainer}>
                      <View style={styles.previewHeader}>
                        <View style={styles.previewBadge}>
                          <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                          <Text style={styles.previewBadgeText}>Medicine Sheet Attached</Text>
                        </View>
                        <TouchableOpacity onPress={handleRemovePrescription} style={styles.removeBtn}>
                          <Ionicons name="trash-outline" size={16} color={Colors.error} />
                          <Text style={styles.removeBtnText}>Remove</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.imagePreviewWrapper}>
                        <Image source={{ uri: prescriptionUri }} style={styles.previewImage} resizeMode="cover" />
                        <View style={styles.imageOverlayButtons}>
                          <TouchableOpacity style={styles.retakeBtn} onPress={handleScanWithCamera} activeOpacity={0.8}>
                            <Ionicons name="camera" size={14} color={Colors.white} />
                            <Text style={styles.retakeText}>Retake</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.changeBtn} onPress={handleUploadFromGallery} activeOpacity={0.8}>
                            <Ionicons name="images" size={14} color={Colors.primary} />
                            <Text style={styles.changeText}>Change</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Duration of Medicines */}
                      <View style={styles.formSection}>
                        <Text style={styles.fieldLabel}>Course Duration Needed</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.durationRow}>
                          {COURSE_DURATIONS.map((dur) => (
                            <TouchableOpacity
                              key={dur}
                              style={[styles.durationChip, selectedDuration === dur && styles.durationChipSelected]}
                              onPress={() => setSelectedDuration(dur)}
                              activeOpacity={0.7}
                            >
                              <Text style={[styles.durationText, selectedDuration === dur && styles.durationTextSelected]}>
                                {dur}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>

                      {/* Special Instructions / Notes */}
                      <View style={styles.formSection}>
                        <Text style={styles.fieldLabel}>Doctor Instructions or Patient Notes (Optional)</Text>
                        <TextInput
                          style={styles.notesInput}
                          placeholder="e.g. Need 2 strips Paracetamol 500mg, 1 syrup. Send generic substitute if available."
                          placeholderTextColor={Colors.secondary}
                          value={prescriptionNote}
                          onChangeText={setPrescriptionNote}
                          multiline
                          numberOfLines={3}
                        />
                      </View>

                      {/* Pharmacist Call Verification Checkbox */}
                      <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => setRequestCall(!requestCall)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.checkbox, requestCall && styles.checkboxChecked]}>
                          {requestCall && <Ionicons name="checkmark" size={14} color={Colors.white} />}
                        </View>
                        <Text style={styles.checkboxLabel}>
                          Ask {pharmacy.name} pharmacist to call me before dispatch to confirm medicines & price.
                        </Text>
                      </TouchableOpacity>

                      {/* Order Button */}
                      <TouchableOpacity
                        style={styles.prescriptionOrderBtn}
                        onPress={() => handleProceedToCheckout('prescription')}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.prescriptionOrderBtnText}>Proceed to Checkout</Text>
                        <Ionicons name="arrow-forward" size={18} color={Colors.white} />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Safety & Guarantee Highlights */}
                  <View style={styles.guaranteeCard}>
                    <View style={styles.guaranteeRow}>
                      <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.guaranteeTitle}>100% Genuine & Verified Medicines</Text>
                        <Text style={styles.guaranteeDesc}>
                          Every medicine sheet is verified by licensed pharmacists at {pharmacy.name} before dispensing.
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.guaranteeRow, { marginTop: 12 }]}>
                      <Ionicons name="bicycle" size={20} color="#0D9488" />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.guaranteeTitle}>Express Home Delivery ({pharmacy.deliveryTime || '15-25 mins'})</Text>
                        <Text style={styles.guaranteeDesc}>
                          Medicines are safely packed and delivered directly to your doorstep.
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              )}

              {/* 2. BROWSE CATALOG TAB */}
              {activeTab === 'catalog' && (
                <View style={{ flex: 1 }}>
                  {/* Search & Categories */}
                  <View style={styles.searchBar}>
                    <Ionicons name="search" size={18} color={Colors.secondary} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search medicines, vitamins, tablets..."
                      placeholderTextColor={Colors.secondary}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color={Colors.secondary} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Category Pills Header */}
                  <View style={styles.categoriesWrapper}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.categoriesRow}
                    >
                      {MEDICINE_CATEGORIES.map((cat) => {
                        const isSelected = activeCategory === cat;
                        return (
                          <TouchableOpacity
                            key={cat}
                            style={[styles.catChip, isSelected && styles.catChipSelected]}
                            onPress={() => setActiveCategory(cat)}
                            activeOpacity={0.7}
                          >
                            <Text style={[styles.catText, isSelected && styles.catTextSelected]}>
                              {cat}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* Medicine List */}
                  <ScrollView
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.medList}
                  >
                    {filteredMedicines.length === 0 ? (
                      <View style={styles.emptyCatalogContainer}>
                        <Ionicons name="medical-outline" size={44} color={Colors.secondary} />
                        <Text style={styles.emptyCatalogTitle}>No medicines found</Text>
                        <Text style={styles.emptyCatalogSubtitle}>
                          No items matched "{activeCategory !== 'All' ? activeCategory : searchQuery}".
                        </Text>
                        <TouchableOpacity
                          style={styles.resetFilterBtn}
                          onPress={() => {
                            setActiveCategory('All');
                            setSearchQuery('');
                          }}
                        >
                          <Text style={styles.resetFilterText}>Show All Medicines</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      filteredMedicines.map((med) => {
                        const qty = cart[med.id] || 0;
                        return (
                          <View key={med.id} style={styles.medCard}>
                            {med.image ? (
                              <Image source={med.image} style={styles.medImage} />
                            ) : (
                              <View style={styles.medIconPlaceholder}>
                                <Ionicons name="medkit" size={20} color={Colors.primary} />
                              </View>
                            )}
                            <View style={{ flex: 1, paddingHorizontal: 10 }}>
                              <Text style={styles.medName} numberOfLines={1}>{med.name}</Text>
                              <Text style={styles.medDosage} numberOfLines={1}>{med.dosage} • {med.category}</Text>
                              <View style={styles.medPriceRow}>
                                <Text style={styles.medPrice}>${med.price.toFixed(2)}</Text>
                                {med.originalPrice > med.price && (
                                  <Text style={styles.medOriginalPrice}>${med.originalPrice.toFixed(2)}</Text>
                                )}
                              </View>
                            </View>
                            {qty > 0 ? (
                              <View style={styles.qtyControls}>
                                <TouchableOpacity onPress={() => handleRemoveFromCart(med.id)} style={styles.qtyBtn}>
                                  <Ionicons name="remove" size={15} color={Colors.primary} />
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>{qty}</Text>
                                <TouchableOpacity onPress={() => handleAddToCart(med.id)} style={styles.qtyBtn}>
                                  <Ionicons name="add" size={15} color={Colors.primary} />
                                </TouchableOpacity>
                              </View>
                            ) : (
                              <TouchableOpacity onPress={() => handleAddToCart(med.id)} style={styles.addBtn}>
                                <Ionicons name="add" size={15} color={Colors.white} />
                                <Text style={styles.addBtnText}>Add</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        );
                      })
                    )}
                  </ScrollView>

                  {/* View Cart Bar */}
                  {cartItemsCount > 0 && (
                    <View style={styles.cartBar}>
                      <View>
                        <Text style={styles.cartBarItems}>{cartItemsCount} items added</Text>
                        <Text style={styles.cartBarTotal}>${totalAmount}</Text>
                      </View>
                      <TouchableOpacity style={styles.viewCartBtn} onPress={() => handleProceedToCheckout('catalog')}>
                        <Text style={styles.viewCartText}>View Cart & Checkout</Text>
                        <Ionicons name="arrow-forward" size={16} color={Colors.white} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* CHECKOUT STATE */}
          {viewState === 'checkout' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* Prescription / Order Summary Banner */}
              {lastOrderType === 'prescription' && prescriptionUri ? (
                <View style={styles.checkoutRxSummary}>
                  <Image source={{ uri: prescriptionUri }} style={styles.checkoutRxThumb} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.checkoutRxTitle}>Medicine Sheet Order</Text>
                    <Text style={styles.checkoutRxSub}>Duration: <Text style={{ fontWeight: '700', color: Colors.primary }}>{selectedDuration}</Text></Text>
                    {prescriptionNote ? (
                      <Text style={styles.checkoutRxNote} numberOfLines={2}>Notes: "{prescriptionNote}"</Text>
                    ) : null}
                    <Text style={styles.checkoutRxPharmacist}>
                      {requestCall ? '✓ Pharmacist call requested' : '✓ Standard verification'}
                    </Text>
                  </View>
                </View>
              ) : null}

              <Text style={styles.sectionHeading}>Delivery Details</Text>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Delivery Address</Text>
                <TextInput style={styles.input} value={deliveryAddress} onChangeText={setDeliveryAddress} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput style={styles.input} value={deliveryPhone} onChangeText={setDeliveryPhone} keyboardType="phone-pad" />
              </View>

              <PaymentPicker
                paymentMethod={paymentMethod}
                onSelectPaymentMethod={setPaymentMethod}
                upiId={upiId}
                onChangeUpiId={setUpiId}
              />

              {lastOrderType === 'catalog' ? (
                <PriceSummary
                  items={[
                    { label: `Medicines Subtotal (${cartItemsCount} items)`, amount: `$${subtotal.toFixed(2)}` },
                    { label: 'Express Delivery Fee', amount: deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`, isDiscount: deliveryFee === 0 },
                    { label: 'Packaging & Platform Fee', amount: `$${platformFee.toFixed(2)}` },
                  ]}
                  totalAmount={`$${totalAmount}`}
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

              <View style={styles.dualBtnRow}>
                <TouchableOpacity style={styles.secondaryBtn} onPress={() => setViewState('main')}>
                  <Text style={styles.secondaryBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryBtn, { flex: 2 }]}
                  onPress={handlePlaceOrder}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator color={Colors.white} size="small" />
                  ) : (
                    <Text style={styles.primaryBtnText}>
                      {lastOrderType === 'prescription' ? 'Confirm Prescription Order' : `Confirm Order ($${totalAmount})`}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

          {/* SUCCESS STATE */}
          {viewState === 'success' && (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={68} color="#16A34A" />
              <Text style={styles.successTitle}>
                {lastOrderType === 'prescription' ? 'Prescription Received!' : 'Order Confirmed!'}
              </Text>
              <Text style={styles.successSubtitle}>
                {lastOrderType === 'prescription'
                  ? `Your medicine sheet has been sent to ${pharmacy.name}. A licensed pharmacist is reviewing your prescription.`
                  : `Your medicines from ${pharmacy.name} are being prepared for express delivery.`}
              </Text>

              {lastOrderType === 'prescription' && prescriptionUri ? (
                <View style={styles.successRxPreview}>
                  <Image source={{ uri: prescriptionUri }} style={styles.successRxThumb} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.successRxLabel}>Attached Sheet</Text>
                    <Text style={styles.successRxVal}>{selectedDuration} Course</Text>
                    <Text style={styles.successRxStatus}>ETA: {pharmacy.deliveryTime || '15-25 mins'}</Text>
                  </View>
                </View>
              ) : null}

              <View style={styles.orderBadge}>
                <Text style={styles.orderBadgeLabel}>Order Reference ID</Text>
                <Text style={styles.orderBadgeVal}>{orderId}</Text>
              </View>

              <TouchableOpacity style={[styles.primaryBtn, { width: '85%', marginTop: 24 }]} onPress={handleResetAndClose}>
                <Text style={styles.primaryBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    backgroundColor: Colors.bgLight,
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 14,
    padding: 4,
    gap: 6,
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
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  tabButtonTextActive: {
    color: Colors.white,
  },
  tabBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
  },
  tabBadgeTextActive: {
    color: Colors.white,
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  uploadPlaceholderCard: {
    backgroundColor: Colors.bgLight,
    borderWidth: 1.5,
    borderColor: '#D1EAE5',
    borderStyle: 'dashed',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  uploadIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 6,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: Colors.secondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    paddingHorizontal: 10,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  cameraActionBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cameraActionText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  galleryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  galleryActionText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  samplesWrapper: {
    marginTop: 16,
    alignItems: 'center',
    width: '100%',
  },
  samplesLabel: {
    fontSize: 11,
    color: Colors.secondary,
    marginBottom: 8,
  },
  sampleChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sampleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  sampleChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textDark,
  },
  previewContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  previewBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  removeBtnText: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: '600',
  },
  imagePreviewWrapper: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
    height: 180,
    backgroundColor: Colors.bgLight,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayButtons: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    gap: 6,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(25, 154, 142, 0.9)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
  },
  retakeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
  },
  changeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  formSection: {
    marginTop: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 6,
  },
  durationRow: {
    gap: 8,
    paddingVertical: 2,
  },
  durationChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  durationChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  durationText: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '600',
  },
  durationTextSelected: {
    color: Colors.white,
    fontWeight: '700',
  },
  notesInput: {
    backgroundColor: Colors.bgLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
    fontSize: 13,
    color: Colors.textDark,
    textAlignVertical: 'top',
    minHeight: 65,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxLabel: {
    fontSize: 12,
    color: Colors.secondary,
    flex: 1,
    lineHeight: 16,
  },
  prescriptionOrderBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  prescriptionOrderBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  guaranteeCard: {
    backgroundColor: '#F4FAF8',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D2ECE6',
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  guaranteeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 2,
  },
  guaranteeDesc: {
    fontSize: 11,
    color: Colors.secondary,
    lineHeight: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    marginHorizontal: 16,
    marginVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
    fontSize: 13,
  },
  categoriesWrapper: {
    height: 48,
    marginVertical: 4,
    justifyContent: 'center',
  },
  categoriesRow: {
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
  },
  catChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  catText: {
    fontSize: 12.5,
    color: '#4B5563',
    fontWeight: '600',
  },
  catTextSelected: {
    color: Colors.white,
    fontWeight: '700',
  },
  medList: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 90,
  },
  medCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  medImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: Colors.bgLight,
  },
  medIconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 2,
  },
  medDosage: {
    fontSize: 11,
    color: Colors.secondary,
    marginBottom: 4,
  },
  medPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  medOriginalPrice: {
    fontSize: 11,
    color: Colors.secondary,
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  emptyCatalogContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyCatalogTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.black,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyCatalogSubtitle: {
    fontSize: 12,
    color: Colors.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  resetFilterBtn: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  resetFilterText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 12.5,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  addBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '700',
  },
  cartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartBarItems: {
    fontSize: 11,
    color: Colors.secondary,
  },
  cartBarTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  viewCartBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewCartText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  scrollContent: {
    padding: 16,
  },
  checkoutRxSummary: {
    flexDirection: 'row',
    backgroundColor: Colors.accentLight,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C5EBE4',
  },
  checkoutRxThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  checkoutRxTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 2,
  },
  checkoutRxSub: {
    fontSize: 12,
    color: Colors.secondary,
    marginBottom: 2,
  },
  checkoutRxNote: {
    fontSize: 11,
    color: Colors.secondary,
    fontStyle: 'italic',
  },
  checkoutRxPharmacist: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 10,
  },
  formGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  input: {
    backgroundColor: Colors.bgLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
  },
  dualBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  secondaryBtn: {
    height: 46,
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: Colors.secondary,
    fontWeight: '700',
    fontSize: 13,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
    marginTop: 12,
  },
  successSubtitle: {
    fontSize: 13,
    color: Colors.secondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  successRxPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    borderRadius: 14,
    padding: 12,
    width: '100%',
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  successRxThumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  successRxLabel: {
    fontSize: 11,
    color: Colors.secondary,
  },
  successRxVal: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textDark,
  },
  successRxStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
  },
  orderBadge: {
    marginTop: 16,
    backgroundColor: Colors.accentLight,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  orderBadgeLabel: {
    fontSize: 11,
    color: Colors.secondary,
  },
  orderBadgeVal: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
});

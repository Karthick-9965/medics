import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Modal, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import {
  AMBULANCE_TYPES,
  NEARBY_AMBULANCES,
  HOSPITAL_AMBULANCE_NUMBERS,
  AmbulanceUnit,
  HospitalAmbulanceNumber,
} from '../constants/ambulancesData';
import EmergencyHotlines from '../components/common/EmergencyHotlines';
import ModalHeader from '../components/common/ModalHeader';
import { sendAmbulanceDispatchNotification } from '../services/notificationManager';

interface AmbulanceScreenProps {
  onBack?: () => void;
  navigation?: any;
}

export default function AmbulanceScreen({ onBack, navigation }: AmbulanceScreenProps) {
  const handleGoBack = () => (onBack ? onBack() : navigation?.goBack());

  const [activeTab, setActiveTab] = useState<'dispatch' | 'hospitals'>('dispatch');
  const [selectedType, setSelectedType] = useState('als');
  const [pickupAddress, setPickupAddress] = useState('742 Evergreen Terrace, Medical District');
  const [landmark, setLandmark] = useState('Near Central Park Gate 2');
  const [isDispatched, setIsDispatched] = useState(false);
  const [activeDriver, setActiveDriver] = useState<AmbulanceUnit>(NEARBY_AMBULANCES[0]);
  const [etaSeconds, setEtaSeconds] = useState(240);
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    let timer: any = null;
    if (isDispatched && etaSeconds > 0) {
      timer = setInterval(() => setEtaSeconds((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isDispatched, etaSeconds]);

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleRequestAmbulance = () => {
    const driver = NEARBY_AMBULANCES[0];
    setActiveDriver(driver);
    setEtaSeconds(driver.etaMinutes * 60);
    setIsDispatched(true);

    sendAmbulanceDispatchNotification({
      hospitalName: driver.currentHospital,
      ambulanceId: driver.vehicleNumber,
      driverName: driver.driverName,
      eta: `${driver.etaMinutes} mins`,
    });
  };

  const handleCancelDispatch = () => {
    Alert.alert('Cancel Emergency Dispatch?', 'Are you sure you want to cancel the ambulance request?', [
      { text: 'No, Keep Dispatch', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: () => setIsDispatched(false) },
    ]);
  };

  const handleCallHospitalAmbulance = (hosp: HospitalAmbulanceNumber) => {
    const rawNum = hosp.shortHotline || hosp.directPhone;
    const cleanNum = rawNum.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanNum}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.iconBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.title}>{isDispatched ? 'Live Dispatch' : 'Emergency Ambulance'}</Text>
        <View style={styles.sosBadge}>
          <Ionicons name="flash" size={14} color={Colors.white} />
          <Text style={styles.sosBadgeText}>24/7 SOS</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Medical Emergency Hotlines (Ambulance 108, 104, 1066) */}
        <EmergencyHotlines />

        {/* Tab Switcher */}
        {!isDispatched && (
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'dispatch' && styles.tabBtnActive]}
              onPress={() => setActiveTab('dispatch')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="car-outline"
                size={16}
                color={activeTab === 'dispatch' ? Colors.white : Colors.primary}
              />
              <Text style={[styles.tabBtnText, activeTab === 'dispatch' && styles.tabBtnTextActive]}>
                Book Ambulance
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'hospitals' && styles.tabBtnActive]}
              onPress={() => setActiveTab('hospitals')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="medical-outline"
                size={16}
                color={activeTab === 'hospitals' ? Colors.white : Colors.primary}
              />
              <Text style={[styles.tabBtnText, activeTab === 'hospitals' && styles.tabBtnTextActive]}>
                Hospital Numbers
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 1: ON-DEMAND AMBULANCE DISPATCH */}
        {activeTab === 'dispatch' && (
          <>
            {!isDispatched ? (
              <>
                {/* Pickup Address Card */}
                <View style={styles.locationCard}>
                  <View style={styles.locationHeader}>
                    <Ionicons name="location" size={20} color={Colors.error} />
                    <Text style={styles.locationTitle}>Emergency Pickup Location</Text>
                  </View>
                  <Text style={styles.addressText}>{pickupAddress}</Text>
                  <Text style={styles.landmarkText}>Landmark: {landmark}</Text>
                  <TouchableOpacity style={styles.editLocBtn} onPress={() => setShowLocationModal(true)}>
                    <Ionicons name="create-outline" size={16} color={Colors.primary} />
                    <Text style={styles.editLocText}>Change Pickup Address</Text>
                  </TouchableOpacity>
                </View>

                {/* Ambulance Category Selection */}
                <Text style={styles.sectionHeading}>Select Ambulance Category</Text>
                {AMBULANCE_TYPES.map((type) => {
                  const isSelected = selectedType === type.id;
                  return (
                    <TouchableOpacity
                      key={type.id}
                      style={[styles.typeCard, isSelected && styles.typeCardSelected]}
                      onPress={() => setSelectedType(type.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.typeIconBox, isSelected && styles.typeIconBoxSelected]}>
                        <Ionicons name="medical" size={22} color={isSelected ? Colors.primary : Colors.secondary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.typeName, isSelected && styles.typeNameSelected]}>{type.name}</Text>
                        <Text style={styles.typeDesc}>{type.description}</Text>
                        <View style={styles.featureRow}>
                          {type.features.slice(0, 2).map((feat, i) => (
                            <View key={i} style={styles.featBadge}>
                              <Ionicons name="checkmark-circle" size={12} color={Colors.primary} style={{ marginRight: 3 }} />
                              <Text style={styles.featText}>{feat}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.etaText}>{type.eta}</Text>
                        <Text style={styles.priceText}>{type.price}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {/* Request Button */}
                <TouchableOpacity style={styles.sosRequestBtn} onPress={handleRequestAmbulance} activeOpacity={0.8}>
                  <Ionicons name="flash" size={20} color={Colors.white} />
                  <Text style={styles.sosRequestText}>REQUEST EMERGENCY AMBULANCE</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* Live Tracking Card */
              <View style={styles.trackerCard}>
                <View style={styles.countdownBox}>
                  <Text style={styles.countdownLabel}>ESTIMATED ARRIVAL IN</Text>
                  <Text style={styles.countdownTimer}>{formatCountdown(etaSeconds)}</Text>
                  <Text style={styles.countdownSub}>Driver is navigating rapidly toward your location</Text>
                </View>

                <View style={styles.driverRow}>
                  <View style={styles.driverAvatar}>
                    <Ionicons name="person" size={28} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.driverName}>{activeDriver.driverName}</Text>
                    <Text style={styles.driverHospital}>{activeDriver.currentHospital}</Text>
                    <Text style={styles.vehicleNo}>Vehicle: {activeDriver.vehicleNumber}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.callDriverBtn}
                    onPress={() => {
                      const clean = activeDriver.phone.replace(/[^0-9+]/g, '');
                      Linking.openURL(`tel:${clean}`);
                    }}
                  >
                    <Ionicons name="call" size={20} color={Colors.white} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.cancelDispatchBtn} onPress={handleCancelDispatch}>
                  <Text style={styles.cancelDispatchText}>Cancel Ambulance Request</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* TAB 2: DEDICATED HOSPITAL AMBULANCE NUMBERS */}
        {activeTab === 'hospitals' && (
          <View style={styles.hospitalListSection}>
            <View style={styles.hospitalSectionHeader}>
              <Ionicons name="call" size={16} color={Colors.primary} />
              <Text style={styles.hospitalSectionTitle}>Direct Hospital Ambulance Helplines</Text>
            </View>
            <Text style={styles.hospitalSectionSubtitle}>
              Tap any hospital below to directly call their dedicated emergency ambulance desk.
            </Text>

            {HOSPITAL_AMBULANCE_NUMBERS.map((hosp) => (
              <View key={hosp.id} style={styles.hospAmbCard}>
                <View style={styles.hospAmbCardHeader}>
                  <View style={[styles.hospIconCircle, { backgroundColor: (hosp.badgeColor || Colors.primary) + '15' }]}>
                    <Ionicons name="medical" size={20} color={hosp.badgeColor || Colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.hospAmbName}>{hosp.hospitalName}</Text>
                    <Text style={styles.hospAmbDistance}>{hosp.distance} • Response: {hosp.eta}</Text>
                  </View>
                  <View style={[styles.hospHotlineBadge, { backgroundColor: hosp.badgeColor || Colors.primary }]}>
                    <Text style={styles.hospHotlineText}>SOS {hosp.shortHotline}</Text>
                  </View>
                </View>

                <View style={styles.hospAmbDetailsRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.hospAmbType}>{hosp.ambulanceType}</Text>
                    <Text style={styles.hospAmbPhone}>{hosp.directPhone}</Text>
                    <Text style={styles.hospUnitsActive}>✓ {hosp.availableUnits} Ambulances on Standby</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.hospCallBtn, { backgroundColor: hosp.badgeColor || Colors.primary }]}
                    onPress={() => handleCallHospitalAmbulance(hosp)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="call" size={16} color={Colors.white} />
                    <Text style={styles.hospCallBtnText}>Call</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Address Edit Modal */}
      <Modal visible={showLocationModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <ModalHeader title="Edit Pickup Address" onClose={() => setShowLocationModal(false)} />
            <View style={{ padding: 16 }}>
              <Text style={styles.inputLabel}>Full Street Address</Text>
              <TextInput style={styles.input} value={pickupAddress} onChangeText={setPickupAddress} />
              <Text style={[styles.inputLabel, { marginTop: 12 }]}>Nearby Landmark</Text>
              <TextInput style={styles.input} value={landmark} onChangeText={setLandmark} />
              <TouchableOpacity
                style={[styles.sosRequestBtn, { backgroundColor: Colors.primary, marginTop: 16 }]}
                onPress={() => setShowLocationModal(false)}
              >
                <Text style={styles.sosRequestText}>Save Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
  },
  sosBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 4,
  },
  sosBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 4,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
  },
  tabBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  tabBtnTextActive: {
    color: Colors.white,
  },
  locationCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.error,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
  },
  landmarkText: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
  },
  editLocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  editLocText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 10,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  typeCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.accentLight,
  },
  typeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  typeIconBoxSelected: {
    backgroundColor: Colors.white,
  },
  typeName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  typeNameSelected: {
    color: Colors.primary,
  },
  typeDesc: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 2,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  featBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  featText: {
    fontSize: 10,
    color: Colors.secondary,
  },
  etaText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
    marginTop: 4,
  },
  sosRequestBtn: {
    backgroundColor: Colors.error,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  sosRequestText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  trackerCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 6,
  },
  countdownBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  countdownLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.error,
    letterSpacing: 1,
  },
  countdownTimer: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.error,
    marginVertical: 4,
  },
  countdownSub: {
    fontSize: 11,
    color: Colors.secondary,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  driverHospital: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 2,
  },
  vehicleNo: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
  },
  callDriverBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelDispatchBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.error,
    alignItems: 'center',
  },
  cancelDispatchText: {
    color: Colors.error,
    fontWeight: '700',
    fontSize: 13,
  },
  hospitalListSection: {
    marginTop: 4,
  },
  hospitalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  hospitalSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
  },
  hospitalSectionSubtitle: {
    fontSize: 11,
    color: Colors.secondary,
    marginBottom: 12,
    lineHeight: 16,
  },
  hospAmbCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  hospAmbCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 10,
  },
  hospIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospAmbName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textDark,
  },
  hospAmbDistance: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 2,
  },
  hospHotlineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  hospHotlineText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  hospAmbDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hospAmbType: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
  },
  hospAmbPhone: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: '700',
    marginTop: 2,
  },
  hospUnitsActive: {
    fontSize: 10.5,
    color: '#16A34A',
    fontWeight: '600',
    marginTop: 2,
  },
  hospCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  hospCallBtnText: {
    color: Colors.white,
    fontSize: 12.5,
    fontWeight: '800',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 6,
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
});

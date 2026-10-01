import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import {
  AMBULANCE_TYPES,
  NEARBY_AMBULANCES,
  HOSPITAL_AMBULANCE_NUMBERS,
  AmbulanceUnit,
} from '../constants/ambulancesData';
import EmergencyHotlines from '../components/common/EmergencyHotlines';
import ScreenHeader from '../components/common/ScreenHeader';
import AmbulanceTypeCard from '../components/ambulance/AmbulanceTypeCard';
import AmbulanceLiveTracker from '../components/ambulance/AmbulanceLiveTracker';
import HospitalAmbulanceCard from '../components/ambulance/HospitalAmbulanceCard';
import EditPickupLocationModal from '../components/ambulance/EditPickupLocationModal';
import { sendAmbulanceDispatchNotification } from '../services/notificationManager';
import MedicalAlertModal from '../components/modals/MedicalAlertModal';

import { formatDuration } from '../utils/formatters';

interface AmbulanceScreenProps {
  onBack?: () => void;
  navigation?: any;
}

/**
 * Emergency Ambulance Screen.
 * Allows booking an on-demand ambulance with live countdown tracking
 * or calling direct hospital ambulance desks.
 */
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
  const [showCancelAlert, setShowCancelAlert] = useState(false);

  useEffect(() => {
    let timer: any = null;
    if (isDispatched && etaSeconds > 0) {
      timer = setInterval(() => setEtaSeconds((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isDispatched, etaSeconds]);

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
    setShowCancelAlert(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <ScreenHeader
        title={isDispatched ? 'Live Dispatch' : 'Emergency Ambulance'}
        onBack={handleGoBack}
        iconName="arrow-back"
        rightElement={
          <View style={styles.sosBadge}>
            <Ionicons name="flash" size={13} color={Colors.white} />
            <Text style={styles.sosBadgeText}>24/7 SOS</Text>
          </View>
        }
      />

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
                {AMBULANCE_TYPES.map((type) => (
                  <AmbulanceTypeCard
                    key={type.id}
                    type={type}
                    isSelected={selectedType === type.id}
                    onSelect={() => setSelectedType(type.id)}
                  />
                ))}

                {/* Request Button */}
                <TouchableOpacity
                  style={styles.sosRequestBtn}
                  onPress={handleRequestAmbulance}
                  activeOpacity={0.8}
                >
                  <Ionicons name="flash" size={20} color={Colors.white} />
                  <Text style={styles.sosRequestText}>REQUEST EMERGENCY AMBULANCE</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* Live Tracking Card */
              <AmbulanceLiveTracker
                driver={activeDriver}
                etaSeconds={etaSeconds}
                formatCountdown={formatDuration}
                onCancelDispatch={handleCancelDispatch}
              />
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
              <HospitalAmbulanceCard key={hosp.id} hospital={hosp} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Address Edit Modal */}
      <EditPickupLocationModal
        visible={showLocationModal}
        pickupAddress={pickupAddress}
        landmark={landmark}
        onAddressChange={setPickupAddress}
        onLandmarkChange={setLandmark}
        onClose={() => setShowLocationModal(false)}
        onSave={() => setShowLocationModal(false)}
      />

      {/* Emergency Dispatch Cancellation Dialog */}
      <MedicalAlertModal
        visible={showCancelAlert}
        type="ambulance"
        icon="alert-circle-outline"
        title="Cancel Emergency Dispatch?"
        message="Are you sure you want to cancel the ambulance request?"
        primaryButtonText="Yes, Cancel"
        secondaryButtonText="Keep Dispatch"
        isDestructive
        onPrimaryPress={() => {
          setIsDispatched(false);
          setShowCancelAlert(false);
        }}
        onSecondaryPress={() => setShowCancelAlert(false)}
        onClose={() => setShowCancelAlert(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.black,
  },
  sosBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  sosBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 50,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBgSecondary,
    borderRadius: 14,
    padding: 4,
    marginVertical: 14,
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
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  tabBtnTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  locationCard: {
    backgroundColor: Colors.dangerBgLight,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  locationTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.error,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 2,
  },
  landmarkText: {
    fontSize: 12,
    color: Colors.secondary,
    marginBottom: 10,
  },
  editLocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editLocText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.primary,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 12,
  },
  sosRequestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
    gap: 8,
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sosRequestText: {
    color: Colors.white,
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hospitalListSection: {
    marginTop: 6,
  },
  hospitalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  hospitalSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.black,
  },
  hospitalSectionSubtitle: {
    fontSize: 12,
    color: Colors.secondary,
    marginBottom: 14,
    lineHeight: 17,
  },
});

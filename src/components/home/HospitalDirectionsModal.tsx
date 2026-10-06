import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HospitalItem } from '../../constants/hospitalsData';
import { getDynamicBookingDates } from '../../constants/appData';
import ModalHeader from '../common/ModalHeader';
import HospitalInfoSection from '../hospital/HospitalInfoSection';
import HospitalBookingForm, { VisitTypeOption } from '../hospital/HospitalBookingForm';
import HospitalBookingSuccess from '../hospital/HospitalBookingSuccess';
import { sendHospitalBookingNotificationAndReminder } from '../../services/notificationManager';
import { getLoginSession } from '../../utils/storage';
import MedicalAlertModal, { MedicalAlertType } from '../modals/MedicalAlertModal';

export interface HospitalDirectionsModalProps {
  visible: boolean;
  hospital: HospitalItem | null;
  initialTab?: 'info' | 'book';
  onClose: () => void;
  onEmergencyPress?: () => void;
  onAmbulancePress?: () => void;
  onBookingConfirmed?: (booking: any) => void;
}

const VISIT_TYPES: VisitTypeOption[] = [
  { id: 'opd', label: 'OPD Doctor Consultation', icon: 'medkit-outline', badge: 'Standard' },
  { id: 'checkup', label: 'General Health Checkup', icon: 'heart-outline', badge: 'Preventive' },
  { id: 'inpatient', label: 'Inpatient Hospital Care', icon: 'business-outline', badge: 'Admission' },
  { id: 'emergency', label: 'Emergency Priority Token', icon: 'flash-outline', badge: 'Immediate' },
];

/**
 * Main Hospital Directions and Booking Modal.
 * Orchestrates hospital details/helpline calling, OPD/bed booking, and token confirmation.
 */
export default function HospitalDirectionsModal({
  visible,
  hospital,
  initialTab = 'info',
  onClose,
  onEmergencyPress,
  onAmbulancePress,
  onBookingConfirmed,
}: HospitalDirectionsModalProps) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'info' | 'book'>('info');
  const [viewState, setViewState] = useState<'main' | 'success'>('main');

  // Booking Form State
  const [selectedVisitType, setSelectedVisitType] = useState('opd');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('+1 (555) 019-2834');
  const [visitNotes, setVisitNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingToken, setBookingToken] = useState('');
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

  const bookingDates = useMemo(() => getDynamicBookingDates(14), []);

  useEffect(() => {
    if (visible && hospital) {
      setActiveTab(initialTab || 'info');
      setViewState('main');
      if (hospital.departments && hospital.departments.length > 0) {
        setSelectedDepartment(hospital.departments[0]);
      }
      getLoginSession().then((session) => {
        if (session?.name) {
          setPatientName(session.name);
        } else {
          setPatientName('');
        }
      });
    }
  }, [visible, hospital, initialTab]);

  if (!hospital) return null;

  const handleOpenGPS = () => {
    const query = encodeURIComponent(`${hospital.name} ${hospital.address}`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const handleCallReception = () => {
    const phone = hospital.receptionPhone || '+1 (555) 012-4000';
    const cleanNumber = phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanNumber}`);
  };

  const handleCallEmergencyDesk = () => {
    const rawNumber = hospital.emergencyPhone ? hospital.emergencyPhone.split('/')[0].trim() : '108';
    const cleanNumber = rawNumber.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanNumber || '108'}`);
  };

  const handleAmbulanceDispatch = () => {
    onClose();
    if (onAmbulancePress) {
      onAmbulancePress();
    } else if (onEmergencyPress) {
      onEmergencyPress();
    }
  };

  const handleBookHospitalVisit = async () => {
    if (!patientName.trim()) {
      setAlertConfig({
        visible: true,
        type: 'warning',
        icon: 'person-outline',
        title: 'Patient Name Required',
        message: 'Please enter patient full name before generating hospital appointment token.',
      });
      return;
    }

    setIsProcessing(true);
    const genToken = `#HOSP-${Math.floor(10000 + Math.random() * 90000)}`;
    setBookingToken(genToken);

    const visitTypeObj = VISIT_TYPES.find((v) => v.id === selectedVisitType);
    const visitTypeLabel = visitTypeObj ? visitTypeObj.label : 'OPD Consultation';
    const chosenDateStr = bookingDates[selectedDateIndex]?.fullDate || 'Today';

    try {
      await sendHospitalBookingNotificationAndReminder({
        hospitalName: hospital.name,
        bookingToken: genToken,
        department: selectedDepartment || 'General Medicine',
        date: chosenDateStr,
        time: selectedTimeSlot,
        visitType: visitTypeLabel,
        receptionPhone: hospital.receptionPhone,
      });

      setIsProcessing(false);
      setViewState('success');
      onBookingConfirmed?.({
        hospital: hospital.name,
        token: genToken,
        date: chosenDateStr,
        time: selectedTimeSlot,
      });
    } catch (e) {
      console.log(e);
      setIsProcessing(false);
      setViewState('success');
    }
  };

  const handleResetAndClose = () => {
    setViewState('main');
    setIsProcessing(false);
    onClose();
  };

  const chosenDateStr = bookingDates[selectedDateIndex]?.fullDate || 'Today';
  const currentFee = selectedVisitType === 'emergency' ? 35 : selectedVisitType === 'checkup' ? 50 : 25;

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
            title={viewState === 'success' ? 'Booking Confirmed' : hospital.name}
            subtitle={
              viewState === 'main'
                ? `${hospital.distance} • ${hospital.hospitalType || 'Certified Medical Hospital'}`
                : undefined
            }
            onBack={viewState === 'success' ? handleResetAndClose : undefined}
            onClose={handleResetAndClose}
          />

          {viewState === 'main' && (
            <View style={{ flex: 1 }}>
              {/* Segmented Control Tabs */}
              <View style={styles.tabBar}>
                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'info' && styles.tabButtonActive]}
                  onPress={() => setActiveTab('info')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color={activeTab === 'info' ? Colors.white : Colors.primary}
                  />
                  <Text style={[styles.tabButtonText, activeTab === 'info' && styles.tabButtonTextActive]}>
                    Hospital & Hotlines
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'book' && styles.tabButtonActive]}
                  onPress={() => setActiveTab('book')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={activeTab === 'book' ? Colors.white : Colors.primary}
                  />
                  <Text style={[styles.tabButtonText, activeTab === 'book' && styles.tabButtonTextActive]}>
                    Book Hospital Visit
                  </Text>
                  <View style={[styles.tabBadge, activeTab === 'book' && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, activeTab === 'book' && styles.tabBadgeTextActive]}>
                      Token
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {activeTab === 'info' ? (
                <HospitalInfoSection
                  hospital={hospital}
                  onCallReception={handleCallReception}
                  onCallEmergency={handleCallEmergencyDesk}
                  onAmbulanceDispatch={handleAmbulanceDispatch}
                  onSwitchToBook={() => setActiveTab('book')}
                  onOpenGPS={handleOpenGPS}
                />
              ) : (
                <HospitalBookingForm
                  hospital={hospital}
                  visitTypes={VISIT_TYPES}
                  selectedVisitType={selectedVisitType}
                  selectedDepartment={selectedDepartment}
                  selectedDateIndex={selectedDateIndex}
                  selectedTimeSlot={selectedTimeSlot}
                  patientName={patientName}
                  patientPhone={patientPhone}
                  visitNotes={visitNotes}
                  currentFee={currentFee}
                  isProcessing={isProcessing}
                  onSelectVisitType={setSelectedVisitType}
                  onSelectDepartment={setSelectedDepartment}
                  onSelectDateIndex={setSelectedDateIndex}
                  onSelectTimeSlot={setSelectedTimeSlot}
                  onPatientNameChange={setPatientName}
                  onPatientPhoneChange={setPatientPhone}
                  onVisitNotesChange={setVisitNotes}
                  onSubmitBooking={handleBookHospitalVisit}
                />
              )}
            </View>
          )}

          {viewState === 'success' && (
            <HospitalBookingSuccess
              hospital={hospital}
              bookingToken={bookingToken}
              selectedDepartment={selectedDepartment}
              chosenDateStr={chosenDateStr}
              selectedTimeSlot={selectedTimeSlot}
              patientName={patientName}
              onCallReception={handleCallReception}
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
  tabBadge: {
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  tabBadgeActive: {
    backgroundColor: Colors.whiteOverlay25,
  },
  tabBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.secondary,
  },
  tabBadgeTextActive: {
    color: Colors.white,
  },
});

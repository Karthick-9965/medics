import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, Image, Linking, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { HospitalItem } from '../../constants/hospitalsData';
import { getDynamicBookingDates } from '../../constants/appData';
import ModalHeader from '../common/ModalHeader';
import SlotPicker from '../common/SlotPicker';
import PriceSummary from '../common/PriceSummary';
import { sendHospitalBookingNotificationAndReminder } from '../../services/notificationManager';
import { getLoginSession } from '../../utils/storage';

export interface HospitalDirectionsModalProps {
  visible: boolean;
  hospital: HospitalItem | null;
  initialTab?: 'info' | 'book';
  onClose: () => void;
  onEmergencyPress?: () => void;
  onAmbulancePress?: () => void;
  onBookingConfirmed?: (booking: any) => void;
}

interface VisitTypeOption {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge: string;
}

const VISIT_TYPES: VisitTypeOption[] = [
  { id: 'opd', label: 'OPD Doctor Consultation', icon: 'medkit-outline', badge: 'Standard' },
  { id: 'checkup', label: 'General Health Checkup', icon: 'heart-outline', badge: 'Preventive' },
  { id: 'bed', label: 'Bed / Inpatient Admission', icon: 'bed-outline', badge: 'Room / ICU' },
  { id: 'emergency', label: 'Emergency Priority Token', icon: 'flash-outline', badge: 'Immediate' },
];

export default function HospitalDirectionsModal({
  visible,
  hospital,
  initialTab = 'info',
  onClose,
  onEmergencyPress,
  onAmbulancePress,
  onBookingConfirmed,
}: HospitalDirectionsModalProps) {
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

  const bookingDates = useMemo(() => getDynamicBookingDates(14), []);

  // Reset tab & default department when opened
  React.useEffect(() => {
    if (visible && hospital) {
      setActiveTab(initialTab || 'info');
      setViewState('main');
      if (hospital.departments && hospital.departments.length > 0) {
        setSelectedDepartment(hospital.departments[0]);
      }
      getLoginSession().then((session) => {
        if (session?.name && session.name !== 'User' && session.name !== 'Sathish Kumar') {
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
      Alert.alert('Patient Name Required', 'Please enter the patient name.');
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
    } catch (e) {
      console.log('Error scheduling hospital booking notification:', e);
    }

    setTimeout(() => {
      setIsProcessing(false);
      setViewState('success');
      if (onBookingConfirmed) {
        onBookingConfirmed({
          token: genToken,
          hospitalName: hospital.name,
          department: selectedDepartment,
          date: chosenDateStr,
          time: selectedTimeSlot,
          visitType: visitTypeLabel,
          fee: `$${hospital.consultationFee || 25}`,
        });
      }
    }, 900);
  };

  const handleResetAndClose = () => {
    setViewState('main');
    setIsProcessing(false);
    onClose();
  };

  const currentFee = hospital.consultationFee || 25;
  const chosenDateStr = bookingDates[selectedDateIndex]?.fullDate || 'Today';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleResetAndClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <ModalHeader
            title={viewState === 'main' ? hospital.name : 'Booking Confirmed!'}
            subtitle={viewState === 'main' ? `${hospital.distance} • ${hospital.rating} ★ • ${hospital.visitingHours || '24/7 Open'}` : undefined}
            onClose={handleResetAndClose}
          />

          {viewState === 'main' ? (
            <View style={{ flex: 1 }}>
              {/* Mode Segmented Control Tabs */}
              <View style={styles.tabBar}>
                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'info' && styles.tabButtonActive]}
                  onPress={() => setActiveTab('info')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="business-outline"
                    size={16}
                    color={activeTab === 'info' ? Colors.white : Colors.primary}
                  />
                  <Text style={[styles.tabButtonText, activeTab === 'info' && styles.tabButtonTextActive]}>
                    Hospital & Reception
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

              {/* TAB 1: HOSPITAL DETAILS & RECEPTION CALLING */}
              {activeTab === 'info' && (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                  {/* Hero Card */}
                  <View style={styles.heroCard}>
                    <Image source={hospital.image} style={styles.heroImage} />
                    <View style={styles.heroOverlay}>
                      <Text style={styles.heroName}>{hospital.name}</Text>
                      <Text style={styles.heroAddress}>{hospital.address}</Text>
                      <View style={styles.badgeRow}>
                        <View style={styles.statusBadge}>
                          <Ionicons name="bed" size={13} color="#16A34A" />
                          <Text style={styles.badgeText}>{hospital.availableBeds || 12} ICU Beds Available</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: Colors.accentLight }]}>
                          <Ionicons name="navigate" size={13} color={Colors.primary} />
                          <Text style={[styles.badgeText, { color: Colors.primary }]}>{hospital.distance}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* 1. Direct Hospital Reception & Helpdesk Card */}
                  <View style={styles.receptionCard}>
                    <View style={styles.receptionHeader}>
                      <View style={styles.receptionIconCircle}>
                        <Ionicons name="call" size={20} color={Colors.primary} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.receptionTitle}>Hospital Reception & Helpdesk</Text>
                        <Text style={styles.receptionPhone}>{hospital.receptionPhone || '+1 (555) 012-4000'}</Text>
                        <Text style={styles.receptionSub}>OPD enquiries, doctor schedule & billing</Text>
                      </View>
                      <TouchableOpacity style={styles.receptionCallBtn} onPress={handleCallReception} activeOpacity={0.8}>
                        <Ionicons name="call" size={16} color={Colors.white} />
                        <Text style={styles.receptionCallBtnText}>Call</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* 2. Direct Emergency SOS & Ambulance Card */}
                  <View style={styles.emergencyDeskCard}>
                    <View style={styles.emergencyDeskHeader}>
                      <View style={styles.deskIconCircle}>
                        <Ionicons name="medical" size={20} color={Colors.error} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.emergencyDeskTitle}>24/7 Emergency & Trauma Desk</Text>
                        <Text style={styles.emergencyDeskNumber}>{hospital.emergencyPhone || '1066 / 108'}</Text>
                      </View>
                      <TouchableOpacity style={styles.emergencyCallBtn} onPress={handleCallEmergencyDesk} activeOpacity={0.8}>
                        <Ionicons name="flash" size={15} color={Colors.white} />
                        <Text style={styles.emergencyCallBtnText}>Emergency</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={styles.ambulanceDispatchLink}
                      onPress={handleAmbulanceDispatch}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="medical" size={16} color={Colors.error} />
                      <Text style={styles.ambulanceDispatchLinkText}>Need an Ambulance? Dispatch now to {hospital.name.split(' ')[0]}</Text>
                      <Ionicons name="arrow-forward" size={14} color={Colors.error} />
                    </TouchableOpacity>
                  </View>

                  {/* 3. Quick CTA to Book Visit */}
                  <TouchableOpacity
                    style={styles.bookVisitPromoBanner}
                    onPress={() => setActiveTab('book')}
                    activeOpacity={0.85}
                  >
                    <View style={styles.bookVisitPromoIcon}>
                      <Ionicons name="calendar" size={20} color={Colors.white} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.bookVisitPromoTitle}>Book OPD Visit / Bed Token</Text>
                      <Text style={styles.bookVisitPromoSub}>Skip the queue • Instant hospital appointment token</Text>
                    </View>
                    <View style={styles.bookVisitPromoBtn}>
                      <Text style={styles.bookVisitPromoBtnText}>Book Now</Text>
                      <Ionicons name="arrow-forward" size={12} color={Colors.primary} />
                    </View>
                  </TouchableOpacity>

                  {/* 4. Departments Available */}
                  {hospital.departments && hospital.departments.length > 0 && (
                    <View style={styles.departmentsSection}>
                      <Text style={styles.sectionHeading}>Specialty & Super Specialty Departments</Text>
                      <View style={styles.deptWrap}>
                        {hospital.departments.map((dept, i) => (
                          <View key={i} style={styles.deptChip}>
                            <Ionicons name="checkmark-circle" size={13} color={Colors.primary} />
                            <Text style={styles.deptText}>{dept}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* 5. Location Card */}
                  <View style={styles.infoBox}>
                    <Ionicons name="location" size={18} color={Colors.primary} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.infoBoxTitle}>Location & Address</Text>
                      <Text style={styles.infoBoxDesc}>{hospital.address}</Text>
                    </View>
                  </View>
                </ScrollView>
              )}

              {/* TAB 2: BOOK HOSPITAL VISIT / BED APPOINTMENT */}
              {activeTab === 'book' && (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                  {/* Select Visit Type */}
                  <Text style={styles.sectionHeading}>1. Select Visit / Booking Type</Text>
                  <View style={styles.visitTypesGrid}>
                    {VISIT_TYPES.map((v) => {
                      const isSelected = selectedVisitType === v.id;
                      return (
                        <TouchableOpacity
                          key={v.id}
                          style={[styles.visitTypeCard, isSelected && styles.visitTypeCardSelected]}
                          onPress={() => setSelectedVisitType(v.id)}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name={v.icon}
                            size={18}
                            color={isSelected ? Colors.primary : Colors.secondary}
                          />
                          <Text style={[styles.visitTypeLabel, isSelected && styles.visitTypeLabelSelected]}>
                            {v.label}
                          </Text>
                          <View style={[styles.visitTypeBadge, isSelected && styles.visitTypeBadgeSelected]}>
                            <Text style={[styles.visitTypeBadgeText, isSelected && styles.visitTypeBadgeTextSelected]}>
                              {v.badge}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Select Department */}
                  {hospital.departments && hospital.departments.length > 0 && (
                    <View style={{ marginTop: 14 }}>
                      <Text style={styles.sectionHeading}>2. Select Department</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deptScroll}>
                        {hospital.departments.map((dept) => {
                          const isSel = selectedDepartment === dept;
                          return (
                            <TouchableOpacity
                              key={dept}
                              style={[styles.deptSelectChip, isSel && styles.deptSelectChipActive]}
                              onPress={() => setSelectedDepartment(dept)}
                              activeOpacity={0.7}
                            >
                              <Text style={[styles.deptSelectText, isSel && styles.deptSelectTextActive]}>{dept}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}

                  {/* Date & Time Slot Picker */}
                  <View style={{ marginTop: 14 }}>
                    <Text style={styles.sectionHeading}>3. Select Visit Date & Time</Text>
                    <SlotPicker
                      selectedDateIndex={selectedDateIndex}
                      onSelectDate={setSelectedDateIndex}
                      selectedTimeSlot={selectedTimeSlot}
                      onSelectTime={setSelectedTimeSlot}
                    />
                  </View>

                  {/* Patient Details Form */}
                  <View style={{ marginTop: 14 }}>
                    <Text style={styles.sectionHeading}>4. Patient Information</Text>
                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>Patient Full Name</Text>
                      <TextInput
                        style={styles.formInput}
                        value={patientName}
                        onChangeText={setPatientName}
                        placeholder="Enter patient full name"
                        placeholderTextColor={Colors.secondary}
                      />
                    </View>
                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>Contact Phone Number</Text>
                      <TextInput style={styles.formInput} value={patientPhone} onChangeText={setPatientPhone} keyboardType="phone-pad" />
                    </View>
                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>Symptoms or Reason for Hospital Visit (Optional)</Text>
                      <TextInput
                        style={[styles.formInput, { height: 60, textAlignVertical: 'top' }]}
                        value={visitNotes}
                        onChangeText={setVisitNotes}
                        placeholder="e.g. Chest discomfort, orthopedic review, second opinion"
                        placeholderTextColor={Colors.secondary}
                        multiline
                      />
                    </View>
                  </View>

                  {/* Summary & Price */}
                  <PriceSummary
                    items={[
                      { label: `Hospital Registration & Consultation Fee`, amount: `$${currentFee}.00` },
                      { label: 'Token Reservation & Priority Queue', amount: 'FREE', isDiscount: true },
                      { label: 'Hospital Reception Verification', amount: 'Included' },
                    ]}
                    totalAmount={`$${currentFee}.00`}
                  />

                  {/* Book Button */}
                  <TouchableOpacity
                    style={styles.primaryBookBtn}
                    onPress={handleBookHospitalVisit}
                    disabled={isProcessing}
                    activeOpacity={0.8}
                  >
                    {isProcessing ? (
                      <ActivityIndicator color={Colors.white} size="small" />
                    ) : (
                      <Text style={styles.primaryBookBtnText}>
                        Confirm Hospital Token (${currentFee}.00)
                      </Text>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              )}

              {/* Bottom Fixed Footer for Info Tab */}
              {activeTab === 'info' && (
                <View style={styles.footer}>
                  <TouchableOpacity style={styles.receptionFooterBtn} onPress={handleCallReception} activeOpacity={0.8}>
                    <Ionicons name="call" size={17} color={Colors.white} />
                    <Text style={styles.receptionFooterBtnText}>Call Reception</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.navigateBtn} onPress={handleOpenGPS} activeOpacity={0.8}>
                    <Ionicons name="navigate" size={17} color={Colors.primary} />
                    <Text style={styles.navigateBtnText}>GPS Route</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            /* SUCCESS CONFIRMATION STATE */
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={68} color="#16A34A" />
              <Text style={styles.successTitle}>Hospital Visit Booked!</Text>
              <Text style={styles.successSubtitle}>
                Your appointment token at {hospital.name} has been generated. Please present this token at the hospital reception.
              </Text>

              <View style={styles.tokenCard}>
                <Text style={styles.tokenLabel}>HOSPITAL TOKEN REFERENCE</Text>
                <Text style={styles.tokenNumber}>{bookingToken}</Text>
                <View style={styles.tokenDivider} />
                <View style={styles.tokenRow}>
                  <Text style={styles.tokenItemKey}>Department:</Text>
                  <Text style={styles.tokenItemVal}>{selectedDepartment || 'General'}</Text>
                </View>
                <View style={styles.tokenRow}>
                  <Text style={styles.tokenItemKey}>Date & Time:</Text>
                  <Text style={styles.tokenItemVal}>{chosenDateStr}, {selectedTimeSlot}</Text>
                </View>
                <View style={styles.tokenRow}>
                  <Text style={styles.tokenItemKey}>Patient:</Text>
                  <Text style={styles.tokenItemVal}>{patientName}</Text>
                </View>
                <View style={styles.tokenRow}>
                  <Text style={styles.tokenItemKey}>Reception Helpdesk:</Text>
                  <Text style={[styles.tokenItemVal, { color: Colors.primary, fontWeight: '700' }]}>
                    {hospital.receptionPhone}
                  </Text>
                </View>
              </View>

              <View style={styles.successBtnRow}>
                <TouchableOpacity style={styles.callReceptionSuccessBtn} onPress={handleCallReception}>
                  <Ionicons name="call" size={16} color={Colors.primary} />
                  <Text style={styles.callReceptionSuccessText}>Call Reception</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.doneBtn} onPress={handleResetAndClose}>
                  <Text style={styles.doneBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
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
    marginVertical: 8,
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
    fontSize: 12.5,
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
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  heroCard: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 155,
    position: 'relative',
    marginBottom: 14,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.68)',
    padding: 12,
  },
  heroName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.white,
  },
  heroAddress: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  receptionCard: {
    backgroundColor: '#EDF8F6',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#C5EBE4',
    marginBottom: 12,
  },
  receptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receptionIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C5EBE4',
  },
  receptionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textDark,
  },
  receptionPhone: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 1,
  },
  receptionSub: {
    fontSize: 10.5,
    color: Colors.secondary,
    marginTop: 2,
  },
  receptionCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 5,
  },
  receptionCallBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  emergencyDeskCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    marginBottom: 12,
  },
  emergencyDeskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deskIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyDeskTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textDark,
  },
  emergencyDeskNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.error,
    marginTop: 2,
  },
  emergencyCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 4,
  },
  emergencyCallBtnText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  ambulanceDispatchLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    gap: 6,
  },
  ambulanceDispatchLinkText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.error,
  },
  bookVisitPromoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    marginBottom: 14,
  },
  bookVisitPromoIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookVisitPromoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textDark,
  },
  bookVisitPromoSub: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 1,
  },
  bookVisitPromoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 3,
  },
  bookVisitPromoBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  departmentsSection: {
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
  },
  deptWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  deptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  deptText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textDark,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
  },
  infoBoxDesc: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 1,
  },
  visitTypesGrid: {
    gap: 8,
  },
  visitTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 10,
  },
  visitTypeCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.accentLight,
  },
  visitTypeLabel: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.textDark,
  },
  visitTypeLabelSelected: {
    color: Colors.primary,
  },
  visitTypeBadge: {
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  visitTypeBadgeSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  visitTypeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary,
  },
  visitTypeBadgeTextSelected: {
    color: Colors.white,
  },
  deptScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  deptSelectChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deptSelectChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  deptSelectText: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '600',
  },
  deptSelectTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  formGroup: {
    marginBottom: 10,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: Colors.bgLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
  },
  primaryBookBtn: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  primaryBookBtnText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 13.5,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  receptionFooterBtn: {
    flex: 1.5,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  receptionFooterBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  navigateBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  navigateBtnText: {
    color: Colors.primary,
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
  tokenCard: {
    width: '100%',
    backgroundColor: '#F4FAF8',
    borderRadius: 16,
    padding: 16,
    marginTop: 18,
    borderWidth: 1.5,
    borderColor: '#C5EBE4',
  },
  tokenLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  tokenNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.primary,
    textAlign: 'center',
    marginVertical: 4,
  },
  tokenDivider: {
    height: 1,
    backgroundColor: '#D1EAE5',
    marginVertical: 10,
  },
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  tokenItemKey: {
    fontSize: 12,
    color: Colors.secondary,
  },
  tokenItemVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.textDark,
  },
  successBtnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginTop: 22,
  },
  callReceptionSuccessBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  callReceptionSuccessText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  doneBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});

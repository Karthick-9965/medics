import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { DoctorItem } from '../../constants/doctorsData';
import { getDynamicBookingDates, CONSULTATION_OPTIONS, ConsultationType, PaymentMethodType } from '../../constants/appData';
import ModalHeader from '../common/ModalHeader';
import SlotPicker from '../common/SlotPicker';
import PaymentPicker from '../common/PaymentPicker';
import PriceSummary from '../common/PriceSummary';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLoginSession } from '../../utils/storage';
import { sendAppointmentNotificationAndReminder } from '../../services/notificationManager';

interface BookDoctorModalProps {
  visible: boolean;
  doctor: DoctorItem | null;
  onClose: () => void;
  onBookingConfirmed?: (appointment: any) => void;
  onNavigateToSchedule?: () => void;
}

export default function BookDoctorModal({
  visible,
  doctor,
  onClose,
  onBookingConfirmed,
  onNavigateToSchedule,
}: BookDoctorModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:30 AM');
  const [consultationType, setConsultationType] = useState<ConsultationType>('Video Call');
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [problemDescription, setProblemDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('382');
  const [setReminderChecked, setSetReminderChecked] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingId, setBookingId] = useState('');

  React.useEffect(() => {
    if (visible) {
      setStep(1);
      getLoginSession().then((session) => {
        if (session?.name && session.name !== 'User' && session.name !== 'Sathish Kumar') {
          setPatientName(session.name);
        } else {
          setPatientName('');
        }
      });
    }
  }, [visible]);

  if (!doctor) return null;

  const activeConsultation = CONSULTATION_OPTIONS.find((c) => c.type === consultationType) || CONSULTATION_OPTIONS[0];
  const baseFee = activeConsultation.fee;
  const platformFee = 2.0;
  const promoDiscount = 5.0;
  const totalAmount = (baseFee + platformFee - promoDiscount).toFixed(2);

  const handleResetAndClose = () => {
    setStep(1);
    setIsProcessing(false);
    onClose();
  };

  const handleProcessPayment = async () => {
    if (!patientName.trim()) {
      Alert.alert('Required', 'Please enter patient name.');
      return;
    }
    setIsProcessing(true);
    const generatedId = `#MED-${Math.floor(10000 + Math.random() * 90000)}`;
    setBookingId(generatedId);

    const bookingDates = getDynamicBookingDates(14);
    const selectedDateItem = bookingDates[selectedDateIndex] || bookingDates[0];

    const newAppointment = {
      id: String(Date.now()),
      doctorName: doctor.name,
      specialization: doctor.specialization,
      avatar: doctor.image,
      rating: doctor.rating,
      date: selectedDateItem.fullDate,
      time: selectedTimeSlot,
      status: 'upcoming',
      statusLabel: 'Confirmed',
      hospitalName: doctor.hospital || 'City Care Hospital',
      consultationType,
      bookingId: generatedId,
      patientName,
      patientAge: `${patientAge} yrs`,
      patientGender,
      fee: `$${totalAmount}`,
      problemDescription,
    };

    try {
      const savedStr = await AsyncStorage.getItem('@app_appointments');
      const saved = savedStr ? JSON.parse(savedStr) : [];
      saved.unshift(newAppointment);
      await AsyncStorage.setItem('@app_appointments', JSON.stringify(saved));

      await sendAppointmentNotificationAndReminder({
        doctorName: doctor.name,
        specialization: doctor.specialization,
        date: selectedDateItem.date,
        time: selectedTimeSlot,
        consultationType,
        bookingId: generatedId,
        setReminder: setReminderChecked,
      });
    } catch (e) {
      console.log('Error caching appointment:', e);
    }

    setTimeout(() => {
      setIsProcessing(false);
      setStep(4);
      if (onBookingConfirmed) onBookingConfirmed(newAppointment);
    }, 1200);
  };

  const handleHeaderBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    } else {
      handleResetAndClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleResetAndClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <ModalHeader
            title={step === 4 ? 'Booking Confirmed' : `Book ${doctor.name}`}
            subtitle={step < 4 ? `Step ${step} of 3` : undefined}
            onBack={handleHeaderBack}
            onClose={handleResetAndClose}
          />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Doctor mini header card */}
            {step < 4 && (
              <View style={styles.docMiniCard}>
                <Image source={doctor.image} style={styles.docAvatar} />
                <View style={styles.docInfo}>
                  <Text style={styles.docName}>{doctor.name}</Text>
                  <Text style={styles.docSpec}>{doctor.specialization}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={13} color="#F59E0B" />
                    <Text style={styles.ratingText}>{doctor.rating} • {doctor.experience || '8+ yrs'}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Step 1: Slots */}
            {step === 1 && (
              <SlotPicker
                selectedDateIndex={selectedDateIndex}
                onSelectDate={setSelectedDateIndex}
                selectedTimeSlot={selectedTimeSlot}
                onSelectTime={setSelectedTimeSlot}
              />
            )}

            {/* Step 2: Consultation mode & Patient details */}
            {step === 2 && (
              <View style={styles.stepContainer}>
                <Text style={styles.sectionHeading}>Choose Consultation Mode</Text>
                {CONSULTATION_OPTIONS.map((opt) => {
                  const isSelected = consultationType === opt.type;
                  return (
                    <TouchableOpacity
                      key={opt.type}
                      style={[styles.consultCard, isSelected && styles.consultCardSelected]}
                      onPress={() => setConsultationType(opt.type)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.consultIcon, isSelected && styles.consultIconSelected]}>
                        <Ionicons name={opt.icon} size={20} color={isSelected ? Colors.primary : Colors.secondary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.consultTitle, isSelected && styles.consultTitleSelected]}>{opt.title}</Text>
                        <Text style={styles.consultDesc}>{opt.desc}</Text>
                      </View>
                      <Text style={[styles.consultFee, isSelected && styles.consultFeeSelected]}>${opt.fee.toFixed(2)}</Text>
                    </TouchableOpacity>
                  );
                })}

                <Text style={[styles.sectionHeading, { marginTop: 18 }]}>Patient Information</Text>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Patient Full Name</Text>
                  <TextInput
                    style={styles.input}
                    value={patientName}
                    onChangeText={setPatientName}
                    placeholder="Enter patient full name"
                    placeholderTextColor={Colors.secondary}
                  />
                </View>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Age</Text>
                    <TextInput
                      style={styles.input}
                      value={patientAge}
                      onChangeText={setPatientAge}
                      placeholder="e.g. 28"
                      placeholderTextColor={Colors.secondary}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={{ flex: 1.5 }}>
                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.genderRow}>
                      {(['Male', 'Female', 'Other'] as const).map((g) => (
                        <TouchableOpacity
                          key={g}
                          style={[styles.genderChip, patientGender === g && styles.genderChipSelected]}
                          onPress={() => setPatientGender(g)}
                        >
                          <Text style={[styles.genderText, patientGender === g && styles.genderTextSelected]}>{g}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Health Concern / Symptoms</Text>
                  <TextInput
                    style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                    value={problemDescription}
                    onChangeText={setProblemDescription}
                    placeholder="Describe health concern or symptoms..."
                    placeholderTextColor={Colors.secondary}
                    multiline
                  />
                </View>
              </View>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <View style={styles.stepContainer}>
                <PaymentPicker
                  paymentMethod={paymentMethod}
                  onSelectPaymentMethod={setPaymentMethod}
                  upiId={upiId}
                  onChangeUpiId={setUpiId}
                  cardNumber={cardNumber}
                  onChangeCardNumber={setCardNumber}
                  cardExpiry={cardExpiry}
                  onChangeCardExpiry={setCardExpiry}
                  cardCvv={cardCvv}
                  onChangeCardCvv={setCardCvv}
                />
                <PriceSummary
                  items={[
                    { label: `${consultationType} Consultation`, amount: `$${baseFee.toFixed(2)}` },
                    { label: 'Platform & Care Fee', amount: `$${platformFee.toFixed(2)}` },
                    { label: 'First Consultation Offer', amount: `-$${promoDiscount.toFixed(2)}`, isDiscount: true },
                  ]}
                  totalAmount={`$${totalAmount}`}
                />
                <TouchableOpacity
                  style={styles.reminderRow}
                  onPress={() => setSetReminderChecked(!setReminderChecked)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={setReminderChecked ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={Colors.primary}
                  />
                  <Text style={styles.reminderText}>Send push notification & 30-min reminder before call</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <View style={styles.successContainer}>
                <View style={styles.successIconBox}>
                  <Ionicons name="checkmark-circle" size={64} color="#16A34A" />
                </View>
                <Text style={styles.successTitle}>Appointment Booked!</Text>
                <Text style={styles.successSubtitle}>
                  Your appointment with {doctor.name} has been confirmed.
                </Text>
                <View style={styles.bookingBadge}>
                  <Text style={styles.bookingIdLabel}>Booking ID</Text>
                  <Text style={styles.bookingIdValue}>{bookingId}</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Bottom Action Footer */}
          <View style={styles.footer}>
            {step === 1 && (
              <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(2)}>
                <Text style={styles.primaryBtnText}>Proceed to Patient Details</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.white} />
              </TouchableOpacity>
            )}
            {step === 2 && (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => {
                  if (!patientName.trim()) {
                    Alert.alert('Required', 'Please enter patient full name.');
                    return;
                  }
                  setStep(3);
                }}
              >
                <Text style={styles.primaryBtnText}>Review & Pay</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.white} />
              </TouchableOpacity>
            )}
            {step === 3 && (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleProcessPayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>Pay ${totalAmount} & Confirm</Text>
                )}
              </TouchableOpacity>
            )}
            {step === 4 && (
              <View style={styles.dualBtnRow}>
                <TouchableOpacity
                  style={[styles.secondaryBtn, { flex: 1 }]}
                  onPress={handleResetAndClose}
                >
                  <Text style={styles.secondaryBtnText}>Done</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryBtn, { flex: 1.5 }]}
                  onPress={() => {
                    handleResetAndClose();
                    if (onNavigateToSchedule) onNavigateToSchedule();
                  }}
                >
                  <Text style={styles.primaryBtnText}>View in Schedule</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
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
    maxHeight: '92%',
    paddingBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  docMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  docAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
  },
  docSpec: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '600',
  },
  stepContainer: {
    marginTop: 4,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 10,
  },
  consultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    marginBottom: 10,
  },
  consultCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.accentLight,
  },
  consultIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  consultIconSelected: {
    backgroundColor: Colors.white,
  },
  consultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  consultTitleSelected: {
    color: Colors.primary,
  },
  consultDesc: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 2,
  },
  consultFee: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
    marginLeft: 8,
  },
  consultFeeSelected: {
    color: Colors.primary,
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
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
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.textDark,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 6,
  },
  genderChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
  },
  genderChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  genderText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
  },
  genderTextSelected: {
    color: Colors.white,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: Colors.bgLight,
  },
  reminderText: {
    fontSize: 12,
    color: Colors.textDark,
    flex: 1,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  successIconBox: {
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
  },
  successSubtitle: {
    fontSize: 13,
    color: Colors.secondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
  },
  bookingBadge: {
    marginTop: 18,
    backgroundColor: Colors.accentLight,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
  },
  bookingIdLabel: {
    fontSize: 11,
    color: Colors.secondary,
  },
  bookingIdValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryBtn: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  secondaryBtnText: {
    color: Colors.secondary,
    fontWeight: '700',
    fontSize: 14,
  },
  dualBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
});

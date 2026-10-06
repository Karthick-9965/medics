import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DoctorItem } from '../../constants/doctorsData';
import {
  getDynamicBookingDates,
  CONSULTATION_OPTIONS,
  ConsultationType,
  PaymentMethodType,
} from '../../constants/appData';
import ModalHeader from '../common/ModalHeader';
import SlotPicker from '../common/SlotPicker';
import DoctorBookingHeaderCard from '../booking/DoctorBookingHeaderCard';
import BookingPatientStep from '../booking/BookingPatientStep';
import BookingPaymentStep from '../booking/BookingPaymentStep';
import BookingSuccessStep from '../booking/BookingSuccessStep';
import MedicalAlertModal, { MedicalAlertType } from '../modals/MedicalAlertModal';
import { getLoginSession } from '../../utils/storage';
import { sendAppointmentNotificationAndReminder } from '../../services/notificationManager';
import { generateReferenceId } from '../../utils/formatters';

interface BookDoctorModalProps {
  visible: boolean;
  doctor: DoctorItem | null;
  onClose: () => void;
  onBookingConfirmed?: (appointment: any) => void;
  onNavigateToSchedule?: () => void;
}

/**
 * Fresher-friendly Doctor Booking Wizard Modal.
 * Orchestrates 4 modular step components:
 * 1. SlotPicker (Date & Time selection)
 * 2. BookingPatientStep (Consultation mode & patient form)
 * 3. BookingPaymentStep (Payment selection & price breakdown)
 * 4. BookingSuccessStep (Confirmation receipt)
 */
export default function BookDoctorModal({
  visible,
  doctor,
  onClose,
  onBookingConfirmed,
  onNavigateToSchedule,
}: BookDoctorModalProps) {
  const insets = useSafeAreaInsets();
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
      setStep(1);
      getLoginSession().then((session) => {
        if (session?.name) {
          setPatientName(session.name);
        } else {
          setPatientName('');
        }
      });
    }
  }, [visible]);

  if (!doctor) return null;

  const activeConsultation =
    CONSULTATION_OPTIONS.find((c) => c.type === consultationType) || CONSULTATION_OPTIONS[0];
  const baseFee = activeConsultation.fee;
  const platformFee = 2.0;
  const promoDiscount = 5.0;
  const totalAmount = (baseFee + platformFee - promoDiscount).toFixed(2);
  const bookingDates = getDynamicBookingDates(14);
  const selectedDateItem = bookingDates[selectedDateIndex] || bookingDates[0];

  const handleResetAndClose = () => {
    setStep(1);
    setIsProcessing(false);
    onClose();
  };

  const handleProcessPayment = async () => {
    if (!patientName.trim()) {
      setAlertConfig({
        visible: true,
        type: 'warning',
        icon: 'person-outline',
        title: 'Patient Name Required',
        message: 'Please enter patient full name to proceed with booking.',
      });
      return;
    }
    setIsProcessing(true);
    const generatedId = generateReferenceId('MED');
    setBookingId(generatedId);

    const newAppointment = {
      id: `${Date.now()}`,
      doctorName: doctor.name,
      specialization: doctor.specialization,
      avatar: doctor.image,
      rating: doctor.rating,
      date: selectedDateItem.date,
      time: selectedTimeSlot,
      status: 'upcoming',
      statusLabel: 'Confirmed',
      hospitalName: doctor.hospital || 'Care Hospital',
      consultationType,
      bookingId: generatedId,
      patientName: patientName.trim(),
      patientAge: patientAge.trim() || '28',
      patientGender,
      paymentMethod,
      paymentStatus: 'Paid',
      fee: `₹${totalAmount}`,
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
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else handleResetAndClose();
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
        <View style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <ModalHeader
            title={step === 4 ? 'Booking Confirmed' : `Book ${doctor.name}`}
            subtitle={step < 4 ? `Step ${step} of 3` : undefined}
            onBack={handleHeaderBack}
            onClose={handleResetAndClose}
          />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Doctor mini summary card */}
            {step < 4 && <DoctorBookingHeaderCard doctor={doctor} />}

            {/* Step 1: Date & Time Slots */}
            {step === 1 && (
              <SlotPicker
                selectedDateIndex={selectedDateIndex}
                onSelectDate={setSelectedDateIndex}
                selectedTimeSlot={selectedTimeSlot}
                onSelectTime={setSelectedTimeSlot}
              />
            )}

            {/* Step 2: Patient Form & Consultation Mode */}
            {step === 2 && (
              <BookingPatientStep
                consultationType={consultationType}
                onSelectConsultationType={setConsultationType}
                patientName={patientName}
                onChangePatientName={setPatientName}
                patientAge={patientAge}
                onChangePatientAge={setPatientAge}
                patientGender={patientGender}
                onSelectPatientGender={setPatientGender}
                problemDescription={problemDescription}
                onChangeProblemDescription={setProblemDescription}
              />
            )}

            {/* Step 3: Payment & Summary */}
            {step === 3 && (
              <BookingPaymentStep
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
                consultationType={consultationType}
                baseFee={baseFee}
                platformFee={platformFee}
                promoDiscount={promoDiscount}
                totalAmount={totalAmount}
                setReminderChecked={setReminderChecked}
                onToggleReminder={() => setSetReminderChecked(!setReminderChecked)}
              />
            )}

            {/* Step 4: Success Receipt */}
            {step === 4 && (
              <BookingSuccessStep
                doctor={doctor}
                bookingId={bookingId}
                selectedDate={selectedDateItem.date}
                selectedTimeSlot={selectedTimeSlot}
                consultationType={consultationType}
              />
            )}
          </ScrollView>

          {/* Bottom Action Footer */}
          <View style={styles.footer}>
            {step === 1 && (
              <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(2)} activeOpacity={0.8}>
                <Text style={styles.primaryBtnText}>Proceed to Patient Details</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.white} />
              </TouchableOpacity>
            )}

            {step === 2 && (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => {
                  if (!patientName.trim()) {
                    setAlertConfig({
                      visible: true,
                      type: 'warning',
                      icon: 'person-outline',
                      title: 'Patient Name Required',
                      message: 'Please enter patient full name before proceeding to payment.',
                    });
                    return;
                  }
                  setStep(3);
                }}
                activeOpacity={0.8}
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
                activeOpacity={0.8}
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
                  activeOpacity={0.7}
                >
                  <Text style={styles.secondaryBtnText}>Done</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryBtn, { flex: 1.5 }]}
                  onPress={() => {
                    handleResetAndClose();
                    if (onNavigateToSchedule) onNavigateToSchedule();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryBtnText}>View in Schedule</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

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
    maxHeight: '92%',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 14,
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

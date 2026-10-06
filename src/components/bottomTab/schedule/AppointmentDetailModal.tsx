import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { AppointmentItem } from './AppointmentCard';
import ModalHeader from '../../common/ModalHeader';
import PriceSummary from '../../common/PriceSummary';
import MedicalAlertModal from '../../modals/MedicalAlertModal';
import AppointmentDoctorHeader from './AppointmentDoctorHeader';
import AppointmentScheduleGrid from './AppointmentScheduleGrid';
import DigitalPrescriptionCard from './DigitalPrescriptionCard';
import { sendAppointmentReminderNotification } from '../../../services/notificationManager';
import { useMedicalAlert } from '../../../hooks/useMedicalAlert';

interface AppointmentDetailModalProps {
  visible: boolean;
  appointment: AppointmentItem | null;
  onClose: () => void;
  onCancel?: (id: string) => void;
  onReschedule?: (id: string) => void;
  onRebook?: (id: string) => void;
  onReview?: (id: string) => void;
  onJoinCall?: (appointment: AppointmentItem) => void;
  onDelete?: (id: string) => void;
}

/**
 * AppointmentDetailModal displays full appointment breakdown,
 * including doctor profile, schedule grid, patient data, prescription, and action buttons.
 */
export default function AppointmentDetailModal({
  visible,
  appointment,
  onClose,
  onCancel,
  onReschedule,
  onRebook,
  onReview,
  onJoinCall,
  onDelete,
}: AppointmentDetailModalProps) {
  const insets = useSafeAreaInsets();
  const { alertConfig, showAlert, closeAlert } = useMedicalAlert();

  if (!appointment) return null;

  const isUpcoming = appointment.status === 'upcoming';
  const isCompleted = appointment.status === 'completed';
  const isCanceled = appointment.status === 'canceled';

  const handleDownloadInvoice = () => {
    showAlert({
      type: 'receipt',
      title: 'Invoice Downloaded',
      message: 'Receipt and tax invoice have been downloaded to your documents.',
    });
  };

  const handleSetReminder = async () => {
    await sendAppointmentReminderNotification({
      doctorName: appointment.doctorName,
      date: appointment.date,
      time: appointment.time,
      bookingId: appointment.bookingId,
      consultationType: appointment.consultationType,
    });
    showAlert({
      type: 'reminder',
      icon: 'notifications',
      title: 'Reminder Set',
      message: `Appointment reminder scheduled for ${appointment.doctorName} on ${appointment.date} at ${appointment.time}.`,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <ModalHeader
            title="Appointment Details"
            subtitle={appointment.bookingId || '#MED-APPT'}
            onClose={onClose}
            rightAction={{
              icon: 'receipt-outline',
              onPress: handleDownloadInvoice,
              color: Colors.primary,
            }}
          />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Doctor Info Header */}
            <AppointmentDoctorHeader
              doctorName={appointment.doctorName}
              specialization={appointment.specialization}
              hospitalName={appointment.hospitalName}
              avatar={appointment.avatar}
              status={appointment.status as 'upcoming' | 'completed' | 'canceled'}
              statusLabel={appointment.statusLabel}
            />

            {/* Schedule Details Grid */}
            <AppointmentScheduleGrid
              date={appointment.date}
              time={appointment.time}
              consultationType={appointment.consultationType}
            />

            {/* Patient Information Section */}
            <View style={styles.patientSection}>
              <Text style={styles.sectionTitle}>Patient Information</Text>
              <Text style={styles.patientText}>
                {appointment.patientName || 'Patient'} • {appointment.patientAge || '28 yrs'} •{' '}
                {appointment.patientGender || 'Male'}
              </Text>
              <Text style={styles.concernText}>
                Concern: {appointment.problemDescription || 'General health consultation'}
              </Text>
            </View>

            {/* Digital Prescription (for completed appointments) */}
            {isCompleted && appointment.prescriptions && (
              <DigitalPrescriptionCard prescriptions={appointment.prescriptions} />
            )}

            {/* Bill Summary */}
            <PriceSummary
              title="Payment Summary"
              items={[
                { label: 'Consultation Fee', amount: appointment.fee || '₹47.00' },
                {
                  label: 'Payment Status',
                  amount: appointment.paymentStatus || 'Paid (Online)',
                  isHighlight: true,
                },
              ]}
              totalAmount={appointment.fee || '₹47.00'}
            />
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            {isUpcoming && (
              <View style={styles.btnGroup}>
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={() => onJoinCall && onJoinCall(appointment)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="videocam" size={18} color={Colors.white} />
                  <Text style={styles.primaryActionText}>Start Video Consultation</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.reminderBtn}
                  onPress={handleSetReminder}
                  activeOpacity={0.8}
                >
                  <Ionicons name="notifications-outline" size={17} color={Colors.primary} />
                  <Text style={styles.reminderBtnText}>Set Appointment Reminder</Text>
                </TouchableOpacity>

                <View style={styles.dualRow}>
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => onReschedule && onReschedule(appointment.id)}
                  >
                    <Text style={styles.secondaryBtnText}>Reschedule</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.secondaryBtn, styles.dangerBorder]}
                    onPress={() => onCancel && onCancel(appointment.id)}
                  >
                    <Text style={[styles.secondaryBtnText, styles.dangerText]}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {isCompleted && (
              <View style={styles.dualRow}>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => onReview && onReview(appointment.id)}
                >
                  <Ionicons name="star-outline" size={16} color={Colors.starGoldDark} />
                  <Text style={styles.secondaryBtnText}>Review</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryActionBtn, { flex: 1.5 }]}
                  onPress={() => onRebook && onRebook(appointment.id)}
                >
                  <Text style={styles.primaryActionText}>Re-Book Doctor</Text>
                </TouchableOpacity>
              </View>
            )}

            {isCanceled && (
              <View style={styles.dualRow}>
                <TouchableOpacity
                  style={[styles.secondaryBtn, styles.dangerBorder, { flex: 1 }]}
                  onPress={() => onDelete && onDelete(appointment.id)}
                >
                  <Ionicons name="trash-outline" size={16} color={Colors.dangerRed} />
                  <Text style={[styles.secondaryBtnText, styles.dangerText]}>Delete Record</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryActionBtn, { flex: 1.5 }]}
                  onPress={() => onRebook && onRebook(appointment.id)}
                >
                  <Text style={styles.primaryActionText}>Book Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Project-Themed MedicalAlertModal */}
      <MedicalAlertModal
        visible={alertConfig.visible}
        type={alertConfig.type}
        icon={alertConfig.icon}
        title={alertConfig.title}
        message={alertConfig.message}
        onPrimaryPress={closeAlert}
        onClose={closeAlert}
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
    maxHeight: '90%',
  },
  scrollContent: {
    padding: 16,
  },
  patientSection: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSlateMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  patientText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSlateDark,
  },
  concernText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 3,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  btnGroup: {
    gap: 8,
  },
  primaryActionBtn: {
    backgroundColor: Colors.primary,
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryActionText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  reminderBtn: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.tealBg,
  },
  reminderBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  dualRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.borderMedium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.white,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSlateDark,
  },
  dangerBorder: {
    borderColor: Colors.dangerBorder,
    backgroundColor: Colors.dangerBgLight,
  },
  dangerText: {
    color: Colors.dangerRed,
  },
});

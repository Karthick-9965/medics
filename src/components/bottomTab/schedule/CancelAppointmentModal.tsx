import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { AppointmentItem } from './AppointmentCard';

interface CancelAppointmentModalProps {
  visible: boolean;
  appointment: AppointmentItem | null;
  onClose: () => void;
  onConfirmCancel: (id: string, reason: string) => void;
}

const CANCEL_REASONS = [
  'Schedule Conflict / Busy',
  'Feeling Better / Not Needed',
  'Want to Reschedule Instead',
  'Doctor Consultation Elsewhere',
  'Other Reason',
];

export default function CancelAppointmentModal({
  visible,
  appointment,
  onClose,
  onConfirmCancel,
}: CancelAppointmentModalProps) {
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);

  if (!appointment) return null;

  const handleConfirm = () => {
    onConfirmCancel(appointment.id, selectedReason);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Top Handle */}
          <View style={styles.indicatorWrap}>
            <View style={styles.indicator} />
          </View>

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleWithIcon}>
              <View style={styles.warningIconCircle}>
                <Ionicons name="alert-circle-outline" size={22} color={Colors.logoutRed} />
              </View>
              <Text style={styles.sheetTitle}>Cancel Appointment</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={Colors.textDark} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Warning Text */}
            <Text style={styles.warningDescription}>
              Are you sure you want to cancel this consultation? This action cannot be undone.
            </Text>

            {/* Doctor Info Card */}
            <View style={styles.appointmentSummaryCard}>
              <Image source={appointment.avatar} style={styles.doctorAvatar} />
              <View style={styles.summaryInfo}>
                <Text style={styles.doctorName}>{appointment.doctorName}</Text>
                <Text style={styles.doctorSpecialty}>{appointment.specialization}</Text>
                <View style={styles.scheduleRow}>
                  <Ionicons name="calendar-outline" size={14} color={Colors.primary} />
                  <Text style={styles.scheduleText}>
                    {appointment.date} at {appointment.time}
                  </Text>
                </View>
              </View>
            </View>

            {/* Reason Selection */}
            <View style={styles.reasonsSection}>
              <Text style={styles.sectionLabel}>Reason for Cancellation</Text>
              {CANCEL_REASONS.map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <TouchableOpacity
                    key={reason}
                    style={[styles.reasonOption, isSelected && styles.reasonOptionSelected]}
                    onPress={() => setSelectedReason(reason)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                    <Text style={[styles.reasonText, isSelected && styles.reasonTextSelected]}>
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.cancelConfirmBtn}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle-outline" size={18} color={Colors.white} />
                <Text style={styles.cancelConfirmBtnText}>Yes, Cancel Appointment</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.keepButton}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.keepButtonText}>Keep Appointment</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 59, 50, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: '88%',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  indicatorWrap: {
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 6,
  },
  indicator: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dividerLine,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  warningIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.redBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
  },
  closeButton: {
    padding: 6,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  warningDescription: {
    fontSize: 13,
    color: Colors.secondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  appointmentSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  doctorAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
    backgroundColor: Colors.white,
  },
  summaryInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 12,
    color: Colors.secondary,
    marginBottom: 4,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  scheduleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  reasonsSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 10,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reasonOptionSelected: {
    borderColor: Colors.logoutRed,
    backgroundColor: '#FFF8F8',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioCircleSelected: {
    borderColor: Colors.logoutRed,
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: Colors.logoutRed,
  },
  reasonText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textDark,
  },
  reasonTextSelected: {
    fontWeight: '700',
    color: Colors.logoutRed,
  },
  actionsContainer: {
    gap: 10,
  },
  cancelConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.logoutRed,
    paddingVertical: 14,
    borderRadius: 28,
    gap: 8,
    shadowColor: Colors.logoutRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelConfirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  keepButton: {
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  keepButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
  },
});

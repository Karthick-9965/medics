import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/Colors';
import { AppointmentItem } from './AppointmentCard';
import { getDynamicBookingDates } from '../../../constants/appData';
import ModalHeader from '../../common/ModalHeader';
import SlotPicker from '../../common/SlotPicker';

export interface AppointmentTimeModalProps {
  visible: boolean;
  appointment: AppointmentItem | null;
  mode?: 'reschedule' | 'rebook';
  onClose: () => void;
  onConfirmDateAndTime?: (appointmentId: string, newDate: string, newTime: string) => void;
  // Backward compatibility callbacks
  onRescheduled?: (appointmentId: string, newDate: string, newTime: string) => void;
  onRebooked?: (appointmentId: string, newDate: string, newTime: string) => void;
  onConfirm?: (data: { id: string; date: string; time: string }) => void;
}

/**
 * Unified Reusable Appointment Date/Time Picker Modal.
 * Replaces duplicate RebookModal and RescheduleModal.
 */
export default function AppointmentTimeModal({
  visible,
  appointment,
  mode = 'reschedule',
  onClose,
  onConfirmDateAndTime,
  onRescheduled,
  onRebooked,
  onConfirm,
}: AppointmentTimeModalProps) {
  const insets = useSafeAreaInsets();
  const isRebook = mode === 'rebook';
  const [dateIndex, setDateIndex] = useState(isRebook ? 0 : 1);
  const [timeSlot, setTimeSlot] = useState(isRebook ? '09:45 AM' : '02:00 PM');

  if (!appointment) return null;

  const handleConfirm = () => {
    const dates = getDynamicBookingDates(14);
    const newDate = dates[dateIndex]?.fullDate || dates[0].fullDate;

    if (onConfirmDateAndTime) {
      onConfirmDateAndTime(appointment.id, newDate, timeSlot);
    }
    if (isRebook && onRebooked) {
      onRebooked(appointment.id, newDate, timeSlot);
    }
    if (!isRebook && onRescheduled) {
      onRescheduled(appointment.id, newDate, timeSlot);
    }
    if (onConfirm) {
      onConfirm({ id: appointment.id, date: newDate, time: timeSlot });
    }
    onClose();
  };

  const title = isRebook ? 'Re-Book Consultation' : 'Reschedule Appointment';
  const confirmButtonText = isRebook ? 'Confirm Re-Booking' : 'Confirm New Time';

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
            title={title}
            subtitle={appointment.doctorName}
            onClose={onClose}
          />
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <SlotPicker
              selectedDateIndex={dateIndex}
              onSelectDate={setDateIndex}
              selectedTimeSlot={timeSlot}
              onSelectTime={setTimeSlot}
            />
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.8}>
              <Text style={styles.confirmText}>{confirmButtonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    maxHeight: '85%',
  },
  scrollContent: {
    padding: 16,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary,
  },
  confirmBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});

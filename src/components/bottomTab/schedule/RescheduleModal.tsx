import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { AppointmentItem } from './AppointmentCard';
import { getDynamicBookingDates } from '../../../constants/appData';
import ModalHeader from '../../common/ModalHeader';
import SlotPicker from '../../common/SlotPicker';

interface RescheduleModalProps {
  visible: boolean;
  appointment: AppointmentItem | null;
  onClose: () => void;
  onRescheduled?: (appointmentId: string, newDate: string, newTime: string) => void;
  onConfirm?: (data: { id: string; date: string; time: string }) => void;
}

export default function RescheduleModal({
  visible,
  appointment,
  onClose,
  onRescheduled,
  onConfirm,
}: RescheduleModalProps) {
  const [dateIndex, setDateIndex] = useState(1);
  const [timeSlot, setTimeSlot] = useState('02:00 PM');

  if (!appointment) return null;

  const handleConfirm = () => {
    const dates = getDynamicBookingDates(14);
    const newDate = dates[dateIndex]?.fullDate || dates[0].fullDate;
    if (onRescheduled) onRescheduled(appointment.id, newDate, timeSlot);
    if (onConfirm) onConfirm({ id: appointment.id, date: newDate, time: timeSlot });
    Alert.alert('Rescheduled', `Appointment moved to ${newDate} at ${timeSlot}.`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <ModalHeader title="Reschedule Appointment" subtitle={appointment.doctorName} onClose={onClose} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
            <SlotPicker
              selectedDateIndex={dateIndex}
              onSelectDate={setDateIndex}
              selectedTimeSlot={timeSlot}
              onSelectTime={setTimeSlot}
            />
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmText}>Confirm New Time</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: Colors.secondary,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 2,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    color: Colors.white,
    fontWeight: '700',
  },
});

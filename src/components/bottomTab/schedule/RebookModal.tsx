import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { AppointmentItem } from './AppointmentCard';
import { getDynamicBookingDates } from '../../../constants/appData';
import ModalHeader from '../../common/ModalHeader';
import SlotPicker from '../../common/SlotPicker';

interface RebookModalProps {
  visible: boolean;
  appointment: AppointmentItem | null;
  onClose: () => void;
  onRebooked?: (appointmentId: string, newDate: string, newTime: string) => void;
  onConfirm?: (data: { id: string; date: string; time: string }) => void;
}

export default function RebookModal({
  visible,
  appointment,
  onClose,
  onRebooked,
  onConfirm,
}: RebookModalProps) {
  const [dateIndex, setDateIndex] = useState(0);
  const [timeSlot, setTimeSlot] = useState('09:45 AM');

  if (!appointment) return null;

  const handleConfirm = () => {
    const dates = getDynamicBookingDates(14);
    const newDate = dates[dateIndex]?.fullDate || dates[0].fullDate;
    if (onRebooked) onRebooked(appointment.id, newDate, timeSlot);
    if (onConfirm) onConfirm({ id: appointment.id, date: newDate, time: timeSlot });
    Alert.alert('Appointment Re-booked', `Consultation scheduled with ${appointment.doctorName} on ${newDate} at ${timeSlot}.`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <ModalHeader title="Re-Book Consultation" subtitle={appointment.doctorName} onClose={onClose} />
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
              <Text style={styles.confirmText}>Confirm Re-Booking</Text>
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

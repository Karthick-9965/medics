import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { AppointmentItem } from './AppointmentCard';
import { CANCEL_REASONS } from '../../../constants/appData';
import ModalHeader from '../../common/ModalHeader';

interface CancelAppointmentModalProps {
  visible: boolean;
  appointment: AppointmentItem | null;
  onClose: () => void;
  onCancelled?: (appointmentId: string, reason: string) => void;
  onConfirm?: (data: { id: string; reason: string }) => void;
}

export default function CancelAppointmentModal({
  visible,
  appointment,
  onClose,
  onCancelled,
  onConfirm,
}: CancelAppointmentModalProps) {
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);

  if (!appointment) return null;

  const handleConfirm = () => {
    if (onCancelled) onCancelled(appointment.id, selectedReason);
    if (onConfirm) onConfirm({ id: appointment.id, reason: selectedReason });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <ModalHeader title="Cancel Appointment" subtitle={appointment.doctorName} onClose={onClose} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
            <Text style={styles.heading}>Please select a cancellation reason:</Text>
            {CANCEL_REASONS.map((reason) => {
              const isSelected = selectedReason === reason;
              return (
                <TouchableOpacity
                  key={reason}
                  style={[styles.reasonRow, isSelected && styles.reasonRowSelected]}
                  onPress={() => setSelectedReason(reason)}
                >
                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={isSelected ? Colors.error : Colors.border}
                  />
                  <Text style={[styles.reasonText, isSelected && styles.reasonTextSelected]}>{reason}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.backBtn} onPress={onClose}>
              <Text style={styles.backText}>Keep Appointment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleConfirm}>
              <Text style={styles.cancelText}>Confirm Cancel</Text>
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
    maxHeight: '80%',
  },
  heading: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 12,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
    gap: 10,
  },
  reasonRowSelected: {
    borderColor: Colors.error,
    backgroundColor: '#FEF2F2',
  },
  reasonText: {
    fontSize: 13,
    color: Colors.textDark,
    flex: 1,
  },
  reasonTextSelected: {
    fontWeight: '700',
    color: Colors.error,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  backBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: Colors.secondary,
    fontWeight: '700',
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: Colors.white,
    fontWeight: '700',
  },
});

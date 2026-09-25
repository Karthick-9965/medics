import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { AppointmentItem } from './AppointmentCard';
import { getDoctorAvatar } from '../../../constants/scheduleData';
import ModalHeader from '../../common/ModalHeader';
import PriceSummary from '../../common/PriceSummary';

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
  if (!appointment) return null;

  const isUpcoming = appointment.status === 'upcoming';
  const isCompleted = appointment.status === 'completed';
  const isCanceled = appointment.status === 'canceled';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <ModalHeader
            title="Appointment Details"
            subtitle={appointment.bookingId || '#MED-APPT'}
            onClose={onClose}
            rightAction={{
              icon: 'receipt-outline',
              onPress: () => Alert.alert('Invoice Downloaded', 'Receipt downloaded to documents.'),
              color: Colors.primary,
            }}
          />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Doctor Info Card */}
            <View style={styles.docCard}>
              <Image
                source={
                  typeof appointment.avatar === 'number' || (appointment.avatar && typeof appointment.avatar === 'object' && 'uri' in appointment.avatar)
                    ? appointment.avatar
                    : getDoctorAvatar(appointment.doctorName, appointment.avatar)
                }
                style={styles.avatar}
                resizeMode="cover"
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.docName}>{appointment.doctorName}</Text>
                <Text style={styles.docSpec}>{appointment.specialization}</Text>
                <Text style={styles.hospitalName}>{appointment.hospitalName || 'City Care Hospital'}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  isUpcoming ? styles.badgeUpcoming : isCompleted ? styles.badgeCompleted : styles.badgeCanceled,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    isUpcoming ? styles.textUpcoming : isCompleted ? styles.textCompleted : styles.textCanceled,
                  ]}
                >
                  {isCanceled ? 'Canceled' : appointment.statusLabel || appointment.status}
                </Text>
              </View>
            </View>

            {/* Schedule Details Row */}
            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{appointment.date}</Text>
              </View>
              <View style={styles.infoBox}>
                <Ionicons name="time-outline" size={18} color={Colors.primary} />
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>{appointment.time}</Text>
              </View>
              <View style={styles.infoBox}>
                <Ionicons name="videocam-outline" size={18} color={Colors.primary} />
                <Text style={styles.infoLabel}>Type</Text>
                <Text style={styles.infoValue}>{appointment.consultationType || 'Video Call'}</Text>
              </View>
            </View>

            {/* Patient Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Patient Information</Text>
              <Text style={styles.patientText}>
                {appointment.patientName || 'Patient'} • {appointment.patientAge || '28 yrs'} • {appointment.patientGender || 'Male'}
              </Text>
              <Text style={styles.concernText}>Concern: {appointment.problemDescription || 'General health consultation'}</Text>
            </View>

            {/* Prescriptions (for completed) */}
            {isCompleted && appointment.prescriptions && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Digital Prescription</Text>
                {appointment.prescriptions.map((p, idx) => (
                  <View key={idx} style={styles.prescRow}>
                    <Ionicons name="medkit" size={16} color={Colors.primary} />
                    <Text style={styles.prescMed}>{p.medicine}</Text>
                    <Text style={styles.prescDosage}>{p.dosage} • {p.duration}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Bill Summary */}
            <PriceSummary
              title="Payment Summary"
              items={[
                { label: 'Consultation Fee', amount: appointment.fee || '$47.00' },
                { label: 'Payment Status', amount: appointment.paymentStatus || 'Paid (Online)', isHighlight: true },
              ]}
              totalAmount={appointment.fee || '$47.00'}
            />
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            {isUpcoming && (
              <View style={styles.btnGroup}>
                <TouchableOpacity
                  style={styles.joinCallBtn}
                  onPress={() => onJoinCall && onJoinCall(appointment)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="videocam" size={18} color={Colors.white} />
                  <Text style={styles.joinCallText}>Start Video Consultation</Text>
                </TouchableOpacity>
                <View style={styles.dualRow}>
                  <TouchableOpacity
                    style={styles.actionBtnSecondary}
                    onPress={() => onReschedule && onReschedule(appointment.id)}
                  >
                    <Text style={styles.actionTextSecondary}>Reschedule</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtnSecondary, { borderColor: Colors.error }]}
                    onPress={() => onCancel && onCancel(appointment.id)}
                  >
                    <Text style={[styles.actionTextSecondary, { color: Colors.error }]}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {isCompleted && (
              <View style={styles.dualRow}>
                <TouchableOpacity
                  style={styles.actionBtnSecondary}
                  onPress={() => onReview && onReview(appointment.id)}
                >
                  <Ionicons name="star-outline" size={16} color={Colors.primary} />
                  <Text style={styles.actionTextSecondary}>Review</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.joinCallBtn, { flex: 1.5 }]}
                  onPress={() => onRebook && onRebook(appointment.id)}
                >
                  <Text style={styles.joinCallText}>Re-Book Doctor</Text>
                </TouchableOpacity>
              </View>
            )}

            {isCanceled && (
              <View style={styles.dualRow}>
                <TouchableOpacity
                  style={[styles.actionBtnSecondary, { borderColor: Colors.error, flex: 1 }]}
                  onPress={() => onDelete && onDelete(appointment.id)}
                >
                  <Ionicons name="trash-outline" size={16} color={Colors.error} />
                  <Text style={[styles.actionTextSecondary, { color: Colors.error }]}>Delete Record</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.joinCallBtn, { flex: 1.5 }]}
                  onPress={() => onRebook && onRebook(appointment.id)}
                >
                  <Text style={styles.joinCallText}>Book Again</Text>
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
    maxHeight: '90%',
  },
  scrollContent: {
    padding: 16,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  docName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
  },
  docSpec: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  hospitalName: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgeUpcoming: { backgroundColor: Colors.accentLight },
  badgeCompleted: { backgroundColor: '#DCFCE7' },
  badgeCanceled: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 11, fontWeight: '700' },
  textUpcoming: { color: Colors.primary },
  textCompleted: { color: '#16A34A' },
  textCanceled: { color: Colors.error },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  infoBox: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoLabel: {
    fontSize: 10,
    color: Colors.secondary,
    marginTop: 4,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: 2,
  },
  section: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.bgLight,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 4,
  },
  patientText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
  },
  concernText: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
  },
  prescRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  prescMed: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
  },
  prescDosage: {
    fontSize: 12,
    color: Colors.secondary,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  btnGroup: {
    gap: 8,
  },
  joinCallBtn: {
    backgroundColor: Colors.primary,
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  joinCallText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  dualRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtnSecondary: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionTextSecondary: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
  },
});

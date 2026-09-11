import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { AppointmentItem } from './AppointmentCard';

interface AppointmentDetailModalProps {
  visible: boolean;
  appointment: AppointmentItem | null;
  onClose: () => void;
  onCancel?: (id: string) => void;
  onReschedule?: (id: string) => void;
  onRebook?: (id: string) => void;
  onReview?: (id: string) => void;
  onJoinCall?: (appointment: AppointmentItem) => void;
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
}: AppointmentDetailModalProps) {
  if (!appointment) return null;

  const isUpcoming = appointment.status === 'upcoming';
  const isCompleted = appointment.status === 'completed';
  const isCanceled = appointment.status === 'canceled';

  const handleDownloadPrescription = () => {
    Alert.alert('Prescription Downloaded', 'The official medical prescription has been downloaded to your documents.');
  };

  const handleDownloadInvoice = () => {
    Alert.alert('Invoice Downloaded', 'Appointment invoice & receipt downloaded.');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Top Bar / Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color={Colors.textDark} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Appointment Details</Text>
            <TouchableOpacity onPress={handleDownloadInvoice} style={styles.receiptButton}>
              <Ionicons name="receipt-outline" size={22} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Status Banner */}
            <View
              style={[
                styles.statusBanner,
                isUpcoming
                  ? styles.bannerUpcoming
                  : isCompleted
                  ? styles.bannerCompleted
                  : styles.bannerCanceled,
              ]}
            >
              <Ionicons
                name={
                  isUpcoming
                    ? 'time-outline'
                    : isCompleted
                    ? 'checkmark-circle-outline'
                    : 'close-circle-outline'
                }
                size={18}
                color={
                  isUpcoming
                    ? '#138A72'
                    : isCompleted
                    ? '#2E7D32'
                    : Colors.error
                }
              />
              <Text
                style={[
                  styles.statusBannerText,
                  isUpcoming
                    ? styles.bannerTextUpcoming
                    : isCompleted
                    ? styles.bannerTextCompleted
                    : styles.bannerTextCanceled,
                ]}
              >
                {isUpcoming
                  ? 'Scheduled & Confirmed'
                  : isCompleted
                  ? 'Consultation Completed'
                  : 'Appointment Canceled'}
              </Text>
            </View>

            {/* Doctor Card */}
            <View style={styles.cardSection}>
              <View style={styles.doctorInfoRow}>
                <Image source={appointment.avatar} style={styles.doctorAvatar} />
                <View style={styles.doctorTextWrap}>
                  <Text style={styles.doctorName}>{appointment.doctorName}</Text>
                  <Text style={styles.doctorSpecialty}>{appointment.specialization}</Text>
                  <View style={styles.hospitalRow}>
                    <Ionicons name="business-outline" size={13} color={Colors.secondary} />
                    <Text style={styles.hospitalText}>{appointment.hospitalName || 'City Care Hospital'}</Text>
                  </View>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#FFA800" />
                    <Text style={styles.ratingText}>{appointment.rating}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Consultation & Schedule Card */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>Appointment Schedule</Text>
              
              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                </View>
                <View style={styles.infoTextBox}>
                  <Text style={styles.infoLabel}>Date</Text>
                  <Text style={styles.infoValue}>{appointment.date}</Text>
                </View>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="time-outline" size={18} color={Colors.primary} />
                </View>
                <View style={styles.infoTextBox}>
                  <Text style={styles.infoLabel}>Time Slot</Text>
                  <Text style={styles.infoValue}>{appointment.time} (30 mins session)</Text>
                </View>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Ionicons
                    name={
                      appointment.consultationType === 'Video Call'
                        ? 'videocam-outline'
                        : appointment.consultationType === 'Audio Call'
                        ? 'call-outline'
                        : 'location-outline'
                    }
                    size={18}
                    color={Colors.primary}
                  />
                </View>
                <View style={styles.infoTextBox}>
                  <Text style={styles.infoLabel}>Consultation Mode</Text>
                  <Text style={styles.infoValue}>{appointment.consultationType || 'Video Call'}</Text>
                </View>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="barcode-outline" size={18} color={Colors.primary} />
                </View>
                <View style={styles.infoTextBox}>
                  <Text style={styles.infoLabel}>Booking ID</Text>
                  <Text style={styles.infoValueCode}>{appointment.bookingId || `#MED-${appointment.id}8921`}</Text>
                </View>
              </View>
            </View>

            {/* Patient Information Card */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>Patient Information</Text>

              <View style={styles.patientGrid}>
                <View style={styles.patientGridItem}>
                  <Text style={styles.infoLabel}>Full Name</Text>
                  <Text style={styles.infoValue}>{appointment.patientName || 'Sathish Kumar'}</Text>
                </View>
                <View style={styles.patientGridItem}>
                  <Text style={styles.infoLabel}>Age & Gender</Text>
                  <Text style={styles.infoValue}>{appointment.patientAge || '28 yrs'}, {appointment.patientGender || 'Male'}</Text>
                </View>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.reasonBox}>
                <Text style={styles.infoLabel}>Symptoms / Medical Reason</Text>
                <Text style={styles.reasonText}>
                  {appointment.problemDescription || 'Consultation for general cardiac review and intermittent mild chest palpitations after exercise.'}
                </Text>
              </View>
            </View>

            {/* Prescription & Medical Notes (For Completed Appointments) */}
            {isCompleted && (
              <View style={styles.cardSection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Doctor Diagnosis & Rx</Text>
                  <TouchableOpacity
                    style={styles.downloadRxBtn}
                    onPress={handleDownloadPrescription}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="document-text-outline" size={15} color={Colors.primary} />
                    <Text style={styles.downloadRxText}>Prescription</Text>
                  </TouchableOpacity>
                </View>

                {appointment.diagnosis && (
                  <View style={styles.diagnosisBox}>
                    <Text style={styles.diagnosisLabel}>Diagnosis:</Text>
                    <Text style={styles.diagnosisText}>{appointment.diagnosis}</Text>
                  </View>
                )}

                <View style={styles.rxList}>
                  {(appointment.prescriptions || [
                    { medicine: 'Metoprolol Tartrate 25mg', dosage: '1 tablet twice daily after meals', duration: '14 days' },
                    { medicine: 'CoQ10 100mg Supplement', dosage: '1 capsule daily in the morning', duration: '30 days' },
                  ]).map((rx, idx) => (
                    <View key={idx} style={styles.rxItem}>
                      <View style={styles.rxIconWrap}>
                        <Ionicons name="medkit-outline" size={16} color={Colors.primary} />
                      </View>
                      <View style={styles.rxInfo}>
                        <Text style={styles.rxName}>{rx.medicine}</Text>
                        <Text style={styles.rxDosage}>{rx.dosage}</Text>
                        <Text style={styles.rxDuration}>Duration: {rx.duration}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Payment & Billing Breakdown */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>Payment Summary</Text>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Consultation Fee</Text>
                <Text style={styles.billValue}>{appointment.fee || '$50.00'}</Text>
              </View>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Booking & Platform Fee</Text>
                <Text style={styles.billValue}>$5.00</Text>
              </View>

              <View style={styles.billDivider} />

              <View style={styles.billRow}>
                <Text style={styles.billTotalLabel}>Total Paid</Text>
                <Text style={styles.billTotalValue}>
                  {appointment.fee ? `$${(parseFloat(appointment.fee.replace('$', '')) + 5).toFixed(2)}` : '$55.00'}
                </Text>
              </View>

              <View style={styles.paymentMethodRow}>
                <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                <Text style={styles.paymentMethodText}>
                  {appointment.paymentStatus || 'Paid via Apple Pay (•••• 4242)'}
                </Text>
              </View>
            </View>

            {/* Bottom Actions based on Status */}
            <View style={styles.modalActionGroup}>
              {isUpcoming && (
                <>
                  <TouchableOpacity
                    style={styles.joinCallBtn}
                    onPress={() => {
                      onClose();
                      onJoinCall?.(appointment);
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="videocam" size={20} color={Colors.white} />
                    <Text style={styles.joinCallBtnText}>Start Video Consultation</Text>
                  </TouchableOpacity>

                  <View style={styles.secondaryActionRow}>
                    <TouchableOpacity
                      style={styles.rescheduleActionBtn}
                      onPress={() => {
                        onClose();
                        onReschedule?.(appointment.id);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="calendar" size={16} color={Colors.primary} />
                      <Text style={styles.rescheduleActionText}>Reschedule</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cancelActionBtn}
                      onPress={() => {
                        onClose();
                        onCancel?.(appointment.id);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close-circle-outline" size={16} color={Colors.logoutRed} />
                      <Text style={styles.cancelActionText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {isCompleted && (
                <View style={styles.secondaryActionRow}>
                  <TouchableOpacity
                    style={styles.rescheduleActionBtn}
                    onPress={() => {
                      onClose();
                      onReview?.(appointment.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="star-outline" size={16} color={Colors.primary} />
                    <Text style={styles.rescheduleActionText}>Leave Review</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.primaryFollowUpBtn}
                    onPress={() => {
                      onClose();
                      onRebook?.(appointment.id);
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="repeat" size={16} color={Colors.white} />
                    <Text style={styles.primaryFollowUpText}>Re-Book</Text>
                  </TouchableOpacity>
                </View>
              )}

              {isCanceled && (
                <TouchableOpacity
                  style={styles.joinCallBtn}
                  onPress={() => {
                    onClose();
                    onRebook?.(appointment.id);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh" size={18} color={Colors.white} />
                  <Text style={styles.joinCallBtnText}>Re-Book Appointment</Text>
                </TouchableOpacity>
              )}
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
    backgroundColor: 'rgba(26, 59, 50, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    maxHeight: '92%',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
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
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
  },
  receiptButton: {
    padding: 6,
  },
  scrollContent: {
    paddingBottom: 16,
    gap: 14,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  bannerUpcoming: {
    backgroundColor: Colors.accentLight,
  },
  bannerCompleted: {
    backgroundColor: '#E8F5E9',
  },
  bannerCanceled: {
    backgroundColor: Colors.redBg,
  },
  statusBannerText: {
    fontSize: 13,
    fontWeight: '700',
  },
  bannerTextUpcoming: {
    color: Colors.primary,
  },
  bannerTextCompleted: {
    color: '#2E7D32',
  },
  bannerTextCanceled: {
    color: Colors.logoutRed,
  },
  cardSection: {
    backgroundColor: Colors.bgLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 12,
  },
  doctorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    marginRight: 14,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  doctorTextWrap: {
    flex: 1,
  },
  doctorName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 13,
    color: Colors.secondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  hospitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  hospitalText: {
    fontSize: 12,
    color: Colors.secondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoTextBox: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  infoValueCode: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
    fontFamily: 'monospace',
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  patientGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  patientGridItem: {
    flex: 1,
  },
  reasonBox: {
    marginTop: 4,
  },
  reasonText: {
    fontSize: 13,
    color: Colors.textDark,
    lineHeight: 18,
    marginTop: 2,
  },
  downloadRxBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  downloadRxText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  diagnosisBox: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    marginBottom: 12,
  },
  diagnosisLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  diagnosisText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
    lineHeight: 18,
  },
  rxList: {
    gap: 10,
  },
  rxItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-start',
  },
  rxIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  rxInfo: {
    flex: 1,
  },
  rxName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 2,
  },
  rxDosage: {
    fontSize: 12,
    color: Colors.secondary,
    marginBottom: 2,
  },
  rxDuration: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  billLabel: {
    fontSize: 13,
    color: Colors.secondary,
  },
  billValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
  },
  billDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  billTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
  },
  billTotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: Colors.white,
    padding: 8,
    borderRadius: 8,
  },
  paymentMethodText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
  },
  modalActionGroup: {
    gap: 10,
    marginTop: 6,
  },
  joinCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
  },
  joinCallBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  secondaryActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rescheduleActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 6,
  },
  rescheduleActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  cancelActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.redBg,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 6,
  },
  cancelActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.logoutRed,
  },
  primaryFollowUpBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 6,
  },
  primaryFollowUpText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
});

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { ScheduleStatus } from './ScheduleStatusTabs';

export interface AppointmentItem {
  id: string;
  doctorName: string;
  specialization: string;
  avatar: any;
  rating: string;
  date: string;
  time: string;
  status: ScheduleStatus;
  statusLabel: string;
  hospitalName?: string;
  consultationType?: string;
  bookingId?: string;
  patientName?: string;
  patientAge?: string;
  patientGender?: string;
  problemDescription?: string;
  fee?: string;
  paymentStatus?: string;
  diagnosis?: string;
  prescriptions?: { medicine: string; dosage: string; duration: string }[];
}

interface AppointmentCardProps {
  appointment: AppointmentItem;
  onPressCard?: (appointment: AppointmentItem) => void;
  onCancel?: (id: string) => void;
  onReschedule?: (id: string) => void;
  onRebook?: (id: string) => void;
  onReview?: (id: string) => void;
}

export default function AppointmentCard({
  appointment,
  onPressCard,
  onCancel,
  onReschedule,
  onRebook,
  onReview,
}: AppointmentCardProps) {
  return (
    <View style={styles.appointmentCard}>
      {/* Doctor Info Row */}
      <TouchableOpacity
        style={styles.doctorRow}
        onPress={() => onPressCard?.(appointment)}
        activeOpacity={0.8}
      >
        <Image source={appointment.avatar} style={styles.doctorAvatar} />
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{appointment.doctorName}</Text>
          <Text style={styles.doctorSpecialty}>{appointment.specialization}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#FFA800" />
            <Text style={styles.ratingText}>{appointment.rating}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Schedule Info Box */}
      <View style={styles.scheduleBox}>
        <View style={styles.scheduleItem}>
          <Ionicons name="calendar" size={15} color={Colors.primary} />
          <Text style={styles.scheduleText}>{appointment.date}</Text>
        </View>
        <View style={styles.scheduleDivider} />
        <View style={styles.scheduleItem}>
          <Ionicons name="time" size={15} color={Colors.primary} />
          <Text style={styles.scheduleText}>{appointment.time}</Text>
        </View>
        <View style={styles.scheduleDivider} />
        <View style={styles.statusBadge}>
          <View
            style={[
              styles.statusDot,
              appointment.status === 'upcoming'
                ? styles.dotUpcoming
                : appointment.status === 'completed'
                ? styles.dotCompleted
                : styles.dotCanceled,
            ]}
          />
          <Text
            style={[
              styles.statusLabel,
              appointment.status === 'canceled' && styles.statusLabelCanceled,
            ]}
          >
            {appointment.statusLabel}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        {appointment.status === 'upcoming' && (
          <>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => onCancel?.(appointment.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle-outline" size={16} color={Colors.logoutRed} />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rescheduleButton}
              onPress={() => onReschedule?.(appointment.id)}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={16} color={Colors.white} />
              <Text style={styles.rescheduleButtonText}>Reschedule</Text>
            </TouchableOpacity>
          </>
        )}

        {appointment.status === 'completed' && (
          <>
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => onReview?.(appointment.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="star-outline" size={16} color="#E09200" />
              <Text style={styles.reviewButtonText}>Leave Review</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rescheduleButton}
              onPress={() => onRebook?.(appointment.id)}
              activeOpacity={0.8}
            >
              <Ionicons name="repeat" size={16} color={Colors.white} />
              <Text style={styles.rescheduleButtonText}>Re-Book</Text>
            </TouchableOpacity>
          </>
        )}

        {appointment.status === 'canceled' && (
          <TouchableOpacity
            style={[styles.rescheduleButton, styles.fullWidthButton]}
            onPress={() => onRebook?.(appointment.id)}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={16} color={Colors.white} />
            <Text style={styles.rescheduleButtonText}>Re-Book Appointment</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appointmentCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 14,
    backgroundColor: Colors.bgLight,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 13,
    color: Colors.secondary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
  },
  scheduleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.border,
  },
  scheduleText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textDark,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotUpcoming: {
    backgroundColor: '#34C759',
  },
  dotCompleted: {
    backgroundColor: Colors.primary,
  },
  dotCanceled: {
    backgroundColor: Colors.error,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  statusLabelCanceled: {
    color: Colors.error,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 11,
    borderRadius: 24,
    backgroundColor: Colors.redBg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.logoutRed,
  },
  reviewButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 11,
    borderRadius: 24,
    backgroundColor: '#FFF8E6',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#FFE2A6',
  },
  reviewButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B57400',
  },
  rescheduleButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 11,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  rescheduleButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  fullWidthButton: {
    flex: 1,
  },
});

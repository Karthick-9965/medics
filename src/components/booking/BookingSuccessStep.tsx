import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { DoctorItem } from '../../constants/doctorsData';

export interface BookingSuccessStepProps {
  doctor: DoctorItem;
  bookingId: string;
  selectedDate: string;
  selectedTimeSlot: string;
  consultationType: string;
}

/**
 * Step 4 of Doctor Booking: Confirmation Receipt & Booking ID Display.
 */
export default function BookingSuccessStep({
  doctor,
  bookingId,
  selectedDate,
  selectedTimeSlot,
  consultationType,
}: BookingSuccessStepProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Ionicons name="checkmark-circle" size={68} color={Colors.successGreen} />
      </View>
      <Text style={styles.title}>Appointment Booked!</Text>
      <Text style={styles.subtitle}>
        Your appointment with {doctor.name} has been confirmed.
      </Text>

      <View style={styles.bookingBadge}>
        <Text style={styles.bookingIdLabel}>Booking ID</Text>
        <Text style={styles.bookingIdValue}>{bookingId}</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Doctor</Text>
          <Text style={styles.rowValue}>{doctor.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Specialty</Text>
          <Text style={styles.rowValue}>{doctor.specialization}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Date & Time</Text>
          <Text style={styles.rowValue}>{selectedDate} • {selectedTimeSlot}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Mode</Text>
          <Text style={styles.rowValue}>{consultationType}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  iconBox: {
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.secondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  bookingBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bookingIdLabel: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bookingIdValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 2,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: Colors.bgLight,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.textDark,
  },
});

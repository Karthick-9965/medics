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

interface RescheduleModalProps {
  visible: boolean;
  appointment: AppointmentItem | null;
  onClose: () => void;
  onConfirmReschedule: (
    appointment: AppointmentItem,
    newDate: string,
    newTime: string,
    consultationType: string
  ) => void;
}

const DATE_OPTIONS = [
  { label: 'Tomorrow', date: '27/06/2026', day: 'Fri' },
  { label: 'Sat', date: '28/06/2026', day: '28 Jun' },
  { label: 'Mon', date: '30/06/2026', day: '30 Jun' },
  { label: 'Wed', date: '02/07/2026', day: '02 Jul' },
  { label: 'Fri', date: '04/07/2026', day: '04 Jul' },
];

const TIME_SLOTS = [
  '09:00 AM',
  '10:30 AM',
  '02:00 PM',
  '04:30 PM',
  '06:00 PM',
];

const CONSULTATION_TYPES = [
  { key: 'Video Call', icon: 'videocam-outline' as const },
  { key: 'Audio Call', icon: 'call-outline' as const },
  { key: 'Hospital Visit', icon: 'location-outline' as const },
];

export default function RescheduleModal({
  visible,
  appointment,
  onClose,
  onConfirmReschedule,
}: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState(DATE_OPTIONS[0].date);
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0]);
  const [selectedType, setSelectedType] = useState('Video Call');

  if (!appointment) return null;

  const handleConfirm = () => {
    onConfirmReschedule(appointment, selectedDate, selectedTime, selectedType);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleWithIcon}>
              <View style={styles.headerIconCircle}>
                <Ionicons name="calendar" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.sheetTitle}>Reschedule Appointment</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={Colors.textDark} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Doctor Card Banner */}
            <View style={styles.doctorCard}>
              <Image source={appointment.avatar} style={styles.doctorAvatar} />
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{appointment.doctorName}</Text>
                <Text style={styles.doctorSpecialty}>{appointment.specialization}</Text>
                <View style={styles.currentScheduleBadge}>
                  <Ionicons name="time-outline" size={13} color={Colors.secondary} />
                  <Text style={styles.currentScheduleText}>
                    Current: {appointment.date} at {appointment.time}
                  </Text>
                </View>
              </View>
            </View>

            {/* Select Consultation Type */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Consultation Mode</Text>
              <View style={styles.typeRow}>
                {CONSULTATION_TYPES.map((type) => {
                  const isSelected = selectedType === type.key;
                  return (
                    <TouchableOpacity
                      key={type.key}
                      style={[styles.typeOption, isSelected && styles.typeOptionSelected]}
                      onPress={() => setSelectedType(type.key)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={type.icon}
                        size={18}
                        color={isSelected ? Colors.white : Colors.secondary}
                      />
                      <Text
                        style={[styles.typeOptionText, isSelected && styles.typeOptionTextSelected]}
                      >
                        {type.key}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Select New Date */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Select New Date</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.datesRow}
              >
                {DATE_OPTIONS.map((item) => {
                  const isSelected = selectedDate === item.date;
                  return (
                    <TouchableOpacity
                      key={item.date}
                      style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                      onPress={() => setSelectedDate(item.date)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[styles.dateDayText, isSelected && styles.dateDayTextSelected]}
                      >
                        {item.day}
                      </Text>
                      <Text
                        style={[styles.dateLabelText, isSelected && styles.dateLabelTextSelected]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Select New Time Slot */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Select New Time Slot</Text>
              <View style={styles.timesGrid}>
                {TIME_SLOTS.map((time) => {
                  const isSelected = selectedTime === time;
                  return (
                    <TouchableOpacity
                      key={time}
                      style={[styles.timeSlotPill, isSelected && styles.timeSlotPillSelected]}
                      onPress={() => setSelectedTime(time)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={isSelected ? Colors.white : Colors.secondary}
                      />
                      <Text
                        style={[styles.timeSlotText, isSelected && styles.timeSlotTextSelected]}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Reschedule Summary Box */}
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>New Schedule:</Text>
                <Text style={styles.summaryValue}>
                  {selectedDate} at {selectedTime}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Mode:</Text>
                <Text style={styles.summaryValue}>{selectedType}</Text>
              </View>
            </View>

            {/* Confirm Reschedule Button */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color={Colors.white} />
              <Text style={styles.confirmButtonText}>Confirm Reschedule</Text>
            </TouchableOpacity>
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
    paddingTop: 18,
    paddingBottom: 32,
    maxHeight: '90%',
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
    marginBottom: 16,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.textDark,
  },
  closeButton: {
    padding: 6,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 18,
  },
  doctorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    backgroundColor: Colors.white,
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
  currentScheduleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currentScheduleText: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '500',
  },
  section: {
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 10,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
  },
  typeOptionTextSelected: {
    color: Colors.white,
  },
  datesRow: {
    gap: 10,
    paddingRight: 10,
  },
  dateCard: {
    width: 80,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateCardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dateDayText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 2,
  },
  dateDayTextSelected: {
    color: Colors.white,
  },
  dateLabelText: {
    fontSize: 11,
    color: Colors.secondary,
  },
  dateLabelTextSelected: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeSlotPillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeSlotText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
  },
  timeSlotTextSelected: {
    color: Colors.white,
  },
  summaryBox: {
    backgroundColor: Colors.accentLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    gap: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 28,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
});

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';

interface AppointmentScheduleGridProps {
  date: string;
  time: string;
  consultationType?: string;
}

/**
 * 3-column summary grid showing appointment date, time, and consultation mode.
 */
export default function AppointmentScheduleGrid({
  date,
  time,
  consultationType = 'Video Call',
}: AppointmentScheduleGridProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoBox}>
        <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
        <Text style={styles.infoLabel}>Date</Text>
        <Text style={styles.infoValue}>{date}</Text>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="time-outline" size={18} color={Colors.primary} />
        <Text style={styles.infoLabel}>Time</Text>
        <Text style={styles.infoValue}>{time}</Text>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="videocam-outline" size={18} color={Colors.primary} />
        <Text style={styles.infoLabel}>Type</Text>
        <Text style={styles.infoValue}>{consultationType}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    borderColor: Colors.borderLight,
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
    textAlign: 'center',
  },
});

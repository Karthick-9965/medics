import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { getDoctorAvatar } from '../../../constants/scheduleData';

interface AppointmentDoctorHeaderProps {
  doctorName: string;
  specialization: string;
  hospitalName?: string;
  avatar?: any;
  status: 'upcoming' | 'completed' | 'canceled';
  statusLabel?: string;
}

/**
 * Renders the Doctor summary header inside the Appointment Detail view,
 * complete with doctor avatar, specialization, hospital name, and status badge.
 */
export default function AppointmentDoctorHeader({
  doctorName,
  specialization,
  hospitalName = 'City Care Hospital',
  avatar,
  status,
  statusLabel,
}: AppointmentDoctorHeaderProps) {
  const isUpcoming = status === 'upcoming';
  const isCompleted = status === 'completed';
  const isCanceled = status === 'canceled';

  const resolvedAvatar = getDoctorAvatar(doctorName, avatar);

  return (
    <View style={styles.container}>
      <Image source={resolvedAvatar} style={styles.avatar} resizeMode="cover" />
      <View style={styles.infoCol}>
        <Text style={styles.doctorName}>{doctorName}</Text>
        <Text style={styles.specialization}>{specialization}</Text>
        <Text style={styles.hospitalName}>{hospitalName}</Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          isUpcoming && styles.badgeUpcoming,
          isCompleted && styles.badgeCompleted,
          isCanceled && styles.badgeCanceled,
        ]}
      >
        <Text
          style={[
            styles.statusText,
            isUpcoming && styles.textUpcoming,
            isCompleted && styles.textCompleted,
            isCanceled && styles.textCanceled,
          ]}
        >
          {isCanceled ? 'Canceled' : statusLabel || status}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.white,
  },
  infoCol: {
    flex: 1,
    marginLeft: 12,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textSlateDark,
  },
  specialization: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 1,
  },
  hospitalName: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 8,
  },
  badgeUpcoming: {
    backgroundColor: Colors.accentLight,
  },
  badgeCompleted: {
    backgroundColor: Colors.successBgTint,
  },
  badgeCanceled: {
    backgroundColor: Colors.dangerBgTint,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  textUpcoming: {
    color: Colors.primary,
  },
  textCompleted: {
    color: Colors.successGreen,
  },
  textCanceled: {
    color: Colors.dangerRed,
  },
});

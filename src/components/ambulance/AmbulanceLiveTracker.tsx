import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { AmbulanceUnit } from '../../constants/ambulancesData';

import { openPhoneDialer } from '../../utils/formatters';

export interface AmbulanceLiveTrackerProps {
  driver: AmbulanceUnit;
  etaSeconds: number;
  formatCountdown: (seconds: number) => string;
  onCancelDispatch: () => void;
}

/**
 * Live Tracking Card displayed after requesting an emergency ambulance.
 * Shows countdown timer, assigned driver, vehicle number, and action buttons.
 */
export default function AmbulanceLiveTracker({
  driver,
  etaSeconds,
  formatCountdown,
  onCancelDispatch,
}: AmbulanceLiveTrackerProps) {
  const handleCallDriver = () => {
    openPhoneDialer(driver.phone);
  };

  return (
    <View style={styles.trackerCard}>
      {/* Countdown Timer Box */}
      <View style={styles.countdownBox}>
        <Text style={styles.countdownLabel}>ESTIMATED ARRIVAL IN</Text>
        <Text style={styles.countdownTimer}>{formatCountdown(etaSeconds)}</Text>
        <Text style={styles.countdownSub}>Driver is navigating rapidly toward your location</Text>
      </View>

      {/* Driver Information Row */}
      <View style={styles.driverRow}>
        <View style={styles.driverAvatar}>
          <Ionicons name="person" size={28} color={Colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.driverName}>{driver.driverName}</Text>
          <Text style={styles.driverHospital}>{driver.currentHospital}</Text>
          <Text style={styles.vehicleNo}>Vehicle: {driver.vehicleNumber}</Text>
        </View>
        <TouchableOpacity
          style={styles.callDriverBtn}
          onPress={handleCallDriver}
          activeOpacity={0.8}
        >
          <Ionicons name="call" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Cancel Dispatch Button */}
      <TouchableOpacity
        style={styles.cancelDispatchBtn}
        onPress={onCancelDispatch}
        activeOpacity={0.8}
      >
        <Text style={styles.cancelDispatchText}>Cancel Ambulance Request</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  trackerCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  countdownBox: {
    backgroundColor: Colors.dangerBgLight,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  countdownLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.error,
    letterSpacing: 1,
    marginBottom: 4,
  },
  countdownTimer: {
    fontSize: 40,
    fontWeight: '900',
    color: Colors.error,
    fontVariant: ['tabular-nums'],
    marginBottom: 4,
  },
  countdownSub: {
    fontSize: 12,
    color: Colors.secondary,
    textAlign: 'center',
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgPage,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 2,
  },
  driverHospital: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  vehicleNo: {
    fontSize: 11.5,
    color: Colors.secondary,
  },
  callDriverBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelDispatchBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelDispatchText: {
    color: Colors.error,
    fontSize: 13.5,
    fontWeight: '600',
  },
});

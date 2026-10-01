import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EMERGENCY_HOTLINES } from '../../constants/appData';
import { Colors } from '../../constants/Colors';
import MedicalAlertModal from '../modals/MedicalAlertModal';

interface EmergencyHotlinesProps {
  onCall?: (number: string, label: string) => void;
  compact?: boolean;
}

export default function EmergencyHotlines({ onCall }: EmergencyHotlinesProps) {
  const [showCallAlert, setShowCallAlert] = useState(false);
  const [pendingCall, setPendingCall] = useState<{ number: string; label: string }>({
    number: '108',
    label: 'Ambulance 108',
  });

  const hotline = EMERGENCY_HOTLINES[0] || {
    number: '108',
    label: 'Ambulance 108',
    subtitle: 'National Medical SOS (24/7 Toll-Free)',
    color: Colors.logoutRed,
    icon: 'medical' as const,
  };

  const handlePress = (num: string, label: string) => {
    if (onCall) {
      onCall(num, label);
    } else {
      setPendingCall({ number: num, label });
      setShowCallAlert(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="flash" size={16} color={Colors.error} />
        <Text style={styles.title}>24/7 Emergency Medical Hotline</Text>
      </View>
      <TouchableOpacity
        style={styles.card}
        onPress={() => handlePress(hotline.number, hotline.label)}
        activeOpacity={0.75}
      >
        <View style={styles.iconBox}>
          <Ionicons name={hotline.icon} size={22} color={hotline.color} />
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.label}>{hotline.label}</Text>
          <Text style={styles.subtitle}>{hotline.subtitle}</Text>
        </View>
        <View style={styles.callBadge}>
          <Ionicons name="call" size={14} color={Colors.white} />
          <Text style={styles.callBadgeText}>Call 108</Text>
        </View>
      </TouchableOpacity>

      {/* Emergency Call Medical Modal */}
      <MedicalAlertModal
        visible={showCallAlert}
        type="ambulance"
        icon="call"
        title={`Emergency Call: ${pendingCall.number}`}
        message={`Connecting immediately to ${pendingCall.label} (${pendingCall.number}). Please stay on the line.`}
        primaryButtonText="Call Now"
        secondaryButtonText="Cancel"
        isDestructive
        onPrimaryPress={() => {
          setShowCallAlert(false);
          Linking.openURL(`tel:${pendingCall.number}`);
        }}
        onSecondaryPress={() => setShowCallAlert(false)}
        onClose={() => setShowCallAlert(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.error,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.dangerBorder,
    elevation: 2,
    shadowColor: Colors.logoutRed,
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.dangerBgLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoCol: {
    flex: 1,
  },
  label: {
    fontSize: 14.5,
    fontWeight: '800',
    color: Colors.logoutRed,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11.5,
    color: Colors.secondary,
  },
  callBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.logoutRed,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 5,
  },
  callBadgeText: {
    color: Colors.white,
    fontSize: 12.5,
    fontWeight: '700',
  },
});

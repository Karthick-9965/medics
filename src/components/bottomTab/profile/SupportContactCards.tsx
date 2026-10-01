import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';

export interface SupportContactCardsProps {
  onCallSupport: () => void;
  onCallEmergency: () => void;
  onLiveChat: () => void;
  onEmailSupport: () => void;
}

/**
 * Reusable Medical Support Quick Contact Cards Grid.
 * Displays 24/7 Care Hotline, 108 Emergency Ambulance, Live Chat Desk, and Email Support.
 */
export default function SupportContactCards({
  onCallSupport,
  onCallEmergency,
  onLiveChat,
  onEmailSupport,
}: SupportContactCardsProps) {
  return (
    <View style={styles.grid}>
      {/* 24/7 Helpline */}
      <TouchableOpacity
        style={styles.card}
        onPress={onCallSupport}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBox, { backgroundColor: Colors.infoBlueBg }]}>
          <Ionicons name="call" size={20} color={Colors.infoBlueDark} />
        </View>
        <Text style={styles.title}>24/7 Helpline</Text>
        <Text style={styles.subtitle}>1800-MED-CARE</Text>
      </TouchableOpacity>

      {/* 108 Emergency */}
      <TouchableOpacity
        style={styles.card}
        onPress={onCallEmergency}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBox, { backgroundColor: Colors.dangerBgTint }]}>
          <Ionicons name="alert-circle" size={20} color={Colors.dangerRed} />
        </View>
        <Text style={styles.title}>Emergency</Text>
        <Text style={styles.subtitle}>Dial 108</Text>
      </TouchableOpacity>

      {/* Live Chat */}
      <TouchableOpacity
        style={styles.card}
        onPress={onLiveChat}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBox, { backgroundColor: Colors.accentLight }]}>
          <Ionicons name="chatbubbles" size={20} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Live Chat</Text>
        <Text style={styles.subtitle}>Online Now</Text>
      </TouchableOpacity>

      {/* Email Desk */}
      <TouchableOpacity
        style={styles.card}
        onPress={onEmailSupport}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBox, { backgroundColor: Colors.medicalPurpleBg }]}>
          <Ionicons name="mail" size={20} color={Colors.medicalPurple} />
        </View>
        <Text style={styles.title}>Email Desk</Text>
        <Text style={styles.subtitle}>support@medics</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  card: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.textDark,
  },
  subtitle: {
    fontSize: 11.5,
    color: Colors.secondary,
    marginTop: 2,
    fontWeight: '600',
  },
});

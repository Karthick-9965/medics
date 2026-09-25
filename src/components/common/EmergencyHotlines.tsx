import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EMERGENCY_HOTLINES } from '../../constants/appData';
import { Colors } from '../../constants/Colors';

interface EmergencyHotlinesProps {
  onCall?: (number: string, label: string) => void;
  compact?: boolean;
}

export default function EmergencyHotlines({ onCall, compact }: EmergencyHotlinesProps) {
  const handlePress = (num: string, label: string) => {
    if (onCall) {
      onCall(num, label);
    } else {
      Alert.alert(
        `Emergency Call: ${num}`,
        `Connecting immediately to ${label} (${num}). Please stay on the line.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call Now', style: 'destructive', onPress: () => {} },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="flash" size={16} color={Colors.error} />
        <Text style={styles.title}>24/7 Emergency SOS Hotlines</Text>
      </View>
      <View style={[styles.row, compact && { gap: 6 }]}>
        {EMERGENCY_HOTLINES.map((hotline) => (
          <TouchableOpacity
            key={hotline.number}
            style={[styles.card, { borderColor: hotline.color + '33' }]}
            onPress={() => handlePress(hotline.number, hotline.label)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { backgroundColor: hotline.color + '18' }]}>
              <Ionicons name={hotline.icon} size={compact ? 16 : 18} color={hotline.color} />
            </View>
            <Text style={[styles.label, { color: hotline.color }]}>{hotline.label}</Text>
            {!compact && <Text style={styles.subtitle}>{hotline.subtitle}</Text>}
          </TouchableOpacity>
        ))}
      </View>
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
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 10,
    color: Colors.secondary,
    textAlign: 'center',
    marginTop: 2,
  },
});

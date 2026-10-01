import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';

export interface PrescriptionItem {
  medicine: string;
  dosage: string;
  duration: string;
}

interface DigitalPrescriptionCardProps {
  prescriptions: PrescriptionItem[];
}

/**
 * Clean medical card rendering prescribed medicines, dosages, and schedules.
 */
export default function DigitalPrescriptionCard({ prescriptions }: DigitalPrescriptionCardProps) {
  if (!prescriptions || prescriptions.length === 0) return null;

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <Ionicons name="document-text-outline" size={16} color={Colors.primary} />
        <Text style={styles.cardTitle}>Digital Prescription</Text>
      </View>

      {prescriptions.map((p, idx) => (
        <View key={idx} style={styles.medicineRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="medkit" size={14} color={Colors.primary} />
          </View>
          <View style={styles.medicineDetails}>
            <Text style={styles.medicineName}>{p.medicine}</Text>
            <Text style={styles.medicineDosage}>
              {p.dosage} • {p.duration}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSlateMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  medicineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 10,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicineDetails: {
    flex: 1,
  },
  medicineName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSlateDark,
  },
  medicineDosage: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
  },
});

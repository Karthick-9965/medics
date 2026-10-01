import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { HospitalAmbulanceNumber } from '../../constants/ambulancesData';

import { openPhoneDialer } from '../../utils/formatters';

export interface HospitalAmbulanceCardProps {
  hospital: HospitalAmbulanceNumber;
}

/**
 * Reusable card for dedicated direct hospital ambulance emergency helplines.
 */
export default function HospitalAmbulanceCard({ hospital }: HospitalAmbulanceCardProps) {
  const badgeColor = hospital.badgeColor || Colors.darkTeal;

  const handleCall = () => {
    openPhoneDialer(hospital.directPhone || hospital.shortHotline);
  };

  return (
    <View style={styles.hospAmbCard}>
      <View style={styles.hospAmbCardHeader}>
        <View style={[styles.hospIconCircle, { backgroundColor: badgeColor + '15' }]}>
          <Ionicons name="medical" size={20} color={badgeColor} />
        </View>

        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.hospAmbName}>{hospital.hospitalName}</Text>
          <Text style={styles.hospAmbDistance}>
            {hospital.distance} • Response: {hospital.eta}
          </Text>
        </View>
      </View>

      <View style={styles.hospAmbDetailsRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.hospAmbPhone, { color: badgeColor }]}>{hospital.directPhone}</Text>
          <Text style={styles.hospUnitsActive}>
            ✓ {hospital.availableUnits} Ambulances on Standby
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.hospCallBtn, { backgroundColor: badgeColor }]}
          onPress={handleCall}
          activeOpacity={0.8}
        >
          <Ionicons name="call" size={16} color={Colors.white} />
          <Text style={styles.hospCallBtnText}>Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hospAmbCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  hospAmbCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hospIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospAmbName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 2,
  },
  hospAmbDistance: {
    fontSize: 11.5,
    color: Colors.secondary,
  },
  hospAmbDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  hospAmbPhone: {
    fontSize: 12,
    color: Colors.darkTeal,
    fontWeight: '700',
    marginBottom: 2,
  },
  hospUnitsActive: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '600',
  },
  hospCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  hospCallBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});

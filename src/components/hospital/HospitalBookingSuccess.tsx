import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { HospitalItem } from '../../constants/hospitalsData';

export interface HospitalBookingSuccessProps {
  hospital: HospitalItem;
  bookingToken: string;
  selectedDepartment: string;
  chosenDateStr: string;
  selectedTimeSlot: string;
  patientName: string;
  onCallReception: () => void;
  onDone: () => void;
}

/**
 * Reusable booking confirmation view after reserving a hospital visit or bed token.
 */
export default function HospitalBookingSuccess({
  hospital,
  bookingToken,
  selectedDepartment,
  chosenDateStr,
  selectedTimeSlot,
  patientName,
  onCallReception,
  onDone,
}: HospitalBookingSuccessProps) {
  return (
    <View style={styles.successContainer}>
      <Ionicons name="checkmark-circle" size={68} color={Colors.successGreen} />
      <Text style={styles.successTitle}>Hospital Visit Booked!</Text>
      <Text style={styles.successSubtitle}>
        Your appointment token at {hospital.name} has been generated. Please present this token at the hospital reception.
      </Text>

      <View style={styles.tokenCard}>
        <Text style={styles.tokenLabel}>HOSPITAL TOKEN REFERENCE</Text>
        <Text style={styles.tokenNumber}>{bookingToken}</Text>
        <View style={styles.tokenDivider} />
        <View style={styles.tokenRow}>
          <Text style={styles.tokenItemKey}>Department:</Text>
          <Text style={styles.tokenItemVal}>{selectedDepartment || 'General'}</Text>
        </View>
        <View style={styles.tokenRow}>
          <Text style={styles.tokenItemKey}>Date & Time:</Text>
          <Text style={styles.tokenItemVal}>
            {chosenDateStr}, {selectedTimeSlot}
          </Text>
        </View>
        <View style={styles.tokenRow}>
          <Text style={styles.tokenItemKey}>Patient:</Text>
          <Text style={styles.tokenItemVal}>{patientName}</Text>
        </View>
        <View style={styles.tokenRow}>
          <Text style={styles.tokenItemKey}>Reception Helpdesk:</Text>
          <Text style={[styles.tokenItemVal, { color: Colors.primary, fontWeight: '700' }]}>
            {hospital.receptionPhone}
          </Text>
        </View>
      </View>

      <View style={styles.successBtnRow}>
        <TouchableOpacity style={styles.callReceptionSuccessBtn} onPress={onCallReception} activeOpacity={0.8}>
          <Ionicons name="call" size={16} color={Colors.primary} />
          <Text style={styles.callReceptionSuccessText}>Call Reception</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.doneBtn} onPress={onDone} activeOpacity={0.8}>
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.black,
    marginTop: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 13.5,
    color: Colors.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  tokenCard: {
    backgroundColor: Colors.bgPage,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: Colors.border,
    width: '100%',
    marginBottom: 20,
  },
  tokenLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 1,
    textAlign: 'center',
  },
  tokenNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primary,
    textAlign: 'center',
    marginVertical: 6,
    letterSpacing: 1,
  },
  tokenDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 12,
  },
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tokenItemKey: {
    fontSize: 12.5,
    color: Colors.secondary,
  },
  tokenItemVal: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.black,
  },
  successBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  callReceptionSuccessBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    gap: 6,
  },
  callReceptionSuccessText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  doneBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
});

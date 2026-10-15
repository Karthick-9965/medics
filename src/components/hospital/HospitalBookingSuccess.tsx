import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { HospitalItem } from '../../constants/hospitalsData';

export interface HospitalBookingSuccessProps {
  hospital: HospitalItem;
  bookingToken: string;
  selectedDepartment: string;
  selectedDoctorName?: string;
  chosenDateStr: string;
  selectedTimeSlot: string;
  patientName: string;
  isEmergency?: boolean;
  onCallReception: () => void;
  onDone: () => void;
}

/**
 * Reusable booking confirmation view after reserving a hospital visit or emergency token.
 */
export default function HospitalBookingSuccess({
  hospital,
  bookingToken,
  selectedDepartment,
  selectedDoctorName,
  chosenDateStr,
  selectedTimeSlot,
  patientName,
  isEmergency = false,
  onCallReception,
  onDone,
}: HospitalBookingSuccessProps) {
  return (
    <View style={styles.successContainer}>
      <Ionicons
        name={isEmergency ? 'alert-circle' : 'checkmark-circle'}
        size={68}
        color={isEmergency ? Colors.primary : Colors.successGreen}
      />
      <Text style={[styles.successTitle, isEmergency && { color: Colors.primary }]}>
        {isEmergency ? 'Emergency Token Booked!' : 'Hospital Visit Booked!'}
      </Text>
      <Text style={styles.successSubtitle}>
        {isEmergency
          ? `Your priority emergency token at ${hospital.name} has been generated. Please report directly to the Casualty / Emergency desk upon arrival.`
          : `Your appointment token at ${hospital.name} has been generated. Please present this token at the hospital reception.`}
      </Text>

      <View style={[styles.tokenCard, isEmergency && styles.emergencyTokenCard]}>
        <Text style={[styles.tokenLabel, isEmergency && { color: Colors.primary }]}>
          {isEmergency ? 'EMERGENCY TOKEN REFERENCE' : 'HOSPITAL TOKEN REFERENCE'}
        </Text>
        <Text style={[styles.tokenNumber, isEmergency && { color: Colors.primary }]}>{bookingToken}</Text>
        <View style={styles.tokenDivider} />
        <View style={styles.tokenRow}>
          <Text style={styles.tokenItemKey}>Department:</Text>
          <Text style={[styles.tokenItemVal, isEmergency && { color: Colors.primary, fontWeight: '700' }]}>
            {selectedDepartment || (isEmergency ? 'Emergency' : 'General')}
          </Text>
        </View>
        {!isEmergency && selectedDoctorName ? (
          <View style={styles.tokenRow}>
            <Text style={styles.tokenItemKey}>Consulting Doctor:</Text>
            <Text style={[styles.tokenItemVal, { color: Colors.primary, fontWeight: '700' }]}>
              {selectedDoctorName}
            </Text>
          </View>
        ) : null}
        <View style={styles.tokenRow}>
          <Text style={styles.tokenItemKey}>Date & Time:</Text>
          <Text style={styles.tokenItemVal}>
            {chosenDateStr}, {selectedTimeSlot}
          </Text>
        </View>
        <View style={styles.tokenRow}>
          <Text style={styles.tokenItemKey}>Patient:</Text>
          <Text style={styles.tokenItemVal}>{patientName || 'Emergency Patient'}</Text>
        </View>
        {isEmergency ? (
          <View style={styles.tokenRow}>
            <Text style={styles.tokenItemKey}>Payment / Fee:</Text>
            <Text style={[styles.tokenItemVal, { fontWeight: '700', color: Colors.primary }]}>- (Direct at Triage)</Text>
          </View>
        ) : (
          <View style={styles.tokenRow}>
            <Text style={styles.tokenItemKey}>Token Status:</Text>
            <Text style={[styles.tokenItemVal, { fontWeight: '700', color: Colors.successGreen }]}>Active & Verified</Text>
          </View>
        )}
        <View style={styles.tokenRow}>
          <Text style={styles.tokenItemKey}>Helpdesk / Helpline:</Text>
          <Text style={[styles.tokenItemVal, { color: Colors.primary, fontWeight: '700' }]}>
            {isEmergency ? (hospital.emergencyPhone || hospital.receptionPhone) : hospital.receptionPhone}
          </Text>
        </View>
      </View>

      <View style={styles.successBtnRow}>
        <TouchableOpacity style={styles.callReceptionSuccessBtn} onPress={onCallReception} activeOpacity={0.8}>
          <Ionicons name="call" size={16} color={Colors.primary} />
          <Text style={styles.callReceptionSuccessText}>
            {isEmergency ? 'Call Emergency Desk' : 'Call Reception'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={onDone}
          activeOpacity={0.8}
        >
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
  emergencyTokenCard: {
    borderColor: '#A3D9D0',
    backgroundColor: Colors.accentLight,
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

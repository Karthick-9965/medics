import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { CONSULTATION_OPTIONS, ConsultationType } from '../../constants/appData';

export interface BookingPatientStepProps {
  consultationType: ConsultationType;
  onSelectConsultationType: (type: ConsultationType) => void;
  patientName: string;
  onChangePatientName: (name: string) => void;
  patientAge: string;
  onChangePatientAge: (age: string) => void;
  patientGender: 'Male' | 'Female' | 'Other';
  onSelectPatientGender: (gender: 'Male' | 'Female' | 'Other') => void;
  problemDescription: string;
  onChangeProblemDescription: (desc: string) => void;
}

/**
 * Step 2 of Doctor Booking: Consultation Mode Selection & Patient Information Form.
 */
export default function BookingPatientStep({
  consultationType,
  onSelectConsultationType,
  patientName,
  onChangePatientName,
  patientAge,
  onChangePatientAge,
  patientGender,
  onSelectPatientGender,
  problemDescription,
  onChangeProblemDescription,
}: BookingPatientStepProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeading}>Choose Consultation Mode</Text>
      {CONSULTATION_OPTIONS.map((opt) => {
        const isSelected = consultationType === opt.type;
        return (
          <TouchableOpacity
            key={opt.type}
            style={[styles.consultCard, isSelected && styles.consultCardSelected]}
            onPress={() => onSelectConsultationType(opt.type)}
            activeOpacity={0.7}
          >
            <View style={[styles.consultIcon, isSelected && styles.consultIconSelected]}>
              <Ionicons
                name={opt.icon}
                size={20}
                color={isSelected ? Colors.primary : Colors.secondary}
              />
            </View>
            <View style={styles.consultInfo}>
              <Text style={[styles.consultTitle, isSelected && styles.consultTitleSelected]}>
                {opt.title}
              </Text>
              <Text style={styles.consultDesc}>{opt.desc}</Text>
            </View>
            <Text style={[styles.consultFee, isSelected && styles.consultFeeSelected]}>
              ₹{opt.fee.toFixed(2)}
            </Text>
          </TouchableOpacity>
        );
      })}

      <Text style={[styles.sectionHeading, { marginTop: 18 }]}>Patient Information</Text>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Patient Full Name</Text>
        <TextInput
          style={styles.input}
          value={patientName}
          onChangeText={onChangePatientName}
          placeholder="Enter patient full name"
          placeholderTextColor={Colors.inputPlaceholder}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.ageCol}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            value={patientAge}
            onChangeText={onChangePatientAge}
            placeholder="e.g. 28"
            placeholderTextColor={Colors.inputPlaceholder}
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.genderCol}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            {(['Male', 'Female', 'Other'] as const).map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.genderChip, patientGender === g && styles.genderChipSelected]}
                onPress={() => onSelectPatientGender(g)}
                activeOpacity={0.7}
              >
                <Text style={[styles.genderText, patientGender === g && styles.genderTextSelected]}>
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Health Concern / Symptoms</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={problemDescription}
          onChangeText={onChangeProblemDescription}
          placeholder="Describe health concern or symptoms..."
          placeholderTextColor={Colors.inputPlaceholder}
          multiline
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 10,
  },
  consultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  consultCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.accentLight,
  },
  consultIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  consultIconSelected: {
    backgroundColor: Colors.white,
  },
  consultInfo: {
    flex: 1,
  },
  consultTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.textDark,
  },
  consultTitleSelected: {
    color: Colors.primary,
  },
  consultDesc: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 2,
  },
  consultFee: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginLeft: 8,
  },
  consultFeeSelected: {
    color: Colors.primary,
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.2,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13.5,
    color: Colors.textDark,
    backgroundColor: Colors.white,
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  ageCol: {
    flex: 1,
  },
  genderCol: {
    flex: 1.5,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 6,
  },
  genderChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.accentLight,
  },
  genderText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: Colors.secondary,
  },
  genderTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
});

import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { HospitalItem } from '../../constants/hospitalsData';
import SlotPicker from '../common/SlotPicker';
import PriceSummary from '../common/PriceSummary';

export interface VisitTypeOption {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge: string;
}

export interface HospitalBookingFormProps {
  hospital: HospitalItem;
  visitTypes: VisitTypeOption[];
  selectedVisitType: string;
  selectedDepartment: string;
  selectedDateIndex: number;
  selectedTimeSlot: string;
  patientName: string;
  patientPhone: string;
  visitNotes: string;
  currentFee: number;
  isProcessing: boolean;
  onSelectVisitType: (id: string) => void;
  onSelectDepartment: (dept: string) => void;
  onSelectDateIndex: (index: number) => void;
  onSelectTimeSlot: (slot: string) => void;
  onPatientNameChange: (name: string) => void;
  onPatientPhoneChange: (phone: string) => void;
  onVisitNotesChange: (notes: string) => void;
  onSubmitBooking: () => void;
}

/**
 * Reusable Hospital Booking form component.
 * Allows choosing visit type, hospital department, date/time slots, and patient details.
 */
export default function HospitalBookingForm({
  hospital,
  visitTypes,
  selectedVisitType,
  selectedDepartment,
  selectedDateIndex,
  selectedTimeSlot,
  patientName,
  patientPhone,
  visitNotes,
  currentFee,
  isProcessing,
  onSelectVisitType,
  onSelectDepartment,
  onSelectDateIndex,
  onSelectTimeSlot,
  onPatientNameChange,
  onPatientPhoneChange,
  onVisitNotesChange,
  onSubmitBooking,
}: HospitalBookingFormProps) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {/* 1. Select Visit Type */}
      <Text style={styles.sectionHeading}>1. Select Visit / Booking Type</Text>
      <View style={styles.visitTypesGrid}>
        {visitTypes.map((v) => {
          const isSelected = selectedVisitType === v.id;
          return (
            <TouchableOpacity
              key={v.id}
              style={[styles.visitTypeCard, isSelected && styles.visitTypeCardSelected]}
              onPress={() => onSelectVisitType(v.id)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={v.icon}
                size={18}
                color={isSelected ? Colors.primary : Colors.secondary}
              />
              <Text style={[styles.visitTypeLabel, isSelected && styles.visitTypeLabelSelected]}>
                {v.label}
              </Text>
              <View style={[styles.visitTypeBadge, isSelected && styles.visitTypeBadgeSelected]}>
                <Text style={[styles.visitTypeBadgeText, isSelected && styles.visitTypeBadgeTextSelected]}>
                  {v.badge}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 2. Select Department */}
      {hospital.departments && hospital.departments.length > 0 && (
        <View style={{ marginTop: 14 }}>
          <Text style={styles.sectionHeading}>2. Select Department</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deptScroll}>
            {hospital.departments.map((dept) => {
              const isSel = selectedDepartment === dept;
              return (
                <TouchableOpacity
                  key={dept}
                  style={[styles.deptSelectChip, isSel && styles.deptSelectChipActive]}
                  onPress={() => onSelectDepartment(dept)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.deptSelectText, isSel && styles.deptSelectTextActive]}>
                    {dept}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* 3. Date & Time Slot Picker */}
      <View style={{ marginTop: 14 }}>
        <Text style={styles.sectionHeading}>3. Select Visit Date & Time</Text>
        <SlotPicker
          selectedDateIndex={selectedDateIndex}
          onSelectDate={onSelectDateIndex}
          selectedTimeSlot={selectedTimeSlot}
          onSelectTime={onSelectTimeSlot}
        />
      </View>

      {/* 4. Patient Details Form */}
      <View style={{ marginTop: 14 }}>
        <Text style={styles.sectionHeading}>4. Patient Information</Text>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Patient Full Name</Text>
          <TextInput
            style={styles.formInput}
            value={patientName}
            onChangeText={onPatientNameChange}
            placeholder="Enter patient full name"
            placeholderTextColor={Colors.secondary}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Contact Phone Number</Text>
          <TextInput
            style={styles.formInput}
            value={patientPhone}
            onChangeText={onPatientPhoneChange}
            keyboardType="phone-pad"
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Symptoms or Reason for Hospital Visit (Optional)</Text>
          <TextInput
            style={[styles.formInput, { height: 60, textAlignVertical: 'top' }]}
            value={visitNotes}
            onChangeText={onVisitNotesChange}
            placeholder="e.g. Chest discomfort, orthopedic review, second opinion"
            placeholderTextColor={Colors.secondary}
            multiline
          />
        </View>
      </View>

      {/* Summary & Price */}
      <PriceSummary
        items={[
          { label: 'Hospital Registration & Consultation Fee', amount: `₹${currentFee}.00` },
          { label: 'Token Reservation & Priority Queue', amount: 'FREE', isDiscount: true },
          { label: 'Hospital Reception Verification', amount: 'Included' },
        ]}
        totalAmount={`₹${currentFee}.00`}
      />

      {/* Book Button */}
      <TouchableOpacity
        style={styles.primaryBookBtn}
        onPress={onSubmitBooking}
        disabled={isProcessing}
        activeOpacity={0.8}
      >
        {isProcessing ? (
          <ActivityIndicator color={Colors.white} size="small" />
        ) : (
          <Text style={styles.primaryBookBtnText}>
            Confirm Hospital Token (₹${currentFee}.00)
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeading: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 10,
  },
  visitTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  visitTypeCard: {
    width: '48%',
    backgroundColor: Colors.bgPage,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  visitTypeCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.successBgLight,
  },
  visitTypeLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: 6,
    marginBottom: 6,
  },
  visitTypeLabelSelected: {
    color: Colors.primary,
  },
  visitTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  visitTypeBadgeSelected: {
    backgroundColor: Colors.accentLight,
  },
  visitTypeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary,
  },
  visitTypeBadgeTextSelected: {
    color: Colors.primary,
  },
  deptScroll: {
    gap: 8,
  },
  deptSelectChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: Colors.cardBgSecondary,
    borderWidth: 1,
    borderColor: Colors.transparent,
  },
  deptSelectChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  deptSelectText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.textDark,
  },
  deptSelectTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  formGroup: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: Colors.bgPage,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13.5,
    color: Colors.black,
  },
  primaryBookBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  primaryBookBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
});

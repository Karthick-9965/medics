import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { HospitalItem } from '../../constants/hospitalsData';
import { DOCTORS_DATA, DoctorItem } from '../../constants/doctorsData';
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
  selectedDoctorName?: string;
  selectedDateIndex: number;
  selectedTimeSlot: string;
  patientName: string;
  patientPhone: string;
  visitNotes: string;
  currentFee: number;
  isProcessing: boolean;
  onSelectVisitType: (id: string) => void;
  onSelectDepartment: (dept: string) => void;
  onSelectDoctorName?: (name: string) => void;
  onSelectDateIndex: (index: number) => void;
  onSelectTimeSlot: (slot: string) => void;
  onPatientNameChange: (name: string) => void;
  onPatientPhoneChange: (phone: string) => void;
  onVisitNotesChange: (notes: string) => void;
  onSubmitBooking: () => void;
}

/**
 * Returns doctors matching the department strictly from real DOCTORS_DATA (no extra dummy doctors).
 */
export const getDepartmentDoctors = (department: string, hospitalName?: string): { id: string; name: string }[] => {
  const dept = (department || '').toLowerCase().trim();

  // 1. Direct specialization matches from DOCTORS_DATA
  const matched = DOCTORS_DATA.filter((doc) => {
    const spec = doc.specialization.toLowerCase();
    if (dept.includes('cardio') && spec.includes('cardio')) return true;
    if (dept.includes('neuro') && spec.includes('neuro')) return true;
    if ((dept.includes('ortho') || dept.includes('trauma')) && spec.includes('ortho')) return true;
    if ((dept.includes('pediatr') || dept.includes('vaccin') || dept.includes('child')) && spec.includes('pediatr')) return true;
    if ((dept.includes('derma') || dept.includes('skin')) && spec.includes('derma')) return true;
    if ((dept.includes('pulmon') || dept.includes('lung') || dept.includes('respirat')) && spec.includes('pulmon')) return true;
    if ((dept.includes('ent') || dept.includes('ear') || dept.includes('throat')) && spec.includes('ent')) return true;
    if ((dept.includes('dent') || dept.includes('oral')) && spec.includes('dent')) return true;
    if ((dept.includes('psych') || dept.includes('mental')) && (spec.includes('psych') || spec.includes('psycho'))) return true;
    if ((dept.includes('general') || dept.includes('opd') || dept.includes('medicine') || dept.includes('care')) && spec.includes('general')) return true;
    return false;
  });

  if (matched.length > 0) {
    return matched.map((d) => ({ id: d.id, name: d.name }));
  }

  // 2. If no direct specialization match (e.g. Oncology, ICU, Radiology), get doctor belonging to this hospital
  const hospitalDoctors = DOCTORS_DATA.filter((doc) => doc.hospital === hospitalName);
  if (hospitalDoctors.length > 0) {
    return hospitalDoctors.map((d) => ({ id: d.id, name: d.name }));
  }

  // 3. Fallback to General Physician Dr. Emily Watson
  const generalDoc = DOCTORS_DATA.find((doc) => doc.specialization === 'General Physician') || DOCTORS_DATA[0];
  return [{ id: generalDoc.id, name: generalDoc.name }];
};

/**
 * Reusable Hospital Booking form component.
 * Allows choosing visit type, hospital department, selecting a doctor from dropdown (clean, no extra details),
 * date/time slots (with past times disabled for today), and patient details.
 */
export default function HospitalBookingForm({
  hospital,
  visitTypes,
  selectedVisitType,
  selectedDepartment,
  selectedDoctorName = '',
  selectedDateIndex,
  selectedTimeSlot,
  patientName,
  patientPhone,
  visitNotes,
  currentFee,
  isProcessing,
  onSelectVisitType,
  onSelectDepartment,
  onSelectDoctorName,
  onSelectDateIndex,
  onSelectTimeSlot,
  onPatientNameChange,
  onPatientPhoneChange,
  onVisitNotesChange,
  onSubmitBooking,
}: HospitalBookingFormProps) {
  const isEmergency = selectedVisitType === 'emergency';
  const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);

  // Ensure 'Emergency' is present in the department list when emergency visit type is chosen
  const displayedDepartments = useMemo(() => {
    const list = [...(hospital.departments || [])];
    if (isEmergency) {
      if (!list.some((d) => d.toLowerCase() === 'emergency')) {
        list.unshift('Emergency');
      }
    }
    return list;
  }, [hospital.departments, isEmergency]);

  // Real doctors matching the selected department
  const availableDoctors = useMemo(() => {
    return getDepartmentDoctors(selectedDepartment, hospital?.name);
  }, [selectedDepartment, hospital?.name]);

  // Synchronize selected doctor when department changes
  useEffect(() => {
    if (!isEmergency && availableDoctors.length > 0 && onSelectDoctorName) {
      if (!availableDoctors.some((d) => d.name === selectedDoctorName)) {
        onSelectDoctorName(availableDoctors[0].name);
      }
    }
  }, [selectedDepartment, availableDoctors, isEmergency, selectedDoctorName, onSelectDoctorName]);

  // Total fee calculation (Nominal token charge without any "FREE" labels)
  const tokenFee = 15;
  const deskFee = 10;
  const nonEmergencyTotal = currentFee + tokenFee + deskFee;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      {/* 1. Select Visit Type */}
      <Text style={styles.sectionHeading}>1. Select Visit / Booking Type</Text>
      <View style={styles.visitTypesGrid}>
        {visitTypes.map((v) => {
          const isSelected = selectedVisitType === v.id;
          const isThisEmergency = v.id === 'emergency';
          return (
            <TouchableOpacity
              key={v.id}
              style={[
                styles.visitTypeCard,
                isSelected && (isThisEmergency ? styles.visitTypeEmergencySelected : styles.visitTypeCardSelected),
              ]}
              onPress={() => onSelectVisitType(v.id)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={v.icon}
                size={18}
                color={isSelected ? Colors.primary : Colors.secondary}
              />
              <Text
                style={[
                  styles.visitTypeLabel,
                  isSelected && (isThisEmergency ? styles.visitTypeEmergencyLabel : styles.visitTypeLabelSelected),
                ]}
              >
                {v.label}
              </Text>
              <View
                style={[
                  styles.visitTypeBadge,
                  isSelected && (isThisEmergency ? styles.visitTypeEmergencyBadge : styles.visitTypeBadgeSelected),
                ]}
              >
                <Text
                  style={[
                    styles.visitTypeBadgeText,
                    isSelected && (isThisEmergency ? styles.visitTypeEmergencyBadgeText : styles.visitTypeBadgeTextSelected),
                  ]}
                >
                  {v.badge}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 2. Select Department */}
      {displayedDepartments.length > 0 && (
        <View style={{ marginTop: 14 }}>
          <View style={styles.headingRow}>
            <Text style={styles.sectionHeading}>2. Select Department</Text>
            {isEmergency && (
              <View style={styles.autoSelectTag}>
                <Ionicons name="flash" size={12} color={Colors.primary} />
                <Text style={styles.autoSelectTagText}>Auto-Selected</Text>
              </View>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deptScroll}>
            {displayedDepartments.map((dept) => {
              const isSel = selectedDepartment.toLowerCase() === dept.toLowerCase();
              return (
                <TouchableOpacity
                  key={dept}
                  style={[
                    styles.deptSelectChip,
                    isSel && (isEmergency ? styles.deptSelectChipEmergency : styles.deptSelectChipActive),
                  ]}
                  onPress={() => {
                    onSelectDepartment(dept);
                    setIsDoctorDropdownOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.deptSelectText,
                      isSel && styles.deptSelectTextActive,
                    ]}
                  >
                    {dept}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* 3. Simple Doctor Dropdown (Shown for non-emergency bookings) */}
      {!isEmergency && (
        <View style={{ marginTop: 14 }}>
          <Text style={styles.sectionHeading}>3. Select Doctor</Text>

          {/* Simple Dropdown Trigger */}
          <TouchableOpacity
            style={[styles.doctorDropdownTrigger, isDoctorDropdownOpen && styles.doctorDropdownTriggerActive]}
            onPress={() => setIsDoctorDropdownOpen(!isDoctorDropdownOpen)}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <Ionicons name="person" size={18} color={Colors.primary} />
              <Text style={styles.selectedDoctorNameText}>
                {selectedDoctorName || availableDoctors[0]?.name || 'Select Doctor'}
              </Text>
            </View>
            <Ionicons
              name={isDoctorDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={Colors.secondary}
            />
          </TouchableOpacity>

          {/* Clean Dropdown Menu - Just Doctor Names */}
          {isDoctorDropdownOpen && (
            <View style={styles.doctorDropdownMenu}>
              {availableDoctors.map((doc) => {
                const isSelected = (selectedDoctorName || availableDoctors[0]?.name) === doc.name;
                return (
                  <TouchableOpacity
                    key={doc.id}
                    style={[styles.doctorOptionItem, isSelected && styles.doctorOptionItemSelected]}
                    onPress={() => {
                      if (onSelectDoctorName) onSelectDoctorName(doc.name);
                      setIsDoctorDropdownOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.doctorOptionNameText, isSelected && styles.doctorOptionNameTextSelected]}>
                      {doc.name}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={18} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* 4. Date & Time Slot Picker */}
      <View style={{ marginTop: 14 }}>
        <Text style={styles.sectionHeading}>
          {isEmergency ? '3. Select Visit Date & Time' : '4. Select Visit Date & Time'}
        </Text>
        {isEmergency ? (
          <View style={styles.emergencyAutoBox}>
            <View style={styles.emergencyBadgeRow}>
              <Ionicons name="flash" size={16} color={Colors.white} />
              <Text style={styles.emergencyBadgeText}>Emergency Priority Queue</Text>
            </View>
            <Text style={styles.emergencyAutoTitle}>Immediate Arrival (Today • Right Now)</Text>
            <Text style={styles.emergencyAutoSub}>
              Date & time slot selection is bypassed for emergency. Walk in directly at the casualty desk.
            </Text>
          </View>
        ) : (
          <SlotPicker
            selectedDateIndex={selectedDateIndex}
            onSelectDate={onSelectDateIndex}
            selectedTimeSlot={selectedTimeSlot}
            onSelectTime={onSelectTimeSlot}
            disablePastSlots={true}
          />
        )}
      </View>

      {/* 5. Patient Details Form */}
      <View style={{ marginTop: 14 }}>
        <View style={styles.headingRow}>
          <Text style={styles.sectionHeading}>
            {isEmergency ? '4. Patient Information' : '5. Patient Information'}
          </Text>
          {isEmergency && (
            <View style={styles.optionalNoticeBadge}>
              <Text style={styles.optionalNoticeText}>Optional for Emergency</Text>
            </View>
          )}
        </View>

        {isEmergency ? (
          <View style={styles.emergencyPatientNotice}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
            <Text style={styles.emergencyPatientNoticeText}>
              Name and phone typing not required. Direct priority token will be generated.
            </Text>
          </View>
        ) : null}

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>
            Patient Full Name {isEmergency ? '(Optional)' : ''}
          </Text>
          <TextInput
            style={styles.formInput}
            value={patientName}
            onChangeText={onPatientNameChange}
            placeholder={isEmergency ? 'Emergency Patient (Auto-assigned)' : 'Enter patient full name'}
            placeholderTextColor={Colors.secondary}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>
            Contact Phone Number {isEmergency ? '(Optional)' : ''}
          </Text>
          <TextInput
            style={styles.formInput}
            value={patientPhone}
            onChangeText={onPatientPhoneChange}
            placeholder={isEmergency ? '+1 (555) 019-2834 (Default)' : 'Enter phone number'}
            placeholderTextColor={Colors.secondary}
            keyboardType="phone-pad"
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Symptoms or Reason for Hospital Visit (Optional)</Text>
          <TextInput
            style={[styles.formInput, { height: 60, textAlignVertical: 'top' }]}
            value={visitNotes}
            onChangeText={onVisitNotesChange}
            placeholder={isEmergency ? 'e.g. Severe chest pain, trauma, acute breathlessness' : 'e.g. Chest discomfort, orthopedic review, second opinion'}
            placeholderTextColor={Colors.secondary}
            multiline
          />
        </View>
      </View>

      {/* Summary & Price Breakdown */}
      {isEmergency ? (
        <PriceSummary
          title="Emergency Payment Breakdown"
          items={[
            { label: 'Hospital Registration & Consultation Fee', amount: '-' },
            { label: 'Emergency Priority Token Reservation', amount: '-' },
            { label: 'Casualty & Triage Reception Desk', amount: '-' },
          ]}
          totalLabel="Total Payable"
          totalAmount="-"
        />
      ) : (
        <PriceSummary
          title="Hospital Payment Breakdown"
          items={[
            { label: 'Hospital Registration & Doctor Consultation', amount: `₹${currentFee}.00` },
            { label: 'Digital Token & Priority Queue Pass', amount: `₹${tokenFee}.00` },
            { label: 'Hospital Desk & Facility Charge', amount: `₹${deskFee}.00` },
          ]}
          totalLabel="Total Payable"
          totalAmount={`₹${nonEmergencyTotal}.00`}
        />
      )}

      {/* Book Button */}
      <TouchableOpacity
        style={[styles.primaryBookBtn, isEmergency && styles.emergencyBookBtn]}
        onPress={onSubmitBooking}
        disabled={isProcessing}
        activeOpacity={0.8}
      >
        {isProcessing ? (
          <ActivityIndicator color={Colors.white} size="small" />
        ) : (
          <Text style={styles.primaryBookBtnText}>
            {isEmergency
              ? ' Direct Book Emergency Token (-)'
              : `Confirm Hospital Token (₹${nonEmergencyTotal}.00)`}
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
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  autoSelectTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  autoSelectTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  optionalNoticeBadge: {
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  optionalNoticeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
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
  visitTypeEmergencySelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.accentLight,
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
  visitTypeEmergencyLabel: {
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
  visitTypeEmergencyBadge: {
    backgroundColor: '#CCECE5',
  },
  visitTypeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary,
  },
  visitTypeBadgeTextSelected: {
    color: Colors.primary,
  },
  visitTypeEmergencyBadgeText: {
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
  deptSelectChipEmergency: {
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
  doctorDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgPage,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  doctorDropdownTriggerActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  selectedDoctorNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
  },
  doctorDropdownMenu: {
    backgroundColor: Colors.white,
    borderWidth: 1.2,
    borderColor: Colors.primary,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  doctorOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  doctorOptionItemSelected: {
    backgroundColor: Colors.accentLight,
  },
  doctorOptionNameText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: Colors.textDark,
  },
  doctorOptionNameTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  emergencyAutoBox: {
    backgroundColor: Colors.accentLight,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#A3D9D0',
  },
  emergencyBadgeRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    marginBottom: 8,
  },
  emergencyBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  emergencyAutoTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  emergencyAutoSub: {
    fontSize: 12,
    color: Colors.textDark,
    lineHeight: 18,
  },
  emergencyPatientNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accentLight,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  emergencyPatientNoticeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    flex: 1,
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
  emergencyBookBtn: {
    backgroundColor: Colors.primary,
  },
  primaryBookBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
});

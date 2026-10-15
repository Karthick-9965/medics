import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../../constants/Colors';
import ModalHeader from '../../common/ModalHeader';
import MedicalAlertModal, { MedicalAlertType } from '../../modals/MedicalAlertModal';

export interface UserProfileData {
  name: string;
  email: string;
  phone: string;
  dob: string;
  age?: string;
  gender: string;
  bloodGroup: string;
  height?: string;
  weight?: string;
  heartRate?: string;
  calories?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  address: string;
  streetAddress?: string;
  apartment?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  addressType?: 'Home' | 'Work' | 'Other';
  allergies: string;
}

interface PersonalInfoModalProps {
  visible: boolean;
  initialData: UserProfileData;
  onClose: () => void;
  onSave: (data: UserProfileData) => void;
}

const BLOOD_GROUPS = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];
const GENDERS = ['Male', 'Female', 'Other'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function PersonalInfoModal({ visible, initialData, onClose, onSave }: PersonalInfoModalProps) {
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState<UserProfileData>(initialData);
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const [isBloodGroupDropdownOpen, setIsBloodGroupDropdownOpen] = useState(false);
  const [showDobPickerModal, setShowDobPickerModal] = useState(false);

  // Calendar picker state
  const [selectedYear, setSelectedYear] = useState(1996);
  const [selectedMonth, setSelectedMonth] = useState(4); // 0-indexed (4 = May)
  const [selectedDay, setSelectedDay] = useState(14);

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type?: MedicalAlertType;
    icon?: keyof typeof Ionicons.glyphMap;
    title: string;
    message: string;
    onPrimaryPress?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  useEffect(() => {
    setFormData(initialData);
    if (initialData.dob) {
      const parsed = new Date(initialData.dob);
      if (!isNaN(parsed.getTime())) {
        setSelectedYear(parsed.getFullYear());
        setSelectedMonth(parsed.getMonth());
        setSelectedDay(parsed.getDate());
      }
    }
  }, [initialData, visible]);

  const handleChange = (key: keyof UserProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Days in month calculation for DOB calendar
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const handleConfirmDob = () => {
    const validDay = Math.min(selectedDay, daysInMonth);
    const monthStr = MONTH_NAMES[selectedMonth].substring(0, 3);
    const dobFormatted = `${validDay} ${monthStr} ${selectedYear}`;
    handleChange('dob', dobFormatted);
    setShowDobPickerModal(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setAlertConfig({
        visible: true,
        type: 'warning',
        icon: 'alert-circle-outline',
        title: 'Validation Error',
        message: 'Please enter your full patient name before saving.',
        onPrimaryPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
      });
      return;
    }
    try {
      await AsyncStorage.setItem('@user_profile_data', JSON.stringify(formData));
      onSave(formData);
      setAlertConfig({
        visible: true,
        type: 'success',
        icon: 'checkmark-circle',
        title: 'Profile Updated',
        message: 'Personal medical information has been updated successfully.',
        onPrimaryPress: () => {
          setAlertConfig((prev) => ({ ...prev, visible: false }));
          onClose();
        },
      });
    } catch (e) {
      console.log(e);
    }
  };

  const renderField = (label: string, value: string, key: keyof UserProfileData, keyboard: any = 'default') => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={(val) => handleChange(key, val)}
        keyboardType={keyboard}
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <View style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <ModalHeader title="Personal Information" onClose={onClose} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.sectionHeader}>Basic Contact Details</Text>
            {renderField('Full Name', formData.name, 'name')}
            {renderField('Email Address', formData.email, 'email', 'email-address')}
            {renderField('Phone Number', formData.phone, 'phone', 'phone-pad')}

            <Text style={[styles.sectionHeader, { marginTop: 14 }]}>Medical Profile</Text>

            {/* Date of Birth Picker Button */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date of Birth (DOB)</Text>
              <TouchableOpacity
                style={styles.dobTrigger}
                onPress={() => setShowDobPickerModal(true)}
                activeOpacity={0.8}
              >
                <View style={styles.dobTriggerLeft}>
                  <Ionicons name="calendar" size={18} color={Colors.primary} />
                  <Text style={styles.dobValueText}>
                    {formData.dob || 'Select Date of Birth'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.secondary} />
              </TouchableOpacity>
            </View>

            {/* Gender Dropdown */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Gender</Text>
              <TouchableOpacity
                style={[styles.dropdownTrigger, isGenderDropdownOpen && styles.dropdownTriggerActive]}
                onPress={() => {
                  setIsGenderDropdownOpen(!isGenderDropdownOpen);
                  setIsBloodGroupDropdownOpen(false);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.dropdownLeft}>
                  <Ionicons name="male-female-outline" size={18} color={Colors.primary} />
                  <Text style={styles.dropdownSelectedText}>
                    {formData.gender || 'Select Gender'}
                  </Text>
                </View>
                <Ionicons
                  name={isGenderDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={Colors.secondary}
                />
              </TouchableOpacity>

              {isGenderDropdownOpen && (
                <View style={styles.dropdownMenu}>
                  {GENDERS.map((g) => {
                    const isSelected = formData.gender === g;
                    return (
                      <TouchableOpacity
                        key={g}
                        style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                        onPress={() => {
                          handleChange('gender', g);
                          setIsGenderDropdownOpen(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]}>
                          {g}
                        </Text>
                        {isSelected && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Blood Group Dropdown */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Blood Group</Text>
              <TouchableOpacity
                style={[styles.dropdownTrigger, isBloodGroupDropdownOpen && styles.dropdownTriggerActive]}
                onPress={() => {
                  setIsBloodGroupDropdownOpen(!isBloodGroupDropdownOpen);
                  setIsGenderDropdownOpen(false);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.dropdownLeft}>
                  <Ionicons name="water-outline" size={18} color={Colors.primary} />
                  <Text style={styles.dropdownSelectedText}>
                    {formData.bloodGroup || 'Select Blood Group'}
                  </Text>
                </View>
                <Ionicons
                  name={isBloodGroupDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={Colors.secondary}
                />
              </TouchableOpacity>

              {isBloodGroupDropdownOpen && (
                <View style={styles.dropdownMenu}>
                  {BLOOD_GROUPS.map((bg) => {
                    const isSelected = formData.bloodGroup === bg;
                    return (
                      <TouchableOpacity
                        key={bg}
                        style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                        onPress={() => {
                          handleChange('bloodGroup', bg);
                          setIsBloodGroupDropdownOpen(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]}>
                          {bg}
                        </Text>
                        {isSelected && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Separate Section 3: Emergency Contact (Only Name & Phone Number) */}
            <Text style={[styles.sectionHeader, { marginTop: 18 }]}>Emergency Contact Details</Text>
            <View style={styles.cardSectionBox}>
              {renderField('Contact Person Name', formData.emergencyContactName, 'emergencyContactName')}
              {renderField('Contact Phone Number', formData.emergencyContactPhone, 'emergencyContactPhone', 'phone-pad')}
            </View>

            {/* Separate Section 4: Delivery & Residential Address */}
            <Text style={[styles.sectionHeader, { marginTop: 18 }]}>Address Details</Text>
            <View style={styles.cardSectionBox}>
              {/* Flat / House No / Building */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Flat, House no., Building, Company, Apartment</Text>
                <TextInput
                  style={styles.input}
                  value={formData.apartment || ''}
                  onChangeText={(val) => {
                    handleChange('apartment', val);
                    const fullAddr = [val, formData.streetAddress, formData.city, formData.pincode].filter(Boolean).join(', ');
                    handleChange('address', fullAddr || val);
                  }}
                  placeholder="e.g. Flat 402, Green Towers"
                  placeholderTextColor={Colors.inputPlaceholder}
                />
              </View>

              {/* Area / Street / Sector */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Area, Street, Sector, Village</Text>
                <TextInput
                  style={styles.input}
                  value={formData.streetAddress || ''}
                  onChangeText={(val) => {
                    handleChange('streetAddress', val);
                    const fullAddr = [formData.apartment, val, formData.city, formData.pincode].filter(Boolean).join(', ');
                    handleChange('address', fullAddr || val);
                  }}
                  placeholder="e.g. 742 Evergreen Terrace, Medical District"
                  placeholderTextColor={Colors.inputPlaceholder}
                />
              </View>

              {/* Landmark */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Landmark</Text>
                <TextInput
                  style={styles.input}
                  value={formData.landmark || ''}
                  onChangeText={(val) => handleChange('landmark', val)}
                  placeholder="e.g. Near Apollo Pharmacy / City Park Gate"
                  placeholderTextColor={Colors.inputPlaceholder}
                />
              </View>

              {/* Town / City & State */}
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Town / City</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.city || ''}
                    onChangeText={(val) => {
                      handleChange('city', val);
                      const fullAddr = [formData.apartment, formData.streetAddress, val, formData.pincode].filter(Boolean).join(', ');
                      handleChange('address', fullAddr || val);
                    }}
                    placeholder="e.g. Chennai"
                    placeholderTextColor={Colors.inputPlaceholder}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>State</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.state || ''}
                    onChangeText={(val) => handleChange('state', val)}
                    placeholder="e.g. Tamil Nadu"
                    placeholderTextColor={Colors.inputPlaceholder}
                  />
                </View>
              </View>

              {/* 6 digits PIN Code */}
              <View style={[styles.formGroup, { marginTop: 10 }]}>
                <Text style={styles.label}>6-digit Pincode</Text>
                <TextInput
                  style={styles.input}
                  value={formData.pincode || ''}
                  onChangeText={(val) => {
                    handleChange('pincode', val);
                    const fullAddr = [formData.apartment, formData.streetAddress, formData.city, val].filter(Boolean).join(', ');
                    handleChange('address', fullAddr || val);
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="e.g. 600028"
                  placeholderTextColor={Colors.inputPlaceholder}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>Save Information</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* DOB Calendar Picker Modal */}
      <Modal
        visible={showDobPickerModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDobPickerModal(false)}
      >
        <View style={styles.calendarOverlay}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="calendar" size={20} color={Colors.primary} />
                <Text style={styles.calendarTitle}>Select Date of Birth</Text>
              </View>
              <TouchableOpacity onPress={() => setShowDobPickerModal(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={22} color={Colors.secondary} />
              </TouchableOpacity>
            </View>

            {/* Year & Month Selectors */}
            <View style={styles.calNavRow}>
              {/* Month Selector */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calPillsScroll}>
                {MONTH_NAMES.map((m, idx) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.calPill, selectedMonth === idx && styles.calPillActive]}
                    onPress={() => setSelectedMonth(idx)}
                  >
                    <Text style={[styles.calPillText, selectedMonth === idx && styles.calPillTextActive]}>
                      {m.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Year Selector Row */}
            <View style={styles.calYearRow}>
              <TouchableOpacity
                style={styles.calYearBtn}
                onPress={() => setSelectedYear((y) => Math.max(1940, y - 1))}
              >
                <Ionicons name="chevron-back" size={18} color={Colors.primary} />
              </TouchableOpacity>
              <Text style={styles.calYearText}>{selectedYear}</Text>
              <TouchableOpacity
                style={styles.calYearBtn}
                onPress={() => setSelectedYear((y) => Math.min(new Date().getFullYear(), y + 1))}
              >
                <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Days Grid */}
            <Text style={styles.calDaysHeading}>Day of Month</Text>
            <ScrollView style={{ maxHeight: 180 }} contentContainerStyle={styles.daysGrid}>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const isSelected = selectedDay === day;
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayCell, isSelected && styles.dayCellActive]}
                    onPress={() => setSelectedDay(day)}
                  >
                    <Text style={[styles.dayCellText, isSelected && styles.dayCellTextActive]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.calendarActions}>
              <TouchableOpacity
                style={styles.calCancelBtn}
                onPress={() => setShowDobPickerModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.calCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.calConfirmBtn}
                onPress={handleConfirmDob}
                activeOpacity={0.8}
              >
                <Text style={styles.calConfirmText}>Set DOB</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Project Themed Medical Alert Modal */}
      <MedicalAlertModal
        visible={alertConfig.visible}
        type={alertConfig.type}
        icon={alertConfig.icon}
        title={alertConfig.title}
        message={alertConfig.message}
        onPrimaryPress={() => {
          if (alertConfig.onPrimaryPress) {
            alertConfig.onPrimaryPress();
          } else {
            setAlertConfig((prev) => ({ ...prev, visible: false }));
          }
        }}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.modalOverlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  scrollContent: {
    padding: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 5,
  },
  input: {
    backgroundColor: Colors.bgLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: Colors.textDark,
  },
  dobTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 44,
  },
  dobTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dobValueText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 44,
  },
  dropdownTriggerActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownSelectedText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
  },
  dropdownMenu: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dropdownItemSelected: {
    backgroundColor: Colors.accentLight,
  },
  dropdownItemText: {
    fontSize: 13,
    color: Colors.textDark,
    fontWeight: '500',
  },
  dropdownItemTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  cardSectionBox: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  // Calendar Modal Styles
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
  },
  calNavRow: {
    marginBottom: 10,
  },
  calPillsScroll: {
    flexDirection: 'row',
    gap: 6,
  },
  calPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  calPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  calPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
  },
  calPillTextActive: {
    color: Colors.white,
  },
  calYearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginVertical: 10,
  },
  calYearBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calYearText: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
  },
  calDaysHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 8,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellActive: {
    backgroundColor: Colors.primary,
  },
  dayCellText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
  },
  dayCellTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  calendarActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  calCancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
  },
  calConfirmBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calConfirmText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
});

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../../constants/Colors';
import ModalHeader from '../../common/ModalHeader';

export interface UserProfileData {
  name: string;
  email: string;
  phone: string;
  dob: string;
  age: string;
  gender: string;
  bloodGroup: string;
  height: string;
  weight: string;
  heartRate: string;
  calories: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  address: string;
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

export default function PersonalInfoModal({ visible, initialData, onClose, onSave }: PersonalInfoModalProps) {
  const [formData, setFormData] = useState<UserProfileData>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData, visible]);

  const handleChange = (key: keyof UserProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation', 'Please enter your name.');
      return;
    }
    try {
      await AsyncStorage.setItem('@user_profile_data', JSON.stringify(formData));
      onSave(formData);
      Alert.alert('Profile Saved', 'Personal medical information updated successfully.');
      onClose();
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
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <View style={styles.modalCard}>
          <ModalHeader title="Personal Information" onClose={onClose} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionHeader}>Basic Contact Details</Text>
            {renderField('Full Name', formData.name, 'name')}
            {renderField('Email Address', formData.email, 'email', 'email-address')}
            {renderField('Phone Number', formData.phone, 'phone', 'phone-pad')}

            <Text style={[styles.sectionHeader, { marginTop: 14 }]}>Medical Metrics</Text>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>{renderField('Age', formData.age, 'age', 'number-pad')}</View>
              <View style={{ flex: 1 }}>{renderField('Weight', formData.weight, 'weight')}</View>
              <View style={{ flex: 1 }}>{renderField('Height', formData.height, 'height')}</View>
            </View>

            <Text style={styles.label}>Gender</Text>
            <View style={styles.chipRow}>
              {GENDERS.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.chip, formData.gender === g && styles.chipSelected]}
                  onPress={() => handleChange('gender', g)}
                >
                  <Text style={[styles.chipText, formData.gender === g && styles.chipTextSelected]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 10 }]}>Blood Group</Text>
            <View style={styles.chipRow}>
              {BLOOD_GROUPS.map((bg) => (
                <TouchableOpacity
                  key={bg}
                  style={[styles.chip, formData.bloodGroup === bg && styles.chipSelected]}
                  onPress={() => handleChange('bloodGroup', bg)}
                >
                  <Text style={[styles.chipText, formData.bloodGroup === bg && styles.chipTextSelected]}>{bg}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionHeader, { marginTop: 14 }]}>Emergency Contact & Address</Text>
            {renderField('Emergency Contact Name', formData.emergencyContactName, 'emergencyContactName')}
            {renderField('Emergency Phone Number', formData.emergencyContactPhone, 'emergencyContactPhone', 'phone-pad')}
            {renderField('Residential Address', formData.address, 'address')}
            {renderField('Known Allergies', formData.allergies, 'allergies')}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>Save Information</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
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
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: Colors.textDark,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: Colors.white,
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
});

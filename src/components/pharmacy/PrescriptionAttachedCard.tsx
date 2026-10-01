import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export interface PrescriptionAttachedCardProps {
  prescriptionUri: string;
  prescriptionNote: string;
  selectedDuration: string;
  requestCall: boolean;
  pharmacyName: string;
  courseDurations: string[];
  onScanCamera: () => void;
  onUploadGallery: () => void;
  onRemovePrescription: () => void;
  onDurationChange: (duration: string) => void;
  onNoteChange: (note: string) => void;
  onRequestCallToggle: () => void;
  onProceedToCheckout: () => void;
}

/**
 * Preview Card & Ordering Form for attached prescription sheets.
 */
export default function PrescriptionAttachedCard({
  prescriptionUri,
  prescriptionNote,
  selectedDuration,
  requestCall,
  pharmacyName,
  courseDurations,
  onScanCamera,
  onUploadGallery,
  onRemovePrescription,
  onDurationChange,
  onNoteChange,
  onRequestCallToggle,
  onProceedToCheckout,
}: PrescriptionAttachedCardProps) {
  const isPdf = prescriptionUri.toLowerCase().includes('.pdf');

  return (
    <View style={styles.card}>
      {/* Header with status badge & remove */}
      <View style={styles.header}>
        <View style={styles.statusBadge}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.successGreen} />
          <Text style={styles.statusBadgeText}>
            {isPdf ? 'Prescription PDF Attached' : 'Medicine Sheet Attached'}
          </Text>
        </View>
        <TouchableOpacity onPress={onRemovePrescription} style={styles.removeBtn} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={16} color={Colors.error} />
          <Text style={styles.removeBtnText}>Remove</Text>
        </TouchableOpacity>
      </View>

      {/* Image or PDF Preview with Retake / Change overlays */}
      <View style={styles.imagePreviewWrapper}>
        {isPdf ? (
          <View style={styles.pdfPlaceholder}>
            <Ionicons name="document-text" size={48} color={Colors.primary} />
            <Text style={styles.pdfTitle}>Medical Prescription Document</Text>
            <Text style={styles.pdfSub} numberOfLines={1}>
              {prescriptionUri.split('/').pop() || 'prescription.pdf'}
            </Text>
          </View>
        ) : (
          <Image source={{ uri: prescriptionUri }} style={styles.previewImage} resizeMode="cover" />
        )}
        <View style={styles.imageOverlayButtons}>
          <TouchableOpacity style={styles.retakeBtn} onPress={onScanCamera} activeOpacity={0.8}>
            <Ionicons name="camera" size={14} color={Colors.white} />
            <Text style={styles.retakeText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.changeBtn} onPress={onUploadGallery} activeOpacity={0.8}>
            <Ionicons name="images" size={14} color={Colors.primary} />
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Course Duration Pills */}
      <View style={styles.formSection}>
        <Text style={styles.fieldLabel}>Course Duration Needed</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.durationRow}>
          {courseDurations.map((dur) => (
            <TouchableOpacity
              key={dur}
              style={[styles.durationChip, selectedDuration === dur && styles.durationChipSelected]}
              onPress={() => onDurationChange(dur)}
              activeOpacity={0.7}
            >
              <Text style={[styles.durationText, selectedDuration === dur && styles.durationTextSelected]}>
                {dur}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Doctor Instructions or Notes */}
      <View style={styles.formSection}>
        <Text style={styles.fieldLabel}>Doctor Instructions or Patient Notes (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="e.g. Need 2 strips Paracetamol 500mg, 1 syrup. Send generic substitute if available."
          placeholderTextColor={Colors.inputPlaceholder}
          value={prescriptionNote}
          onChangeText={onNoteChange}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Pharmacist Call Verification Checkbox */}
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={onRequestCallToggle}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, requestCall && styles.checkboxChecked]}>
          {requestCall && <Ionicons name="checkmark" size={14} color={Colors.white} />}
        </View>
        <Text style={styles.checkboxLabel}>
          Ask {pharmacyName} pharmacist to call me before dispatch to confirm medicines & price.
        </Text>
      </TouchableOpacity>

      {/* Proceed Button */}
      <TouchableOpacity
        style={styles.orderBtn}
        onPress={onProceedToCheckout}
        activeOpacity={0.8}
      >
        <Text style={styles.orderBtnText}>Proceed to Checkout</Text>
        <Ionicons name="arrow-forward" size={18} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successBgLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.successDark,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  removeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.error,
  },
  imagePreviewWrapper: {
    position: 'relative',
    height: 190,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.bgLight,
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  pdfPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentLight,
    padding: 20,
    gap: 6,
  },
  pdfTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
  },
  pdfSub: {
    fontSize: 12,
    color: Colors.secondary,
    textAlign: 'center',
  },
  imageOverlayButtons: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    gap: 8,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  retakeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  changeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  formSection: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
  },
  durationRow: {
    gap: 8,
  },
  durationChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
  },
  durationChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.accentLight,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
  },
  durationTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: Colors.textDark,
    backgroundColor: Colors.bgLight,
    textAlignVertical: 'top',
    height: 72,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 18,
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.borderMedium,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    color: Colors.secondary,
    lineHeight: 17,
  },
  orderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  orderBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});

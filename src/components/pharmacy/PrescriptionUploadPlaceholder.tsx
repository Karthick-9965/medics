import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export interface PrescriptionUploadPlaceholderProps {
  pharmacyName: string;
  onScanCamera: () => void;
  onUploadGallery: () => void;
  onUploadDocument?: () => void;
}

/**
 * Upload Card.
 * Shown when no prescription image has been attached yet.
 */
export default function PrescriptionUploadPlaceholder({
  pharmacyName,
  onScanCamera,
  onUploadGallery,
  onUploadDocument,
}: PrescriptionUploadPlaceholderProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Ionicons name="document-text" size={36} color={Colors.primary} />
      </View>
      <Text style={styles.title}>Scan or Upload Medicine Sheet / Tablet</Text>
      <Text style={styles.subtitle}>
        Take a photo of your doctor's prescription sheet, tablet strip, or upload a PDF document to order directly from {pharmacyName}.
      </Text>

      {/* Primary Action Buttons */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={styles.cameraActionBtn}
          onPress={onScanCamera}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={20} color={Colors.white} />
          <Text style={styles.cameraActionText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.galleryActionBtn}
          onPress={onUploadGallery}
          activeOpacity={0.8}
        >
          <Ionicons name="images-outline" size={20} color={Colors.primary} />
          <Text style={styles.galleryActionText}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {onUploadDocument && (
        <TouchableOpacity
          style={styles.documentActionBtn}
          onPress={onUploadDocument}
          activeOpacity={0.8}
        >
          <Ionicons name="document-text-outline" size={18} color={Colors.primary} />
          <Text style={styles.documentActionText}>Upload Document / PDF File</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgPage,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12.5,
    color: Colors.secondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cameraActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
  },
  cameraActionText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  galleryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
  },
  galleryActionText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  documentActionBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentLight,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    marginTop: 10,
  },
  documentActionText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
});

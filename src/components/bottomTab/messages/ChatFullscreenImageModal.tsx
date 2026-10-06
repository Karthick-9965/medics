import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';

export interface ChatFullscreenImageModalProps {
  uri: string | null;
  doctorName?: string;
  onClose: () => void;
}

/**
 * Reusable Fullscreen Viewer Overlay for prescription images or documents in chat.
 */
export default function ChatFullscreenImageModal({
  uri,
  doctorName,
  onClose,
}: ChatFullscreenImageModalProps) {
  if (!uri) return null;

  const isPdf = uri.toLowerCase().includes('.pdf');
  const filename = uri.split('/').pop() || 'Prescription Document';

  return (
    <View style={styles.overlay}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {isPdf ? 'Prescription Document' : 'Prescription Sheet'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Content Body */}
        {isPdf ? (
          <View style={styles.pdfCenterWrap}>
            <View style={styles.pdfCard}>
              <Ionicons name="document-text" size={64} color={Colors.primary} />
              <Text style={styles.pdfName} numberOfLines={2}>
                {filename}
              </Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.successGreen} />
                <Text style={styles.verifiedBadgeText}>HIPAA Verified Medical Record</Text>
              </View>
              {doctorName && (
                <Text style={styles.doctorNote}>
                  Uploaded for consultation with {doctorName}.
                </Text>
              )}
            </View>
          </View>
        ) : (
          <Image source={{ uri }} style={styles.fullImage} resizeMode="contain" />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.modalOverlayHeavy,
    zIndex: 2000,
    elevation: 20,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  closeBtn: {
    padding: 6,
  },
  fullImage: {
    flex: 1,
    width: '100%',
  },
  pdfCenterWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  pdfCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  pdfName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: 12,
    textAlign: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.cardBgSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 6,
  },
  verifiedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
  },
  doctorNote: {
    fontSize: 12,
    color: Colors.secondary,
    textAlign: 'center',
    marginTop: 6,
  },
});

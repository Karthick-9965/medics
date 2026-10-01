import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';

export interface ChatAttachmentModalProps {
  visible: boolean;
  onPickCamera: () => void;
  onPickGallery: () => void;
  onPickDocument?: () => void;
  onClose: () => void;
}

/**
 * Bottom Sheet Modal for selecting prescription attachment source (Camera, Gallery, Document).
 */
export default function ChatAttachmentModal({
  visible,
  onPickCamera,
  onPickGallery,
  onPickDocument,
  onClose,
}: ChatAttachmentModalProps) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.uploadModalCard, { paddingBottom: Math.max(insets.bottom, 24) }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.uploadModalHeader}>
            <View style={styles.uploadModalIcon}>
              <Ionicons name="document-text" size={26} color={Colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.uploadModalTitle}>Upload Prescription</Text>
              <Text style={styles.uploadModalSubtitle}>Share your doctor's Rx sheet, tablet photo or PDF</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeUploadBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={Colors.secondary} />
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.uploadActionsRow}>
            <TouchableOpacity
              style={styles.uploadActionItem}
              onPress={onPickCamera}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: Colors.primary }]}>
                <Ionicons name="camera" size={20} color={Colors.white} />
              </View>
              <Text style={styles.actionItemText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadActionItem}
              onPress={onPickGallery}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: Colors.accentLight }]}>
                <Ionicons name="images" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.actionItemText}>Gallery</Text>
            </TouchableOpacity>

            {onPickDocument && (
              <TouchableOpacity
                style={styles.uploadActionItem}
                onPress={onPickDocument}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIconCircle, { backgroundColor: Colors.accentLight }]}>
                  <Ionicons name="document-text" size={20} color={Colors.primary} />
                </View>
                <Text style={styles.actionItemText}>PDF / File</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.modalOverlay,
    justifyContent: 'flex-end',
  },
  uploadModalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 34,
  },
  uploadModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadModalIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.black,
  },
  uploadModalSubtitle: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
  },
  closeUploadBtn: {
    padding: 6,
  },
  uploadActionsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  uploadActionItem: {
    flex: 1,
    backgroundColor: Colors.bgPage,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionItemText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
  },
});

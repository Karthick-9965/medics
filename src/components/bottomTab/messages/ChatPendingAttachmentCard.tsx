import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';

export interface PendingSendItem {
  uri: string;
  name: string;
  isPdf: boolean;
}

export interface ChatPendingAttachmentCardProps {
  item: PendingSendItem;
  doctorName: string;
  note: string;
  onNoteChange: (note: string) => void;
  onSend: () => void;
  onCancel: () => void;
}

/**
 * Reusable Confirmation & Note Overlay Card for captured/selected prescription attachments.
 * Allows the patient to inspect the image/PDF, type a medical instruction note, and dispatch.
 */
export default function ChatPendingAttachmentCard({
  item,
  doctorName,
  note,
  onNoteChange,
  onSend,
  onCancel,
}: ChatPendingAttachmentCardProps) {
  const cleanDoctorName = doctorName.replace(/^Dr\.\s*/, '');

  return (
    <View style={styles.overlay}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardWrap}
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="document-attach" size={20} color={Colors.primary} />
            </View>
            <View style={styles.titleWrap}>
              <Text style={styles.title}>Send Prescription</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                to Dr. {cleanDoctorName}
              </Text>
            </View>
            <TouchableOpacity onPress={onCancel} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={Colors.secondary} />
            </TouchableOpacity>
          </View>

          {/* Media Preview (Photo or PDF Card) */}
          <View style={styles.mediaWrap}>
            {item.isPdf ? (
              <View style={styles.pdfBox}>
                <Ionicons name="document-text" size={44} color={Colors.primary} />
                <Text style={styles.pdfTitle} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.pdfBadge}>
                  <Ionicons name="shield-checkmark" size={12} color={Colors.successGreen} />
                  <Text style={styles.pdfBadgeText}>Medical PDF Document</Text>
                </View>
              </View>
            ) : (
              <Image source={{ uri: item.uri }} style={styles.previewImage} resizeMode="cover" />
            )}
          </View>

          {/* Note Input */}
          <View style={styles.noteBox}>
            <Text style={styles.noteLabel}>Add Note for Doctor (Optional)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="e.g. Please review my medicines dosage and verify..."
              placeholderTextColor={Colors.secondary}
              value={note}
              onChangeText={onNoteChange}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Action Buttons: Send & Cancel */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={onSend}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={16} color={Colors.white} />
              <Text style={styles.submitText}>Send Prescription</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Keep in Chat Input</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.modalOverlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    elevation: 20,
    padding: 16,
  },
  keyboardWrap: {
    width: '100%',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    width: '100%',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  mediaWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    backgroundColor: Colors.bgLight,
  },
  previewImage: {
    width: '100%',
    height: 180,
  },
  pdfBox: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: Colors.accentLight,
  },
  pdfTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: 8,
    textAlign: 'center',
  },
  pdfBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  pdfBadgeText: {
    fontSize: 11,
    color: Colors.successDark,
    fontWeight: '700',
  },
  noteBox: {
    marginBottom: 14,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 6,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.textDark,
    backgroundColor: Colors.bgLight,
    height: 52,
    textAlignVertical: 'top',
  },
  actionsRow: {
    gap: 8,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  submitText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.bgLight,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondary,
  },
});

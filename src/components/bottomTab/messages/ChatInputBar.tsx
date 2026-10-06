import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';

export interface ChatInputBarProps {
  inputText: string;
  attachedImage: string | null;
  attachedName: string;
  onInputChange: (text: string) => void;
  onOpenAttachment: () => void;
  onRemoveAttachment: () => void;
  onSend: () => void;
}

/**
 * Reusable Chat Input Bar with prescription attachment button and attachment preview.
 */
export default function ChatInputBar({
  inputText,
  attachedImage,
  attachedName,
  onInputChange,
  onOpenAttachment,
  onRemoveAttachment,
  onSend,
}: ChatInputBarProps) {
  const canSend = inputText.trim().length > 0 || !!attachedImage;
  const isPdf =
    (attachedName || '').toLowerCase().endsWith('.pdf') ||
    (attachedImage || '').toLowerCase().endsWith('.pdf') ||
    (attachedImage || '').toLowerCase().includes('.pdf');

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Attached Prescription Preview Banner */}
      {attachedImage && (
        <View style={styles.attachedPreviewBar}>
          {isPdf ? (
            <View style={styles.attachedPdfThumb}>
              <Ionicons name="document-text" size={22} color={Colors.error} />
              <View style={styles.attachedPdfBadge}>
                <Text style={styles.attachedPdfBadgeText}>PDF</Text>
              </View>
            </View>
          ) : (
            <Image
              source={{ uri: attachedImage }}
              style={styles.attachedThumb}
              resizeMode="cover"
            />
          )}

          <View style={{ flex: 1, marginLeft: 10 }}>
            <View style={styles.attachedBadge}>
              <Ionicons name="shield-checkmark" size={12} color={Colors.successGreen} />
              <Text style={styles.attachedBadgeText}>
                {isPdf ? 'Document Attached' : 'Prescription Photo'}
              </Text>
            </View>
            <Text style={styles.attachedFileName} numberOfLines={1}>
              {attachedName || (isPdf ? 'Prescription Document.pdf' : 'Prescription Image')}
            </Text>
          </View>

          {/* Remove attachment button */}
          <TouchableOpacity
            onPress={onRemoveAttachment}
            style={styles.removeAttachedBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle" size={22} color={Colors.secondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Main Input Row */}
      <View style={styles.inputBar}>
        <TouchableOpacity
          style={styles.attachBtn}
          onPress={onOpenAttachment}
          activeOpacity={0.7}
        >
          <Ionicons name="document-attach" size={22} color={Colors.primary} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={onInputChange}
          placeholder={attachedImage ? 'Add a note for the doctor (optional)...' : 'Type your message...'}
          placeholderTextColor={Colors.secondary}
        />

        <TouchableOpacity
          style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
          onPress={onSend}
          disabled={!canSend}
          activeOpacity={0.8}
        >
          <Ionicons name="send" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  attachedPreviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBgSecondary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  attachedThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: Colors.borderLight,
  },
  attachedPdfThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: Colors.redBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dangerBorderTint,
  },
  attachedPdfBadge: {
    position: 'absolute',
    bottom: 2,
    backgroundColor: Colors.error,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  attachedPdfBadgeText: {
    color: Colors.white,
    fontSize: 7.5,
    fontWeight: '800',
  },
  attachedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attachedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.successDark,
  },
  attachedFileName: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textDark,
    marginTop: 2,
  },
  removeAttachedBtn: {
    padding: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.bgPage,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.black,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.borderMedium,
  },
});

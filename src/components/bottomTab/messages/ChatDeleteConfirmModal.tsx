import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';

export interface ChatDeleteConfirmModalProps {
  messageText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Reusable Confirmation Card for deleting an incorrect/unwanted chat message.
 * Displays preview snippet of the message and provides destructive confirmation.
 */
export default function ChatDeleteConfirmModal({
  messageText,
  onConfirm,
  onCancel,
}: ChatDeleteConfirmModalProps) {
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="trash-outline" size={26} color={Colors.error} />
        </View>

        <Text style={styles.title}>Delete Message?</Text>
        <Text style={styles.subtitle}>
          Are you sure you want to delete this message? It will be removed from your chat conversation.
        </Text>

        {/* Message preview snippet */}
        <View style={styles.snippetBox}>
          <Text style={styles.snippetText} numberOfLines={2}>
            "{messageText}"
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={onConfirm}
            activeOpacity={0.8}
          >
            <Ionicons name="trash" size={16} color={Colors.white} />
            <Text style={styles.confirmText}>Delete Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    padding: 24,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 22,
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.dangerBgTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.secondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  snippetBox: {
    backgroundColor: Colors.bgLight,
    padding: 12,
    borderRadius: 12,
    width: '100%',
    marginBottom: 18,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  snippetText: {
    fontSize: 12.5,
    color: Colors.textDark,
    fontStyle: 'italic',
  },
  actions: {
    width: '100%',
    gap: 10,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.error,
    paddingVertical: 12,
    borderRadius: 12,
  },
  confirmText: {
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

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import Button from './Button';

interface LogoutModalProps {
  visible: boolean;
  onConfirmLogout: () => void;
  onCancel: () => void;
}

export default function LogoutModal({
  visible,
  onConfirmLogout,
  onCancel,
}: LogoutModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Top Logout Icon Circle */}
          <View style={styles.iconCircle}>
            <Ionicons name="log-out-outline" size={36} color={Colors.primary} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Are you sure to log out of your account?</Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="Log Out"
              onPress={onConfirmLogout}
            />

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 59, 50, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
    textAlign: 'center',
    lineHeight: 25,
    marginBottom: 26,
    paddingHorizontal: 12,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
});

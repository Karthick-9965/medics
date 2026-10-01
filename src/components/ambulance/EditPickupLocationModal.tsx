import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Colors } from '../../constants/Colors';
import ModalHeader from '../common/ModalHeader';

export interface EditPickupLocationModalProps {
  visible: boolean;
  pickupAddress: string;
  landmark: string;
  onAddressChange: (address: string) => void;
  onLandmarkChange: (landmark: string) => void;
  onClose: () => void;
  onSave: () => void;
}

/**
 * Reusable modal for editing emergency pickup address and landmark.
 */
export default function EditPickupLocationModal({
  visible,
  pickupAddress,
  landmark,
  onAddressChange,
  onLandmarkChange,
  onClose,
  onSave,
}: EditPickupLocationModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <ModalHeader title="Edit Pickup Address" onClose={onClose} />
          <View style={styles.content}>
            <Text style={styles.inputLabel}>Full Street Address</Text>
            <TextInput
              style={styles.input}
              value={pickupAddress}
              onChangeText={onAddressChange}
              placeholder="Enter complete street address"
            />

            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Nearby Landmark</Text>
            <TextInput
              style={styles.input}
              value={landmark}
              onChangeText={onLandmarkChange}
              placeholder="e.g. Near Central Park Gate 2"
            />

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={onSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>Save Location</Text>
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
    backgroundColor: Colors.modalOverlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
  },
  content: {
    padding: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.black,
    backgroundColor: Colors.bgPage,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});

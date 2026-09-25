import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../../constants/Colors';
import ModalHeader from '../../common/ModalHeader';

interface ProfilePhotoModalProps {
  visible: boolean;
  avatarUri: string | null;
  userName?: string;
  userEmail?: string;
  onAvatarPicked: (uri: string | null) => void;
  onClose: () => void;
}

export default function ProfilePhotoModal({
  visible,
  avatarUri,
  userName = 'Sathish Kumar',
  userEmail = 'sathish.kumar@telemed.com',
  onAvatarPicked,
  onClose,
}: ProfilePhotoModalProps) {
  const handleGallery = async () => {
    try {
      const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!res.granted) {
        Alert.alert('Permission', 'Gallery permission required.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        onAvatarPicked(result.assets[0].uri);
        onClose();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleCamera = async () => {
    try {
      const res = await ImagePicker.requestCameraPermissionsAsync();
      if (!res.granted) {
        Alert.alert('Permission', 'Camera permission required.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        onAvatarPicked(result.assets[0].uri);
        onClose();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleRemove = () => {
    onAvatarPicked(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Drag Indicator */}
          <View style={styles.indicatorWrap}>
            <View style={styles.indicator} />
          </View>

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.headerIconCircle}>
                <Ionicons name="camera" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.sheetTitle}>Profile Photo</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={Colors.secondary} />
            </TouchableOpacity>
          </View>

          {/* Current Avatar Preview */}
          <View style={styles.previewSection}>
            <View style={styles.avatarWrapper}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarCircle}>
                  <Ionicons name="person" size={36} color={Colors.primary} />
                </View>
              )}
            </View>
            {userName ? <Text style={styles.previewName}>{userName}</Text> : null}
            {userEmail ? <Text style={styles.previewEmail}>{userEmail}</Text> : null}
          </View>

          {/* Action Options List */}
          <View style={styles.optionsList}>
            {/* 1. Choose from Gallery */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleGallery}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIconCircle, { backgroundColor: Colors.accentLight }]}>
                <Ionicons name="images-outline" size={22} color={Colors.primary} />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>Choose from Gallery</Text>
                <Text style={styles.optionSubtitle}>Select a photo from your device library</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.secondary} />
            </TouchableOpacity>

            {/* 2. Take Photo */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleCamera}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIconCircle, { backgroundColor: '#EBF3FF' }]}>
                <Ionicons name="camera-outline" size={22} color="#2F80ED" />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>Take Photo</Text>
                <Text style={styles.optionSubtitle}>Use camera to capture a new picture</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.secondary} />
            </TouchableOpacity>

            {/* 3. Remove Photo (if photo exists) */}
            {avatarUri && (
              <TouchableOpacity
                style={[styles.optionCard, styles.removeOptionCard]}
                onPress={handleRemove}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIconCircle, { backgroundColor: Colors.redBg || '#FFF5F5' }]}>
                  <Ionicons name="trash-outline" size={20} color={Colors.logoutRed || '#E53E3E'} />
                </View>
                <View style={styles.optionTextWrap}>
                  <Text style={[styles.optionTitle, { color: Colors.logoutRed || '#E53E3E' }]}>
                    Remove Current Photo
                  </Text>
                  <Text style={styles.optionSubtitle}>Reset to default profile avatar</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.logoutRed || '#E53E3E'} />
              </TouchableOpacity>
            )}
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 59, 50, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  indicatorWrap: {
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 6,
  },
  indicator: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dividerLine || Colors.border,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
  },
  closeButton: {
    padding: 6,
  },
  previewSection: {
    alignItems: 'center',
    marginVertical: 12,
  },
  avatarWrapper: {
    marginBottom: 8,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: Colors.border,
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2.5,
    borderColor: Colors.primary,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 2,
  },
  previewEmail: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '500',
  },
  optionsList: {
    gap: 10,
    marginVertical: 14,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  removeOptionCard: {
    borderColor: '#FFD7D7',
    backgroundColor: '#FFF8F8',
    borderWidth: 1,
  },
  optionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionTextWrap: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 3,
  },
  optionSubtitle: {
    fontSize: 12,
    color: Colors.secondary,
  },
  cancelButton: {
    marginTop: 6,
    backgroundColor: Colors.bgLight,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
  },
});

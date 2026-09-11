import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/Colors';
import Button from '../Button';

interface HomeProfileModalProps {
  visible: boolean;
  userName: string;
  userEmail: string;
  avatarUri: string | null;
  onAvatarPicked: (uri: string | null) => void;
  onViewFullProfile: () => void;
  onLogoutPress: () => void;
  onClose: () => void;
}

export default function HomeProfileModal({
  visible,
  userName,
  userEmail,
  avatarUri,
  onAvatarPicked,
  onViewFullProfile,
  onLogoutPress,
  onClose,
}: HomeProfileModalProps) {
  const handlePickFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo gallery to select a profile picture.'
        );
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
      }
    } catch (e) {
      console.error('Error picking image from gallery', e);
      Alert.alert('Error', 'Failed to pick image from gallery. Please try again.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow camera access to take a profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onAvatarPicked(result.assets[0].uri);
      }
    } catch (e) {
      console.error('Error taking photo', e);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <Text style={styles.sheetTitle}>Account Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={Colors.textDark} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Active User Avatar & Info */}
            <View style={styles.userInfoSection}>
              <View style={styles.avatarWrapper}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.mainAvatarImage} />
                ) : (
                  <View style={styles.mainAvatarCircle}>
                    <Ionicons name="person" size={44} color={Colors.primary} />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.cameraBadge}
                  onPress={handlePickFromGallery}
                  activeOpacity={0.8}
                >
                  <Ionicons name="camera" size={16} color={Colors.white} />
                </TouchableOpacity>
              </View>

              <Text style={styles.userNameText}>{userName || 'User'}</Text>

              <View style={styles.emailRow}>
                <Ionicons name="mail-outline" size={15} color={Colors.secondary} />
                <Text style={styles.userEmailText}>{userEmail || 'user@example.com'}</Text>
              </View>

              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active Account</Text>
              </View>
            </View>

            {/* Gallery / Photo Upload Options */}
            <View style={styles.photoActionsBox}>
              <Text style={styles.sectionLabel}>Profile Photo</Text>
              
              <View style={styles.photoButtonsRow}>
                <TouchableOpacity
                  style={styles.photoOptionButton}
                  onPress={handlePickFromGallery}
                  activeOpacity={0.7}
                >
                  <View style={[styles.photoIconCircle, { backgroundColor: Colors.accentLight }]}>
                    <Ionicons name="images" size={22} color={Colors.primary} />
                  </View>
                  <Text style={styles.photoOptionTitle}>Choose from Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.photoOptionButton}
                  onPress={handleTakePhoto}
                  activeOpacity={0.7}
                >
                  <View style={[styles.photoIconCircle, { backgroundColor: '#EBF3FF' }]}>
                    <Ionicons name="camera" size={22} color="#2F80ED" />
                  </View>
                  <Text style={styles.photoOptionTitle}>Take Photo</Text>
                </TouchableOpacity>
              </View>

              {avatarUri && (
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => onAvatarPicked(null)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={16} color={Colors.error} />
                  <Text style={styles.removePhotoText}>Remove Photo</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <Button
                title="View Full Profile"
                onPress={() => {
                  onClose();
                  onViewFullProfile();
                }}
              />

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => {
                  onClose();
                  onLogoutPress();
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="log-out-outline" size={20} color={Colors.logoutRed} />
                <Text style={styles.logoutButtonText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 34,
    maxHeight: '88%',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
  },
  closeButton: {
    padding: 6,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  userInfoSection: {
    alignItems: 'center',
    marginBottom: 18,
    width: '100%',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  mainAvatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.border,
  },
  mainAvatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: Colors.white,
  },
  userNameText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 4,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  userEmailText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  photoActionsBox: {
    width: '100%',
    backgroundColor: Colors.bgLight,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 12,
  },
  photoButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  photoOptionButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoOptionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
  },
  removePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 6,
    gap: 6,
  },
  removePhotoText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.redBg,
    borderRadius: 28,
    paddingVertical: 14,
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.logoutRed,
  },
});

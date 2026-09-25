import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import ModalHeader from '../common/ModalHeader';

export interface HomeProfileModalProps {
  visible: boolean;
  onClose: () => void;
  userName?: string;
  userEmail?: string;
  avatarUri?: string | null;
  onAvatarPicked?: (uri: string | null) => Promise<void>;
  onViewFullProfile?: () => void;
  onNavigateToProfile?: () => void;
  onLogoutPress?: () => void;
  onLogout?: () => void;
}

export default function HomeProfileModal({
  visible,
  onClose,
  userName = 'Sathish Kumar',
  userEmail = 'sathish.kumar@telemed.com',
  avatarUri,
  onViewFullProfile,
  onNavigateToProfile,
  onLogoutPress,
  onLogout,
}: HomeProfileModalProps) {
  const handleProfileNav = () => {
    onClose();
    if (onViewFullProfile) onViewFullProfile();
    else if (onNavigateToProfile) onNavigateToProfile();
  };

  const handleSignOut = () => {
    if (onLogoutPress) onLogoutPress();
    else if (onLogout) onLogout();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <ModalHeader title="Quick Account" onClose={onClose} />

          <View style={styles.content}>
            <View style={styles.userRow}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={32} color={Colors.primary} />
                </View>
              )}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.userEmail}>{userEmail}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Verified Patient</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.menuItem} onPress={handleProfileNav} activeOpacity={0.7}>
              <Ionicons name="person-circle-outline" size={22} color={Colors.primary} />
              <Text style={styles.menuText}>Go to Full Profile & Health Stats</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.secondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut} activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={20} color={Colors.error} />
              <Text style={styles.logoutText}>Sign Out of Telemedicine</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
  },
  content: {
    padding: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: Colors.bgLight,
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accentLight,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    gap: 8,
  },
  logoutText: {
    color: Colors.error,
    fontWeight: '700',
    fontSize: 13,
  },
});

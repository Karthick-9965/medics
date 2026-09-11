import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import ProfileUserCard from '../components/bottomTab/profile/ProfileUserCard';
import HealthStatsRow from '../components/bottomTab/profile/HealthStatsRow';
import ProfileMenuItem from '../components/bottomTab/profile/ProfileMenuItem';
import LogoutModal from '../components/LogoutModal';
import ProfilePhotoModal from '../components/bottomTab/profile/ProfilePhotoModal';

interface ProfileProps {
  userName?: string;
  userEmail?: string;
  avatarUri?: string | null;
  onAvatarChange?: (uri: string | null) => void;
  onLogout?: () => void;
  onNavigateToSchedule?: () => void;
  onNavigateToSavedDoctors?: () => void;
}

export default function Profile({
  userName,
  userEmail,
  avatarUri = null,
  onAvatarChange,
  onLogout,
  onNavigateToSchedule,
  onNavigateToSavedDoctors,
}: ProfileProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const displayName = userName || 'User';
  const displayEmail = userEmail || `${displayName.toLowerCase().replace(/\s+/g, '')}@example.com`;

  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7}>
            <Ionicons name="settings-outline" size={22} color={Colors.textDark} />
          </TouchableOpacity>
        </View>

        {/* User Card */}
        <ProfileUserCard
          name={displayName}
          email={displayEmail}
          avatarUri={avatarUri}
          onPickAvatar={() => setShowPhotoModal(true)}
        />

        {/* Health Stats Row */}
        <HealthStatsRow
          heartRate="215bpm"
          calories="756cal"
          weight="103lbs"
        />

        {/* Menu Section 1: Medical & Appointments */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeaderTitle}>Medical Records</Text>
          <View style={styles.menuCard}>
            <ProfileMenuItem
              icon="heart-outline"
              title="My Saved Doctors"
              badge="5"
              onPress={() => onNavigateToSavedDoctors?.()}
            />
            <View style={styles.itemDivider} />
            <ProfileMenuItem
              icon="calendar-outline"
              title="Appointment History"
              onPress={() => onNavigateToSchedule?.()}
            />
            <View style={styles.itemDivider} />
            <ProfileMenuItem
              icon="card-outline"
              title="Payment Method"
              subtitle="Visa ending in 4242"
              onPress={() => Alert.alert('Payment', 'Payment method options')}
            />
          </View>
        </View>

        {/* Menu Section 2: App & Security */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeaderTitle}>General Settings</Text>
          <View style={styles.menuCard}>
            <ProfileMenuItem
              icon="notifications-outline"
              title="Notifications"
              subtitle={notificationsEnabled ? 'Enabled' : 'Disabled'}
              onPress={() => setNotificationsEnabled(!notificationsEnabled)}
            />
            <View style={styles.itemDivider} />
            <ProfileMenuItem
              icon="shield-checkmark-outline"
              title="Privacy & Security"
              onPress={() => Alert.alert('Privacy', 'Privacy & Security details')}
            />
            <View style={styles.itemDivider} />
            <ProfileMenuItem
              icon="help-circle-outline"
              title="Help Center & FAQs"
              onPress={() => Alert.alert('Help Center', 'Our 24/7 support is ready to help.')}
            />
          </View>
        </View>

        {/* Menu Section 3: Logout */}
        <View style={styles.menuSection}>
          <View style={styles.menuCard}>
            <ProfileMenuItem
              icon="log-out-outline"
              title="Log Out"
              isDestructive
              onPress={handleLogoutPress}
            />
          </View>
        </View>
      </ScrollView>

      {/* Custom Logout Popup Modal */}
      <LogoutModal
        visible={showLogoutModal}
        onConfirmLogout={() => {
          setShowLogoutModal(false);
          onLogout?.();
        }}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* Custom UI Profile Photo Selection Modal */}
      <ProfilePhotoModal
        visible={showPhotoModal}
        avatarUri={avatarUri}
        userName={displayName}
        userEmail={displayEmail}
        onAvatarPicked={(uri) => {
          onAvatarChange?.(uri);
        }}
        onClose={() => setShowPhotoModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
  },
  headerIconButton: {
    padding: 6,
  },
  menuSection: {
    marginBottom: 20,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  itemDivider: {
    height: 1,
    backgroundColor: Colors.dividerLine,
  },
});

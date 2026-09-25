import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';
import ProfileUserCard from '../components/bottomTab/profile/ProfileUserCard';
import HealthStatsRow from '../components/bottomTab/profile/HealthStatsRow';
import ProfileMenuItem from '../components/bottomTab/profile/ProfileMenuItem';
import LogoutModal from '../components/modals/LogoutModal';
import ProfilePhotoModal from '../components/bottomTab/profile/ProfilePhotoModal';
import PersonalInfoModal, { UserProfileData } from '../components/bottomTab/profile/PersonalInfoModal';
import { getLoginSession } from '../utils/storage';

const INITIAL_PROFILE: UserProfileData = {
  name: 'Sathish Kumar',
  email: 'sathish.kumar@telemed.com',
  phone: '+1 (555) 019-2834',
  dob: '14 May 1996',
  age: '28',
  gender: 'Male',
  bloodGroup: 'O+',
  height: '178 cm',
  weight: '75 kg',
  heartRate: '215bpm',
  calories: '756cal',
  emergencyContactName: 'Priya Kumar (Spouse)',
  emergencyContactPhone: '+1 (555) 019-5678',
  address: '742 Evergreen Terrace, Medical District',
  allergies: 'Penicillin, Peanuts',
};

export interface ProfileProps {
  userName?: string;
  userEmail?: string;
  avatarUri?: string | null;
  onAvatarPicked?: (uri: string | null) => void;
  onAvatarChange?: (uri: string | null) => Promise<void> | void;
  onLogout?: () => void;
  onNavigateToSchedule?: () => void;
  onNavigateToSavedDoctors?: () => void;
}

export default function Profile({
  userName,
  userEmail,
  avatarUri: propAvatar = null,
  onAvatarPicked,
  onAvatarChange,
  onLogout,
  onNavigateToSchedule,
  onNavigateToSavedDoctors,
}: ProfileProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);

  const [avatarUri, setAvatarUri] = useState<string | null>(propAvatar || null);
  const [profileData, setProfileData] = useState<UserProfileData>({
    ...INITIAL_PROFILE,
    name: userName || INITIAL_PROFILE.name,
    email: userEmail || INITIAL_PROFILE.email,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const session = await getLoginSession();
        const activeName = userName || session?.name;
        const activeEmail = userEmail || session?.email;

        const stored = await AsyncStorage.getItem('@user_profile_data');
        if (stored) {
          const parsed = JSON.parse(stored);
          setProfileData({
            ...parsed,
            name: activeName || parsed.name || 'User',
            email: activeEmail || parsed.email || 'user@telemed.com',
          });
        } else {
          setProfileData((prev) => ({
            ...prev,
            name: activeName || prev.name,
            email: activeEmail || prev.email,
          }));
        }
        const av = await AsyncStorage.getItem('@user_avatar');
        if (av) setAvatarUri(av);
      } catch (e) {
        console.log(e);
      }
    };
    load();
  }, [userName, userEmail]);

  const displayName = profileData.name || userName || 'User';
  const displayEmail = profileData.email || userEmail || `${displayName.toLowerCase().replace(/\s+/g, '')}@example.com`;

  const handleAvatarChange = async (uri: string | null) => {
    setAvatarUri(uri);
    try {
      if (uri) await AsyncStorage.setItem('@user_avatar', uri);
      else await AsyncStorage.removeItem('@user_avatar');
    } catch (e) {
      console.log(e);
    }
    if (onAvatarPicked) onAvatarPicked(uri);
    if (onAvatarChange) onAvatarChange(uri);
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
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => setShowPersonalInfoModal(true)}
            activeOpacity={0.7}
          >
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
          heartRate={profileData.heartRate}
          calories={profileData.calories}
          weight={profileData.weight}
        />

        {/* Menu Section 1: Medical & Appointments */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeaderTitle}>Medical Records</Text>
          <View style={styles.menuCard}>
            <ProfileMenuItem
              icon="person-outline"
              title="Personal Information"
              subtitle="Edit health details & contacts"
              onPress={() => setShowPersonalInfoModal(true)}
            />
            <View style={styles.itemDivider} />
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
              onPress={() => Alert.alert('Payment Method', 'UPI & Visa Card ending in 4242 are verified.')}
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
              onPress={() => Alert.alert('Privacy & Security', 'End-to-end 256-bit encrypted medical consultations.')}
            />
            <View style={styles.itemDivider} />
            <ProfileMenuItem
              icon="help-circle-outline"
              title="Help Center & FAQs"
              onPress={() => Alert.alert('Help Center', 'Our 24/7 patient support is ready to help at support@telemed.com')}
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
              onPress={() => setShowLogoutModal(true)}
            />
          </View>
        </View>
      </ScrollView>

      {/* Custom Logout Popup Modal */}
      <LogoutModal
        visible={showLogoutModal}
        onConfirm={() => {
          setShowLogoutModal(false);
          if (onLogout) onLogout();
        }}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* Custom UI Profile Photo Selection Modal */}
      <ProfilePhotoModal
        visible={showPhotoModal}
        avatarUri={avatarUri}
        userName={displayName}
        userEmail={displayEmail}
        onAvatarPicked={handleAvatarChange}
        onClose={() => setShowPhotoModal(false)}
      />

      {/* Personal Info Edit Modal */}
      <PersonalInfoModal
        visible={showPersonalInfoModal}
        initialData={profileData}
        onClose={() => setShowPersonalInfoModal(false)}
        onSave={(data) => {
          setProfileData(data);
          AsyncStorage.setItem('@user_profile_data', JSON.stringify(data));
        }}
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

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';
import ProfileUserCard from '../components/bottomTab/profile/ProfileUserCard';
import HealthStatsRow from '../components/bottomTab/profile/HealthStatsRow';
import ProfileMenuItem from '../components/bottomTab/profile/ProfileMenuItem';
import ProfileModalsContainer from '../components/bottomTab/profile/ProfileModalsContainer';
import { UserProfileData } from '../components/bottomTab/profile/PersonalInfoModal';
import { SupportedLanguage } from '../components/bottomTab/profile/LanguageSelectModal';
import { getLoginSession } from '../utils/storage';
import { useMedicalAlert } from '../hooks/useMedicalAlert';

const INITIAL_PROFILE: UserProfileData = {
  name: 'User',
  email: 'user@telemed.com',
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
}: ProfileProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showPharmacyOrdersModal, setShowPharmacyOrdersModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showHelpCenterModal, setShowHelpCenterModal] = useState(false);
  const [showPaymentMethodsModal, setShowPaymentMethodsModal] = useState(false);
  const [defaultCardText, setDefaultCardText] = useState('Visa ending in 4242');
  const [appLanguage, setAppLanguage] = useState<SupportedLanguage>('en');

  const { alertConfig, showAlert, closeAlert } = useMedicalAlert();

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
        const activeName = userName || session?.name || 'User';
        const activeEmail = userEmail || session?.email || 'user@telemed.com';

        const stored = await AsyncStorage.getItem('@user_profile_data');
        if (stored) {
          const parsed = JSON.parse(stored);
          setProfileData({
            ...parsed,
            name: activeName,
            email: activeEmail,
          });
        } else {
          setProfileData((prev) => ({
            ...prev,
            name: activeName,
            email: activeEmail,
          }));
        }
        const av = await AsyncStorage.getItem('@user_avatar');
        if (av) setAvatarUri(av);

        const lang = await AsyncStorage.getItem('@app_language');
        if (lang === 'ta' || lang === 'en') setAppLanguage(lang);

        const savedCards = await AsyncStorage.getItem('@user_saved_cards');
        if (savedCards) {
          try {
            const parsed = JSON.parse(savedCards);
            const def = parsed.find((c: any) => c.isDefault) || parsed[0];
            if (def) {
              setDefaultCardText(`${def.cardType} ending in ${def.last4}`);
            }
          } catch (e) {}
        }
      } catch (e) {
        console.log(e);
      }
    };
    load();
  }, [userName, userEmail]);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('@user_avatar').then((av) => {
        if (av) setAvatarUri(av);
      });
      AsyncStorage.getItem('@app_language').then((lang) => {
        if (lang === 'ta' || lang === 'en') setAppLanguage(lang);
      });
      getLoginSession().then((session) => {
        if (session?.name) {
          setProfileData((prev) => ({
            ...prev,
            name: userName || session.name,
            email: userEmail || session.email || prev.email,
          }));
        }
      });
      ImagePicker.getPendingResultAsync().then((pending) => {
        if (pending && 'assets' in pending && !pending.canceled && pending.assets && pending.assets.length > 0) {
          handleAvatarChange(pending.assets[0].uri);
        }
      }).catch((e) => console.log('Pending image error:', e));
    }, [userName, userEmail])
  );

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

    if (uri) {
      showAlert({
        type: 'success',
        icon: 'checkmark-circle',
        title: 'Profile Updated',
        message: 'Your profile picture has been updated successfully.',
      });
    }
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
            style={styles.headerLogoutButton}
            onPress={() => setShowLogoutModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={17} color={Colors.logoutRed} />
            <Text style={styles.headerLogoutText}>Log Out</Text>
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
              icon="document-text-outline"
              title="My Prescriptions & Reports"
              subtitle="Digital Rx & verified lab records"
              badge="Vault"
              onPress={() => setShowVaultModal(true)}
            />
            <View style={styles.itemDivider} />
            <ProfileMenuItem
              icon="bag-check-outline"
              title="My Pharmacy Orders"
              subtitle="Track medicine deliveries & ETA"
              badge="Live"
              onPress={() => setShowPharmacyOrdersModal(true)}
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
              subtitle={defaultCardText}
              onPress={() => setShowPaymentMethodsModal(true)}
            />
          </View>
        </View>

        {/* Menu Section 2: App & General */}
        <View style={[styles.menuSection, styles.lastMenuSection]}>
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
              icon="language-outline"
              title="Language / மொழி"
              subtitle={appLanguage === 'ta' ? 'தமிழ் (Tamil)' : 'English (US)'}
              badge={appLanguage === 'ta' ? 'தமிழ்' : 'EN'}
              onPress={() => setShowLanguageModal(true)}
            />
            <View style={styles.itemDivider} />
            <ProfileMenuItem
              icon="help-circle-outline"
              title="Help Center & FAQs"
              subtitle="24/7 care helpline & questions"
              onPress={() => setShowHelpCenterModal(true)}
            />
          </View>
        </View>
      </ScrollView>

      {/* Modular Profile Modals Container */}
      <ProfileModalsContainer
        showLogoutModal={showLogoutModal}
        onCloseLogoutModal={() => setShowLogoutModal(false)}
        onConfirmLogout={() => {
          setShowLogoutModal(false);
          if (onLogout) onLogout();
        }}
        showPhotoModal={showPhotoModal}
        avatarUri={avatarUri}
        userName={displayName}
        userEmail={displayEmail}
        onAvatarPicked={handleAvatarChange}
        onClosePhotoModal={() => setShowPhotoModal(false)}
        showPersonalInfoModal={showPersonalInfoModal}
        profileData={profileData}
        onClosePersonalInfoModal={() => setShowPersonalInfoModal(false)}
        onSavePersonalInfo={(data) => {
          setProfileData(data);
          AsyncStorage.setItem('@user_profile_data', JSON.stringify(data));
        }}
        showVaultModal={showVaultModal}
        onCloseVaultModal={() => setShowVaultModal(false)}
        showPharmacyOrdersModal={showPharmacyOrdersModal}
        onClosePharmacyOrdersModal={() => setShowPharmacyOrdersModal(false)}
        showPaymentMethodsModal={showPaymentMethodsModal}
        onClosePaymentMethodsModal={() => setShowPaymentMethodsModal(false)}
        onCardUpdated={(cardText) => setDefaultCardText(cardText)}
        showLanguageModal={showLanguageModal}
        currentLanguage={appLanguage}
        onCloseLanguageModal={() => setShowLanguageModal(false)}
        onLanguageChanged={(newLang) => {
          setAppLanguage(newLang);
          showAlert({
            type: 'success',
            icon: 'language',
            title: newLang === 'ta' ? 'மொழி மாற்றப்பட்டது' : 'Language Updated',
            message:
              newLang === 'ta'
                ? 'பயன்பாட்டின் மொழி தமிழுக்கு மாற்றப்பட்டது.'
                : 'App interface language set to English successfully.',
          });
        }}
        showHelpCenterModal={showHelpCenterModal}
        onCloseHelpCenterModal={() => setShowHelpCenterModal(false)}
        alertConfig={alertConfig}
        onCloseAlert={closeAlert}
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
    paddingBottom: 20,
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
  headerLogoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.dangerBgTint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  headerLogoutText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.logoutRed,
  },
  menuSection: {
    marginBottom: 20,
  },
  lastMenuSection: {
    marginBottom: 0,
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

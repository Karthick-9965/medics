import React from 'react';
import { Colors } from '../../../constants/Colors';
import ProfilePhotoModal from './ProfilePhotoModal';
import PersonalInfoModal, { UserProfileData } from './PersonalInfoModal';
import PrescriptionsVaultModal from './PrescriptionsVaultModal';
import PharmacyOrdersModal from './PharmacyOrdersModal';
import LanguageSelectModal, { SupportedLanguage } from './LanguageSelectModal';
import HelpCenterModal from './HelpCenterModal';
import PaymentMethodsModal from './PaymentMethodsModal';
import MedicalAlertModal, { MedicalAlertModalProps } from '../../modals/MedicalAlertModal';

export interface ProfileModalsContainerProps {
  showLogoutModal: boolean;
  onCloseLogoutModal: () => void;
  onConfirmLogout: () => void;

  showPhotoModal: boolean;
  avatarUri: string | null;
  userName: string;
  userEmail: string;
  onAvatarPicked: (uri: string | null) => void;
  onClosePhotoModal: () => void;

  showPersonalInfoModal: boolean;
  profileData: UserProfileData;
  onClosePersonalInfoModal: () => void;
  onSavePersonalInfo: (data: UserProfileData) => void;

  showVaultModal: boolean;
  onCloseVaultModal: () => void;

  showPharmacyOrdersModal: boolean;
  onClosePharmacyOrdersModal: () => void;

  showPaymentMethodsModal: boolean;
  onClosePaymentMethodsModal: () => void;
  onCardUpdated?: (cardText: string) => void;

  showLanguageModal: boolean;
  currentLanguage: SupportedLanguage;
  onCloseLanguageModal: () => void;
  onLanguageChanged: (newLang: SupportedLanguage) => void;

  showHelpCenterModal: boolean;
  onCloseHelpCenterModal: () => void;

  alertConfig: MedicalAlertModalProps;
  onCloseAlert: () => void;
}

/**
 * Encapsulates all modals associated with the Profile screen.
 * Keeps Profile.tsx lean, clean, and focused solely on profile display & navigation.
 */
export default function ProfileModalsContainer({
  showLogoutModal,
  onCloseLogoutModal,
  onConfirmLogout,

  showPhotoModal,
  avatarUri,
  userName,
  userEmail,
  onAvatarPicked,
  onClosePhotoModal,

  showPersonalInfoModal,
  profileData,
  onClosePersonalInfoModal,
  onSavePersonalInfo,

  showVaultModal,
  onCloseVaultModal,

  showPharmacyOrdersModal,
  onClosePharmacyOrdersModal,

  showPaymentMethodsModal,
  onClosePaymentMethodsModal,
  onCardUpdated,

  showLanguageModal,
  currentLanguage,
  onCloseLanguageModal,
  onLanguageChanged,

  showHelpCenterModal,
  onCloseHelpCenterModal,

  alertConfig,
  onCloseAlert,
}: ProfileModalsContainerProps) {
  return (
    <>
      {/* Custom Logout Modal */}
      <MedicalAlertModal
        visible={showLogoutModal}
        icon="log-out-outline"
        iconColor={Colors.logoutRed}
        iconBg={Colors.dangerBgLight}
        title="Are you sure you want to log out?"
        message="You will need to enter your email and password to sign back in."
        primaryButtonText="Log Out"
        secondaryButtonText="Cancel"
        isDestructive
        onPrimaryPress={onConfirmLogout}
        onSecondaryPress={onCloseLogoutModal}
        onClose={onCloseLogoutModal}
      />

      {/* Profile Photo Selection Modal */}
      <ProfilePhotoModal
        visible={showPhotoModal}
        avatarUri={avatarUri}
        userName={userName}
        userEmail={userEmail}
        onAvatarPicked={onAvatarPicked}
        onClose={onClosePhotoModal}
      />

      {/* Personal Info Edit Modal */}
      <PersonalInfoModal
        visible={showPersonalInfoModal}
        initialData={profileData}
        onClose={onClosePersonalInfoModal}
        onSave={onSavePersonalInfo}
      />

      {/* Prescriptions Vault Modal */}
      <PrescriptionsVaultModal
        visible={showVaultModal}
        onClose={onCloseVaultModal}
      />

      {/* Pharmacy Orders Modal */}
      <PharmacyOrdersModal
        visible={showPharmacyOrdersModal}
        onClose={onClosePharmacyOrdersModal}
      />

      {/* Payment Methods & Cards Modal */}
      <PaymentMethodsModal
        visible={showPaymentMethodsModal}
        onClose={onClosePaymentMethodsModal}
        onCardUpdated={onCardUpdated}
      />

      {/* Language Selector Modal */}
      <LanguageSelectModal
        visible={showLanguageModal}
        currentLanguage={currentLanguage}
        onClose={onCloseLanguageModal}
        onLanguageChanged={onLanguageChanged}
      />

      {/* Help Center & FAQs Modal */}
      <HelpCenterModal
        visible={showHelpCenterModal}
        onClose={onCloseHelpCenterModal}
      />

      {/* Themed Medical Alert Modal */}
      <MedicalAlertModal
        visible={alertConfig.visible}
        type={alertConfig.type}
        icon={alertConfig.icon}
        title={alertConfig.title}
        message={alertConfig.message}
        onPrimaryPress={() => {
          if (alertConfig.onPrimaryPress) {
            alertConfig.onPrimaryPress();
          } else {
            onCloseAlert();
          }
        }}
        onSecondaryPress={() => {
          if (alertConfig.onSecondaryPress) {
            alertConfig.onSecondaryPress();
          } else {
            onCloseAlert();
          }
        }}
        onClose={onCloseAlert}
      />
    </>
  );
}

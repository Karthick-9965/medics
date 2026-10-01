import React from 'react';
import LogoutModal from '../modals/LogoutModal';
import NotificationsModal from './NotificationsModal';
import BookDoctorModal from './BookDoctorModal';
import PharmacyOrderModal from './PharmacyOrderModal';
import HospitalDirectionsModal from './HospitalDirectionsModal';
import ArticleDetailModal from '../modals/ArticleDetailModal';
import { DoctorItem } from '../../constants/doctorsData';
import { PharmacyItem } from '../../constants/pharmaciesData';
import { HospitalItem } from '../../constants/hospitalsData';
import { ArticleItem } from '../../constants/articlesData';

export interface HomeModalsContainerProps {
  showNotificationsModal: boolean;
  onCloseNotificationsModal: () => void;
  onNavigateToSchedule: () => void;
  onNavigateToAmbulance: () => void;
  onNavigateToPharmacy: () => void;
  onNavigateToMessages: () => void;

  bookingDoctor: DoctorItem | null;
  onCloseBookingDoctor: () => void;

  orderingPharmacy: PharmacyItem | null;
  pharmacyModalMode: 'prescription' | 'catalog';
  onCloseOrderingPharmacy: () => void;

  directionsHospital: HospitalItem | null;
  onCloseDirectionsHospital: () => void;

  selectedArticle: ArticleItem | null;
  onCloseSelectedArticle: () => void;

  showLogoutModal: boolean;
  onCloseLogoutModal: () => void;
  onConfirmLogout: () => void;
}

/**
 * Encapsulates the modular modals used on the Home screen to keep Home.tsx clean & readable.
 */
export default function HomeModalsContainer({
  showNotificationsModal,
  onCloseNotificationsModal,
  onNavigateToSchedule,
  onNavigateToAmbulance,
  onNavigateToPharmacy,
  onNavigateToMessages,

  bookingDoctor,
  onCloseBookingDoctor,

  orderingPharmacy,
  pharmacyModalMode,
  onCloseOrderingPharmacy,

  directionsHospital,
  onCloseDirectionsHospital,

  selectedArticle,
  onCloseSelectedArticle,

  showLogoutModal,
  onCloseLogoutModal,
  onConfirmLogout,
}: HomeModalsContainerProps) {
  return (
    <>

      <NotificationsModal
        visible={showNotificationsModal}
        onClose={onCloseNotificationsModal}
        onNavigateToSchedule={onNavigateToSchedule}
        onNavigateToAmbulance={onNavigateToAmbulance}
        onNavigateToPharmacy={onNavigateToPharmacy}
        onNavigateToMessages={onNavigateToMessages}
      />

      <BookDoctorModal
        visible={!!bookingDoctor}
        doctor={bookingDoctor}
        onClose={onCloseBookingDoctor}
        onNavigateToSchedule={onNavigateToSchedule}
      />

      <PharmacyOrderModal
        visible={!!orderingPharmacy}
        pharmacy={orderingPharmacy}
        initialMode={pharmacyModalMode}
        onClose={onCloseOrderingPharmacy}
      />

      <HospitalDirectionsModal
        visible={!!directionsHospital}
        hospital={directionsHospital}
        onClose={onCloseDirectionsHospital}
        onAmbulancePress={onNavigateToAmbulance}
      />

      <ArticleDetailModal
        visible={!!selectedArticle}
        article={selectedArticle}
        onClose={onCloseSelectedArticle}
      />

      <LogoutModal
        visible={showLogoutModal}
        onCancel={onCloseLogoutModal}
        onConfirm={onConfirmLogout}
      />
    </>
  );
}

import React from 'react';
import BookDoctorModal from '../home/BookDoctorModal';
import PharmacyOrderModal from '../home/PharmacyOrderModal';
import HospitalDirectionsModal from '../home/HospitalDirectionsModal';
import ArticleDetailModal from '../modals/ArticleDetailModal';
import AudioCallModal from '../consultation/AudioCallModal';
import VideoCallModal from '../consultation/VideoCallModal';
import ChatDetailModal from '../bottomTab/messages/ChatDetailModal';
import { DoctorItem } from '../../constants/doctorsData';
import { PharmacyItem } from '../../constants/pharmaciesData';
import { HospitalItem } from '../../constants/hospitalsData';
import { ArticleItem } from '../../constants/articlesData';
import { ChatMessage } from '../../constants/messagesData';

export interface SeeAllModalsContainerProps {
  // Booking & Info Modals
  bookingDoctor: DoctorItem | null;
  onCloseBookingDoctor: () => void;
  onNavigateToSchedule?: () => void;

  orderingPharmacy: PharmacyItem | null;
  pharmacyModalMode: 'prescription' | 'catalog';
  onCloseOrderingPharmacy: () => void;

  directionsHospital: HospitalItem | null;
  onCloseDirectionsHospital: () => void;
  onEmergencyPress?: () => void;

  selectedArticle: ArticleItem | null;
  onCloseSelectedArticle: () => void;

  // Doctor Consultations
  callingDoctor: DoctorItem | null;
  onEndCallingDoctor: () => void;
  onSwitchDoctorToVideo: () => void;

  videoCallingDoctor: DoctorItem | null;
  onEndVideoDoctor: () => void;
  onSwitchDoctorToAudio: () => void;

  chatDoctor: DoctorItem | null;
  chatMessages: { [id: string]: ChatMessage[] };
  isDoctorTyping: boolean;
  onCloseChatDoctor: () => void;
  onSendMessageToDoctor: (text: string, image?: string, isPrescription?: boolean, prescriptionName?: string) => void;
  onDeleteChatMessage: (idx: number) => void;
  onAudioCallDoctor: () => void;
  onVideoCallDoctor: () => void;

  // Pharmacy Consultations
  callingPharmacy: PharmacyItem | null;
  onEndCallingPharmacy: () => void;

  chatPharmacy: PharmacyItem | null;
  onCloseChatPharmacy: () => void;
  onSendPharmacyMessage: (text: string, image?: string) => void;
  onDeletePharmacyChatMessage: (idx: number) => void;
  onAudioCallPharmacy: () => void;

  // Hospital Reception Call
  callingHospital: HospitalItem | null;
  onEndCallingHospital: () => void;
}

/**
 * Encapsulates all modals and live consultations (calls, chats, bookings) for SeeAllScreen.
 * Keeps SeeAllScreen.tsx clean, maintainable, and readable.
 */
export default function SeeAllModalsContainer({
  bookingDoctor,
  onCloseBookingDoctor,
  onNavigateToSchedule,

  orderingPharmacy,
  pharmacyModalMode,
  onCloseOrderingPharmacy,

  directionsHospital,
  onCloseDirectionsHospital,
  onEmergencyPress,

  selectedArticle,
  onCloseSelectedArticle,

  callingDoctor,
  onEndCallingDoctor,
  onSwitchDoctorToVideo,

  videoCallingDoctor,
  onEndVideoDoctor,
  onSwitchDoctorToAudio,

  chatDoctor,
  chatMessages,
  isDoctorTyping,
  onCloseChatDoctor,
  onSendMessageToDoctor,
  onDeleteChatMessage,
  onAudioCallDoctor,
  onVideoCallDoctor,

  callingPharmacy,
  onEndCallingPharmacy,

  chatPharmacy,
  onCloseChatPharmacy,
  onSendPharmacyMessage,
  onDeletePharmacyChatMessage,
  onAudioCallPharmacy,

  callingHospital,
  onEndCallingHospital,
}: SeeAllModalsContainerProps) {
  return (
    <>
      {/* 1. Detail & Booking Modals */}
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
        onEmergencyPress={onEmergencyPress}
        onClose={onCloseDirectionsHospital}
      />

      <ArticleDetailModal
        visible={!!selectedArticle}
        article={selectedArticle}
        onClose={onCloseSelectedArticle}
      />

      {/* 2. Doctor In-App Consultations */}
      <AudioCallModal
        visible={!!callingDoctor}
        doctor={callingDoctor}
        onEndCall={onEndCallingDoctor}
        onClose={onEndCallingDoctor}
        onSwitchToVideo={onSwitchDoctorToVideo}
      />

      <VideoCallModal
        visible={!!videoCallingDoctor}
        doctor={videoCallingDoctor}
        onEndCall={onEndVideoDoctor}
        onSwitchToAudio={onSwitchDoctorToAudio}
      />

      <ChatDetailModal
        visible={!!chatDoctor}
        conversation={
          chatDoctor
            ? {
                id: chatDoctor.id,
                name: chatDoctor.name,
                specialization: chatDoctor.specialization,
                avatar: chatDoctor.image,
                lastMessage: `Online • ${chatDoctor.hospital || 'Hospital Care'}`,
                time: 'Active now',
                unread: 0,
                online: true,
                type: 'doctor',
              }
            : null
        }
        messages={
          chatDoctor
            ? chatMessages[chatDoctor.id] || [
                {
                  sender: 'doctor',
                  text: `Hello! I am ${chatDoctor.name}, ${chatDoctor.specialization} at ${chatDoctor.hospital || 'Care Hospital'}. How can I assist you with your health today?`,
                  time: '10:00 AM',
                },
              ]
            : []
        }
        isTyping={isDoctorTyping}
        onClose={onCloseChatDoctor}
        onSendMessage={onSendMessageToDoctor}
        onDeleteMessage={onDeleteChatMessage}
        onAudioCall={onAudioCallDoctor}
        onVideoCall={onVideoCallDoctor}
      />

      {/* 3. Pharmacy Consultations */}
      <AudioCallModal
        visible={!!callingPharmacy}
        doctor={
          callingPharmacy
            ? {
                name: callingPharmacy.name,
                specialization: 'Licensed Pharmacy Desk',
                image: callingPharmacy.image,
                phone: callingPharmacy.phone,
              }
            : null
        }
        onEndCall={onEndCallingPharmacy}
        onClose={onEndCallingPharmacy}
      />

      <ChatDetailModal
        visible={!!chatPharmacy}
        conversation={
          chatPharmacy
            ? {
                id: `pharmacy_${chatPharmacy.id}`,
                name: chatPharmacy.name,
                specialization: 'Licensed Pharmacy & Support Desk',
                avatar: chatPharmacy.image,
                lastMessage: `Open 24/7 • Delivery in ${chatPharmacy.deliveryTime || '20 mins'}`,
                time: 'Active now',
                unread: 0,
                online: true,
                type: 'pharmacy',
              }
            : null
        }
        messages={
          chatPharmacy
            ? chatMessages[`pharmacy_${chatPharmacy.id}`] || [
                {
                  sender: 'doctor',
                  text: `Welcome to ${chatPharmacy.name}! Our licensed pharmacist is available to answer your prescription questions or prepare medicine delivery. How can we help?`,
                  time: '10:00 AM',
                },
              ]
            : []
        }
        isTyping={isDoctorTyping}
        onClose={onCloseChatPharmacy}
        onSendMessage={onSendPharmacyMessage}
        onDeleteMessage={onDeletePharmacyChatMessage}
        onAudioCall={onAudioCallPharmacy}
      />

      {/* 4. Hospital Reception Call Simulation */}
      <AudioCallModal
        visible={!!callingHospital}
        doctor={
          callingHospital
            ? {
                name: callingHospital.name,
                specialization: 'Hospital Reception & Emergency Desk',
                image: callingHospital.image,
                phone: callingHospital.receptionPhone || callingHospital.emergencyPhone,
              }
            : null
        }
        onEndCall={onEndCallingHospital}
        onClose={onEndCallingHospital}
      />
    </>
  );
}

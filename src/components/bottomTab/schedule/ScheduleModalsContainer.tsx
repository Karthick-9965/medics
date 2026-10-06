import React from 'react';
import { AppointmentItem } from './AppointmentCard';
import AppointmentDetailModal from './AppointmentDetailModal';
import AppointmentTimeModal from './AppointmentTimeModal';
import CancelAppointmentModal from './CancelAppointmentModal';
import LeaveReviewModal from './LeaveReviewModal';
import VideoCallModal from '../../consultation/VideoCallModal';
import AudioCallModal from '../../consultation/AudioCallModal';
import NotificationsModal from '../../home/NotificationsModal';
import MedicalAlertModal, { MedicalAlertModalProps } from '../../modals/MedicalAlertModal';

export interface ScheduleModalsContainerProps {
  // Rebook Modal
  rebookTarget: AppointmentItem | null;
  onCloseRebook: () => void;
  onConfirmRebook: (appointmentId: string, newDate: string, newTime: string) => void;

  // Reschedule Modal
  rescheduleTarget: AppointmentItem | null;
  onCloseReschedule: () => void;
  onConfirmReschedule: (appointmentId: string, newDate: string, newTime: string) => void;

  // Cancel Modal
  cancelTarget: AppointmentItem | null;
  onCloseCancel: () => void;
  onConfirmCancel: (id: string, reason: string) => void;

  // Review Modal
  reviewTarget: AppointmentItem | null;
  onCloseReview: () => void;
  onConfirmReview: (rating: number, review: string) => void;

  // Detail Modal
  detailTarget: AppointmentItem | null;
  onCloseDetail: () => void;
  onOpenCancelFromDetail: (id: string) => void;
  onOpenRescheduleFromDetail: (id: string) => void;
  onOpenRebookFromDetail: (id: string) => void;
  onOpenReviewFromDetail: (id: string) => void;
  onDeleteFromDetail: (id: string) => void;
  onJoinCallFromDetail: (appointment: AppointmentItem) => void;

  // Live Consultations
  videoDoctor: any | null;
  onEndVideoCall: () => void;
  onSwitchVideoToAudio: () => void;

  audioDoctor: any | null;
  onEndAudioCall: () => void;
  onSwitchAudioToVideo: () => void;

  // Notifications Modal
  showNotifModal: boolean;
  onCloseNotifModal: () => void;
  onNavigateToMessages?: () => void;
  onNavigateToAmbulance?: () => void;
  onNavigateToPharmacy?: () => void;
  navigation?: any;

  // Medical Alert
  alertConfig: MedicalAlertModalProps;
  onCloseAlert: () => void;
}

/**
 * Encapsulates all modals associated with the Schedule screen.
 * Keeps Schedule.tsx modular, lightweight, and easy to read.
 */
export default function ScheduleModalsContainer({
  rebookTarget,
  onCloseRebook,
  onConfirmRebook,

  rescheduleTarget,
  onCloseReschedule,
  onConfirmReschedule,

  cancelTarget,
  onCloseCancel,
  onConfirmCancel,

  reviewTarget,
  onCloseReview,
  onConfirmReview,

  detailTarget,
  onCloseDetail,
  onOpenCancelFromDetail,
  onOpenRescheduleFromDetail,
  onOpenRebookFromDetail,
  onOpenReviewFromDetail,
  onDeleteFromDetail,
  onJoinCallFromDetail,

  videoDoctor,
  onEndVideoCall,
  onSwitchVideoToAudio,

  audioDoctor,
  onEndAudioCall,
  onSwitchAudioToVideo,

  showNotifModal,
  onCloseNotifModal,
  onNavigateToMessages,
  onNavigateToAmbulance,
  onNavigateToPharmacy,
  navigation,

  alertConfig,
  onCloseAlert,
}: ScheduleModalsContainerProps) {
  return (
    <>
      {/* Unified Appointment Slot / Time Modal (Rebook & Reschedule) */}
      <AppointmentTimeModal
        visible={!!(rebookTarget || rescheduleTarget)}
        mode={rebookTarget ? 'rebook' : 'reschedule'}
        appointment={rebookTarget || rescheduleTarget}
        onClose={rebookTarget ? onCloseRebook : onCloseReschedule}
        onRebooked={onConfirmRebook}
        onRescheduled={onConfirmReschedule}
      />

      {/* Cancel Appointment Modal */}
      <CancelAppointmentModal
        visible={!!cancelTarget}
        appointment={cancelTarget}
        onClose={onCloseCancel}
        onCancelled={onConfirmCancel}
      />

      {/* Leave Review Modal */}
      <LeaveReviewModal
        visible={!!reviewTarget}
        appointment={reviewTarget}
        onClose={onCloseReview}
        onReviewSubmitted={onConfirmReview}
      />

      {/* Appointment Detail Modal */}
      <AppointmentDetailModal
        visible={!!detailTarget}
        appointment={detailTarget}
        onClose={onCloseDetail}
        onCancel={onOpenCancelFromDetail}
        onReschedule={onOpenRescheduleFromDetail}
        onRebook={onOpenRebookFromDetail}
        onReview={onOpenReviewFromDetail}
        onDelete={onDeleteFromDetail}
        onJoinCall={onJoinCallFromDetail}
      />

      {/* Live Video Call */}
      <VideoCallModal
        visible={!!videoDoctor}
        doctor={videoDoctor}
        onEndCall={onEndVideoCall}
        onSwitchToAudio={onSwitchVideoToAudio}
      />

      {/* Live Audio Call */}
      <AudioCallModal
        visible={!!audioDoctor}
        doctor={audioDoctor}
        onEndCall={onEndAudioCall}
        onSwitchToVideo={onSwitchAudioToVideo}
      />

      {/* In-App Notifications Modal */}
      <NotificationsModal
        visible={showNotifModal}
        onClose={onCloseNotifModal}
        onNavigateToMessages={() => {
          onCloseNotifModal();
          if (onNavigateToMessages) onNavigateToMessages();
          else if (navigation) navigation.navigate('Main', { screen: 'MessagesTab' });
        }}
        onNavigateToSchedule={() => onCloseNotifModal()}
        onNavigateToAmbulance={() => {
          onCloseNotifModal();
          if (onNavigateToAmbulance) onNavigateToAmbulance();
          else if (navigation) navigation.navigate('Ambulance');
        }}
        onNavigateToPharmacy={() => {
          onCloseNotifModal();
          if (onNavigateToPharmacy) onNavigateToPharmacy();
          else if (navigation) navigation.navigate('SeeAll', { category: 'pharmacy' });
        }}
      />

      {/* Custom Themed Medical Alert Modal */}
      <MedicalAlertModal
        visible={alertConfig.visible}
        type={alertConfig.type}
        icon={alertConfig.icon}
        title={alertConfig.title}
        message={alertConfig.message}
        primaryButtonText={alertConfig.primaryButtonText}
        secondaryButtonText={alertConfig.secondaryButtonText}
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
        isDestructive={alertConfig.isDestructive}
      />
    </>
  );
}

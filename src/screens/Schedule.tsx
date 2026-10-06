import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';
import { INITIAL_APPOINTMENTS, getDoctorAvatar } from '../constants/scheduleData';
import ScheduleStatusTabs, { ScheduleStatus } from '../components/bottomTab/schedule/ScheduleStatusTabs';
import AppointmentCard, { AppointmentItem } from '../components/bottomTab/schedule/AppointmentCard';
import ScheduleModalsContainer from '../components/bottomTab/schedule/ScheduleModalsContainer';
import EmptyState from '../components/common/EmptyState';
import { useMedicalAlert } from '../hooks/useMedicalAlert';
import { generateReferenceId } from '../utils/formatters';
import {
  sendAppointmentRescheduledNotificationAndReminder,
  sendAppointmentRebookedNotificationAndReminder,
} from '../services/notificationManager';

interface ScheduleProps {
  navigation?: any;
  route?: any;
  fromProfile?: boolean;
  onNavigateBackToProfile?: () => void;
  onNavigateToMessages?: () => void;
  onNavigateToAmbulance?: () => void;
  onNavigateToPharmacy?: () => void;
}

export default function Schedule({
  navigation,
  route,
  fromProfile: propFromProfile,
  onNavigateBackToProfile,
  onNavigateToMessages,
  onNavigateToAmbulance,
  onNavigateToPharmacy,
}: ScheduleProps = {}) {
  const fromProfile = propFromProfile || route?.params?.fromProfile;

  const handleBackPress = () => {
    if (navigation?.setParams) {
      navigation.setParams({ fromProfile: false });
    }
    if (onNavigateBackToProfile) {
      onNavigateBackToProfile();
    } else if (navigation) {
      navigation.navigate('Main', { screen: 'ProfileTab' });
    }
  };

  const [activeTab, setActiveTab] = useState<ScheduleStatus>('upcoming');
  const [appointments, setAppointments] = useState<AppointmentItem[]>(INITIAL_APPOINTMENTS);
  const [rebookTarget, setRebookTarget] = useState<AppointmentItem | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<AppointmentItem | null>(null);
  const [cancelTarget, setCancelTarget] = useState<AppointmentItem | null>(null);
  const [reviewTarget, setReviewTarget] = useState<AppointmentItem | null>(null);
  const [detailTarget, setDetailTarget] = useState<AppointmentItem | null>(null);
  const [videoDoctor, setVideoDoctor] = useState<any | null>(null);
  const [audioDoctor, setAudioDoctor] = useState<any | null>(null);
  const [showNotifModal, setShowNotifModal] = useState(false);

  const { alertConfig, showAlert, closeAlert } = useMedicalAlert();

  const loadAppointments = async () => {
    try {
      const storedStr = await AsyncStorage.getItem('@app_appointments');
      if (storedStr) {
        const stored: AppointmentItem[] = JSON.parse(storedStr);
        const restored = stored.map((a) => ({
          ...a,
          avatar: getDoctorAvatar(a.doctorName, a.avatar),
          patientName: (a.patientName && a.patientName !== 'Sathish Kumar') ? a.patientName : 'User',
        }));
        setAppointments(restored);
      } else {
        setAppointments(INITIAL_APPOINTMENTS);
        await AsyncStorage.setItem('@app_appointments', JSON.stringify(INITIAL_APPOINTMENTS));
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    loadAppointments();
    const unsubBlur = navigation?.addListener?.('blur', () => {
      navigation?.setParams?.({ fromProfile: false });
    });
    const unsubFocus = navigation?.addListener?.('focus', () => {
      loadAppointments();
    });
    return () => {
      unsubBlur?.();
      unsubFocus?.();
    };
  }, [navigation]);

  const persist = async (list: AppointmentItem[]) => {
    try {
      await AsyncStorage.setItem('@app_appointments', JSON.stringify(list));
    } catch (e) {
      console.log(e);
    }
  };

  const completedCount = appointments.filter((app) => app.status === 'completed').length;
  const filteredAppointments = appointments.filter((app) => app.status === activeTab);

  const handleOpenCancel = (id: string) => {
    const target = appointments.find((item) => item.id === id);
    if (target) {
      setCancelTarget(target);
    }
  };

  const handleConfirmCancel = (id: string, reason: string) => {
    const updated = appointments.map((item) =>
      item.id === id
        ? { ...item, status: 'canceled' as ScheduleStatus, statusLabel: 'Canceled', cancelReason: reason }
        : item
    );
    setAppointments(updated);
    persist(updated);
    setCancelTarget(null);
  };

  const handleOpenReview = (id: string) => {
    const target = appointments.find((item) => item.id === id);
    if (target) {
      setReviewTarget(target);
    }
  };

  const handleConfirmReview = (rating: number, _review: string) => {
    setReviewTarget(null);
    showAlert({
      type: 'success',
      icon: 'star',
      title: 'Review Submitted',
      message: `Your ${rating}-star rating and feedback have been submitted successfully.`,
    });
  };

  const handleOpenReschedule = (id: string) => {
    const target = appointments.find((item) => item.id === id);
    if (target) {
      setRescheduleTarget(target);
    }
  };

  const handleConfirmReschedule = (appointmentId: string, newDate: string, newTime: string) => {
    const target = appointments.find((a) => a.id === appointmentId);
    const updated = appointments.map((item) =>
      item.id === appointmentId
        ? {
            ...item,
            date: newDate,
            time: newTime,
            statusLabel: 'Rescheduled',
          }
        : item
    );
    setAppointments(updated);
    persist(updated);
    setRescheduleTarget(null);

    const docName = target?.doctorName || 'Doctor';

    if (target) {
      sendAppointmentRescheduledNotificationAndReminder({
        doctorName: target.doctorName,
        specialization: target.specialization,
        date: newDate,
        time: newTime,
        consultationType: target.consultationType || 'Consultation',
        bookingId: target.bookingId || generateReferenceId('MED'),
        setReminder: true,
      });
    }

    showAlert({
      type: 'calendar',
      title: 'Appointment Rescheduled',
      message: `Your appointment with ${docName} is now rescheduled for ${newDate} at ${newTime}. A reminder has also been set.`,
    });
  };

  const handleOpenRebook = (id: string) => {
    const target = appointments.find((item) => item.id === id);
    if (target) {
      setRebookTarget(target);
    }
  };

  const handleConfirmRebook = (appointmentId: string, newDate: string, newTime: string) => {
    const base = appointments.find((a) => a.id === appointmentId);
    if (!base) return;

    const newBookingId = generateReferenceId('MED');
    const newAppointment: AppointmentItem = {
      ...base,
      id: `${Date.now()}`,
      date: newDate,
      time: newTime,
      status: 'upcoming',
      statusLabel: 'Confirmed',
      bookingId: newBookingId,
    };

    const updated = [newAppointment, ...appointments];
    setAppointments(updated);
    persist(updated);
    setActiveTab('upcoming');
    setRebookTarget(null);

    sendAppointmentRebookedNotificationAndReminder({
      doctorName: base.doctorName,
      specialization: base.specialization,
      date: newDate,
      time: newTime,
      consultationType: base.consultationType || 'Consultation',
      bookingId: newBookingId,
      setReminder: true,
    });

    showAlert({
      type: 'calendar',
      title: 'Appointment Re-Booked',
      message: `Your appointment with ${base.doctorName} is confirmed for ${newDate} at ${newTime}. A reminder has also been set.`,
    });
  };

  const handleDeleteAppointment = (id: string) => {
    showAlert({
      type: 'delete',
      title: 'Delete Record',
      message: 'Permanently delete this canceled consultation record? This action cannot be undone.',
      primaryButtonText: 'Delete',
      secondaryButtonText: 'Cancel',
      isDestructive: true,
      onPrimaryPress: () => {
        closeAlert();
        const updated = appointments.filter((a) => a.id !== id);
        setAppointments(updated);
        persist(updated);
        setDetailTarget(null);
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, fromProfile && styles.headerWithBack]}>
          {fromProfile && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Back to Profile"
            >
              <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
            </TouchableOpacity>
          )}
          <Text style={[styles.headerTitle, fromProfile && styles.headerTitleWithBack]}>
            {fromProfile ? 'Appointment History' : 'Schedule'}
          </Text>
        </View>

        {/* Status Tab Switcher */}
        <ScheduleStatusTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          completedCount={completedCount}
        />

        {/* Appointment Cards List */}
        <ScrollView
          style={styles.scrollList}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredAppointments.length === 0 ? (
            <EmptyState
              icon="calendar-outline"
              title={`No ${activeTab} appointments`}
              subtitle={`You have no ${activeTab} consultations at the moment.`}
            />
          ) : (
            filteredAppointments.map((item) => (
              <AppointmentCard
                key={item.id}
                appointment={item}
                onPressCard={(app) => setDetailTarget(app)}
                onCancel={(id) => handleOpenCancel(id)}
                onReschedule={(id) => handleOpenReschedule(id)}
                onRebook={(id) => handleOpenRebook(id)}
                onReview={(id) => handleOpenReview(id)}
                onDelete={(id) => handleDeleteAppointment(id)}
              />
            ))
          )}
        </ScrollView>

        {/* Encapsulated Modals */}
        <ScheduleModalsContainer
          rebookTarget={rebookTarget}
          onCloseRebook={() => setRebookTarget(null)}
          onConfirmRebook={handleConfirmRebook}
          rescheduleTarget={rescheduleTarget}
          onCloseReschedule={() => setRescheduleTarget(null)}
          onConfirmReschedule={handleConfirmReschedule}
          cancelTarget={cancelTarget}
          onCloseCancel={() => setCancelTarget(null)}
          onConfirmCancel={handleConfirmCancel}
          reviewTarget={reviewTarget}
          onCloseReview={() => setReviewTarget(null)}
          onConfirmReview={handleConfirmReview}
          detailTarget={detailTarget}
          onCloseDetail={() => setDetailTarget(null)}
          onOpenCancelFromDetail={(id) => {
            setDetailTarget(null);
            handleOpenCancel(id);
          }}
          onOpenRescheduleFromDetail={(id) => {
            setDetailTarget(null);
            handleOpenReschedule(id);
          }}
          onOpenRebookFromDetail={(id) => {
            setDetailTarget(null);
            handleOpenRebook(id);
          }}
          onOpenReviewFromDetail={(id) => {
            setDetailTarget(null);
            handleOpenReview(id);
          }}
          onDeleteFromDetail={handleDeleteAppointment}
          onJoinCallFromDetail={(app) => {
            setDetailTarget(null);
            setVideoDoctor({
              id: app.id,
              name: app.doctorName,
              specialization: app.specialization,
              avatar: app.avatar,
            });
          }}
          videoDoctor={videoDoctor}
          onEndVideoCall={() => setVideoDoctor(null)}
          onSwitchVideoToAudio={() => {
            const d = videoDoctor;
            setVideoDoctor(null);
            setAudioDoctor(d);
          }}
          audioDoctor={audioDoctor}
          onEndAudioCall={() => setAudioDoctor(null)}
          onSwitchAudioToVideo={() => {
            const d = audioDoctor;
            setAudioDoctor(null);
            setVideoDoctor(d);
          }}
          showNotifModal={showNotifModal}
          onCloseNotifModal={() => setShowNotifModal(false)}
          onNavigateToMessages={onNavigateToMessages}
          onNavigateToAmbulance={onNavigateToAmbulance}
          onNavigateToPharmacy={onNavigateToPharmacy}
          navigation={navigation}
          alertConfig={alertConfig}
          onCloseAlert={closeAlert}
        />
      </View>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerWithBack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
  },
  headerTitleWithBack: {
    flex: 1,
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
});

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';
import { INITIAL_APPOINTMENTS, DOCTOR_AVATARS, getDoctorAvatar } from '../constants/scheduleData';
import ScheduleStatusTabs, { ScheduleStatus } from '../components/bottomTab/schedule/ScheduleStatusTabs';
import AppointmentCard, { AppointmentItem } from '../components/bottomTab/schedule/AppointmentCard';
import AppointmentDetailModal from '../components/bottomTab/schedule/AppointmentDetailModal';
import RebookModal from '../components/bottomTab/schedule/RebookModal';
import RescheduleModal from '../components/bottomTab/schedule/RescheduleModal';
import CancelAppointmentModal from '../components/bottomTab/schedule/CancelAppointmentModal';
import LeaveReviewModal from '../components/bottomTab/schedule/LeaveReviewModal';
import VideoCallModal from '../components/consultation/VideoCallModal';
import AudioCallModal from '../components/consultation/AudioCallModal';
import NotificationsModal from '../components/home/NotificationsModal';
import { getUnreadNotificationsCount, subscribeNotifications } from '../services/notificationStorage';

interface ScheduleProps {
  navigation?: any;
  onNavigateToMessages?: () => void;
  onNavigateToAmbulance?: () => void;
  onNavigateToPharmacy?: () => void;
}

export default function Schedule({
  navigation,
  onNavigateToMessages,
  onNavigateToAmbulance,
  onNavigateToPharmacy,
}: ScheduleProps = {}) {
  const [activeTab, setActiveTab] = useState<ScheduleStatus>('upcoming');
  const [appointments, setAppointments] = useState<AppointmentItem[]>(INITIAL_APPOINTMENTS);
  const [rebookTarget, setRebookTarget] = useState<AppointmentItem | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<AppointmentItem | null>(null);
  const [cancelTarget, setCancelTarget] = useState<AppointmentItem | null>(null);
  const [reviewTarget, setReviewTarget] = useState<AppointmentItem | null>(null);
  const [detailTarget, setDetailTarget] = useState<AppointmentItem | null>(null);
  const [videoDoctor, setVideoDoctor] = useState<any | null>(null);
  const [audioDoctor, setAudioDoctor] = useState<any | null>(null);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [showNotifModal, setShowNotifModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const storedStr = await AsyncStorage.getItem('@app_appointments');
        if (storedStr) {
          const stored: AppointmentItem[] = JSON.parse(storedStr);
          const restored = stored.map((a) => ({
            ...a,
            avatar: typeof a.avatar === 'number' ? a.avatar : getDoctorAvatar(a.doctorName, a.avatar),
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
    load();
    getUnreadNotificationsCount().then(setUnreadNotifCount);
    const unsub = subscribeNotifications((list) => setUnreadNotifCount(list.filter((n) => !n.read).length));
    return () => unsub();
  }, []);

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

  const handleConfirmReview = (rating: number, review: string) => {
    setReviewTarget(null);
    Alert.alert(
      'Thank You! ⭐',
      `Your ${rating}-star review and feedback have been submitted successfully.`
    );
  };

  const handleOpenReschedule = (id: string) => {
    const target = appointments.find((item) => item.id === id);
    if (target) {
      setRescheduleTarget(target);
    }
  };

  const handleConfirmReschedule = (appointmentId: string, newDate: string, newTime: string) => {
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
    const docName = appointments.find((a) => a.id === appointmentId)?.doctorName || 'Doctor';
    Alert.alert(
      'Appointment Rescheduled! 📅',
      `Your appointment with ${docName} is now rescheduled for ${newDate} at ${newTime}.`
    );
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

    const newAppointment: AppointmentItem = {
      ...base,
      id: `${Date.now()}`,
      date: newDate,
      time: newTime,
      status: 'upcoming',
      statusLabel: 'Confirmed',
      bookingId: `#MED-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    const updated = [newAppointment, ...appointments];
    setAppointments(updated);
    persist(updated);
    setActiveTab('upcoming');
    setRebookTarget(null);
    Alert.alert(
      'Appointment Re-Booked! 🎉',
      `Your appointment with ${base.doctorName} is confirmed for ${newDate} at ${newTime}.`
    );
  };

  const handleDeleteAppointment = (id: string) => {
    Alert.alert('Delete Record', 'Permanently delete this canceled consultation record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updated = appointments.filter((a) => a.id !== id);
          setAppointments(updated);
          persist(updated);
          setDetailTarget(null);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Schedule</Text>
          <TouchableOpacity
            style={styles.headerNotificationButton}
            onPress={() => setShowNotifModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={22} color={Colors.textDark} />
            {unreadNotifCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Status Tab Switcher - Count only for Completed */}
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
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={54} color={Colors.secondary} />
              <Text style={styles.emptyTitle}>No {activeTab} appointments</Text>
              <Text style={styles.emptySubtitle}>
                You have no {activeTab} consultations at the moment.
              </Text>
            </View>
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

        {/* Re-Book Modal */}
        <RebookModal
          visible={!!rebookTarget}
          appointment={rebookTarget}
          onClose={() => setRebookTarget(null)}
          onRebooked={handleConfirmRebook}
        />

        {/* Reschedule Modal */}
        <RescheduleModal
          visible={!!rescheduleTarget}
          appointment={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onRescheduled={handleConfirmReschedule}
        />

        {/* Cancel Appointment Modal */}
        <CancelAppointmentModal
          visible={!!cancelTarget}
          appointment={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onCancelled={handleConfirmCancel}
        />

        {/* Leave Review Modal */}
        <LeaveReviewModal
          visible={!!reviewTarget}
          appointment={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onReviewSubmitted={handleConfirmReview}
        />

        {/* Full Details Modal */}
        <AppointmentDetailModal
          visible={!!detailTarget}
          appointment={detailTarget}
          onClose={() => setDetailTarget(null)}
          onCancel={(id) => {
            setDetailTarget(null);
            handleOpenCancel(id);
          }}
          onReschedule={(id) => {
            setDetailTarget(null);
            handleOpenReschedule(id);
          }}
          onRebook={(id) => {
            setDetailTarget(null);
            handleOpenRebook(id);
          }}
          onReview={(id) => {
            setDetailTarget(null);
            handleOpenReview(id);
          }}
          onDelete={handleDeleteAppointment}
          onJoinCall={(app) => {
            setDetailTarget(null);
            setVideoDoctor({
              id: app.id,
              name: app.doctorName,
              specialization: app.specialization,
              avatar: app.avatar,
            });
          }}
        />

        {/* Live Calls */}
        <VideoCallModal
          visible={!!videoDoctor}
          doctor={videoDoctor}
          onEndCall={() => setVideoDoctor(null)}
          onSwitchToAudio={() => {
            const d = videoDoctor;
            setVideoDoctor(null);
            setAudioDoctor(d);
          }}
        />

        <AudioCallModal
          visible={!!audioDoctor}
          doctor={audioDoctor}
          onEndCall={() => setAudioDoctor(null)}
          onSwitchToVideo={() => {
            const d = audioDoctor;
            setAudioDoctor(null);
            setVideoDoctor(d);
          }}
        />

        {/* Notifications Modal */}
        <NotificationsModal
          visible={showNotifModal}
          onClose={() => setShowNotifModal(false)}
          onNavigateToMessages={() => {
            setShowNotifModal(false);
            if (onNavigateToMessages) onNavigateToMessages();
            else if (navigation) navigation.navigate('Main', { screen: 'MessagesTab' });
          }}
          onNavigateToSchedule={() => setShowNotifModal(false)}
          onNavigateToAmbulance={() => {
            setShowNotifModal(false);
            if (onNavigateToAmbulance) onNavigateToAmbulance();
            else if (navigation) navigation.navigate('Ambulance');
          }}
          onNavigateToPharmacy={() => {
            setShowNotifModal(false);
            if (onNavigateToPharmacy) onNavigateToPharmacy();
            else if (navigation) navigation.navigate('SeeAll', { category: 'pharmacy' });
          }}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
  },
  headerNotificationButton: {
    padding: 6,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.error,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: 14,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.secondary,
    textAlign: 'center',
  },
});

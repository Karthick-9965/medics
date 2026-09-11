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
import ScheduleStatusTabs, { ScheduleStatus } from '../components/bottomTab/schedule/ScheduleStatusTabs';
import AppointmentCard, { AppointmentItem } from '../components/bottomTab/schedule/AppointmentCard';
import AppointmentDetailModal from '../components/bottomTab/schedule/AppointmentDetailModal';
import RebookModal from '../components/bottomTab/schedule/RebookModal';
import RescheduleModal from '../components/bottomTab/schedule/RescheduleModal';
import CancelAppointmentModal from '../components/bottomTab/schedule/CancelAppointmentModal';
import LeaveReviewModal from '../components/bottomTab/schedule/LeaveReviewModal';
import { INITIAL_APPOINTMENTS } from '../data/scheduleData';

export default function Schedule() {
  const [activeTab, setActiveTab] = useState<ScheduleStatus>('upcoming');
  const [appointments, setAppointments] = useState<AppointmentItem[]>(INITIAL_APPOINTMENTS);
  const [rebookTarget, setRebookTarget] = useState<AppointmentItem | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<AppointmentItem | null>(null);
  const [cancelTarget, setCancelTarget] = useState<AppointmentItem | null>(null);
  const [reviewTarget, setReviewTarget] = useState<AppointmentItem | null>(null);
  const [detailTarget, setDetailTarget] = useState<AppointmentItem | null>(null);

  // Count only for completed appointments
  const completedCount = appointments.filter((app) => app.status === 'completed').length;
  const filteredAppointments = appointments.filter((app) => app.status === activeTab);

  const handleOpenCancel = (id: string) => {
    const target = appointments.find((item) => item.id === id);
    if (target) {
      setCancelTarget(target);
    }
  };

  const handleConfirmCancel = (id: string, reason: string) => {
    setAppointments((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'canceled', statusLabel: 'Canceled by user' }
          : item
      )
    );
    setCancelTarget(null);
  };

  const handleOpenReview = (id: string) => {
    const target = appointments.find((item) => item.id === id);
    if (target) {
      setReviewTarget(target);
    }
  };

  const handleConfirmReview = (
    appointmentId: string,
    rating: number,
    feedback: string,
    tags: string[]
  ) => {
    setReviewTarget(null);
    Alert.alert(
      'Thank You! ',
      `Your ${rating}-star review and feedback have been submitted successfully.`
    );
  };

  const handleOpenReschedule = (id: string) => {
    const target = appointments.find((item) => item.id === id);
    if (target) {
      setRescheduleTarget(target);
    }
  };

  const handleConfirmReschedule = (
    target: AppointmentItem,
    newDate: string,
    newTime: string,
    consultationType: string
  ) => {
    setAppointments((prev) =>
      prev.map((item) =>
        item.id === target.id
          ? {
              ...item,
              date: newDate,
              time: newTime,
              consultationType: consultationType,
              statusLabel: 'Rescheduled',
            }
          : item
      )
    );
    Alert.alert(
      'Appointment Rescheduled! ',
      `Your appointment with ${target.doctorName} is now rescheduled for ${newDate} at ${newTime} (${consultationType}).`
    );
  };

  const handleOpenRebook = (id: string) => {
    const target = appointments.find((item) => item.id === id);
    if (target) {
      setRebookTarget(target);
    }
  };

  const handleConfirmRebook = (
    target: AppointmentItem,
    newDate: string,
    newTime: string,
    consultationType: string
  ) => {
    const newId = `${Date.now()}`;
    const newAppointment: AppointmentItem = {
      ...target,
      id: newId,
      date: newDate,
      time: newTime,
      status: 'upcoming',
      statusLabel: 'Confirmed',
      consultationType: consultationType,
      bookingId: `#MED-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    setAppointments((prev) => [newAppointment, ...prev]);
    setActiveTab('upcoming');
    Alert.alert(
      'Appointment Re-Booked! ',
      `Your appointment with ${target.doctorName} is confirmed for ${newDate} at ${newTime} (${consultationType}).`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Schedule</Text>
          <TouchableOpacity style={styles.headerNotificationButton} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textDark} />
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
                onCancel={handleOpenCancel}
                onReschedule={handleOpenReschedule}
                onRebook={handleOpenRebook}
                onReview={handleOpenReview}
              />
            ))
          )}
        </ScrollView>

        {/* Re-Book Modal */}
        <RebookModal
          visible={!!rebookTarget}
          appointment={rebookTarget}
          onClose={() => setRebookTarget(null)}
          onConfirmRebook={handleConfirmRebook}
        />

        {/* Reschedule Modal */}
        <RescheduleModal
          visible={!!rescheduleTarget}
          appointment={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onConfirmReschedule={handleConfirmReschedule}
        />

        {/* Cancel Appointment Modal */}
        <CancelAppointmentModal
          visible={!!cancelTarget}
          appointment={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirmCancel={handleConfirmCancel}
        />

        {/* Leave Review Modal */}
        <LeaveReviewModal
          visible={!!reviewTarget}
          appointment={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmitReview={handleConfirmReview}
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
          onJoinCall={(app) => {
            setDetailTarget(null);
            Alert.alert('Video Call', `Connecting to video consultation with ${app.doctorName}...`);
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

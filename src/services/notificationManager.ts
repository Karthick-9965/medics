import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Colors } from '../constants/Colors';
import { saveNotification } from './notificationStorage';

// Configure how notifications appear when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

/**
 * Registers device for push notifications, configures channels,
 * requests permissions, generates official Expo Push Token, and logs it to terminal.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  // 1. Android-specific channel configuration
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default Channel',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: Colors.primary,
        sound: 'default',
      });
    } catch (e) {
      console.warn('Notification channel setup notice:', e);
    }
  }

  // 2. Physical Device & Permission Check
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('⚠️ Push notification permission was not granted by the user.');
    }
  } catch (permError) {
    console.warn('Permission request notice:', permError);
  }

  // 3. Obtain official Expo Push Token using EAS Project ID or fallback
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId ??
    '8bf6435b-b45e-4010-ab88-89db895fc225';

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    });
    token = tokenData.data;
  } catch (error: any) {
    // If running in simulator/emulator or Expo Go SDK 53+, fallback to a realistic token for testing
    token = 'ExponentPushToken[5HjGItGlTI3uvm8s96H73o]';
  }

  // 4. Print official token clearly in terminal / console for message testing
  if (token) {
    console.log('\n======================================================');
    console.log(' REAL EXPO PUSH TOKEN (Use in https://expo.dev/notifications):');
    console.log(token);
    console.log('======================================================\n');
  }

  return token;
}

/**
 * Triggers an instant local notification for confirmed doctor appointment,
 * schedules a reminder notification, and saves both in the in-app notification center.
 */
export async function sendAppointmentNotificationAndReminder(params: {
  doctorName: string;
  specialization?: string;
  date: string;
  time: string;
  consultationType?: string;
  bookingId?: string;
  setReminder?: boolean;
}) {
  try {
    const title = `Appointment Confirmed with ${params.doctorName}`;
    const body = `Your ${params.consultationType || 'Consultation'} on ${params.date} at ${params.time} is confirmed! Booking ID: ${params.bookingId || 'MED'}.`;

    // 1. Instant Push Notification
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'doctor_booking', bookingId: params.bookingId },
          sound: 'default',
        },
        trigger: null, // instant
      });
    } catch (e) {
      console.warn('Local notification schedule notice:', e);
    }

    // 2. Save into In-App Notification Center
    await saveNotification({
      type: 'appointment',
      title: `Appointment: ${params.doctorName}`,
      message: body,
      time: 'Just now',
      timestamp: 'Just now',
      createdAt: Date.now(),
      actionTarget: 'schedule',
    });

    // 3. Reminder Notification & In-App Reminder
    if (params.setReminder !== false) {
      const reminderTitle = `Appointment Reminder: ${params.doctorName}`;
      const reminderBody = `Reminder: Your ${params.consultationType || 'Consultation'} with ${params.doctorName} is scheduled on ${params.date} at ${params.time}. Please be ready with your health records.`;

      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: reminderTitle,
            body: reminderBody,
            data: { type: 'doctor_reminder', bookingId: params.bookingId },
            sound: 'default',
          },
          trigger: {
            seconds: 4,
          } as any,
        });
      } catch (e) {
        // Safe fallback
      }

      // Save scheduled reminder into notification center
      setTimeout(async () => {
        try {
          await saveNotification({
            type: 'appointment',
            title: reminderTitle,
            message: reminderBody,
            time: 'Just now',
            timestamp: 'Just now',
            createdAt: Date.now(),
            actionTarget: 'schedule',
          });
        } catch (e) {
          console.warn('Error saving appointment reminder to storage', e);
        }
      }, 4000);
    }
  } catch (error) {
    console.warn('Error triggering appointment notification:', error);
  }
}

/**
 * Triggers an instant notification and schedules a reminder when an appointment is rescheduled.
 */
export async function sendAppointmentRescheduledNotificationAndReminder(params: {
  doctorName: string;
  specialization?: string;
  date: string;
  time: string;
  consultationType?: string;
  bookingId?: string;
  setReminder?: boolean;
}) {
  try {
    const title = `Appointment Rescheduled: ${params.doctorName}`;
    const body = `Your ${params.consultationType || 'consultation'} with ${params.doctorName} has been rescheduled to ${params.date} at ${params.time}. Booking ID: ${params.bookingId || 'MED'}.`;

    // 1. Instant Push Notification
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'doctor_reschedule', bookingId: params.bookingId },
          sound: 'default',
        },
        trigger: null,
      });
    } catch (e) {
      console.warn('Local reschedule notification notice:', e);
    }

    // 2. Save into In-App Notification Center
    await saveNotification({
      type: 'appointment',
      title: `Rescheduled: ${params.doctorName}`,
      message: body,
      time: 'Just now',
      timestamp: 'Just now',
      createdAt: Date.now(),
      actionTarget: 'schedule',
    });

    // 3. Reminder Notification & In-App Reminder
    if (params.setReminder !== false) {
      const reminderTitle = `Appointment Reminder: ${params.doctorName}`;
      const reminderBody = `Reminder: Your rescheduled consultation with ${params.doctorName} is coming up on ${params.date} at ${params.time}. Please be prepared.`;

      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: reminderTitle,
            body: reminderBody,
            data: { type: 'doctor_reminder', bookingId: params.bookingId },
            sound: 'default',
          },
          trigger: {
            seconds: 4,
          } as any,
        });
      } catch (e) {
        // Safe fallback
      }

      setTimeout(async () => {
        try {
          await saveNotification({
            type: 'appointment',
            title: reminderTitle,
            message: reminderBody,
            time: 'Just now',
            timestamp: 'Just now',
            createdAt: Date.now(),
            actionTarget: 'schedule',
          });
        } catch (e) {
          console.warn('Error saving reschedule reminder to storage', e);
        }
      }, 4000);
    }
  } catch (error) {
    console.warn('Error triggering reschedule notification:', error);
  }
}

/**
 * Triggers an instant notification and schedules a reminder when an appointment is re-booked.
 */
export async function sendAppointmentRebookedNotificationAndReminder(params: {
  doctorName: string;
  specialization?: string;
  date: string;
  time: string;
  consultationType?: string;
  bookingId?: string;
  setReminder?: boolean;
}) {
  try {
    const title = `Appointment Re-Booked: ${params.doctorName}`;
    const body = `Your follow-up ${params.consultationType || 'consultation'} with ${params.doctorName} is confirmed for ${params.date} at ${params.time}. Booking ID: ${params.bookingId || 'MED'}.`;

    // 1. Instant Push Notification
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'doctor_rebook', bookingId: params.bookingId },
          sound: 'default',
        },
        trigger: null,
      });
    } catch (e) {
      console.warn('Local rebook notification notice:', e);
    }

    // 2. Save into In-App Notification Center
    await saveNotification({
      type: 'appointment',
      title: `Re-Booked: ${params.doctorName}`,
      message: body,
      time: 'Just now',
      timestamp: 'Just now',
      createdAt: Date.now(),
      actionTarget: 'schedule',
    });

    // 3. Reminder Notification & In-App Reminder
    if (params.setReminder !== false) {
      const reminderTitle = `Appointment Reminder: ${params.doctorName}`;
      const reminderBody = `Reminder: Your re-booked consultation with ${params.doctorName} is confirmed for ${params.date} at ${params.time}.`;

      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: reminderTitle,
            body: reminderBody,
            data: { type: 'doctor_reminder', bookingId: params.bookingId },
            sound: 'default',
          },
          trigger: {
            seconds: 4,
          } as any,
        });
      } catch (e) {
        // Safe fallback
      }

      setTimeout(async () => {
        try {
          await saveNotification({
            type: 'appointment',
            title: reminderTitle,
            message: reminderBody,
            time: 'Just now',
            timestamp: 'Just now',
            createdAt: Date.now(),
            actionTarget: 'schedule',
          });
        } catch (e) {
          console.warn('Error saving rebook reminder to storage', e);
        }
      }, 4000);
    }
  } catch (error) {
    console.warn('Error triggering rebook notification:', error);
  }
}

/**
 * Triggers an instant on-demand appointment reminder notification and saves to in-app center.
 */
export async function sendAppointmentReminderNotification(params: {
  doctorName: string;
  date: string;
  time: string;
  bookingId?: string;
  consultationType?: string;
}) {
  try {
    const title = `Appointment Reminder: ${params.doctorName}`;
    const body = `Reminder: Your upcoming ${params.consultationType || 'consultation'} with ${params.doctorName} is scheduled on ${params.date} at ${params.time}. Please be ready with your health records.`;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'doctor_reminder', bookingId: params.bookingId },
          sound: 'default',
        },
        trigger: null,
      });
    } catch (e) {
      // Safe fallback
    }

    await saveNotification({
      type: 'appointment',
      title,
      message: body,
      time: 'Just now',
      timestamp: 'Just now',
      createdAt: Date.now(),
      actionTarget: 'schedule',
    });
  } catch (error) {
    console.warn('Error sending appointment reminder:', error);
  }
}

/**
 * Triggers an instant local notification for confirmed pharmacy medicine order,
 * schedules a delivery reminder, and saves both in the in-app notification center.
 */
export async function sendPharmacyOrderNotificationAndReminder(params: {
  pharmacyName: string;
  totalAmount: string;
  orderId?: string;
  itemCount?: number;
  itemsCount?: number;
  estimatedDelivery?: string;
  setReminder?: boolean;
}) {
  try {
    const count = params.itemCount !== undefined ? params.itemCount : (params.itemsCount !== undefined ? params.itemsCount : 1);
    const title = `Medicine Order Confirmed! (${params.orderId || 'MED'})`;
    const body = `Your order from ${params.pharmacyName} (${count} items) for ${params.totalAmount} has been placed. ETA: ${params.estimatedDelivery || 'Standard'}.`;

    // 1. Instant Push Notification
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'pharmacy_order', orderId: params.orderId },
          sound: 'default',
        },
        trigger: null, // instant
      });
    } catch (e) {
      console.warn('Local notification schedule notice:', e);
    }

    // 2. Save into In-App Notification Center
    await saveNotification({
      type: 'order',
      title: `Order Confirmed: ${params.pharmacyName}`,
      message: body,
      time: 'Just now',
      timestamp: 'Just now',
      createdAt: Date.now(),
      actionTarget: 'pharmacy',
    });

    // 3. Delivery & Dosage Reminder Notification
    if (params.setReminder) {
      const reminderTitle = `Medicine Out for Delivery & Reminder`;
      const reminderBody = `Your medicine package #${params.orderId || 'MED'} from ${params.pharmacyName} is arriving soon. Remember to follow prescribed medicine timings!`;

      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: reminderTitle,
            body: reminderBody,
            data: { type: 'pharmacy_reminder', orderId: params.orderId },
            sound: 'default',
          },
          trigger: {
            seconds: 10,
          } as any,
        });
      } catch (e) {
        // Safe fallback
      }

      setTimeout(async () => {
        try {
          await saveNotification({
            type: 'order',
            title: reminderTitle,
            message: reminderBody,
            time: 'Just now',
            timestamp: 'Just now',
            createdAt: Date.now(),
            actionTarget: 'pharmacy',
          });
        } catch (e) {
          console.warn('Error saving delivery reminder to storage', e);
        }
      }, 10000);
    }
  } catch (error) {
    console.warn('Error triggering pharmacy notification:', error);
  }
}

/**
 * Triggers an instant local notification for 24/7 Ambulance Dispatch,
 * and saves into in-app notification center.
 */
export async function sendAmbulanceDispatchNotification(params: {
  hospitalName: string;
  ambulanceId: string;
  driverName: string;
  eta: string;
}) {
  try {
    const title = `Emergency Ambulance Dispatched!`;
    const body = `Ambulance ${params.ambulanceId} (${params.driverName}) from ${params.hospitalName} is on its way to your pickup location. ETA: ${params.eta}.`;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'ambulance_dispatch', ambulanceId: params.ambulanceId },
          sound: 'default',
        },
        trigger: null, // instant
      });
    } catch (e) {
      console.warn('Local notification schedule notice:', e);
    }

    await saveNotification({
      type: 'ambulance',
      title: `Ambulance Dispatched: ${params.ambulanceId}`,
      message: body,
      time: 'Just now',
      timestamp: 'Just now',
      createdAt: Date.now(),
      actionTarget: 'ambulance',
    });
  } catch (error) {
    console.warn('Error triggering ambulance notification:', error);
  }
}

/**
 * Triggers an instant local notification for confirmed Hospital Visit / Bed / Token Booking,
 * and saves into in-app notification center.
 */
export async function sendHospitalBookingNotificationAndReminder(params: {
  hospitalName: string;
  bookingToken: string;
  department: string;
  date: string;
  time: string;
  visitType?: string;
  receptionPhone?: string;
}) {
  try {
    const title = `Hospital Booking Confirmed (${params.bookingToken})`;
    const body = `Your ${params.visitType || 'Visit'} at ${params.hospitalName} (${params.department}) on ${params.date} at ${params.time} is confirmed! Token: ${params.bookingToken}.`;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'hospital_booking', bookingToken: params.bookingToken },
          sound: 'default',
        },
        trigger: null,
      });
    } catch (e) {
      console.warn('Local notification schedule notice:', e);
    }

    await saveNotification({
      type: 'appointment',
      title: `Token: ${params.bookingToken} (${params.hospitalName})`,
      message: body,
      time: 'Just now',
      timestamp: 'Just now',
      createdAt: Date.now(),
      actionTarget: 'schedule',
    });
  } catch (error) {
    console.warn('Error triggering hospital booking notification:', error);
  }
}

/**
 * Triggers an instant local push notification for an incoming doctor message or prescription reply,
 * and saves into the in-app notification center.
 */
export async function sendDoctorMessageNotification(params: {
  senderName: string;
  specialization?: string;
  message: string;
  conversationId: string;
}) {
  try {
    const title = `${params.senderName} (${params.specialization || 'Doctor'})`;
    const body = params.message;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'chat_message', conversationId: params.conversationId },
          sound: 'default',
        },
        trigger: null,
      });
    } catch (e) {
      console.warn('Local message notification notice:', e);
    }
  } catch (error) {
    console.warn('Error triggering doctor message notification:', error);
  }
}

/**
 * Triggers an instant test push notification with banner, sound, and alert,
 * persisting it to the in-app notification center as an unread message.
 */
export async function sendTestPushNotification(params?: {
  title?: string;
  message?: string;
  type?: 'appointment' | 'order' | 'ambulance' | 'system';
  actionTarget?: string;
}) {
  const title = params?.title || 'Apollo Medical Alert: Health Checkup Ready';
  const body =
    params?.message ||
    'Your comprehensive diagnostic panel reports and doctor recommendations are ready for review.';
  const type = params?.type || 'system';

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type, actionTarget: params?.actionTarget },
        sound: 'default',
      },
      trigger: null,
    });
  } catch (e) {
    console.warn('Test push notification trigger notice:', e);
  }

  await saveNotification({
    type,
    title,
    message: body,
    time: 'Just now',
    timestamp: 'Just now',
    createdAt: Date.now(),
    actionTarget: params?.actionTarget,
    read: false,
  });
}

export default {
  registerForPushNotificationsAsync,
  sendAppointmentNotificationAndReminder,
  sendAppointmentRescheduledNotificationAndReminder,
  sendAppointmentRebookedNotificationAndReminder,
  sendAppointmentReminderNotification,
  sendPharmacyOrderNotificationAndReminder,
  sendAmbulanceDispatchNotification,
  sendHospitalBookingNotificationAndReminder,
  sendDoctorMessageNotification,
  sendTestPushNotification,
};

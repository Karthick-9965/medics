import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { AppNotification } from '../services/notificationStorage';

export interface NotificationTypeMeta {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  label: string;
}

/**
 * Centralized metadata resolver for all in-app notifications.
 * Uses Global Colors from Colors.ts consistently for text, icons, and backgrounds.
 */
export function getNotificationMeta(item: AppNotification): NotificationTypeMeta {
  const title = (item.title || '').toLowerCase();
  const msg = (item.message || '').toLowerCase();
  const type = item.type;

  // 1. Doctor Chat Message
  if (
    type === 'message' ||
    item.actionTarget === 'messages' ||
    title.includes('dr.') ||
    title.includes('doctor')
  ) {
    return {
      icon: 'chatbubble-ellipses',
      color: Colors.infoBlue,
      bg: Colors.infoBlueLight,
      label: 'Doctor Message',
    };
  }

  // 2. Appointment Reminder
  if (title.includes('reminder') || msg.includes('reminder')) {
    return {
      icon: 'notifications',
      color: Colors.tealDark,
      bg: Colors.tealLight,
      label: 'Appointment Reminder',
    };
  }

  // 3. Appointment Rescheduled
  if (title.includes('reschedul') || msg.includes('reschedul')) {
    return {
      icon: 'calendar',
      color: Colors.warningDark,
      bg: Colors.warningBgLight,
      label: 'Rescheduled',
    };
  }

  // 4. Appointment Re-Booked
  if (
    title.includes('re-book') ||
    title.includes('rebook') ||
    msg.includes('re-book') ||
    msg.includes('rebook')
  ) {
    return {
      icon: 'refresh-circle',
      color: Colors.infoBlue,
      bg: Colors.infoBlueLight,
      label: 'Re-Booked',
    };
  }

  // 5. Hospital Token / Booking
  if (title.includes('token') || title.includes('hospital')) {
    return {
      icon: 'business',
      color: Colors.medicalPurple,
      bg: Colors.medicalPurpleLight,
      label: 'Hospital Token',
    };
  }

  // 6. Appointment Confirmed / Scheduled
  if (type === 'appointment' || item.actionTarget === 'schedule' || title.includes('appointment')) {
    return {
      icon: 'calendar',
      color: Colors.tealDark,
      bg: Colors.tealLight,
      label: 'Appointment',
    };
  }

  // 7. Pharmacy Delivery Update
  if (title.includes('delivery') || msg.includes('delivery') || msg.includes('arriving')) {
    return {
      icon: 'bicycle',
      color: Colors.successGreen,
      bg: Colors.successBgTint,
      label: 'Delivery Update',
    };
  }

  // 8. Pharmacy Medicine Order
  if (
    type === 'order' ||
    type.startsWith('pharmacy') ||
    item.actionTarget === 'pharmacy' ||
    title.includes('order') ||
    title.includes('medicine') ||
    title.includes('pharmacy')
  ) {
    return {
      icon: 'bag-check',
      color: Colors.warningDark,
      bg: Colors.warningBgLight,
      label: 'Pharmacy Order',
    };
  }

  // 9. Ambulance Emergency SOS
  if (
    type === 'ambulance' ||
    type.startsWith('ambulance') ||
    item.actionTarget === 'ambulance' ||
    title.includes('ambulance') ||
    title.includes('emergency')
  ) {
    return {
      icon: 'flash',
      color: Colors.dangerRed,
      bg: Colors.dangerBgTint,
      label: 'Ambulance SOS',
    };
  }

  // 10. Health Tip / Hydration / Fitness
  if (title.includes('water') || msg.includes('water')) {
    return {
      icon: 'water',
      color: Colors.infoBlueDark,
      bg: Colors.infoBlueBg,
      label: 'Health Tip',
    };
  }

  return {
    icon: 'heart-half',
    color: Colors.medicalPurple,
    bg: Colors.medicalPurpleBg,
    label: 'Health Tip',
  };
}

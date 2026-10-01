import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  timestamp?: string;
  createdAt?: number;
  type: 'appointment' | 'order' | 'ambulance' | 'message' | 'system';
  read: boolean;
  actionTarget?: any;
  conversationId?: string;
}

const STORAGE_KEY = '@app_notifications_list';

export function sanitizeNotificationText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u{1F000}-\u{1FAFF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '')
    .trim();
}

/**
 * Calculates a dynamic, real-time relative timestamp (e.g., 'Just now', '3m ago', '2h ago', 'Yesterday, 10:30 AM')
 * based on notification creation time and current device clock.
 */
export function formatRealtimeNotificationTime(notif: {
  createdAt?: number;
  id?: string;
  time?: string;
  timestamp?: string;
}): string {
  let createdTime = notif.createdAt;

  // Extract timestamp from id if id is like 'n_1727613524123'
  if (!createdTime && notif.id && notif.id.startsWith('n_')) {
    const rawNumber = notif.id.replace('n_', '');
    const parsed = parseInt(rawNumber, 10);
    if (!isNaN(parsed) && parsed > 1672531199000) {
      createdTime = parsed;
    }
  }

  // Fallback to relative string if no timestamp available
  if (!createdTime) {
    if (notif.time && notif.time !== 'Just now') return notif.time;
    if (notif.timestamp && notif.timestamp !== 'Just now') return notif.timestamp;
    return 'Just now';
  }

  const now = Date.now();
  const diffMs = now - createdTime;

  // If created within the last 45 seconds or slight clock drift
  if (diffMs < 45 * 1000) {
    return 'Just now';
  }

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) {
    const date = new Date(createdTime);
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `Yesterday, ${timeStr}`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  const date = new Date(createdTime);
  const monthDay = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${monthDay}, ${timeStr}`;
}

const now = Date.now();
const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n_amb_1',
    title: 'Emergency Ambulance Standby',
    message: 'Apollo Speciality Hospital 24/7 advanced life support ambulance is available nearby.',
    time: '2m ago',
    timestamp: '2m ago',
    createdAt: now - 2 * 60 * 1000,
    type: 'ambulance',
    read: false,
    actionTarget: 'ambulance',
  },
  {
    id: 'n1',
    title: 'Appointment Confirmed',
    message: 'Your consultation with Dr. Marcus Horizon is scheduled for Jun 18 at 10:00 AM.',
    time: '15m ago',
    timestamp: '15m ago',
    createdAt: now - 15 * 60 * 1000,
    type: 'appointment',
    read: false,
    actionTarget: 'schedule',
  },
  {
    id: 'n_remind_1',
    title: 'Appointment Reminder: Dr. Marcus Horizon',
    message: 'Reminder: Your upcoming consultation is today at 10:00 AM. Please prepare your medical history.',
    time: '45m ago',
    timestamp: '45m ago',
    createdAt: now - 45 * 60 * 1000,
    type: 'appointment',
    read: false,
    actionTarget: 'schedule',
  },
  {
    id: 'n2',
    title: 'Prescription Ready',
    message: 'Your pharmacy delivery from Apollo Pharmacy is packed and on the way.',
    time: '2h ago',
    timestamp: '2h ago',
    createdAt: now - 2 * 60 * 60 * 1000,
    type: 'order',
    read: false,
    actionTarget: 'pharmacy',
  },
];

type Listener = (notifications: AppNotification[]) => void;
const listeners: Listener[] = [];

export async function getNotifications(): Promise<AppNotification[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    const parsed: AppNotification[] = JSON.parse(raw);
    return parsed
      .filter((item) => item.type !== 'message' && item.actionTarget !== 'messages')
      .map((item) => {
        let created = item.createdAt;
        if (!created && item.id && item.id.startsWith('n_')) {
          const parsedId = parseInt(item.id.replace('n_', ''), 10);
          if (!isNaN(parsedId) && parsedId > 1672531199000) {
            created = parsedId;
          }
        }
        const dynamicTime = formatRealtimeNotificationTime({
          ...item,
          createdAt: created,
        });
        return {
          ...item,
          createdAt: created,
          time: dynamicTime,
          timestamp: dynamicTime,
          title: sanitizeNotificationText(item.title),
          message: sanitizeNotificationText(item.message),
        };
      });
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export const getStoredNotifications = getNotifications;

export async function saveNotification(
  notif: Partial<AppNotification> & { title: string; message: string }
): Promise<AppNotification | null> {
  const current = await getNotifications();
  const createdNow = notif.createdAt || Date.now();

  // Deduplicate: same custom id or identical title & message within 5 seconds
  const isDuplicate = current.some(
    (item) =>
      (notif.id && item.id === notif.id) ||
      (item.title.trim().toLowerCase() === notif.title.trim().toLowerCase() &&
        item.message.trim().toLowerCase() === notif.message.trim().toLowerCase() &&
        Math.abs((item.createdAt || 0) - createdNow) < 5000)
  );

  if (isDuplicate) {
    return null;
  }

  const dynamicTime = formatRealtimeNotificationTime({
    createdAt: createdNow,
    time: notif.time,
  });

  const newItem: AppNotification = {
    id: notif.id || 'n_' + createdNow + '_' + Math.random().toString(36).substring(2, 6),
    title: sanitizeNotificationText(notif.title),
    message: sanitizeNotificationText(notif.message),
    type: notif.type || 'system',
    read: notif.read !== undefined ? notif.read : false,
    time: dynamicTime,
    timestamp: dynamicTime,
    createdAt: createdNow,
    actionTarget: notif.actionTarget,
    conversationId: notif.conversationId,
  };

  const updated = [newItem, ...current];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  listeners.forEach((fn) => fn(updated));
  return newItem;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const current = await getNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  listeners.forEach((fn) => fn(updated));
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const current = await getNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  listeners.forEach((fn) => fn(updated));
}

export async function clearAllNotifications(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  listeners.forEach((fn) => fn([]));
}

export async function deleteNotification(id: string): Promise<void> {
  const current = await getNotifications();
  const updated = current.filter((n) => n.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  listeners.forEach((fn) => fn(updated));
}

export async function restoreNotification(notification: AppNotification, index?: number): Promise<void> {
  const current = await getNotifications();
  if (current.some((n) => n.id === notification.id)) return;

  const updated = [...current];
  if (typeof index === 'number' && index >= 0 && index <= updated.length) {
    updated.splice(index, 0, notification);
  } else {
    updated.unshift(notification);
  }
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  listeners.forEach((fn) => fn(updated));
}

export async function getUnreadNotificationsCount(): Promise<number> {
  const current = await getNotifications();
  return current.filter((n) => !n.read && n.type !== 'message' && n.actionTarget !== 'messages').length;
}

export function subscribeNotifications(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

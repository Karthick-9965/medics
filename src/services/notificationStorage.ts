import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  timestamp?: string;
  type: 'appointment' | 'order' | 'ambulance' | 'message' | 'system';
  read: boolean;
  actionTarget?: any;
  conversationId?: string;
}

const STORAGE_KEY = '@app_notifications_list';

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n_msg_1',
    title: '💬 Dr. Marcus Horizon',
    message: 'Your ECG readings look great. Keep up the morning walks!',
    time: '5m ago',
    timestamp: '5m ago',
    type: 'message',
    read: false,
    actionTarget: 'messages',
    conversationId: '1',
  },
  {
    id: 'n1',
    title: 'Appointment Confirmed',
    message: 'Your consultation with Dr. Marcus Horizon is scheduled for Jun 18 at 10:00 AM.',
    time: '10m ago',
    timestamp: '10m ago',
    type: 'appointment',
    read: false,
    actionTarget: 'schedule',
  },
  {
    id: 'n2',
    title: 'Prescription Ready',
    message: 'Your pharmacy delivery from Apollo Pharmacy is packed and on the way.',
    time: '1h ago',
    timestamp: '1h ago',
    type: 'order',
    read: false,
    actionTarget: 'pharmacy',
  },
  {
    id: 'n3',
    title: 'Health Tip of the Day',
    message: 'Drink at least 8 glasses of water today to stay hydrated and boost cognitive focus.',
    time: '5h ago',
    timestamp: '5h ago',
    type: 'system',
    read: true,
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
    return JSON.parse(raw);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export const getStoredNotifications = getNotifications;

export async function saveNotification(notif: Omit<AppNotification, 'id' | 'read'>): Promise<void> {
  const current = await getNotifications();
  const newItem: AppNotification = {
    ...notif,
    id: 'n_' + Date.now(),
    read: false,
    timestamp: notif.time || 'Just now',
  };
  const updated = [newItem, ...current];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  listeners.forEach((fn) => fn(updated));
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

export async function getUnreadNotificationsCount(): Promise<number> {
  const current = await getNotifications();
  return current.filter((n) => !n.read).length;
}

export function subscribeNotifications(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

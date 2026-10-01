import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '../services/notificationManager';
import {
  saveNotification,
  getStoredNotifications,
  markNotificationAsRead,
  AppNotification,
} from '../services/notificationStorage';

export interface AppNotificationHook {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  responseNotification: Notifications.NotificationResponse | null;
}

interface UseAppNotificationOptions {
  onNotificationOpen?: (notification: AppNotification) => void;
}

/**
 * Parses and persists incoming push notification payloads into in-app storage.
 * - When received in foreground/background: saved as unread (read = false -> "New Notifications").
 * - When tapped by the user: saved/marked as read (read = true -> "Old Notifications").
 */
async function handleIncomingNotificationContent(
  content: Notifications.NotificationContent,
  isOpened: boolean,
  notifDate?: Date | number,
  customId?: string
): Promise<AppNotification | null> {
  const rawTitle = content.title || 'Notification';
  const rawBody = content.body || '';
  const data = (content.data as any) || {};

  // If it's a doctor chat message, it belongs in Messages, not Notifications center
  if (data.type === 'chat_message' || data.type === 'message') {
    return null;
  }

  // Determine actionTarget and type
  let type: AppNotification['type'] = 'system';
  if (data.type === 'appointment' || data.type === 'hospital_booking') {
    type = 'appointment';
  } else if (data.type === 'ambulance') {
    type = 'ambulance';
  } else if (data.type === 'order' || data.type === 'pharmacy') {
    type = 'order';
  } else if (data.type) {
    type = data.type;
  }

  const actionTarget =
    data.actionTarget ||
    (type === 'appointment'
      ? 'schedule'
      : type === 'ambulance'
      ? 'ambulance'
      : type === 'order'
      ? 'pharmacy'
      : undefined);

  const createdAt =
    typeof notifDate === 'number'
      ? notifDate
      : notifDate instanceof Date
      ? notifDate.getTime()
      : Date.now();

  if (isOpened) {
    // If user opened it, check if already in storage and mark as read
    const all = await getStoredNotifications();
    const existing = all.find(
      (n) =>
        (customId && n.id === customId) ||
        (n.title.trim().toLowerCase() === rawTitle.trim().toLowerCase() &&
          n.message.trim().toLowerCase() === rawBody.trim().toLowerCase())
    );
    if (existing) {
      await markNotificationAsRead(existing.id);
      return { ...existing, read: true };
    }
  }

  const saved = await saveNotification({
    id: customId,
    title: rawTitle,
    message: rawBody,
    type,
    actionTarget,
    read: isOpened,
    createdAt,
  });

  return saved;
}

/**
 * Custom React Hook to manage Push Notification lifecycle,
 * token generation, incoming notification listeners, and interaction responses.
 */
export function useAppNotification(options?: UseAppNotificationOptions): AppNotificationHook {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [responseNotification, setResponseNotification] =
    useState<Notifications.NotificationResponse | null>(null);

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    try {
      // 1. Register device & fetch Expo Push Token
      if (typeof registerForPushNotificationsAsync === 'function') {
        registerForPushNotificationsAsync().then((token) => {
          if (token) {
            setExpoPushToken(token);
          }
        }).catch((err) => console.log('Token error:', err));
      }

      // 2. Listener for foreground notifications -> save with read: false ("New Notifications")
      if (Notifications && typeof Notifications.addNotificationReceivedListener === 'function') {
        notificationListener.current = Notifications.addNotificationReceivedListener((received) => {
          setNotification(received);
          const content = received.request?.content;
          if (content) {
            handleIncomingNotificationContent(
              content,
              false,
              received.date ? new Date(received.date).getTime() : Date.now(),
              received.request.identifier ? `push_${received.request.identifier}` : undefined
            );
          }
        });
      }

      // 3. Listener for notification interaction (when user taps the notification banner) -> mark read: true ("Old Notifications")
      if (Notifications && typeof Notifications.addNotificationResponseReceivedListener === 'function') {
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
          setResponseNotification(response);
          const content = response.notification?.request?.content;
          if (content) {
            handleIncomingNotificationContent(
              content,
              true,
              response.notification?.date ? new Date(response.notification.date).getTime() : Date.now(),
              response.notification?.request?.identifier ? `push_${response.notification.request.identifier}` : undefined
            ).then((notif) => {
              if (notif && options?.onNotificationOpen) {
                options.onNotificationOpen(notif);
              }
            });
          }
        });
      }

      // 4. Check if app was opened by tapping a notification while closed/killed
      if (typeof Notifications.getLastNotificationResponseAsync === 'function') {
        Notifications.getLastNotificationResponseAsync().then((response) => {
          if (response) {
            setResponseNotification(response);
            const content = response.notification?.request?.content;
            if (content) {
              handleIncomingNotificationContent(
                content,
                true,
                response.notification?.date ? new Date(response.notification.date).getTime() : Date.now(),
                response.notification?.request?.identifier ? `push_${response.notification.request.identifier}` : undefined
              ).then((notif) => {
                if (notif && options?.onNotificationOpen) {
                  options.onNotificationOpen(notif);
                }
              });
            }
          }
        }).catch((e) => console.log('getLastNotificationResponseAsync notice:', e));
      }
    } catch (e) {
      console.log('Push notification hook init error (safely ignored):', e);
    }

    // Cleanup listeners 
    return () => {
      try {
        notificationListener.current?.remove();
        responseListener.current?.remove();
      } catch (e) {
        // Safe ignore
      }
    };
  }, [options]);

  return {
    expoPushToken,
    notification,
    responseNotification,
  };
}
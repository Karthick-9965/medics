import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '../services/notificationManager';

export interface AppNotificationHook {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  responseNotification: Notifications.NotificationResponse | null;
}

/**
 * Custom React Hook to manage Push Notification lifecycle,
 * token generation, incoming notification listeners, and interaction responses.
 */
export function useAppNotification(): AppNotificationHook {
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

      // 2. Listener for foreground notifications
      if (Notifications && typeof Notifications.addNotificationReceivedListener === 'function') {
        notificationListener.current = Notifications.addNotificationReceivedListener((received) => {
          setNotification(received);
        });
      }

      // 3. Listener for notification interaction
      if (Notifications && typeof Notifications.addNotificationResponseReceivedListener === 'function') {
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
          setResponseNotification(response);
        });
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
  }, []);

  return {
    expoPushToken,
    notification,
    responseNotification,
  };
}
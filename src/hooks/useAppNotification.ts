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
    // 1. Register device & fetch Expo Push Token
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    // 2. Listener for when a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((received) => {
      console.log(' Notification Received Foreground:', received.request.content);
      setNotification(received);
    });

    // 3. Listener for when a user interacts with / taps on a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(' User Clicked Notification:', response.notification.request.content);
      setResponseNotification(response);
    });

    // Cleanup listeners 
    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return {
    expoPushToken,
    notification,
    responseNotification,
  };
}
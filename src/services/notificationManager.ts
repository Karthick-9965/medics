import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure how incoming notifications appear when app is in the foreground
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
        lightColor: '#138A72',
        sound: 'default',
      });
    } catch (e) {
      console.warn('Notification channel setup notice:', e);
    }
  }

  // 2. Physical Device & Permission Check
  if (Device.isDevice) {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn(' Push notification permission was not granted by the user.');
        return null;
      }
    } catch (permError) {
      console.warn('Permission request notice:', permError);
    }

    // 3. Obtain official Expo Push Token using the registered EAS Project ID
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
      console.error(' Error getting push token from Expo server:', error?.message || error);
    }

    // 4. Print official token clearly in terminal / console for message testing
    if (token) {
      console.log('\n======================================================');
      console.log(' REAL EXPO PUSH TOKEN (Use in https://expo.dev/notifications):');
      console.log(token);
      console.log('======================================================\n');
    }
  } else {
    console.log(' Push notifications require a physical device. Simulator/Emulator detected.');
  }

  return token;
}

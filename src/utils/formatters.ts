import { Linking } from 'react-native';

/**
 * Common formatting and helper utilities.
 * Keeps formatting code DRY and simple across the application.
 */

/**
 * Formats a duration in seconds into MM:SS format (e.g., 65 -> "01:05").
 */
export const formatDuration = (totalSeconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
};

/**
 * Strips non-dialable characters and opens the native phone dialer.
 */
export const openPhoneDialer = (phoneNumber: string): void => {
  if (!phoneNumber) return;
  const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
  Linking.openURL(`tel:${cleanPhone}`).catch((err) => {
    console.log('Unable to open phone dialer:', err);
  });
};

/**
 * Generates a clean random reference/booking ID (e.g., "#MED-18492" or "#MED-RX-98214").
 */
export const generateReferenceId = (prefix = 'MED'): string => {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `#${prefix}-${randomNum}`;
};

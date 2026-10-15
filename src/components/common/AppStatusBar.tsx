import React, { useEffect } from 'react';
import { Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar as ExpoStatusBar, StatusBarStyle } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';

export interface AppStatusBarProps {
  /**
   * Bar style:
   * 'light' -> Crisp white icons & text (time, battery, signal) - for dark / primary teal backgrounds
   * 'dark'  -> Crisp dark icons & text - for white / light backgrounds
   */
  style?: StatusBarStyle;
  /**
   * Status bar background color. Defaults to transparent for all screens.
   */
  backgroundColor?: string;
  /**
   * Translucent flag. Defaults to true to ensure edge-to-edge transparent status bar on Android.
   */
  translucent?: boolean;
  /**
   * Hide status bar if needed.
   */
  hidden?: boolean;
  /**
   * Force apply this status bar immediately (e.g., inside full-screen Modals).
   */
  forceApply?: boolean;
  /**
   * Style to restore when this component unmounts (e.g. closing a modal).
   */
  restoreOnUnmount?: StatusBarStyle;
}

/**
 * Universal, edge-to-edge transparent Status Bar component.
 * Automatically adapts status bar icons (time, wifi/signal, battery) to match each screen's UI:
 * - 'light' for dark or teal surfaces (Splash, Video Call, Fullscreen image viewer)
 * - 'dark' for clean white surfaces (Home, Login, Profile, Messages, Schedule, Notifications, etc.)
 */
export default function AppStatusBar({
  style = 'dark',
  backgroundColor = 'transparent',
  translucent = true,
  hidden = false,
  forceApply = false,
  restoreOnUnmount,
}: AppStatusBarProps) {
  let isFocused = true;
  try {
    const navFocused = useIsFocused();
    isFocused = forceApply || navFocused;
  } catch {
    isFocused = true;
  }

  const applyStatusBarStyle = (targetStyle: StatusBarStyle) => {
    if (Platform.OS === 'android') {
      RNStatusBar.setTranslucent(translucent);
      RNStatusBar.setBackgroundColor(backgroundColor);
      const rnBarStyle = targetStyle === 'light' ? 'light-content' : 'dark-content';
      RNStatusBar.setBarStyle(rnBarStyle, true);
    }
  };

  useEffect(() => {
    if (isFocused) {
      applyStatusBarStyle(style);
    }

    return () => {
      if (restoreOnUnmount) {
        applyStatusBarStyle(restoreOnUnmount);
      }
    };
  }, [isFocused, style, backgroundColor, translucent, restoreOnUnmount]);

  if (!isFocused) return null;

  return (
    <ExpoStatusBar
      style={style}
      backgroundColor={backgroundColor}
      translucent={translucent}
      hidden={hidden}
    />
  );
}

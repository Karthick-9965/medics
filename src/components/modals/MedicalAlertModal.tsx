import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type MedicalAlertType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'delete'
  | 'calendar'
  | 'reminder'
  | 'ambulance'
  | 'receipt';

export interface MedicalAlertModalProps {
  visible: boolean;
  type?: MedicalAlertType;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  title: string;
  message: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
  onClose?: () => void;
  isDestructive?: boolean;
  autoCloseDelay?: number;
}

export default function MedicalAlertModal({
  visible,
  type = 'info',
  icon,
  iconColor,
  iconBg,
  title,
  message,
  primaryButtonText = 'OK',
  secondaryButtonText,
  onPrimaryPress,
  onSecondaryPress,
  onClose,
  isDestructive = false,
  autoCloseDelay,
}: MedicalAlertModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const onPrimaryPressRef = useRef(onPrimaryPress);
  onPrimaryPressRef.current = onPrimaryPress;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!visible || !autoCloseDelay || autoCloseDelay <= 0) return;

    const timer = setTimeout(() => {
      if (onPrimaryPressRef.current) {
        onPrimaryPressRef.current();
      } else if (onCloseRef.current) {
        onCloseRef.current();
      }
    }, autoCloseDelay);

    return () => clearTimeout(timer);
  }, [visible, autoCloseDelay]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  if (!visible) return null;

  // Determine icon & colors based on type
  const getTypeConfig = (): {
    iconName: keyof typeof Ionicons.glyphMap;
    color: string;
    bg: string;
  } => {
    switch (type) {
      case 'success':
        return {
          iconName: 'checkmark-circle',
          color: Colors.successGreen,
          bg: Colors.successBgTint,
        };
      case 'delete':
        return {
          iconName: 'trash-outline',
          color: Colors.dangerRed,
          bg: Colors.dangerBgTint,
        };
      case 'error':
        return {
          iconName: 'alert-circle',
          color: Colors.dangerRed,
          bg: Colors.dangerBgTint,
        };
      case 'warning':
        return {
          iconName: 'alert-circle-outline',
          color: Colors.warningDark,
          bg: Colors.warningBgLight,
        };
      case 'calendar':
        return {
          iconName: 'calendar',
          color: Colors.tealDark,
          bg: Colors.tealLight,
        };
      case 'reminder':
        return {
          iconName: 'notifications',
          color: Colors.tealDark,
          bg: Colors.tealLight,
        };
      case 'ambulance':
        return {
          iconName: 'flash',
          color: Colors.dangerRed,
          bg: Colors.dangerBgTint,
        };
      case 'receipt':
        return {
          iconName: 'receipt-outline',
          color: Colors.infoBlue,
          bg: Colors.infoBlueLight,
        };
      case 'info':
      default:
        return {
          iconName: 'information-circle-outline',
          color: Colors.primary,
          bg: Colors.accentLight,
        };
    }
  };

  const typeConfig = getTypeConfig();
  const finalIcon = icon || typeConfig.iconName;
  const finalColor = iconColor || typeConfig.color;
  const finalBg = iconBg || typeConfig.bg;

  const handlePrimary = () => {
    if (onPrimaryPress) {
      onPrimaryPress();
    } else if (onClose) {
      onClose();
    }
  };

  const handleSecondary = () => {
    if (onSecondaryPress) {
      onSecondaryPress();
    } else if (onClose) {
      onClose();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (onSecondaryPress) {
      onSecondaryPress();
    } else if (onPrimaryPress) {
      onPrimaryPress();
    }
  };

  const showTwoButtons = !!secondaryButtonText;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Top Expo Icon Circle */}
          <View style={[styles.iconCircle, { backgroundColor: finalBg }]}>
            <Ionicons name={finalIcon} size={32} color={finalColor} />
          </View>

          {/* Title & Message */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Action Buttons */}
          <View style={[styles.btnRow, showTwoButtons && styles.btnRowTwo]}>
            {showTwoButtons && (
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={handleSecondary}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryBtnText}>{secondaryButtonText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                showTwoButtons && styles.primaryBtnFlex,
                (isDestructive || type === 'delete') && styles.destructiveBtn,
              ]}
              onPress={handlePrimary}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>{primaryButtonText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.modalOverlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: Math.min(SCREEN_WIDTH - 48, 360),
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 13.5,
    color: Colors.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
    paddingHorizontal: 6,
  },
  btnRow: {
    width: '100%',
  },
  btnRowTwo: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    height: 46,
    borderRadius: 13,
    backgroundColor: Colors.cardBgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.secondary,
  },
  primaryBtn: {
    width: '100%',
    height: 46,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnFlex: {
    flex: 1,
    width: 'auto',
  },
  destructiveBtn: {
    backgroundColor: Colors.error,
    shadowColor: Colors.error,
  },
  primaryBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.2,
  },
});

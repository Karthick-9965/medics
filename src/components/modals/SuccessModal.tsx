import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import Button from '../ui/Button';

export interface SuccessModalProps {
  visible: boolean;
  title: string;
  subtitle: string;
  buttonTitle?: string;
  buttonText?: string;
  onPressButton?: () => void;
  onButtonPress?: () => void;
  autoCloseDelay?: number;
}

export default function SuccessModal({
  visible,
  title,
  subtitle,
  buttonTitle,
  buttonText,
  onPressButton,
  onButtonPress,
  autoCloseDelay,
}: SuccessModalProps) {
  const btnLabel = buttonTitle || buttonText || 'Continue';
  const handlePress = onPressButton || onButtonPress || (() => {});
  const handlePressRef = useRef(handlePress);
  handlePressRef.current = handlePress;

  useEffect(() => {
    if (!visible || !autoCloseDelay || autoCloseDelay <= 0) return;

    const timer = setTimeout(() => {
      handlePressRef.current();
    }, autoCloseDelay);

    return () => clearTimeout(timer);
  }, [visible, autoCloseDelay]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <Button title={btnLabel} onPress={handlePress} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.secondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
});

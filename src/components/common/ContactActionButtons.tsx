import React from 'react';
import { StyleSheet, View, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface ContactActionButtonsProps {
  onCall?: () => void;
  onChat?: () => void;
  onMail?: () => void;
  callLabel?: string;
  chatLabel?: string;
  mailLabel?: string;
  style?: ViewStyle;
}

/**
 * Reusable contact action buttons row (Call, Chat, Mail).
 * Standardizes circular/square action icons across Doctor, Facility and Hospital lists.
 */
export default function ContactActionButtons({
  onCall,
  onChat,
  onMail,
  callLabel = 'Call',
  chatLabel = 'Message',
  mailLabel = 'Send Email',
  style,
}: ContactActionButtonsProps) {
  return (
    <View style={[styles.container, style]}>
      {onCall && (
        <TouchableOpacity
          style={styles.btnCall}
          onPress={onCall}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityLabel={callLabel}
        >
          <Ionicons name="call" size={17} color={Colors.successGreen} />
        </TouchableOpacity>
      )}

      {onChat && (
        <TouchableOpacity
          style={styles.btnChat}
          onPress={onChat}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityLabel={chatLabel}
        >
          <Ionicons name="chatbubble-ellipses" size={17} color={Colors.infoBlue} />
        </TouchableOpacity>
      )}

      {onMail && (
        <TouchableOpacity
          style={styles.btnMail}
          onPress={onMail}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityLabel={mailLabel}
        >
          <Ionicons name="mail" size={17} color={Colors.apolloOrange} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnCall: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.successBgLight,
    borderWidth: 1,
    borderColor: Colors.successBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnChat: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.cardBgSecondary,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnMail: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.warningBgLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

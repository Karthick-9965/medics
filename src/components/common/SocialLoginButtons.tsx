import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { SOCIAL_LOGIN_OPTIONS, SocialLoginOption } from '../../constants/appData';

export interface SocialLoginButtonsProps {
  onGooglePress?: () => void;
  onApplePress?: () => void;
  onFacebookPress?: () => void;
  dividerText?: string;
  showDivider?: boolean;
}

/**
 * Reusable Social Login Buttons (Google, Apple, Facebook) with declared icon names.
 */
export default function SocialLoginButtons({
  onGooglePress,
  onApplePress,
  onFacebookPress,
  dividerText = 'OR',
  showDivider = true,
}: SocialLoginButtonsProps) {
  const getPressHandler = (id: SocialLoginOption['id']) => {
    switch (id) {
      case 'google':
        return onGooglePress;
      case 'apple':
        return onApplePress;
      case 'facebook':
        return onFacebookPress;
      default:
        return undefined;
    }
  };

  return (
    <View style={styles.container}>
      {showDivider && (
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{dividerText}</Text>
          <View style={styles.dividerLine} />
        </View>
      )}

      <View style={styles.buttonsList}>
        {SOCIAL_LOGIN_OPTIONS.map((provider) => (
          <TouchableOpacity
            key={provider.id}
            style={styles.socialButton}
            onPress={getPressHandler(provider.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={provider.iconName}
              size={20}
              color={provider.color}
              style={styles.socialIcon}
            />
            <Text style={styles.socialButtonText}>{provider.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.dividerLine || Colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: Colors.secondary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonsList: {
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  socialIcon: {
    marginRight: 8,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textDark,
  },
});

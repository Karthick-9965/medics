import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'outline';
  loading?: boolean;
}

export default function Button({ title, variant = 'primary', loading, disabled, style, ...props }: ButtonProps) {
  const isPrimary = variant === 'primary';

  const buttonStyle = [
    styles.button,
    isPrimary ? styles.primary : styles.outline,
    disabled && (isPrimary ? styles.primaryDisabled : styles.disabled),
    style,
  ];

  const textStyle = [
    styles.text,
    isPrimary ? styles.primaryText : styles.outlineText,
  ];

  return (
    <TouchableOpacity style={buttonStyle} disabled={disabled || loading} activeOpacity={0.8} {...props}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? Colors.white : Colors.primary} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryDisabled: {
    backgroundColor: Colors.primaryDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  outline: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: Colors.white,
  },
  outlineText: {
    color: Colors.primary,
  },
});

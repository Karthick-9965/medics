import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TextInputProps, TouchableOpacity, Text } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface InputFieldProps extends TextInputProps {
  icon?: keyof typeof Feather.glyphMap;
  isValid?: boolean;
  error?: string;
  isPassword?: boolean;
}

export default function InputField({
  icon,
  isValid,
  error,
  isPassword,
  secureTextEntry,
  style,
  ...props
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Border status
  const hasError = !!error;
  const isFilled = (props.value || '').length > 0;

  const containerStyle = [
    styles.container,
    hasError ? styles.borderError : (isValid || isFilled ? styles.borderFilled : styles.borderNormal),
    style,
  ];

  const iconColor = hasError
    ? Colors.error
    : (isValid || isFilled ? Colors.primary : Colors.inputIcon);

  return (
    <View style={styles.wrapper}>
      <View style={containerStyle}>
        {icon && (
          <Feather name={icon} size={20} color={iconColor} style={styles.icon} />
        )}
        
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.inputPlaceholder}
          secureTextEntry={isPassword ? !showPassword : secureTextEntry}
          autoCapitalize="none"
          autoCorrect={false}
          {...props}
        />

        {isValid && !hasError && (
          <Ionicons name="checkmark" size={18} color={Colors.primary} style={styles.checkmark} />
        )}

        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Feather
              name={showPassword ? 'eye' : 'eye-off'}
              size={20}
              color={hasError ? Colors.error : Colors.inputIcon}
            />
          </TouchableOpacity>
        )}
      </View>
      {hasError ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  borderNormal: {
    borderColor: Colors.border,
  },
  borderFilled: {
    borderColor: Colors.primary,
  },
  borderError: {
    borderColor: Colors.error,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: Colors.textDark,
    fontSize: 16,
    height: '100%',
  },
  checkmark: {
    marginLeft: 8,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    marginLeft: 20,
  },
});

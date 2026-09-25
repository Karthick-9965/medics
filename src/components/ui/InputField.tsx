import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TextInputProps, TouchableOpacity, Text } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export interface InputFieldProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Feather.glyphMap | keyof typeof Ionicons.glyphMap | string;
  leftIcon?: keyof typeof Ionicons.glyphMap | string;
  rightIcon?: keyof typeof Ionicons.glyphMap | string;
  rightIconColor?: string;
  isValid?: boolean;
  error?: string;
  isPassword?: boolean;
}

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  lock: 'lock-closed-outline',
  'lock-outline': 'lock-closed-outline',
  'lock-closed': 'lock-closed-outline',
  mail: 'mail-outline',
  user: 'person-outline',
  person: 'person-outline',
  search: 'search-outline',
};

export default function InputField({
  label,
  icon,
  leftIcon,
  rightIcon,
  rightIconColor,
  isValid,
  error,
  isPassword,
  secureTextEntry,
  style,
  ...props
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const hasError = !!error;
  const isFilled = ((props.value as string) || '').length > 0;
  const rawIcon = (leftIcon || icon) as string | undefined;
  const activeLeftIcon = rawIcon ? (ICON_MAP[rawIcon] || rawIcon) : undefined;

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.container,
          hasError ? styles.borderError : isValid || isFilled ? styles.borderFilled : styles.borderNormal,
          style,
        ]}
      >
        {activeLeftIcon && (
          <Ionicons
            name={activeLeftIcon as any}
            size={20}
            color={hasError ? Colors.error : isValid || isFilled ? Colors.primary : Colors.secondary}
            style={styles.icon}
          />
        )}
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.secondary}
          secureTextEntry={secureTextEntry !== undefined ? (showPassword ? false : secureTextEntry) : (isPassword ? !showPassword : false)}
          {...props}
        />
        {rightIcon && (
          <Ionicons name={rightIcon as any} size={20} color={rightIconColor || Colors.primary} style={styles.rightIcon} />
        )}
        {(isPassword || secureTextEntry !== undefined) && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={Colors.secondary} />
          </TouchableOpacity>
        )}
      </View>
      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 6,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.bgLight,
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  borderNormal: {
    borderColor: Colors.border,
  },
  borderFilled: {
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  borderError: {
    borderColor: Colors.error,
    backgroundColor: '#FEF2F2',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
    height: '100%',
  },
  rightIcon: {
    marginLeft: 8,
  },
  eyeBtn: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    color: Colors.error,
    fontSize: 11,
    marginTop: 4,
    marginLeft: 4,
  },
});

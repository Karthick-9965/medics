import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import InputField from '../ui/InputField';
import Button from '../ui/Button';

interface ForgotEmailStepProps {
  email: string;
  emailError: string;
  isValidEmail: boolean;
  loading: boolean;
  onEmailChange: (text: string) => void;
  onSubmit: () => void;
}

export function ForgotEmailStep({
  email,
  emailError,
  isValidEmail,
  loading,
  onEmailChange,
  onSubmit,
}: ForgotEmailStepProps) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Forgot Your Password?</Text>
      <Text style={styles.subtitle}>Enter your registered email address to receive a 4-digit verification code.</Text>
      <InputField
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={onEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon="mail-outline"
        rightIcon={isValidEmail ? 'checkmark-circle' : undefined}
        rightIconColor={Colors.primary}
        error={emailError}
      />
      <Button title="Send Code" onPress={onSubmit} loading={loading} style={styles.btn} />
    </View>
  );
}

interface ForgotOtpStepProps {
  email: string;
  code: string[];
  codeError: string;
  loading: boolean;
  timeLeft: number;
  isExpired: boolean;
  codeRefs: React.MutableRefObject<Array<TextInput | null>>;
  onCodeChange: (text: string, index: number) => void;
  onCodeKeyPress: (e: any, index: number) => void;
  onResend: () => void;
  onSubmit: () => void;
}

export function ForgotOtpStep({
  email,
  code,
  codeError,
  loading,
  timeLeft,
  isExpired,
  codeRefs,
  onCodeChange,
  onCodeKeyPress,
  onResend,
  onSubmit,
}: ForgotOtpStepProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Enter Verification Code</Text>
      <Text style={styles.subtitle}>We've sent a 4-digit code to {email || 'your email'}.</Text>

      {/* OTP 4-digit boxes with native copy-paste */}
      <View style={styles.otpRow}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => { codeRefs.current[index] = ref; }}
            style={[
              styles.otpBox,
              digit ? styles.otpBoxFilled : null,
              codeError ? styles.otpBoxError : null,
              isExpired ? styles.otpBoxExpired : null,
            ]}
            value={digit}
            onChangeText={(text) => onCodeChange(text, index)}
            onKeyPress={(e) => onCodeKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={4}
            autoComplete="sms-otp"
            textContentType="oneTimeCode"
            selectTextOnFocus
            editable={!loading}
            textAlign="center"
          />
        ))}
      </View>

      {codeError ? <Text style={styles.errorText}>{codeError}</Text> : null}

      {/* Countdown Timer & Resend */}
      <View style={styles.timerContainer}>
        {!isExpired ? (
          <View style={styles.timerRow}>
            <Ionicons name="time-outline" size={15} color={Colors.secondary} />
            <Text style={styles.timerText}>
              Code expires in <Text style={styles.timerCountdown}>{formatTime(timeLeft)}</Text>
            </Text>
          </View>
        ) : (
          <View style={styles.expiredRow}>
            <Ionicons name="alert-circle" size={15} color={Colors.error} />
            <Text style={styles.expiredText}>Code has expired. Please request a new code.</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={onResend}
          style={[styles.resendWrap, !isExpired && styles.resendDisabled]}
          disabled={!isExpired && timeLeft > 0}
          activeOpacity={0.7}
        >
          <Text style={[styles.resendText, isExpired && styles.resendTextActive]}>
            Didn't receive code?{' '}
            <Text style={[styles.resendLink, isExpired && styles.resendLinkActive]}>
              Resend Code
            </Text>
          </Text>
        </TouchableOpacity>
      </View>

      <Button
        title="Verify Code"
        onPress={onSubmit}
        loading={loading}
        disabled={isExpired}
        style={styles.btn}
      />
    </View>
  );
}

interface ForgotNewPasswordStepProps {
  password: string;
  confirmPassword: string;
  passwordError: string;
  confirmPasswordError: string;
  loading: boolean;
  onPasswordChange: (text: string) => void;
  onConfirmPasswordChange: (text: string) => void;
  onSubmit: () => void;
}

export function ForgotNewPasswordStep({
  password,
  confirmPassword,
  passwordError,
  confirmPasswordError,
  loading,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: ForgotNewPasswordStepProps) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Create New Password</Text>
      <Text style={styles.subtitle}>Your new password must be at least 8 characters long.</Text>
      <InputField
        label="New Password"
        placeholder="Enter new password"
        value={password}
        onChangeText={onPasswordChange}
        secureTextEntry
        leftIcon="lock-closed-outline"
        error={passwordError}
      />
      <InputField
        label="Confirm Password"
        placeholder="Re-enter new password"
        value={confirmPassword}
        onChangeText={onConfirmPasswordChange}
        secureTextEntry
        leftIcon="lock-closed-outline"
        error={confirmPasswordError}
      />
      <Button title="Reset Password" onPress={onSubmit} loading={loading} style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    paddingVertical: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.secondary,
    lineHeight: 18,
    marginBottom: 20,
  },
  btn: {
    marginTop: 16,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    gap: 12,
  },
  otpBox: {
    flex: 1,
    height: 54,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.accentLight,
  },
  otpBoxError: {
    borderColor: Colors.error,
  },
  otpBoxExpired: {
    borderColor: Colors.border,
    backgroundColor: '#F9F9F9',
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 12,
    gap: 8,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.bgLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timerText: {
    fontSize: 13,
    color: Colors.secondary,
  },
  timerCountdown: {
    fontWeight: '800',
    color: Colors.primary,
  },
  expiredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.redBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  expiredText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.error,
  },
  resendWrap: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  resendDisabled: {
    opacity: 0.6,
  },
  resendText: {
    fontSize: 13,
    color: Colors.secondary,
  },
  resendTextActive: {
    color: Colors.textDark,
  },
  resendLink: {
    color: Colors.secondary,
    fontWeight: '700',
  },
  resendLinkActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
});

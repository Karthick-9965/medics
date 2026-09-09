import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import InputField from './InputField';
import Button from './Button';

// ==========================================
// 1. STEP 1: Email Component
// ==========================================
interface ForgotEmailStepProps {
  email: string;
  emailError: string;
  loading: boolean;
  isValidEmail: boolean;
  onChangeEmail: (text: string) => void;
  onSubmit: () => void;
}

export function ForgotEmailStep({
  email,
  emailError,
  loading,
  isValidEmail,
  onChangeEmail,
  onSubmit,
}: ForgotEmailStepProps) {
  return (
    <View style={styles.stepSection}>
      <Text style={styles.title}>Forgot Your Password?</Text>
      <Text style={styles.subtitle}>
        Enter your email address, we will send you confirmation code
      </Text>

      <InputField
        icon="mail"
        placeholder="Enter your email"
        value={email}
        onChangeText={onChangeEmail}
        keyboardType="email-address"
        isValid={isValidEmail}
        error={emailError}
        style={styles.inputMargin}
      />

      <Button
        title="Reset Password"
        onPress={onSubmit}
        loading={loading}
        disabled={!isValidEmail}
      />
    </View>
  );
}

// ==========================================
// 2. STEP 2: 4-Digit OTP Component (Typing & Copy-Paste with Stable Timer)
// ==========================================
interface ForgotOtpStepProps {
  email: string;
  code: string[];
  codeError: string;
  codeRefs: React.MutableRefObject<Array<TextInput | null>>;
  onCodeChange: (text: string, index: number) => void;
  onKeyPress: (e: any, index: number) => void;
  onVerify: () => void;
  onResend: () => void;
}

export function ForgotOtpStep({
  email,
  code,
  codeError,
  codeRefs,
  onCodeChange,
  onKeyPress,
  onVerify,
  onResend,
}: ForgotOtpStepProps) {
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (timer <= 0) return;
    const intervalId = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timer === 0]);

  const handleResendPress = () => {
    if (timer === 0) {
      onResend();
      setTimer(30);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.stepSection}>
      <Text style={styles.title}>Enter Verification Code</Text>
      <Text style={styles.subtitle}>
        Enter code that we have sent to your email{' '}
        <Text style={styles.boldText}>
          {email.length > 5 ? email.substring(0, 3) + '***' : email}
        </Text>
      </Text>

      {/* 4-Box Inputs with Copy-Paste & Focus Safety */}
      <View style={styles.codeInputsContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(el) => {
              if (codeRefs?.current) {
                codeRefs.current[index] = el;
              }
            }}
            style={[
              styles.codeInputBox,
              digit !== '' && styles.codeInputBoxFilled,
              !!codeError && styles.codeInputBoxError,
            ]}
            maxLength={4}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            value={digit}
            onChangeText={(text) => onCodeChange(text, index)}
            onKeyPress={(e) => onKeyPress(e, index)}
            selectTextOnFocus
          />
        ))}
      </View>
      {!!codeError && <Text style={styles.inlineErrorText}>{codeError}</Text>}

      <Button
        title="Verify"
        onPress={onVerify}
        disabled={code.some((digit) => digit === '')}
      />

      {/* Resend with Stable Countdown Timer */}
      <TouchableOpacity
        style={styles.resendContainer}
        onPress={handleResendPress}
        disabled={timer > 0}
        activeOpacity={0.7}
      >
        <Text style={styles.resendText}>
          Didn't receive the code?{' '}
          {timer > 0 ? (
            <Text style={styles.resendTimer}>Resend in {formatTimer(timer)}</Text>
          ) : (
            <Text style={styles.resendLink}>Resend</Text>
          )}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ==========================================
// 3. STEP 3: Create New Password Component (At least 6 characters restriction)
// ==========================================
interface ForgotNewPasswordStepProps {
  password: string;
  confirmPassword: string;
  passwordError: string;
  confirmPasswordError: string;
  loading: boolean;
  onChangePassword: (text: string) => void;
  onChangeConfirmPassword: (text: string) => void;
  onSubmit: () => void;
}

export function ForgotNewPasswordStep({
  password,
  confirmPassword,
  passwordError,
  confirmPasswordError,
  loading,
  onChangePassword,
  onChangeConfirmPassword,
  onSubmit,
}: ForgotNewPasswordStepProps) {
  // Real-time restriction indicators (min 6 chars, uppercase, number, special char, matching)
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isMatching = confirmPassword.length > 0 && password === confirmPassword;

  const isAllValid = hasMinLength && hasUppercase && hasNumber && hasSpecial && isMatching;

  return (
    <View style={styles.stepSection}>
      <Text style={styles.title}>Create New Password</Text>
      <Text style={styles.subtitle}>Create your new password to login</Text>

      {/* Password Input */}
      <InputField
        icon="lock"
        placeholder="Enter new password"
        value={password}
        onChangeText={onChangePassword}
        isPassword
        error={passwordError}
      />

      {/* Confirm Password Input */}
      <InputField
        icon="lock"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChangeText={onChangeConfirmPassword}
        isPassword
        error={confirmPasswordError}
      />

      {/* Real-time Password Restrictions */}
      <View style={styles.rulesContainer}>
        <View style={styles.ruleItem}>
          <Ionicons
            name={hasMinLength ? 'checkmark-circle' : 'ellipse-outline'}
            size={16}
            color={hasMinLength ? Colors.primary : Colors.secondary}
          />
          <Text style={[styles.ruleText, hasMinLength && styles.ruleTextValid]}>
            At least 6 characters
          </Text>
        </View>

        <View style={styles.ruleItem}>
          <Ionicons
            name={hasUppercase ? 'checkmark-circle' : 'ellipse-outline'}
            size={16}
            color={hasUppercase ? Colors.primary : Colors.secondary}
          />
          <Text style={[styles.ruleText, hasUppercase && styles.ruleTextValid]}>
            At least 1 uppercase letter (A-Z)
          </Text>
        </View>

        <View style={styles.ruleItem}>
          <Ionicons
            name={hasNumber ? 'checkmark-circle' : 'ellipse-outline'}
            size={16}
            color={hasNumber ? Colors.primary : Colors.secondary}
          />
          <Text style={[styles.ruleText, hasNumber && styles.ruleTextValid]}>
            At least 1 number (0-9)
          </Text>
        </View>

        <View style={styles.ruleItem}>
          <Ionicons
            name={hasSpecial ? 'checkmark-circle' : 'ellipse-outline'}
            size={16}
            color={hasSpecial ? Colors.primary : Colors.secondary}
          />
          <Text style={[styles.ruleText, hasSpecial && styles.ruleTextValid]}>
            At least 1 special character (!@#$...)
          </Text>
        </View>

        {confirmPassword.length > 0 && (
          <View style={styles.ruleItem}>
            <Ionicons
              name={isMatching ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={isMatching ? Colors.primary : Colors.error}
            />
            <Text style={[styles.ruleText, isMatching ? styles.ruleTextValid : styles.ruleTextError]}>
              {isMatching ? 'Passwords match' : 'Passwords do not match'}
            </Text>
          </View>
        )}
      </View>

      <Button
        title="Create Password"
        onPress={onSubmit}
        loading={loading}
        disabled={!isAllValid}
      />
    </View>
  );
}

// ==========================================
// COMPONENT STYLES
// ==========================================
const styles = StyleSheet.create({
  stepSection: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.secondary,
    lineHeight: 22,
    marginBottom: 28,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.black,
  },
  inputMargin: {
    marginBottom: 28,
  },
  codeInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 12,
  },
  codeInputBox: {
    flex: 1,
    height: 64,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: Colors.black,
  },
  codeInputBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.bgLight,
  },
  codeInputBoxError: {
    borderColor: Colors.error,
  },
  inlineErrorText: {
    color: Colors.error,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  resendText: {
    fontSize: 14,
    color: Colors.secondary,
  },
  resendLink: {
    color: Colors.primary,
    fontWeight: '700',
  },
  resendTimer: {
    color: Colors.primary,
    fontWeight: '700',
  },
  rulesContainer: {
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
    gap: 10,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ruleText: {
    fontSize: 12.5,
    color: Colors.secondary,
  },
  ruleTextValid: {
    color: Colors.primary,
    fontWeight: '600',
  },
  ruleTextError: {
    color: Colors.error,
    fontWeight: '600',
  },
});

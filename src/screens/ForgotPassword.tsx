import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { ErrorMessages } from '../constants/ErrorMessages';
import SuccessModal from '../components/modals/SuccessModal';
import { ForgotEmailStep, ForgotOtpStep, ForgotNewPasswordStep } from '../components/auth/ForgotPasswordComponents';
import { validateEmail, validatePassword, isEmailValidFormat } from '../utils/validation';
import { getUserByEmail, updateUserPassword } from '../utils/storage';

interface ForgotPasswordProps {
  onBackToLogin?: () => void;
  onResetSuccess?: (email?: string, newPassword?: string) => void;
  navigation?: any;
}

export default function ForgotPassword({ onBackToLogin, onResetSuccess, navigation }: ForgotPasswordProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string[]>(['', '', '', '']);
  const codeRefs = useRef<Array<TextInput | null>>([]);
  const [codeError, setCodeError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isExpired, setIsExpired] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isValidEmail = isEmailValidFormat(email);

  // OTP Countdown Timer
  useEffect(() => {
    let interval: any = null;
    if (currentStep === 2 && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsExpired(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentStep, timeLeft]);

  const handleBack = () => {
    if (currentStep === 1) {
      if (onBackToLogin) onBackToLogin();
      else navigation?.goBack();
    } else if (currentStep === 3) {
      // Clear typed passwords completely when leaving Step 3
      setPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setConfirmPasswordError('');
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCode(['', '', '', '']);
      setCodeError('');
      setCurrentStep(1);
    }
  };

  const handleEmailSubmit = async () => {
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }
    setLoading(true);
    const existing = await getUserByEmail(email);
    if (!existing) {
      setEmailError(ErrorMessages.EMAIL_NOT_FOUND);
      setLoading(false);
      return;
    }
    setLoading(false);
    setCode(['', '', '', '']);
    setCodeError('');
    setTimeLeft(60);
    setIsExpired(false);
    setCurrentStep(2);
  };

  const handleCodeChange = (text: string, index: number) => {
    const digits = text.replace(/[^0-9]/g, '');

    // Multi-digit paste directly into box
    if (digits.length > 1) {
      const newCode = ['', '', '', ''];
      for (let i = 0; i < 4; i++) {
        if (i < digits.length) {
          newCode[i] = digits[i];
        }
      }
      setCode(newCode);
      setCodeError('');
      const focusIndex = Math.min(digits.length - 1, 3);
      codeRefs.current[focusIndex]?.focus();
      return;
    }

    // Single digit input
    const newCode = [...code];
    newCode[index] = digits.slice(-1);
    setCode(newCode);
    setCodeError('');
    if (digits && index < 3) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = () => {
    setCode(['', '', '', '']);
    setCodeError('');
    setTimeLeft(60);
    setIsExpired(false);
    codeRefs.current[0]?.focus();
  };

  const handleOtpSubmit = () => {
    if (isExpired) {
      setCodeError('Verification code has expired. Please click Resend Code.');
      return;
    }
    const fullCode = code.join('');
    if (fullCode.length < 4) {
      setCodeError(ErrorMessages.OTP_INCOMPLETE);
      return;
    }
    // Clear password inputs when entering Step 3
    setPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setConfirmPasswordError('');
    setCurrentStep(3);
  };

  const handlePasswordSubmit = async () => {
    const pErr = validatePassword(password);
    if (pErr) {
      setPasswordError(pErr);
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError(ErrorMessages.PASSWORDS_DO_NOT_MATCH);
      return;
    }
    setLoading(true);
    await updateUserPassword(email, password);
    setLoading(false);
    setShowSuccessModal(true);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    if (onResetSuccess) onResetSuccess(email, password);
    else navigation?.navigate('Login', { email, password });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textDark} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {currentStep === 1 && (
            <ForgotEmailStep
              email={email}
              emailError={emailError}
              isValidEmail={isValidEmail}
              loading={loading}
              onEmailChange={(t) => { setEmail(t); setEmailError(''); }}
              onSubmit={handleEmailSubmit}
            />
          )}
          {currentStep === 2 && (
            <ForgotOtpStep
              email={email}
              code={code}
              codeError={codeError}
              loading={loading}
              timeLeft={timeLeft}
              isExpired={isExpired}
              codeRefs={codeRefs}
              onCodeChange={handleCodeChange}
              onCodeKeyPress={handleCodeKeyPress}
              onResend={handleResendCode}
              onSubmit={handleOtpSubmit}
            />
          )}
          {currentStep === 3 && (
            <ForgotNewPasswordStep
              password={password}
              confirmPassword={confirmPassword}
              passwordError={passwordError}
              confirmPasswordError={confirmPasswordError}
              loading={loading}
              onPasswordChange={(t) => { setPassword(t); setPasswordError(''); }}
              onConfirmPasswordChange={(t) => { setConfirmPassword(t); setConfirmPasswordError(''); }}
              onSubmit={handlePasswordSubmit}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={showSuccessModal}
        title="Password Reset Successful"
        subtitle="You can now sign in with your new password."
        buttonText="Back to Login"
        onButtonPress={handleModalClose}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
});

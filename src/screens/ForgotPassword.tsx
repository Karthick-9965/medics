import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { ErrorMessages } from '../constants/ErrorMessages';
import SuccessModal from '../components/SuccessModal';
import {
  ForgotEmailStep,
  ForgotOtpStep,
  ForgotNewPasswordStep,
} from '../components/ForgotPasswordComponents';
import { validateEmail, validatePassword, isEmailValidFormat } from '../utils/validation';
import { getUserByEmail, updateUserPassword } from '../utils/storage';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
  onResetSuccess: (email?: string, newPassword?: string) => void;
}

export default function ForgotPassword({ onBackToLogin, onResetSuccess }: ForgotPasswordProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 2 code inputs
  const [code, setCode] = useState<string[]>(['', '', '', '']);
  const codeRefs = useRef<Array<TextInput | null>>([]);
  const [codeError, setCodeError] = useState('');

  // Step 3 password inputs
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isValidEmail = isEmailValidFormat(email);

  // Handle typing & 4-digit paste
  const handleCodeChange = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, '');

    // Multi-digit paste support
    if (cleanText.length >= 2) {
      const digits = cleanText.slice(0, 4).split('');
      const newCode = ['', '', '', ''];
      digits.forEach((d, i) => (newCode[i] = d));
      setCode(newCode);
      setCodeError('');
      codeRefs.current[Math.min(digits.length - 1, 3)]?.focus();
      return;
    }

    const singleDigit = cleanText.slice(-1);
    const newCode = [...code];
    newCode[index] = singleDigit;
    setCode(newCode);
    setCodeError('');

    if (singleDigit !== '' && index < 3) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e?.nativeEvent?.key === 'Backspace' && code[index] === '' && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      onBackToLogin();
    } else if (currentStep === 2) {
      setCurrentStep(1);
      setCode(['', '', '', '']);
      setCodeError('');
    } else if (currentStep === 3) {
      // Clear password fields on backward navigation
      setPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setConfirmPasswordError('');
      setCurrentStep(2);
    }
  };

  const handleNextStep1 = async () => {
    const err = validateEmail(email);
    if (err) return setEmailError(err);

    setLoading(true);
    const userExists = await getUserByEmail(email);
    setLoading(false);

    if (!userExists) return setEmailError('*Email is not registered');
    setEmailError('');

    setCode(['', '', '', '']);
    setCodeError('');
    setPassword('');
    setConfirmPassword('');
    setCurrentStep(2);
    setTimeout(() => codeRefs.current[0]?.focus(), 200);
  };

  const handleNextStep2 = () => {
    if (code.join('').length !== 4) return setCodeError('*Please enter all 4 digits');
    setCodeError('');
    setPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setConfirmPasswordError('');
    setCurrentStep(3);
  };

  const handleNextStep3 = async () => {
    const errPass = validatePassword(password);
    if (errPass) setPasswordError(errPass);
    else setPasswordError('');

    if (!confirmPassword) setConfirmPasswordError(ErrorMessages.password.confirmRequired);
    else if (password !== confirmPassword) setConfirmPasswordError(ErrorMessages.password.mismatch);
    else setConfirmPasswordError('');

    if (errPass || !confirmPassword || password !== confirmPassword) return;

    setLoading(true);
    const success = await updateUserPassword(email, password);
    setLoading(false);

    if (!success) return setPasswordError('*Failed to update password. Try again.');
    setShowSuccessModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* STEP 1: Email Component */}
          {currentStep === 1 && (
            <ForgotEmailStep
              email={email}
              emailError={emailError}
              loading={loading}
              isValidEmail={isValidEmail}
              onChangeEmail={(t) => {
                setEmail(t);
                setEmailError('');
              }}
              onSubmit={handleNextStep1}
            />
          )}

          {/* STEP 2: OTP Component */}
          {currentStep === 2 && (
            <ForgotOtpStep
              email={email}
              code={code}
              codeError={codeError}
              codeRefs={codeRefs}
              onCodeChange={handleCodeChange}
              onKeyPress={handleKeyPress}
              onVerify={handleNextStep2}
              onResend={() => {
                setCode(['', '', '', '']);
                setCodeError('');
                codeRefs.current[0]?.focus();
              }}
            />
          )}

          {/* STEP 3: Create New Password Component */}
          {currentStep === 3 && (
            <ForgotNewPasswordStep
              password={password}
              confirmPassword={confirmPassword}
              passwordError={passwordError}
              confirmPasswordError={confirmPasswordError}
              loading={loading}
              onChangePassword={(t) => {
                setPassword(t);
                setPasswordError('');
              }}
              onChangeConfirmPassword={(t) => {
                setConfirmPassword(t);
                setConfirmPasswordError('');
              }}
              onSubmit={handleNextStep3}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Success"
        subtitle="You have successfully reset your password."
        buttonTitle="Login"
        onPressButton={() => {
          setShowSuccessModal(false);
          onResetSuccess(email, password);
        }}
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
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
});

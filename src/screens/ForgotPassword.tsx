import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { ErrorMessages } from '../constants/ErrorMessages';
import InputField from '../components/InputField';
import Button from '../components/Button';
import SuccessModal from '../components/SuccessModal';
import {
  validateEmail,
  validatePassword,
  isEmailValidFormat,
} from '../utils/validation';
import { getUserByEmail, updateUserPassword } from '../utils/storage';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
  onResetSuccess: () => void;
}

export default function ForgotPassword({ onBackToLogin, onResetSuccess }: ForgotPasswordProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  
  // Step 1 states
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 2 states (Manual 4-digit code)
  const [code, setCode] = useState<string[]>(['', '', '', '']);
  const codeRefs = useRef<Array<TextInput | null>>([]);
  const [codeError, setCodeError] = useState('');

  // Step 3 states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Email format check for the checkmark
  const isValidEmail = isEmailValidFormat(email);

  // Handle Code Input Focus shifting & multi-character paste
  const handleCodeChange = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, '');

    // If user pasted a 4-digit code
    if (cleanText.length === 4) {
      const splitCode = cleanText.split('');
      setCode(splitCode);
      setCodeError('');
      codeRefs.current[3]?.focus();
      return;
    }

    // Single digit input
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
    if (e.nativeEvent.key === 'Backspace') {
      if (code[index] === '' && index > 0) {
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        codeRefs.current[index - 1]?.focus();
      }
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
      setCurrentStep(2);
    }
  };

  const handleNextStep1 = async () => {
    const errEmail = validateEmail(email);
    if (errEmail) {
      setEmailError(errEmail);
      return;
    }
    
    setLoading(true);
    const userExists = await getUserByEmail(email);
    setLoading(false);

    if (!userExists) {
      setEmailError('*Email is not registered');
      return;
    }
    setEmailError('');

    // Directly go to verification code step without popup
    setCurrentStep(2);
    setTimeout(() => {
      codeRefs.current[0]?.focus();
    }, 200);
  };

  const handleNextStep2 = () => {
    const enteredCode = code.join('');
    if (enteredCode.length !== 4) {
      setCodeError('*Please enter all 4 digits');
      return;
    }

    // Any 4 digit random code entered manually by user is accepted
    setCodeError('');
    setCurrentStep(3);
  };

  const handleNextStep3 = async () => {
    let hasError = false;

    // Password check
    const errPassword = validatePassword(password);
    if (errPassword) {
      setPasswordError(errPassword);
      hasError = true;
    } else {
      setPasswordError('');
    }

    // Confirm password check
    if (!confirmPassword) {
      setConfirmPasswordError(ErrorMessages.password.confirmRequired);
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError(ErrorMessages.password.mismatch);
      hasError = true;
    } else {
      setConfirmPasswordError('');
    }

    if (hasError) return;

    setLoading(true);
    const success = await updateUserPassword(email, password);
    setLoading(false);

    if (!success) {
      setPasswordError('*Failed to update password. Try again.');
      return;
    }

    setShowSuccessModal(true);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onResetSuccess();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Step 1: Input Email */}
          {currentStep === 1 && (
            <View style={styles.stepSection}>
              <Text style={styles.title}>Forgot Your Password?</Text>
              <Text style={styles.subtitle}>
                Enter your email address, we will send you confirmation code
              </Text>

              {/* Input Area */}
              <InputField
                icon="mail"
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError('');
                }}
                keyboardType="email-address"
                isValid={isValidEmail}
                error={emailError}
                style={styles.emailInputMargin}
              />

              <Button
                title="Reset Password"
                onPress={handleNextStep1}
                loading={loading}
                disabled={!isValidEmail}
              />
            </View>
          )}

          {/* Step 2: Verification Code Entry */}
          {currentStep === 2 && (
            <View style={styles.stepSection}>
              <Text style={styles.title}>Enter Verification Code</Text>
              <Text style={styles.subtitle}>
                Enter code that we have sent to your email{' '}
                <Text style={styles.boldText}>
                  {email.length > 5 ? email.substring(0, 3) + '***' : email}
                </Text>
              </Text>

              {/* Manual 4-Digit Code Inputs */}
              <View style={styles.codeInputsContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(el) => { codeRefs.current[index] = el; }}
                    style={[
                      styles.codeInputBox,
                      digit !== '' && styles.codeInputBoxFilled,
                      !!codeError && styles.codeInputBoxError,
                    ]}
                    maxLength={1}
                    keyboardType="number-pad"
                    value={digit}
                    onChangeText={(text) => handleCodeChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    selectTextOnFocus
                    autoFocus={index === 0}
                  />
                ))}
              </View>
              {!!codeError && <Text style={styles.inlineErrorText}>{codeError}</Text>}

              <Button
                title="Verify"
                onPress={handleNextStep2}
                disabled={code.some(digit => digit === '')}
              />

              <TouchableOpacity
                style={styles.resendContainer}
                onPress={() => {
                  setCode(['', '', '', '']);
                  setCodeError('');
                  codeRefs.current[0]?.focus();
                }}
              >
                <Text style={styles.resendText}>
                  Didn't receive the code? <Text style={styles.resendLink}>Resend</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 3: Create New Password */}
          {currentStep === 3 && (
            <View style={styles.stepSection}>
              <Text style={styles.title}>Create New Password</Text>
              <Text style={styles.subtitle}>Create your new password to login</Text>

              {/* Password Input */}
              <InputField
                icon="lock"
                placeholder="Enter password (min 6 chars)"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError('');
                }}
                isPassword
                error={passwordError}
              />

              {/* Confirm Password Input */}
              <InputField
                icon="lock"
                placeholder="Confirm password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setConfirmPasswordError('');
                }}
                isPassword
                error={confirmPasswordError}
              />

              <Button
                title="Create Password"
                onPress={handleNextStep3}
                loading={loading}
                disabled={!password || password.length < 6 || password !== confirmPassword}
              />
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Success"
        subtitle="You have successfully reset your password."
        buttonTitle="Login"
        onPressButton={handleSuccessModalClose}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
  },
  headerRightPlaceholder: {
    width: 40,
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
  stepSection: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: 10,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 15,
    color: Colors.secondary,
    textAlign: 'left',
    lineHeight: 22,
    marginBottom: 28,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.black,
  },
  emailInputMargin: {
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
});

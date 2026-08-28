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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
  onResetSuccess: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{10}$/;

export default function ForgotPassword({ onBackToLogin, onResetSuccess }: ForgotPasswordProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  
  // Step 1 states
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Step 2 states
  const [code, setCode] = useState<string[]>(['', '', '', '']);
  const codeRefs = useRef<Array<TextInput | null>>([]);

  // Step 3 states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Email format check for the checkmark
  const isValidEmail = EMAIL_REGEX.test(email);
  const isValidPhone = PHONE_REGEX.test(phone);

  // Handle Code Input Focus shifting
  const handleCodeChange = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    const newCode = [...code];
    newCode[index] = cleanText;
    setCode(newCode);

    if (cleanText.length > 0 && index < 3) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      onBackToLogin();
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
  };

  const handleNextStep1 = () => {
    if (activeTab === 'email') {
      if (!email) {
        setEmailError('*Email is required');
        return;
      } else if (!isValidEmail) {
        setEmailError('*Please enter a valid email address');
        return;
      }
      setEmailError('');
    } else {
      if (!phone) {
        setPhoneError('*Phone number is required');
        return;
      } else if (!isValidPhone) {
        setPhoneError('*Please enter a valid 10-digit phone number');
        return;
      }
      setPhoneError('');
    }
    setCurrentStep(2);
  };

  const handleNextStep2 = () => {
    const isCodeComplete = code.every(digit => digit !== '');
    if (!isCodeComplete) return;
    setCurrentStep(3);
  };

  const handleNextStep3 = () => {
    let hasError = false;

    // Password check
    if (!password) {
      setPasswordError('*Password is required');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('*Password must be at least 6 characters');
      hasError = true;
    } else {
      setPasswordError('');
    }

    // Confirm password check
    if (!confirmPassword) {
      setConfirmPasswordError('*Confirm password is required');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('*Passwords do not match');
      hasError = true;
    } else {
      setConfirmPasswordError('');
    }

    if (hasError) return;

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
          <Ionicons name="chevron-back" size={24} color="#1A3B32" />
        </TouchableOpacity>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Step 1: Input Email / Phone */}
          {currentStep === 1 && (
            <View style={styles.stepSection}>
              <Text style={styles.title}>Forgot Your Password?</Text>
              <Text style={styles.subtitle}>
                Enter your email or your phone number, we will send you confirmation code
              </Text>

              {/* Tab Selector Capsule */}
              <View style={styles.tabSelectorBg}>
                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'email' && styles.tabButtonActive]}
                  onPress={() => {
                    setActiveTab('email');
                    setPhoneError('');
                  }}
                >
                  <Text style={[styles.tabText, activeTab === 'email' && styles.tabTextActive]}>
                    Email
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'phone' && styles.tabButtonActive]}
                  onPress={() => {
                    setActiveTab('phone');
                    setEmailError('');
                  }}
                >
                  <Text style={[styles.tabText, activeTab === 'phone' && styles.tabTextActive]}>
                    Phone
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Input Area */}
              {activeTab === 'email' ? (
                <View>
                  <View style={[styles.inputContainer, emailError ? styles.inputContainerError : (isValidEmail && styles.inputContainerFilled)]}>
                    <Feather
                      name="mail"
                      size={20}
                      color={emailError ? '#FF5B5B' : (isValidEmail ? '#138A72' : '#8E9F9A')}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor="#A8B6B2"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        setEmailError('');
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {isValidEmail && !emailError && (
                      <Ionicons name="checkmark" size={18} color="#138A72" style={styles.checkmarkIcon} />
                    )}
                  </View>
                  {emailError ? <Text style={styles.inlineErrorText}>{emailError}</Text> : null}
                </View>
              ) : (
                <View>
                  <View style={[styles.inputContainer, phoneError ? styles.inputContainerError : (isValidPhone && styles.inputContainerFilled)]}>
                    <Feather
                      name="phone"
                      size={20}
                      color={phoneError ? '#FF5B5B' : (isValidPhone ? '#138A72' : '#8E9F9A')}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter 10-digit phone number"
                      placeholderTextColor="#A8B6B2"
                      value={phone}
                      onChangeText={(text) => {
                        setPhone(text);
                        setPhoneError('');
                      }}
                      keyboardType="numeric"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  {phoneError ? <Text style={styles.inlineErrorText}>{phoneError}</Text> : null}
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  ((activeTab === 'email' && !isValidEmail) || (activeTab === 'phone' && !isValidPhone)) &&
                    styles.primaryButtonDisabled,
                ]}
                onPress={handleNextStep1}
                disabled={activeTab === 'email' ? !isValidEmail : !isValidPhone}
              >
                <Text style={styles.primaryButtonText}>Reset Password</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: Verification Code */}
          {currentStep === 2 && (
            <View style={styles.stepSection}>
              <Text style={styles.title}>Enter Verification Code</Text>
              <Text style={styles.subtitle}>
                Enter code that we have sent to your {activeTab === 'email' ? 'email' : 'number'}{' '}
                <Text style={styles.boldText}>
                  {activeTab === 'email'
                    ? email.length > 5 ? email.substring(0, 3) + '***' : email
                    : phone.length > 5 ? phone.substring(0, 4) + '***' : phone}
                </Text>
              </Text>

              {/* Code Inputs Boxes */}
              <View style={styles.codeInputsContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(el) => { codeRefs.current[index] = el; }}
                    style={[
                      styles.codeInputBox,
                      digit !== '' && styles.codeInputBoxFilled,
                    ]}
                    maxLength={1}
                    keyboardType="number-pad"
                    value={digit}
                    onChangeText={(text) => handleCodeChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    selectTextOnFocus
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  code.some(digit => digit === '') && styles.primaryButtonDisabled,
                ]}
                onPress={handleNextStep2}
                disabled={code.some(digit => digit === '')}
              >
                <Text style={styles.primaryButtonText}>Verify</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.resendContainer}>
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
              <View style={[styles.inputContainer, passwordError ? styles.inputContainerError : (password.length > 0 && styles.inputContainerFilled)]}>
                <Feather
                  name="lock"
                  size={20}
                  color={passwordError ? '#FF5B5B' : (password.length > 0 ? '#138A72' : '#8E9F9A')}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter password (min 6 chars)"
                  placeholderTextColor="#A8B6B2"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError('');
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color={passwordError ? '#FF5B5B' : '#8E9F9A'} />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.inlineErrorText}>{passwordError}</Text> : null}

              {/* Confirm Password Input */}
              <View
                style={[
                  styles.inputContainer,
                  confirmPasswordError ? styles.inputContainerError : (confirmPassword.length > 0 && password === confirmPassword && styles.inputContainerFilled),
                ]}
              >
                <Feather
                  name="lock"
                  size={20}
                  color={
                    confirmPasswordError
                      ? '#FF5B5B'
                      : confirmPassword.length > 0 && password === confirmPassword
                      ? '#138A72'
                      : '#8E9F9A'
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  placeholderTextColor="#A8B6B2"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setConfirmPasswordError('');
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Feather name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color={confirmPasswordError ? '#FF5B5B' : '#8E9F9A'} />
                </TouchableOpacity>
              </View>
              {confirmPasswordError ? <Text style={styles.inlineErrorText}>{confirmPasswordError}</Text> : null}

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!password || password.length < 6 || password !== confirmPassword) &&
                    styles.primaryButtonDisabled,
                ]}
                onPress={handleNextStep3}
                disabled={!password || password.length < 6 || password !== confirmPassword}
              >
                <Text style={styles.primaryButtonText}>Create Password</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark" size={40} color="#138A72" />
            </View>
            <Text style={styles.modalTitle}>Success</Text>
            <Text style={styles.modalSubtitle}>
              You have successfully reset your password.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleSuccessModalClose}>
              <Text style={styles.modalButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#ffffff',
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
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
  },
  stepSection: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A3B32',
    marginBottom: 10,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 15,
    color: '#7E918C',
    textAlign: 'left',
    lineHeight: 22,
    marginBottom: 30,
  },
  boldText: {
    fontWeight: '700',
    color: '#1A3B32',
  },
  tabSelectorBg: {
    flexDirection: 'row',
    backgroundColor: '#F5F8F7',
    borderRadius: 24,
    padding: 4,
    height: 48,
    marginBottom: 32,
  },
  tabButton: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E9F9A',
  },
  tabTextActive: {
    color: '#138A72',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E8EFEF',
  },
  inputContainerFilled: {
    borderColor: '#138A72',
  },
  inputContainerError: {
    borderColor: '#FF5B5B',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#1A3B32',
    fontSize: 16,
    height: '100%',
  },
  checkmarkIcon: {
    marginLeft: 8,
  },
  inlineErrorText: {
    color: '#FF5B5B',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    marginLeft: 20,
    marginBottom: 16,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#138A72',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#138A72',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 8,
  },
  primaryButtonDisabled: {
    backgroundColor: '#A3D9D0',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  codeInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  codeInputBox: {
    flex: 1,
    height: 64,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E8EFEF',
    backgroundColor: '#ffffff',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#1A3B32',
  },
  codeInputBoxFilled: {
    borderColor: '#138A72',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  resendText: {
    fontSize: 14,
    color: '#7E918C',
  },
  resendLink: {
    color: '#138A72',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 59, 50, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E7F5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A3B32',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#7E918C',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  modalButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#138A72',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});

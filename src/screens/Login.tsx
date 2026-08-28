import React, { useState } from 'react';
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, FontAwesome } from '@expo/vector-icons';

interface LoginProps {
  onBack: () => void;
  onLoginSuccess: (name: string) => void;
  onSignUpLink: () => void;
  onForgotPassword: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login({ onBack, onLoginSuccess, onSignUpLink, onForgotPassword }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isWrongPassword, setIsWrongPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Real-time email validation format check (for checkmark indicator)
  const isValidEmail = EMAIL_REGEX.test(email);

  const handleLogin = () => {
    let hasError = false;

    // Email format validation
    if (!email) {
      setEmailError('*Email is required');
      hasError = true;
    } else if (!isValidEmail) {
      setEmailError('*Please enter a valid email address');
      hasError = true;
    } else {
      setEmailError('');
    }

    // Password validation (Correct mock credential is 'password123' or '123456')
    const lowercasePassword = password.toLowerCase();
    if (!password) {
      setIsWrongPassword(true); // Treat empty password as wrong
      hasError = true;
    } else if (lowercasePassword !== 'password123' && lowercasePassword !== '123456') {
      setIsWrongPassword(true);
      hasError = true;
    } else {
      setIsWrongPassword(false);
    }

    if (hasError) return;

    // Successful Login
    setShowSuccessModal(true);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    const displayName = email.split('@')[0];
    onLoginSuccess(displayName.charAt(0).toUpperCase() + displayName.slice(1));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="#1A3B32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Login</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Form */}
          <View style={styles.formSection}>
            {/* Email Input */}
            <View
              style={[
                styles.inputContainer,
                emailError ? styles.inputContainerError : (isValidEmail && styles.inputContainerFilled),
              ]}
            >
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
                  setIsWrongPassword(false);
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

            {/* Password Input */}
            <View
              style={[
                styles.inputContainer,
                isWrongPassword ? styles.inputContainerError : (password.length > 0 && styles.inputContainerFilled),
              ]}
            >
              <Feather
                name="lock"
                size={20}
                color={isWrongPassword ? '#FF5B5B' : (password.length > 0 ? '#138A72' : '#8E9F9A')}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#A8B6B2"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setIsWrongPassword(false);
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color={isWrongPassword ? '#FF5B5B' : '#8E9F9A'}
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password Row */}
            {isWrongPassword ? (
              <View style={styles.errorRow}>
                <Text style={styles.errorText}>*The password you entered is wrong</Text>
                <TouchableOpacity onPress={onForgotPassword}>
                  <Text style={styles.errorForgotLink}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.forgotPassword} onPress={onForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, (!email || !password) && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={!email || !password}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={onSignUpLink}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* OR Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Sign-in Buttons */}
          <View style={styles.socialButtonsSection}>
            <TouchableOpacity style={styles.socialButton} onPress={() => onLoginSuccess('Google User')}>
              <Image
                source={require('../assets/google_icon.png')}
                style={styles.socialImage}
                resizeMode="contain"
              />
              <Text style={styles.socialButtonText}>Sign in with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} onPress={() => onLoginSuccess('Apple User')}>
              <FontAwesome name="apple" size={20} color="#000000" style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>Sign in with Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} onPress={() => onLoginSuccess('Facebook User')}>
              <FontAwesome name="facebook" size={20} color="#4267B2" style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>Sign in with Facebook</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark" size={40} color="#138A72" />
            </View>
            <Text style={styles.modalTitle}>Yeay! Welcome Back</Text>
            <Text style={styles.modalSubtitle}>
              Once again you login successfully into medidoc app
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleSuccessModalClose}>
              <Text style={styles.modalButtonText}>Go to home</Text>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3B32',
  },
  headerRightPlaceholder: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  formSection: {
    marginBottom: 20,
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
    marginBottom: 12,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 12,
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#138A72',
    fontSize: 14,
    fontWeight: '600',
  },
  errorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  errorText: {
    color: '#FF5B5B',
    fontSize: 12,
    fontWeight: '500',
  },
  errorForgotLink: {
    color: '#138A72',
    fontSize: 12,
    fontWeight: '600',
  },
  loginButton: {
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
  },
  loginButtonDisabled: {
    backgroundColor: '#A3D9D0',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  footerText: {
    color: '#7E918C',
    fontSize: 14,
  },
  footerLink: {
    color: '#138A72',
    fontSize: 14,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F0F4F3',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#8E9F9A',
    fontSize: 14,
    fontWeight: '500',
  },
  socialButtonsSection: {
    gap: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: '#E8EFEF',
    backgroundColor: '#ffffff',
  },
  socialIcon: {
    marginRight: 12,
  },
  socialImage: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 15,
    color: '#2C3A35',
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 59, 50, 0.45)', // Semi-transparent brand grey/green overlay
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

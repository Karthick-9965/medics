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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';

interface SignUpProps {
  onBack: () => void;
  onSignUpSuccess: (name: string) => void;
  onLoginLink: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUp({ onBack, onSignUpSuccess, onLoginLink }: SignUpProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  
  // Validation errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Email format check for the checkmark
  const isValidEmail = EMAIL_REGEX.test(email);

  const handleSignUp = () => {
    let hasError = false;

    // Name Validation
    if (!name) {
      setNameError('*Name is required');
      hasError = true;
    } else if (name.length < 3) {
      setNameError('*Name must be at least 3 characters');
      hasError = true;
    } else {
      setNameError('');
    }

    // Email Validation
    if (!email) {
      setEmailError('*Email is required');
      hasError = true;
    } else if (!isValidEmail) {
      setEmailError('*Please enter a valid email address');
      hasError = true;
    } else {
      setEmailError('');
    }

    // Password Validation
    if (!password) {
      setPasswordError('*Password is required');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('*Password must be at least 6 characters');
      hasError = true;
    } else {
      setPasswordError('');
    }

    // Agree terms verification
    if (!agree) {
      hasError = true;
    }

    if (hasError) return;

    setShowSuccessModal(true);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onSignUpSuccess(name);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="#1A3B32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign Up</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Form */}
          <View style={styles.formSection}>
            {/* Name Input */}
            <View
              style={[
                styles.inputContainer,
                nameError ? styles.inputContainerError : (name.length > 0 && styles.inputContainerFilled),
              ]}
            >
              <Feather
                name="user"
                size={20}
                color={nameError ? '#FF5B5B' : (name.length > 0 ? '#138A72' : '#8E9F9A')}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#A8B6B2"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setNameError('');
                }}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
            {nameError ? <Text style={styles.inlineErrorText}>{nameError}</Text> : null}

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
                passwordError ? styles.inputContainerError : (password.length > 0 && styles.inputContainerFilled),
              ]}
            >
              <Feather
                name="lock"
                size={20}
                color={passwordError ? '#FF5B5B' : (password.length > 0 ? '#138A72' : '#8E9F9A')}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
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
                <Feather
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color={passwordError ? '#FF5B5B' : '#8E9F9A'}
                />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.inlineErrorText}>{passwordError}</Text> : null}

            {/* Terms and Conditions Checkbox */}
            <TouchableOpacity
              style={styles.agreeContainer}
              onPress={() => setAgree(!agree)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, agree && styles.checkboxChecked]}>
                {agree && <Ionicons name="checkmark" size={14} color="#ffffff" />}
              </View>
              <Text style={styles.agreeText}>
                I agree to the medidoc <Text style={styles.linkText}>Terms of Service</Text>{' '}
                and <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[
                styles.signUpButton,
                (!name || !email || !password || !agree) && styles.signUpButtonDisabled,
              ]}
              onPress={handleSignUp}
              disabled={!name || !email || !password || !agree}
            >
              <Text style={styles.signUpButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={onLoginLink}>
              <Text style={styles.footerLink}>Login</Text>
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
            <Text style={styles.modalTitle}>Success</Text>
            <Text style={styles.modalSubtitle}>
              Your account has been successfully registered
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
  agreeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 30,
    paddingRight: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#A8B6B2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#138A72',
    borderColor: '#138A72',
  },
  agreeText: {
    color: '#7E918C',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  linkText: {
    color: '#138A72',
    fontWeight: '600',
  },
  signUpButton: {
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
  signUpButtonDisabled: {
    backgroundColor: '#A3D9D0',
    shadowOpacity: 0,
    elevation: 0,
  },
  signUpButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
  // Modal Styles
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

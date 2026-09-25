import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { ErrorMessages } from '../constants/ErrorMessages';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import SuccessModal from '../components/modals/SuccessModal';
import { validateName, validateEmail, validatePassword, isEmailValidFormat } from '../utils/validation';
import { saveUser, getUserByEmail, saveLoginSession } from '../utils/storage';

interface SignUpProps {
  onBack?: () => void;
  onSignUpSuccess?: (name: string, email?: string) => void;
  onLoginLink?: () => void;
  navigation?: any;
}

export default function SignUp({ onBack, onSignUpSuccess, onLoginLink, navigation }: SignUpProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Email format check for the checkmark
  const isValidEmail = isEmailValidFormat(email);

  const handleSignUp = async () => {
    let hasError = false;

    // Name Validation
    const errName = validateName(name);
    if (errName) {
      setNameError(errName);
      hasError = true;
    } else {
      setNameError('');
    }

    // Email Validation
    const errEmail = validateEmail(email);
    if (errEmail) {
      setEmailError(errEmail);
      hasError = true;
    } else {
      setEmailError('');
    }

    // Password Validation
    const errPassword = validatePassword(password);
    if (errPassword) {
      setPasswordError(errPassword);
      hasError = true;
    } else {
      setPasswordError('');
    }

    // Confirm Password Validation
    if (!confirmPassword) {
      setConfirmPasswordError(ErrorMessages.password.confirmRequired);
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError(ErrorMessages.password.mismatch);
      hasError = true;
    } else {
      setConfirmPasswordError('');
    }

    // Agree terms verification
    if (!agree) {
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    // Save to AsyncStorage
    const success = await saveUser({ name, email, password });
    setLoading(false);

    if (!success) {
      setEmailError('*Email is already registered');
      return;
    }

    setShowSuccessModal(true);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    if (onSignUpSuccess) onSignUpSuccess(name, email);
    else if (onLoginLink) onLoginLink();
    else navigation?.navigate('Login');
  };

  const handleGoBack = () => (onBack ? onBack() : navigation?.goBack());
  const handleGoLogin = () => (onLoginLink ? onLoginLink() : navigation?.navigate('Login'));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.textDark} />
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
            <InputField
              icon="person-outline"
              placeholder="Enter your name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setNameError('');
              }}
              autoCapitalize="words"
              error={nameError}
            />

            {/* Email Input */}
            <InputField
              icon="mail-outline"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
              }}
              keyboardType="email-address"
              isValid={isValidEmail}
              error={emailError}
            />

            {/* Password Input */}
            <InputField
              icon="lock-closed-outline"
              placeholder="Enter your password"
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
              icon="lock-closed-outline"
              placeholder="Confirm password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setConfirmPasswordError('');
              }}
              isPassword
              error={confirmPasswordError}
            />

            {/* Terms and Conditions Checkbox */}
            <TouchableOpacity
              style={styles.agreeContainer}
              onPress={() => setAgree(!agree)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, agree && styles.checkboxChecked]}>
                {agree && <Ionicons name="checkmark" size={14} color={Colors.white} />}
              </View>
              <Text style={styles.agreeText}>
                I agree to the medidoc <Text style={styles.linkText}>Terms of Service</Text>{' '}
                and <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {/* Sign Up Button */}
            <Button
              title="Sign Up"
              onPress={handleSignUp}
              loading={loading}
              disabled={!name || !email || !password || !confirmPassword || !agree}
            />
          </View>

          {/* Footer Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleGoLogin}>
              <Text style={styles.footerLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Success"
        subtitle="Your account has been successfully registered"
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
    height: 56,
    backgroundColor: Colors.white,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
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
    borderColor: Colors.inputIcon || '#A0AEC0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  agreeText: {
    color: Colors.secondary,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  linkText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: Colors.secondary,
    fontSize: 14,
  },
  footerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});

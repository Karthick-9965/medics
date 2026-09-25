import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { ErrorMessages } from '../constants/ErrorMessages';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import SuccessModal from '../components/modals/SuccessModal';
import { validateEmail, isEmailValidFormat } from '../utils/validation';
import { getUserByEmail, saveLoginSession, saveUser } from '../utils/storage';

interface LoginProps {
  onBack?: () => void;
  onLoginSuccess?: (name: string, email?: string) => void;
  onSignUpLink?: () => void;
  onForgotPassword?: () => void;
  initialEmail?: string;
  initialPassword?: string;
  navigation?: any;
  route?: any;
}

export default function Login({
  onBack,
  onLoginSuccess,
  onSignUpLink,
  onForgotPassword,
  initialEmail = '',
  initialPassword = '',
  navigation,
  route,
}: LoginProps) {
  const paramEmail = route?.params?.email || initialEmail;
  const paramPassword = route?.params?.password || initialPassword;

  const [email, setEmail] = useState(paramEmail);
  const [password, setPassword] = useState(paramPassword);
  const [emailError, setEmailError] = useState('');
  const [isWrongPassword, setIsWrongPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    if (route?.params?.email) setEmail(route.params.email);
    if (route?.params?.password) setPassword(route.params.password);
  }, [route?.params]);

  const isValidEmail = isEmailValidFormat(email);

  const handleLogin = async () => {
    let hasError = false;

    // Email format validation
    const errEmail = validateEmail(email);
    if (errEmail) {
      setEmailError(errEmail);
      hasError = true;
    } else {
      setEmailError('');
    }

    // Password validation (required)
    if (!password) {
      setIsWrongPassword(true);
      hasError = true;
    } else {
      setIsWrongPassword(false);
    }

    if (hasError) return;

    setLoading(true);
    // Find user in AsyncStorage
    const user = await getUserByEmail(email);
    setLoading(false);

    if (!user || user.password !== password) {
      setIsWrongPassword(true);
      return;
    }

    setIsWrongPassword(false);
    setLoggedInUser({ name: user.name, email: user.email });

    // Save session
    await saveLoginSession(user.name, user.email);

    // Show Success Modal
    setShowSuccessModal(true);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    if (onLoginSuccess && loggedInUser) {
      onLoginSuccess(loggedInUser.name, loggedInUser.email);
    } else if (onLoginSuccess) {
      const displayName = email.split('@')[0];
      onLoginSuccess(displayName.charAt(0).toUpperCase() + displayName.slice(1), email);
    } else {
      navigation?.replace('Main');
    }
  };

  const handleGoBack = () => (onBack ? onBack() : navigation?.goBack());
  const handleGoSignUp = () => (onSignUpLink ? onSignUpLink() : navigation?.navigate('SignUp'));
  const handleGoForgotPassword = () => (onForgotPassword ? onForgotPassword() : navigation?.navigate('ForgotPassword'));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.textDark} />
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
            <InputField
              icon="mail-outline"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
                setIsWrongPassword(false);
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
                setIsWrongPassword(false);
              }}
              isPassword
              error={isWrongPassword ? ErrorMessages.password.wrong : undefined}
              style={isWrongPassword ? styles.hideDefaultErrorTextSpace : undefined}
            />

            {/* Forgot Password Row */}
            {isWrongPassword ? (
              <View style={styles.errorRow}>
                <Text style={styles.errorText}>{ErrorMessages.password.wrong}</Text>
                <TouchableOpacity onPress={handleGoForgotPassword}>
                  <Text style={styles.errorForgotLink}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.forgotPassword} onPress={handleGoForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            {/* Login Button */}
            <Button
              title="Login"
              onPress={handleLogin}
              loading={loading}
              disabled={!email || !password}
            />
          </View>

          {/* Footer Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleGoSignUp}>
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
            <TouchableOpacity style={styles.socialButton} onPress={() => handleSuccessModalClose()}>
              <Image
                source={require('../assets/google_icon.png')}
                style={styles.socialImage}
                resizeMode="contain"
              />
              <Text style={styles.socialButtonText}>Sign in with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} onPress={() => handleSuccessModalClose()}>
              <Ionicons name="logo-apple" size={20} color={Colors.black} style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>Sign in with Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} onPress={() => handleSuccessModalClose()}>
              <Ionicons name="logo-facebook" size={20} color="#4267B2" style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>Sign in with Facebook</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Yeay! Welcome Back"
        subtitle="Once again you login successfully into medidoc app"
        buttonTitle="Go to home"
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
  hideDefaultErrorTextSpace: {
    marginBottom: 0,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 12,
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: Colors.primary,
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
    color: Colors.error,
    fontSize: 12,
    fontWeight: '500',
  },
  errorForgotLink: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.dividerLine || '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 12,
    color: Colors.inputIcon || '#9CA3AF',
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
    borderColor: Colors.border,
    backgroundColor: Colors.white,
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
    color: Colors.socialText || '#1F2937',
    fontWeight: '600',
  },
});

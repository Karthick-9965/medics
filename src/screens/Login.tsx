import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { ErrorMessages } from '../constants/ErrorMessages';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import MedicalAlertModal from '../components/modals/MedicalAlertModal';
import ScreenHeader from '../components/common/ScreenHeader';
import SocialLoginButtons from '../components/common/SocialLoginButtons';
import { validateEmail, isEmailValidFormat } from '../utils/validation';
import { getUserByNameOrEmail, saveUser, saveLoginSession } from '../utils/storage';

interface LoginProps {
  onBack?: () => void;
  onLoginSuccess?: (name: string, email?: string) => void;
  onSignUpLink?: () => void;
  onForgotPassword?: () => void;
  initialEmail?: string;
  initialPassword?: string;
  initialName?: string;
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
  initialName = '',
  navigation,
  route,
}: LoginProps) {
  const paramEmail = route?.params?.email || initialEmail;
  const paramPassword = route?.params?.password || initialPassword;
  const paramName = route?.params?.name || initialName;

  const [email, setEmail] = useState(paramEmail);
  const [password, setPassword] = useState(paramPassword);
  const [emailError, setEmailError] = useState('');
  const [isWrongPassword, setIsWrongPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<{ name: string; email: string } | null>(null);

  const hasNavigatedRef = useRef(false);
  const userRef = useRef<{ name: string; email: string } | null>(null);

  useEffect(() => {
    if (route?.params?.email) setEmail(route.params.email);
    if (route?.params?.password) setPassword(route.params.password);
  }, [route?.params]);

  const isValidInput = email.includes('@')
    ? isEmailValidFormat(email)
    : email.trim().length >= 2;

  const handleLogin = async () => {
    let hasError = false;
    const cleanIdentifier = email.trim();

    if (!cleanIdentifier) {
      setEmailError('Please enter your email or name');
      hasError = true;
    } else if (cleanIdentifier.includes('@')) {
      const errEmail = validateEmail(cleanIdentifier);
      if (errEmail) {
        setEmailError(errEmail);
        hasError = true;
      } else {
        setEmailError('');
      }
    } else {
      setEmailError('');
    }

    if (!password) {
      setIsWrongPassword(true);
      hasError = true;
    } else {
      setIsWrongPassword(false);
    }

    if (hasError) return;

    setLoading(true);
    // Find user by email or name in AsyncStorage
    const existingUser = await getUserByNameOrEmail(cleanIdentifier);

    let finalName = '';
    let finalEmail = '';

    if (existingUser) {
      if (existingUser.password && existingUser.password !== password) {
        setLoading(false);
        setIsWrongPassword(true);
        return;
      }
      finalName = existingUser.name;
      finalEmail = existingUser.email;
    } else {
      // User entered a new identifier; determine appropriate display name
      if (cleanIdentifier.includes('@')) {
        const prefix = cleanIdentifier.split('@')[0];
        finalName = paramName
          ? paramName
          : prefix
              .split(/[._-]/)
              .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
              .join(' ') || 'User';
        finalEmail = cleanIdentifier;
      } else {
        finalName = cleanIdentifier;
        finalEmail = `${cleanIdentifier.toLowerCase().replace(/\s+/g, '')}@telemed.com`;
      }

      // Auto-save this user so subsequent logins work seamlessly
      await saveUser({ name: finalName, email: finalEmail, password });
    }

    setLoading(false);
    setIsWrongPassword(false);
    userRef.current = { name: finalName, email: finalEmail };
    setLoggedInUser({ name: finalName, email: finalEmail });
    hasNavigatedRef.current = false;

    // Save session to storage
    await saveLoginSession(finalName, finalEmail);

    // Show Success Modal
    setShowSuccessModal(true);
  };

  const handleSocialLogin = async (_provider: 'google' | 'apple' | 'facebook') => {
    setLoading(true);
    // When logging in with google, apple or facebook, the user name must be 'User'
    const socialName = 'User';
    const socialEmail = 'user@telemed.com';

    userRef.current = { name: socialName, email: socialEmail };
    setLoggedInUser({ name: socialName, email: socialEmail });
    hasNavigatedRef.current = false;

    await saveLoginSession(socialName, socialEmail);
    setLoading(false);

    setShowSuccessModal(true);
  };

  const handleSuccessModalClose = () => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;

    setShowSuccessModal(false);
    const currentUser = loggedInUser || userRef.current;
    const finalName = currentUser?.name || 'User';
    const finalEmail = currentUser?.email || 'user@telemed.com';

    if (onLoginSuccess) {
      onLoginSuccess(finalName, finalEmail);
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
      <ScreenHeader title="Login" onBack={handleGoBack} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Form */}
          <View style={styles.formSection}>
            {/* Email / Username Input */}
            <InputField
              icon="mail-outline"
              placeholder="Enter your email or username"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
                setIsWrongPassword(false);
              }}
              autoCapitalize="none"
              isValid={isValidInput}
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

          {/* Social Sign-in Buttons */}
          <SocialLoginButtons
            onGooglePress={() => handleSocialLogin('google')}
            onApplePress={() => handleSocialLogin('apple')}
            onFacebookPress={() => handleSocialLogin('facebook')}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <MedicalAlertModal
        visible={showSuccessModal}
        type="success"
        title="Yeay! Welcome Back"
        message="Once again you login successfully into medidoc app"
        primaryButtonText="Go to home"
        onPrimaryPress={handleSuccessModalClose}
        onClose={handleSuccessModalClose}
        autoCloseDelay={3000}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
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
    marginTop: 18,
    marginBottom: 8,
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

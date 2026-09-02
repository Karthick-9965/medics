import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { ErrorMessages } from '../constants/ErrorMessages';
import InputField from '../components/InputField';
import Button from '../components/Button';
import SuccessModal from '../components/SuccessModal';
import { validateEmail, isEmailValidFormat } from '../utils/validation';
import { getUserByEmail, saveLoginSession } from '../utils/storage';

interface LoginProps {
  onBack: () => void;
  onLoginSuccess: (name: string) => void;
  onSignUpLink: () => void;
  onForgotPassword: () => void;
}

export default function Login({ onBack, onLoginSuccess, onSignUpLink, onForgotPassword }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isWrongPassword, setIsWrongPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<{ name: string; email: string } | null>(null);

  // Real-time email validation format check (for checkmark indicator)
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

    if (hasError) return;

    setLoading(true);
    // Fetch registered user from AsyncStorage
    const registeredUser = await getUserByEmail(email);
    setLoading(false);

    if (!registeredUser) {
      setEmailError('*Email is not registered');
      return;
    }

    // Verify Password (Also allow mockup testing using wrong password triggers 'wrong' or 'error')
    const lowercasePassword = password.toLowerCase();
    const isMockWrong = lowercasePassword === 'wrong' || lowercasePassword === 'error';
    const isPasswordCorrect = registeredUser.password === password;

    if (isMockWrong || !isPasswordCorrect) {
      setIsWrongPassword(true);
      return;
    }

    setIsWrongPassword(false);
    setLoggedInUser(registeredUser);

    // Save session to AsyncStorage
    await saveLoginSession(registeredUser);

    // Show Success Modal
    setShowSuccessModal(true);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    if (loggedInUser) {
      onLoginSuccess(loggedInUser.name);
    } else {
      const displayName = email.split('@')[0];
      onLoginSuccess(displayName.charAt(0).toUpperCase() + displayName.slice(1));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
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
              icon="mail"
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
              icon="lock"
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
              <FontAwesome name="apple" size={20} color={Colors.black} style={styles.socialIcon} />
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
    backgroundColor: Colors.dividerLine,
  },
  dividerText: {
    marginHorizontal: 12,
    color: Colors.inputIcon,
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
    color: Colors.socialText,
    fontWeight: '600',
  },
});

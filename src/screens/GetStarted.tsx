import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View, Text, TouchableOpacity, } from 'react-native';
import Logo from '../components/Logo';

interface GetStartedProps {
  onLogin: () => void;
  onSignUp: () => void;
}

export default function GetStarted({ onLogin, onSignUp }: GetStartedProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Logo and Brand Name */}
        <View style={styles.logoSection}>
          <Logo size={100} color="#138A72" textColor="#138A72" />
        </View>

        {/* Text Section */}
        <View style={styles.textSection}>
          <Text style={styles.title}>Let's get started!</Text>
          <Text style={styles.subtitle}>
            Login to enjoy the features we've provided, and stay healthy!
          </Text>
        </View>

        {/* Buttons Section */}
        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
            <Text style={styles.loginButtonText}>Login.</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signUpButton} onPress={onSignUp}>
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 40,
  },
  logoSection: {
    marginTop: 40,
    alignItems: 'center',
  },
  textSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A3B32',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7E918C',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonSection: {
    width: '100%',
    gap: 16,
    paddingBottom: 20,
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
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#138A72',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#138A72',
    fontSize: 16,
    fontWeight: '600',
  },
});

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View, Text } from 'react-native';
import Logo from '../components/ui/Logo';
import Button from '../components/ui/Button';
import { Colors } from '../constants/Colors';

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
          <Logo size={100} color={Colors.primary} textColor={Colors.primary} />
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
          <Button title="Login" variant="primary" onPress={onLogin} />
          <Button title="Sign Up" variant="outline" onPress={onSignUp} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
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
    color: Colors.textDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonSection: {
    width: '100%',
    gap: 16,
    paddingBottom: 20,
  },
});

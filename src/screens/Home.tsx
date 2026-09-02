import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import Button from '../components/Button';
import Logo from '../components/Logo';

interface HomeProps {
  userName: string;
  onLogout: () => void;
  onSeeAllDoctors?: () => void;
}

export default function Home({
  userName,
  onLogout,
}: HomeProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Top Branding (Single Logo & Name) */}
        <View style={styles.logoSection}>
          <Logo size={72} />
        </View>

        {/* Welcome Card */}
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-circle" size={54} color={Colors.primary} />
          </View>

          <Text style={styles.welcomeHeading}>Welcome to Home Page</Text>

          <Text style={styles.greetingText}>
            Hello, <Text style={styles.userNameHighlight}>{userName || 'User'}</Text>! 👋
          </Text>

          <Text style={styles.infoText}>
            You have successfully logged in to your account.
          </Text>
        </View>

        {/* Bottom Action */}
        <View style={styles.footerSection}>
          <Button
            title="Log Out"
            variant="outline"
            onPress={onLogout}
          />
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 24,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.bgLight,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: Colors.border,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  welcomeHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 10,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 6,
  },
  userNameHighlight: {
    color: Colors.primary,
    fontWeight: '800',
  },
  infoText: {
    fontSize: 14,
    color: Colors.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 4,
    paddingHorizontal: 10,
  },
  footerSection: {
    width: '100%',
    marginBottom: 16,
  },
});

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';

interface HomeProps {
  userName: string;
  onLogout: () => void;
}

export default function Home({ userName, onLogout }: HomeProps) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View />
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Feather name="log-out" size={20} color="#D93838" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.successIconCircle}>
          <Ionicons name="home-outline" size={48} color="#138A72" />
        </View>

        <Text style={styles.title}>Welcome to Home Page</Text>
        <Text style={styles.userName}>{userName || 'User'}</Text>
        <Text style={styles.subtitle}>
          Once again, you login successfully into medidoc app.
        </Text>

        <TouchableOpacity style={styles.logoutTextButton} onPress={onLogout}>
          <Text style={styles.logoutTextButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 56,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: -40,
  },
  successIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E7F5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A3B32',
    textAlign: 'center',
    marginBottom: 6,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#138A72',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    color: '#7E918C',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
  },
  logoutTextButton: {
    height: 50,
    width: '100%',
    borderRadius: 25,
    backgroundColor: '#D93838',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutTextButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});

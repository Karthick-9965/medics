import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface HomeHeaderProps {
  userName?: string;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export default function HomeHeader({
  userName = 'User',
  onNotificationPress,
  onProfilePress,
}: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Left Profile Avatar */}
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={onProfilePress}
        activeOpacity={0.8}
      >
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={20} color={Colors.primary} />
        </View>
      </TouchableOpacity>

      {/* Middle Greeting & Subtitle */}
      <View style={styles.textContainer}>
        <Text style={styles.greeting}>
          Hi, {userName || 'User'} ! 
        </Text>
        <Text style={styles.subtitle}>How are you feeling today?</Text>
      </View>

      {/* Right Notification Bell Icon */}
      <TouchableOpacity
        style={styles.notificationButton}
        onPress={onNotificationPress}
        activeOpacity={0.7}
      >
        <Ionicons name="notifications-outline" size={24} color={Colors.black} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8EFEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.secondary,
  },
  notificationButton: {
    padding: 6,
  },
});

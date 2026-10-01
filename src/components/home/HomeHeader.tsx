import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface HomeHeaderProps {
  userName?: string;
  avatarUri?: string | null;
  onProfilePress?: () => void;
}

export default function HomeHeader({
  userName = 'User',
  avatarUri = null,
  onProfilePress,
}: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Clickable Profile Avatar -> Navigates to My Profile */}
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={onProfilePress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Go to My Profile"
      >
        {avatarUri ? (
          <Image
            key={avatarUri}
            source={{ uri: avatarUri }}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={22} color={Colors.primary} />
          </View>
        )}
      </TouchableOpacity>

      {/* Non-clickable Greeting Text */}
      <View style={styles.textContainer}>
        <Text style={styles.greeting}>
          Hi, {userName || 'User'} !
        </Text>
        <Text style={styles.subtitle}>How are you feeling today?</Text>
      </View>
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
    backgroundColor: Colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Colors.primary,
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
});

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';

interface ProfileUserCardProps {
  name: string;
  email: string;
  avatarUri?: string | null;
  onPickAvatar?: () => void;
}

export default function ProfileUserCard({
  name,
  email,
  avatarUri = null,
  onPickAvatar,
}: ProfileUserCardProps) {
  return (
    <View style={styles.profileCard}>
      <View style={styles.avatarWrapper}>
        <TouchableOpacity
          style={styles.avatarTouch}
          onPress={onPickAvatar}
          activeOpacity={0.8}
        >
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={40} color={Colors.primary} />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editBadge}
          onPress={onPickAvatar}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={14} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <Text style={styles.userName}>{name}</Text>
      <Text style={styles.userEmail}>{email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarTouch: {
    borderRadius: 44,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.border,
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.secondary,
  },
});

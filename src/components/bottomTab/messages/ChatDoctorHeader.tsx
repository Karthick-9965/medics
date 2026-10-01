import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { ConversationItem } from './ConversationCard';

export interface ChatDoctorHeaderProps {
  conversation: ConversationItem;
  onBack: () => void;
  onAudioCall?: () => void;
  onVideoCall?: () => void;
}

/**
 * Reusable Doctor Chat Header.
 * Displays doctor avatar with online indicator, doctor name, specialization,
 * and quick action buttons for audio and video consultation calls.
 */
export default function ChatDoctorHeader({
  conversation,
  onBack,
  onAudioCall,
  onVideoCall,
}: ChatDoctorHeaderProps) {
  return (
    <View style={styles.header}>
      {/* Back Button */}
      <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
      </TouchableOpacity>

      {/* Doctor Info (Avatar + Name + Specialty) */}
      <View style={styles.headerInfo}>
        <View style={styles.avatarWrapper}>
          <Image source={conversation.avatar} style={styles.avatar} />
          <View style={styles.onlineDot} />
        </View>
        <View style={styles.nameContainer}>
          <Text style={styles.headerName} numberOfLines={1}>
            {conversation.name}
          </Text>
          <Text style={styles.headerSpecialty} numberOfLines={1}>
            {conversation.specialization}
          </Text>
        </View>
      </View>

      {/* Action Buttons: Audio Call & Video Call */}
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onAudioCall} activeOpacity={0.7}>
          <Ionicons name="call" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onVideoCall} activeOpacity={0.7}>
          <Ionicons name="videocam" size={21} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  backBtn: {
    padding: 6,
    marginRight: 6,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.bgLight,
  },
  onlineDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: Colors.checkmarkGreen,
    borderWidth: 2,
    borderColor: Colors.white,
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  nameContainer: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
  },
  headerSpecialty: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

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

export interface ConversationItem {
  id: string;
  name: string;
  specialization: string;
  avatar: any;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  type: 'doctor' | 'clinic';
}

interface ConversationCardProps {
  conversation: ConversationItem;
  onPress: () => void;
}

export default function ConversationCard({
  conversation,
  onPress,
}: ConversationCardProps) {
  return (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Avatar with online status */}
      <View style={styles.avatarContainer}>
        <Image source={conversation.avatar} style={styles.avatar} />
        {conversation.online && <View style={styles.onlineBadge} />}
      </View>

      {/* Details */}
      <View style={styles.chatDetails}>
        <View style={styles.chatHeaderRow}>
          <Text style={styles.doctorName} numberOfLines={1}>
            {conversation.name}
          </Text>
          <Text style={styles.chatTime}>{conversation.time}</Text>
        </View>
        <Text style={styles.specialtyText}>{conversation.specialization}</Text>
        <Text style={styles.lastMessageText} numberOfLines={1}>
          {conversation.lastMessage}
        </Text>
      </View>

      {/* Unread badge / checkmark */}
      <View style={styles.badgeColumn}>
        {conversation.unread > 0 ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{conversation.unread}</Text>
          </View>
        ) : (
          <Ionicons name="checkmark-done" size={16} color={Colors.primary} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dividerLine,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.bgLight,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  chatDetails: {
    flex: 1,
    marginRight: 8,
  },
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
    flex: 1,
    marginRight: 6,
  },
  chatTime: {
    fontSize: 11,
    color: Colors.secondary,
  },
  specialtyText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  lastMessageText: {
    fontSize: 13,
    color: Colors.secondary,
  },
  badgeColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 24,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
});

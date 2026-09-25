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
  const isUnread = (conversation.unread || 0) > 0;

  return (
    <TouchableOpacity
      style={[styles.chatCard, isUnread && styles.chatCardUnread]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image source={conversation.avatar} style={styles.avatar} />
      </View>

      {/* Details */}
      <View style={styles.chatDetails}>
        <View style={styles.chatHeaderRow}>
          <Text style={[styles.doctorName, isUnread && styles.doctorNameUnread]} numberOfLines={1}>
            {conversation.name}
          </Text>
          <Text style={[styles.chatTime, isUnread && styles.chatTimeUnread]}>{conversation.time}</Text>
        </View>
        <Text style={styles.specialtyText}>{conversation.specialization}</Text>
        <Text style={[styles.lastMessageText, isUnread && styles.lastMessageUnread]} numberOfLines={1}>
          {conversation.lastMessage}
        </Text>
      </View>

      {/* Unread badge / checkmark */}
      <View style={styles.badgeColumn}>
        {isUnread ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>
              {conversation.unread > 99 ? '99+' : conversation.unread}
            </Text>
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
    paddingHorizontal: 8,
    borderRadius: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dividerLine,
  },
  chatCardUnread: {
    backgroundColor: Colors.accentLight + '40',
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
  doctorNameUnread: {
    color: Colors.black,
    fontWeight: '800',
  },
  chatTime: {
    fontSize: 11,
    color: Colors.secondary,
  },
  chatTimeUnread: {
    color: Colors.primary,
    fontWeight: '700',
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
  lastMessageUnread: {
    color: Colors.textDark,
    fontWeight: '700',
  },
  badgeColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 26,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 11,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
});

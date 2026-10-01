import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { ConversationItem } from './ConversationCard';

export interface ChatMessage {
  id?: string;
  sender: 'doctor' | 'user';
  text: string;
  time: string;
  image?: string;
  isPrescription?: boolean;
  prescriptionName?: string;
}

export interface ChatMessageBubbleProps {
  message: ChatMessage;
  conversation: ConversationItem;
  onImagePress: (uri: string) => void;
  onDeletePress?: () => void;
}

/**
 * Reusable chat message bubble for doctor or user messages.
 * Supports prescription sheet thumbnails, timestamps, and message deletion.
 */
export default function ChatMessageBubble({
  message,
  conversation,
  onImagePress,
  onDeletePress,
}: ChatMessageBubbleProps) {
  const isUser = message.sender === 'user';
  const isPdf =
    (message.prescriptionName || '').toLowerCase().endsWith('.pdf') ||
    (message.image || '').toLowerCase().endsWith('.pdf') ||
    (message.image || '').toLowerCase().includes('.pdf');

  return (
    <View
      style={[
        styles.msgRow,
        isUser ? styles.msgRowUser : styles.msgRowDoc,
      ]}
    >
      {!isUser && (
        <Image
          source={conversation.avatar}
          style={styles.docAvatar}
          resizeMode="cover"
        />
      )}

      <TouchableOpacity
        activeOpacity={isUser ? 0.9 : 1}
        onLongPress={isUser ? onDeletePress : undefined}
        delayLongPress={300}
        style={[
          styles.msgBubble,
          isUser ? styles.msgBubbleUser : styles.msgBubbleDoc,
        ]}
      >
        {/* Prescription Attachment: PDF Document or Photo */}
        {message.image && (
          isPdf ? (
            <TouchableOpacity
              onPress={() => onImagePress(message.image!)}
              activeOpacity={0.85}
              style={[
                styles.pdfCard,
                isUser ? styles.pdfCardUser : styles.pdfCardDoc,
              ]}
            >
              <View style={[styles.pdfIconCircle, isUser ? styles.pdfIconCircleUser : styles.pdfIconCircleDoc]}>
                <Ionicons name="document-text" size={24} color={isUser ? Colors.primary : Colors.error} />
                <View style={[styles.pdfTinyBadge, isUser ? styles.pdfTinyBadgeUser : styles.pdfTinyBadgeDoc]}>
                  <Text style={styles.pdfTinyBadgeText}>PDF</Text>
                </View>
              </View>
              <View style={styles.pdfInfoWrap}>
                <Text
                  style={[styles.pdfDocName, isUser ? styles.pdfDocNameUser : styles.pdfDocNameDoc]}
                  numberOfLines={1}
                >
                  {message.prescriptionName || 'Prescription Document.pdf'}
                </Text>
                <View style={styles.pdfMetaRow}>
                  <Ionicons
                    name="shield-checkmark"
                    size={11}
                    color={isUser ? 'rgba(255,255,255,0.85)' : Colors.successGreen}
                  />
                  <Text style={[styles.pdfMetaText, isUser ? styles.pdfMetaTextUser : styles.pdfMetaTextDoc]}>
                    Verified Document
                  </Text>
                </View>
              </View>
              <Ionicons
                name="expand-outline"
                size={16}
                color={isUser ? 'rgba(255,255,255,0.85)' : Colors.secondary}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => onImagePress(message.image!)}
              activeOpacity={0.9}
              style={styles.prescriptionWrapper}
            >
              <Image
                source={{ uri: message.image }}
                style={styles.prescriptionImage}
                resizeMode="cover"
              />
              <View style={styles.rxOverlayBadge}>
                <View style={styles.rxTag}>
                  <Ionicons name="shield-checkmark" size={12} color={Colors.successGreen} />
                  <Text style={styles.rxTagText}>Prescription Attached</Text>
                </View>
                <Ionicons name="expand-outline" size={14} color={Colors.secondary} />
              </View>
            </TouchableOpacity>
          )
        )}

        <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextDoc]}>
          {message.text}
        </Text>
        <View style={styles.bubbleFooter}>
          <Text style={[styles.timeText, isUser ? styles.timeTextUser : styles.timeTextDoc]}>
            {message.time}
          </Text>
          {isUser && onDeletePress && (
            <TouchableOpacity
              onPress={onDeletePress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.deleteBubbleBtn}
              activeOpacity={0.6}
            >
              <Ionicons name="trash-outline" size={12} color="rgba(255, 255, 255, 0.75)" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  msgRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowDoc: {
    justifyContent: 'flex-start',
  },
  docAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 2,
  },
  msgBubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  msgBubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  msgBubbleDoc: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  msgTextUser: {
    color: Colors.white,
  },
  msgTextDoc: {
    color: Colors.textDark,
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  timeText: {
    fontSize: 10,
  },
  timeTextUser: {
    color: 'rgba(255,255,255,0.7)',
  },
  timeTextDoc: {
    color: Colors.secondary,
  },
  deleteBubbleBtn: {
    padding: 2,
    marginLeft: 3,
  },
  prescriptionWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: Colors.cardBgSecondary,
  },
  prescriptionImage: {
    width: 200,
    height: 130,
  },
  rxOverlayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  rxTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rxTagText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Colors.successDark,
  },
  pdfCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    minWidth: 190,
  },
  pdfCardUser: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  pdfCardDoc: {
    backgroundColor: Colors.cardBgSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pdfIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfIconCircleUser: {
    backgroundColor: Colors.white,
  },
  pdfIconCircleDoc: {
    backgroundColor: Colors.redBg,
  },
  pdfTinyBadge: {
    position: 'absolute',
    bottom: -2,
    paddingHorizontal: 3,
    paddingVertical: 0.5,
    borderRadius: 3,
  },
  pdfTinyBadgeUser: {
    backgroundColor: Colors.primary,
  },
  pdfTinyBadgeDoc: {
    backgroundColor: Colors.error,
  },
  pdfTinyBadgeText: {
    color: Colors.white,
    fontSize: 7,
    fontWeight: '800',
  },
  pdfInfoWrap: {
    flex: 1,
    marginLeft: 10,
    marginRight: 4,
  },
  pdfDocName: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  pdfDocNameUser: {
    color: Colors.white,
  },
  pdfDocNameDoc: {
    color: Colors.textDark,
  },
  pdfMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  pdfMetaText: {
    fontSize: 10,
    fontWeight: '500',
  },
  pdfMetaTextUser: {
    color: 'rgba(255,255,255,0.85)',
  },
  pdfMetaTextDoc: {
    color: Colors.secondary,
  },
});

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { ConversationItem } from './ConversationCard';

export interface ChatMessage {
  sender: 'doctor' | 'user';
  text: string;
  time: string;
}

interface ChatDetailModalProps {
  visible: boolean;
  conversation: ConversationItem | null;
  messages: ChatMessage[];
  onClose: () => void;
  onSendMessage: (text: string) => void;
}

export default function ChatDetailModal({
  visible,
  conversation,
  messages,
  onClose,
  onSendMessage,
}: ChatDetailModalProps) {
  const [inputText, setInputText] = useState('');

  if (!conversation) return null;

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalSafeArea} edges={['top', 'bottom', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalBackButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.textDark} />
            </TouchableOpacity>

            <View style={styles.modalDoctorInfo}>
              <Image source={conversation.avatar} style={styles.modalAvatar} />
              <View style={styles.modalDoctorText}>
                <Text style={styles.modalDoctorName}>{conversation.name}</Text>
                <Text style={styles.modalDoctorStatus}>
                  {conversation.online ? ' Online' : 'Offline'}
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.actionIconButton}>
                <Ionicons name="call-outline" size={20} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionIconButton}>
                <Ionicons name="videocam-outline" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Chat Message List */}
          <ScrollView
            style={styles.modalChatBody}
            contentContainerStyle={styles.modalChatContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg, idx) => {
              const isMe = msg.sender === 'user';
              return (
                <View
                  key={idx}
                  style={[
                    styles.messageRow,
                    isMe ? styles.messageRowMe : styles.messageRowOther,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      isMe ? styles.messageBubbleMe : styles.messageBubbleOther,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isMe ? styles.messageTextMe : styles.messageTextOther,
                      ]}
                    >
                      {msg.text}
                    </Text>
                    <Text
                      style={[
                        styles.messageTimeText,
                        isMe ? styles.messageTimeMe : styles.messageTimeOther,
                      ]}
                    >
                      {msg.time}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Input Bar */}
          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons name="attach" size={22} color={Colors.secondary} />
            </TouchableOpacity>
            <TextInput
              style={styles.chatTextInput}
              placeholder="Type a message..."
              placeholderTextColor={Colors.inputPlaceholder}
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim()}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalSafeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dividerLine,
  },
  modalBackButton: {
    padding: 6,
    marginRight: 8,
  },
  modalDoctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  modalDoctorText: {
    flex: 1,
  },
  modalDoctorName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
  },
  modalDoctorStatus: {
    fontSize: 11,
    color: Colors.secondary,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalChatBody: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  modalChatContent: {
    padding: 16,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageBubbleMe: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextMe: {
    color: Colors.white,
  },
  messageTextOther: {
    color: Colors.textDark,
  },
  messageTimeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeMe: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  messageTimeOther: {
    color: Colors.secondary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.dividerLine,
    gap: 10,
  },
  attachButton: {
    padding: 6,
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: Colors.bgLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.textDark,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.primaryDisabled,
  },
});

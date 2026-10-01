import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '../../../constants/Colors';
import { ConversationItem } from './ConversationCard';
import ChatMessageBubble, { ChatMessage } from './ChatMessageBubble';
import ChatInputBar from './ChatInputBar';
import ChatAttachmentModal from './ChatAttachmentModal';
import QuickPromptsRow, { QuickPromptItem } from './QuickPromptsRow';
import MedicalAlertModal, { MedicalAlertType } from '../../modals/MedicalAlertModal';
import ChatDoctorHeader from './ChatDoctorHeader';
import ChatPendingAttachmentCard, { PendingSendItem } from './ChatPendingAttachmentCard';
import ChatFullscreenImageModal from './ChatFullscreenImageModal';
import ChatDeleteConfirmModal from './ChatDeleteConfirmModal';

export { ChatMessage };

interface ChatDetailModalProps {
  visible: boolean;
  conversation: ConversationItem | null;
  messages: ChatMessage[];
  isTyping?: boolean;
  onClose: () => void;
  onSendMessage: (
    text: string,
    image?: string,
    isPrescription?: boolean,
    prescriptionName?: string
  ) => void;
  onDeleteMessage?: (messageIndex: number, messageId?: string) => void;
  onAudioCall?: () => void;
  onVideoCall?: () => void;
}

const QUICK_PROMPTS: QuickPromptItem[] = [
  { text: 'Upload Prescription', icon: 'document-attach', isUpload: true },
  { text: 'Describe Symptoms', icon: 'medkit-outline' },
  { text: 'Prescription Query', icon: 'document-text-outline' },
  { text: 'Next Appointment', icon: 'calendar-outline' },
  { text: 'Exercise Advice', icon: 'fitness-outline' },
];

/**
 * Main Chat Detail Modal.
 * Clean, modular architecture composed of ChatDoctorHeader, ChatMessageBubble,
 * ChatInputBar, ChatPendingAttachmentCard, ChatFullscreenImageModal, and ChatDeleteConfirmModal.
 */
export default function ChatDetailModal({
  visible,
  conversation,
  messages,
  isTyping = false,
  onClose,
  onSendMessage,
  onDeleteMessage,
  onAudioCall,
  onVideoCall,
}: ChatDetailModalProps) {
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedName, setAttachedName] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);
  const [pendingSendItem, setPendingSendItem] = useState<PendingSendItem | null>(null);
  const [pendingSendNote, setPendingSendNote] = useState('');
  const [messageToDelete, setMessageToDelete] = useState<{ index: number; message: ChatMessage } | null>(null);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type?: MedicalAlertType;
    icon?: keyof typeof Ionicons.glyphMap;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      ImagePicker.getPendingResultAsync()
        .then((pending) => {
          if (
            pending &&
            'assets' in pending &&
            !pending.canceled &&
            pending.assets &&
            pending.assets.length > 0
          ) {
            const asset = pending.assets[0];
            const name = asset.fileName || 'Camera Photo';
            setAttachedImage(asset.uri);
            setAttachedName(name);
            setPendingSendItem({ uri: asset.uri, name, isPdf: false });
          }
        })
        .catch((err) => console.log('Pending camera in Chat error:', err));
    }
  }, [visible, messages.length]);

  if (!visible || !conversation) return null;

  const handleSend = () => {
    if (!inputText.trim() && !attachedImage) return;

    const isPdf = attachedName.toLowerCase().endsWith('.pdf');
    onSendMessage(
      inputText.trim(),
      attachedImage || undefined,
      !!attachedImage,
      attachedName || (isPdf ? 'Prescription Document.pdf' : 'Prescription Image.jpg')
    );

    setInputText('');
    setAttachedImage(null);
    setAttachedName('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleConfirmSendPrescription = () => {
    if (!pendingSendItem) return;
    const finalNote = pendingSendNote.trim()
      ? `Prescription attached: ${pendingSendItem.name}\nNote: ${pendingSendNote.trim()}`
      : `Prescription attached: ${pendingSendItem.name}`;

    onSendMessage(
      finalNote,
      pendingSendItem.uri,
      true,
      pendingSendItem.name
    );

    setPendingSendItem(null);
    setPendingSendNote('');
    setAttachedImage(null);
    setAttachedName('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handlePickCamera = async () => {
    setShowUploadModal(false);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setAlertConfig({
          visible: true,
          type: 'warning',
          icon: 'camera-outline',
          title: 'Camera Permission',
          message: 'Camera permission is required to capture your doctor prescription sheet.',
        });
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const name = result.assets[0].fileName || 'Camera Photo';
        setAttachedImage(uri);
        setAttachedName(name);
        setPendingSendItem({ uri, name, isPdf: false });
      }
    } catch (e) {
      console.log('Error launching camera:', e);
    }
  };

  const handlePickGallery = async () => {
    setShowUploadModal(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setAlertConfig({
          visible: true,
          type: 'warning',
          icon: 'images-outline',
          title: 'Gallery Permission',
          message: 'Photo gallery permission is required to select medical records.',
        });
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const name = result.assets[0].fileName || 'Prescription Image';
        setAttachedImage(uri);
        setAttachedName(name);
        setPendingSendItem({ uri, name, isPdf: false });
      }
    } catch (e) {
      console.log('Error picking image:', e);
    }
  };

  const handlePickDocument = async () => {
    setShowUploadModal(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        const uri = result.assets[0].uri;
        const name = result.assets[0].name || 'prescription_document.pdf';
        const isPdf = name.toLowerCase().endsWith('.pdf') || uri.toLowerCase().endsWith('.pdf');
        setAttachedImage(uri);
        setAttachedName(name);
        setPendingSendItem({ uri, name, isPdf });
      }
    } catch (e) {
      console.log('Document picker error:', e);
    }
  };

  const handlePromptPress = (prompt: QuickPromptItem) => {
    if (prompt.isUpload) {
      setShowUploadModal(true);
    } else {
      setInputText(prompt.text + ': ');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* 1. Reusable Doctor Chat Header */}
        <ChatDoctorHeader
          conversation={conversation}
          onBack={onClose}
          onAudioCall={onAudioCall}
          onVideoCall={onVideoCall}
        />

        {/* 2. Quick Suggestion Prompts */}
        <QuickPromptsRow prompts={QUICK_PROMPTS} onSelectPrompt={handlePromptPress} />

        {/* 3. Message Thread Scroll View */}
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((m, idx) => (
            <ChatMessageBubble
              key={m.id || idx}
              message={m}
              conversation={conversation}
              onImagePress={(uri) => setPreviewImageUri(uri)}
              onDeletePress={() => setMessageToDelete({ index: idx, message: m })}
            />
          ))}

          {isTyping && (
            <View style={styles.typingWrap}>
              <Text style={styles.typingText}>
                {conversation.type === 'clinic'
                  ? `${conversation.name} is typing...`
                  : `Dr. ${conversation.name.replace(/^Dr\.\s*/, '')} is typing...`}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* 4. Bottom Input Bar */}
        <ChatInputBar
          inputText={inputText}
          attachedImage={attachedImage}
          attachedName={attachedName}
          onInputChange={setInputText}
          onOpenAttachment={() => setShowUploadModal(true)}
          onRemoveAttachment={() => {
            setAttachedImage(null);
            setAttachedName('');
          }}
          onSend={handleSend}
        />

        {/* 5. Prescription Attachment Source Picker Modal */}
        <ChatAttachmentModal
          visible={showUploadModal}
          onPickCamera={handlePickCamera}
          onPickGallery={handlePickGallery}
          onPickDocument={handlePickDocument}
          onClose={() => setShowUploadModal(false)}
        />

        {/* 6. Reusable Pending Attachment Preview & Note Overlay */}
        {!!pendingSendItem && (
          <ChatPendingAttachmentCard
            item={pendingSendItem}
            doctorName={conversation.name}
            note={pendingSendNote}
            onNoteChange={setPendingSendNote}
            onSend={handleConfirmSendPrescription}
            onCancel={() => setPendingSendItem(null)}
          />
        )}

        {/* 7. Reusable Full-Screen Image / Document Viewer Overlay */}
        {!!previewImageUri && (
          <ChatFullscreenImageModal
            uri={previewImageUri}
            doctorName={conversation.name}
            onClose={() => setPreviewImageUri(null)}
          />
        )}

        {/* 8. Reusable Delete Message Confirmation Modal */}
        {messageToDelete !== null && (
          <ChatDeleteConfirmModal
            messageText={
              messageToDelete.message.text ||
              (messageToDelete.message.image ? 'Prescription Attachment' : 'Message')
            }
            onConfirm={() => {
              if (onDeleteMessage) {
                onDeleteMessage(messageToDelete.index, messageToDelete.message.id);
              }
              setMessageToDelete(null);
            }}
            onCancel={() => setMessageToDelete(null)}
          />
        )}

        {/* Alert Modal */}
        <MedicalAlertModal
          visible={alertConfig.visible}
          type={alertConfig.type}
          icon={alertConfig.icon}
          title={alertConfig.title}
          message={alertConfig.message}
          onPrimaryPress={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
          onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  messageList: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  messageContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  typingWrap: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typingText: {
    fontSize: 12.5,
    color: Colors.secondary,
    fontStyle: 'italic',
  },
});

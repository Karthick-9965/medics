import React, { useState, useRef, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../../constants/Colors';
import { ConversationItem } from './ConversationCard';

export interface ChatMessage {
  sender: 'doctor' | 'user';
  text: string;
  time: string;
  image?: string;
  isPrescription?: boolean;
  prescriptionName?: string;
}

interface ChatDetailModalProps {
  visible: boolean;
  conversation: ConversationItem | null;
  messages: ChatMessage[];
  isTyping?: boolean;
  onClose: () => void;
  onSendMessage: (text: string, image?: string, isPrescription?: boolean) => void;
  onAudioCall?: () => void;
  onVideoCall?: () => void;
}

const SAMPLE_PRESCRIPTIONS = [
  {
    id: 'sample_rx_1',
    label: 'Doctor Rx Sheet',
    uri: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
    title: 'Dr. Sarah Wilson - General Medicine Rx',
    note: 'Paracetamol 650mg, Amoxicillin 500mg, Vitamin C',
  },
  {
    id: 'sample_rx_2',
    label: 'Tablet Strip Photo',
    uri: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&auto=format&fit=crop&q=80',
    title: 'Tablet Strip (Pain Relief & Antibiotics)',
    note: 'Taking 1 tablet twice daily after meals',
  },
];

const QUICK_PROMPTS: { text: string; icon: keyof typeof Ionicons.glyphMap; isUpload?: boolean }[] = [
  { text: 'Upload Prescription', icon: 'document-attach', isUpload: true },
  { text: 'Describe Symptoms', icon: 'medkit-outline' },
  { text: 'Prescription Query', icon: 'document-text-outline' },
  { text: 'Next Appointment', icon: 'calendar-outline' },
  { text: 'Exercise Advice', icon: 'fitness-outline' },
];

export default function ChatDetailModal({
  visible,
  conversation,
  messages,
  isTyping = false,
  onClose,
  onSendMessage,
  onAudioCall,
  onVideoCall,
}: ChatDetailModalProps) {
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedName, setAttachedName] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [visible, messages, isTyping]);

  const handleSend = () => {
    if (!inputText.trim() && !attachedImage) return;
    if (!conversation) return;

    const textToSend = inputText.trim() || (attachedImage ? '📄 Prescription Sheet Attached' : '');
    onSendMessage(textToSend, attachedImage || undefined, !!attachedImage);

    setInputText('');
    setAttachedImage(null);
    setAttachedName('');
  };

  const handlePickCamera = async () => {
    setShowUploadModal(false);
    try {
      const res = await ImagePicker.requestCameraPermissionsAsync();
      if (!res.granted) {
        Alert.alert('Permission Required', 'Camera access is needed to capture prescription sheet.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setAttachedImage(result.assets[0].uri);
        setAttachedName('Prescription Photo');
      }
    } catch (e) {
      console.log('Error opening camera:', e);
    }
  };

  const handlePickGallery = async () => {
    setShowUploadModal(false);
    try {
      const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!res.granted) {
        Alert.alert('Permission Required', 'Gallery access is needed to upload prescription sheet.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setAttachedImage(result.assets[0].uri);
        setAttachedName('Prescription Sheet');
      }
    } catch (e) {
      console.log('Error opening gallery:', e);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_PRESCRIPTIONS[0]) => {
    setShowUploadModal(false);
    setAttachedImage(sample.uri);
    setAttachedName(sample.label);
    if (!inputText) {
      setInputText(`Doctor, please review my prescription: ${sample.title}`);
    }
  };

  if (!conversation) return null;

  return (
    <Modal visible={visible && !!conversation} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={Colors.textDark} />
          </TouchableOpacity>
          <Image source={conversation.avatar} style={styles.avatar} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.docName}>{conversation.name}</Text>
            <Text style={styles.docSpec}>{conversation.specialization}</Text>
          </View>
          <TouchableOpacity onPress={onAudioCall} style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="call-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onVideoCall} style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="videocam-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Quick Chips */}
        <View style={{ height: 40, paddingVertical: 4 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {QUICK_PROMPTS.map((p) => (
              <TouchableOpacity
                key={p.text}
                style={[styles.chip, p.isUpload && styles.uploadChip]}
                onPress={() => {
                  if (p.isUpload) {
                    setShowUploadModal(true);
                  } else {
                    onSendMessage(p.text);
                  }
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={p.icon}
                  size={13}
                  color={p.isUpload ? Colors.white : Colors.primary}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.chipText, p.isUpload && styles.uploadChipText]}>{p.text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Message Stream */}
        <ScrollView ref={scrollRef} contentContainerStyle={styles.msgStream} showsVerticalScrollIndicator={false}>
          {messages.map((m, idx) => {
            const isUser = m.sender === 'user';
            return (
              <View key={idx} style={[styles.bubbleWrap, isUser ? styles.bubbleWrapUser : styles.bubbleWrapDoc]}>
                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleDoc]}>
                  {/* Prescription Image Card inside Bubble */}
                  {m.image && (
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => setPreviewImageUri(m.image || null)}
                      style={styles.rxCardInBubble}
                    >
                      <Image source={{ uri: m.image }} style={styles.rxImageInBubble} resizeMode="cover" />
                      <View style={styles.rxCardFooter}>
                        <View style={styles.rxTag}>
                          <Ionicons name="shield-checkmark" size={12} color="#16A34A" />
                          <Text style={styles.rxTagText}>Prescription Attached</Text>
                        </View>
                        <Ionicons name="expand-outline" size={14} color={Colors.secondary} />
                      </View>
                    </TouchableOpacity>
                  )}

                  <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextDoc]}>{m.text}</Text>
                  <Text style={[styles.timeText, isUser ? styles.timeTextUser : styles.timeTextDoc]}>{m.time}</Text>
                </View>
              </View>
            );
          })}
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

        {/* Attached Prescription Preview Banner (before sending) */}
        {attachedImage && (
          <View style={styles.attachedPreviewBar}>
            <Image source={{ uri: attachedImage }} style={styles.attachedThumb} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={styles.attachedBadge}>
                <Ionicons name="document-text" size={12} color="#16A34A" />
                <Text style={styles.attachedBadgeText}>Prescription Attached</Text>
              </View>
              <Text style={styles.attachedFileName} numberOfLines={1}>
                {attachedName || 'Prescription Image'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setAttachedImage(null);
                setAttachedName('');
              }}
              style={styles.removeAttachedBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={22} color={Colors.secondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Input Bar */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.inputBar}>
            {/* Prescription Upload Button */}
            <TouchableOpacity
              style={styles.attachBtn}
              onPress={() => setShowUploadModal(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="document-attach" size={22} color={Colors.primary} />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder={attachedImage ? 'Add a note for the doctor...' : 'Type your message...'}
              placeholderTextColor={Colors.secondary}
            />

            <TouchableOpacity
              style={[
                styles.sendBtn,
                !inputText.trim() && !attachedImage && styles.sendBtnDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() && !attachedImage}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Prescription Upload Options Modal */}
        <Modal
          visible={showUploadModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowUploadModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowUploadModal(false)}
          >
            <View style={styles.uploadModalCard}>
              <View style={styles.uploadModalHeader}>
                <View style={styles.uploadModalIcon}>
                  <MaterialCommunityIcons name="camera-document" size={26} color={Colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.uploadModalTitle}>Upload Prescription</Text>
                  <Text style={styles.uploadModalSubtitle}>Share your doctor's Rx sheet or tablet photo</Text>
                </View>
                <TouchableOpacity onPress={() => setShowUploadModal(false)} style={styles.closeUploadBtn}>
                  <Ionicons name="close" size={20} color={Colors.secondary} />
                </TouchableOpacity>
              </View>

              {/* Action Buttons */}
              <View style={styles.uploadActionsRow}>
                <TouchableOpacity
                  style={styles.uploadActionItem}
                  onPress={handlePickCamera}
                  activeOpacity={0.8}
                >
                  <View style={[styles.actionIconCircle, { backgroundColor: Colors.primary }]}>
                    <Ionicons name="camera" size={22} color={Colors.white} />
                  </View>
                  <Text style={styles.actionItemText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.uploadActionItem}
                  onPress={handlePickGallery}
                  activeOpacity={0.8}
                >
                  <View style={[styles.actionIconCircle, { backgroundColor: Colors.accentLight }]}>
                    <Ionicons name="images" size={22} color={Colors.primary} />
                  </View>
                  <Text style={styles.actionItemText}>Gallery / File</Text>
                </TouchableOpacity>
              </View>

              {/* Sample Prescriptions */}
              <View style={styles.samplesSection}>
                <Text style={styles.samplesHeading}>Or attach a sample prescription:</Text>
                <View style={styles.sampleCardsCol}>
                  {SAMPLE_PRESCRIPTIONS.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={styles.sampleCardItem}
                      onPress={() => handleSelectSample(s)}
                      activeOpacity={0.7}
                    >
                      <Image source={{ uri: s.uri }} style={styles.sampleThumb} />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.sampleCardTitle}>{s.title}</Text>
                        <Text style={styles.sampleCardNote} numberOfLines={1}>{s.note}</Text>
                      </View>
                      <View style={styles.sampleAddBadge}>
                        <Ionicons name="add" size={16} color={Colors.primary} />
                        <Text style={styles.sampleAddText}>Attach</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Full-Screen Image Viewer Modal */}
        <Modal
          visible={!!previewImageUri}
          transparent
          animationType="fade"
          onRequestClose={() => setPreviewImageUri(null)}
        >
          <View style={styles.imageViewerOverlay}>
            <SafeAreaView style={styles.imageViewerSafe} edges={['top', 'bottom']}>
              <View style={styles.imageViewerHeader}>
                <Text style={styles.imageViewerTitle}>Prescription Sheet</Text>
                <TouchableOpacity
                  onPress={() => setPreviewImageUri(null)}
                  style={styles.imageViewerCloseBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color={Colors.white} />
                </TouchableOpacity>
              </View>

              <View style={styles.imageViewerBody}>
                {previewImageUri && (
                  <Image
                    source={{ uri: previewImageUri }}
                    style={styles.imageViewerImg}
                    resizeMode="contain"
                  />
                )}
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  docName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  docSpec: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  chipsRow: {
    paddingHorizontal: 16,
    gap: 6,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  uploadChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 11,
    color: Colors.textDark,
    fontWeight: '600',
  },
  uploadChipText: {
    color: Colors.white,
    fontWeight: '700',
  },
  msgStream: {
    padding: 16,
    paddingBottom: 20,
  },
  bubbleWrap: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  bubbleWrapUser: {
    justifyContent: 'flex-end',
  },
  bubbleWrapDoc: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    padding: 12,
    borderRadius: 16,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleDoc: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rxCardInBubble: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rxImageInBubble: {
    width: '100%',
    height: 140,
    backgroundColor: Colors.bgLight,
  },
  rxCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#F8FAFC',
  },
  rxTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rxTagText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#16A34A',
  },
  msgText: {
    fontSize: 13,
    lineHeight: 18,
  },
  msgTextUser: {
    color: Colors.white,
  },
  msgTextDoc: {
    color: Colors.textDark,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeTextUser: {
    color: 'rgba(255,255,255,0.7)',
  },
  timeTextDoc: {
    color: Colors.secondary,
  },
  typingWrap: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  typingText: {
    fontSize: 11,
    color: Colors.primary,
    fontStyle: 'italic',
  },
  attachedPreviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  attachedThumb: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: Colors.bgLight,
  },
  attachedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attachedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  attachedFileName: {
    fontSize: 12,
    color: Colors.textDark,
    marginTop: 2,
  },
  removeAttachedBtn: {
    padding: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: 42,
    backgroundColor: Colors.bgLight,
    borderRadius: 21,
    paddingHorizontal: 16,
    fontSize: 13,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  uploadModalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
  },
  uploadModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadModalIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
  },
  uploadModalSubtitle: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
  },
  closeUploadBtn: {
    padding: 6,
  },
  uploadActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  uploadActionItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgLight,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionItemText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
  },
  samplesSection: {
    marginTop: 4,
  },
  samplesHeading: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: 10,
  },
  sampleCardsCol: {
    gap: 8,
  },
  sampleCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sampleThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#CBD5E1',
  },
  sampleCardTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.textDark,
  },
  sampleCardNote: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 2,
  },
  sampleAddBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 2,
  },
  sampleAddText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageViewerSafe: {
    flex: 1,
  },
  imageViewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  imageViewerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  imageViewerCloseBtn: {
    padding: 6,
  },
  imageViewerBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  imageViewerImg: {
    width: '100%',
    height: '100%',
  },
});

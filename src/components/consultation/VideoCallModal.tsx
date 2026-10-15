import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useCallTimer, resetGlobalCallTimer } from '../../hooks/useCallTimer';
import AppStatusBar from '../common/AppStatusBar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type VideoAudioDevice = 'speaker' | 'bluetooth' | 'earpiece';

export interface VideoCallModalProps {
  visible: boolean;
  doctor: any;
  onEndCall?: () => void;
  onClose?: () => void;
  onSwitchToAudio?: () => void;
  onMinimize?: () => void;
}

interface InCallMessage {
  id: string;
  sender: 'doctor' | 'user';
  text: string;
  time: string;
}

export default function VideoCallModal({
  visible,
  doctor,
  onEndCall,
  onClose,
  onSwitchToAudio,
  onMinimize,
}: VideoCallModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [audioDevice, setAudioDevice] = useState<VideoAudioDevice>('speaker');
  const [showDevicePicker, setShowDevicePicker] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // In-call messaging state
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<InCallMessage[]>([
    {
      id: 'msg_1',
      sender: 'doctor',
      text: `Hello! You can type notes, symptoms, or medication names here during our call.`,
      time: 'Just now',
    },
  ]);

  const insets = useSafeAreaInsets();
  const doctorKey = doctor?.id || doctor?.name || 'doctor';
  const { formattedTime } = useCallTimer(visible && !!doctor, doctorKey);

  if (!doctor) return null;

  const handleEnd = () => {
    resetGlobalCallTimer();
    if (onEndCall) onEndCall();
    else if (onClose) onClose();
  };

  const handleSwitchToAudio = () => {
    if (onSwitchToAudio) {
      onSwitchToAudio();
    }
  };

  const handleMinimize = () => {
    if (onMinimize) {
      onMinimize();
    } else {
      handleEnd();
    }
  };

  const handleSelectAudioDevice = (device: VideoAudioDevice) => {
    setAudioDevice(device);
    setShowDevicePicker(false);
    const label =
      device === 'bluetooth'
        ? 'Connected to Bluetooth Headset 🎧'
        : device === 'earpiece'
        ? 'Switched to Phone Earpiece 📱'
        : 'Switched to Loudspeaker 🔊';
    setToastMessage(label);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const getAudioDeviceIcon = () => {
    switch (audioDevice) {
      case 'bluetooth':
        return 'headset';
      case 'earpiece':
        return 'phone-portrait-outline';
      case 'speaker':
      default:
        return 'volume-high';
    }
  };

  const getAudioDeviceLabel = () => {
    switch (audioDevice) {
      case 'bluetooth':
        return 'Bluetooth';
      case 'earpiece':
        return 'Earpiece';
      case 'speaker':
      default:
        return 'Speaker';
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || chatInput).trim();
    if (!text) return;

    const newMsg: InCallMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text,
      time: 'Just now',
    };
    setMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    // Doctor auto acknowledgment simulation
    setTimeout(() => {
      const docReply: InCallMessage = {
        id: 'reply_' + Date.now(),
        sender: 'doctor',
        text: `Noted: "${text.length > 30 ? text.substring(0, 30) + '...' : text}". Let's discuss this right now in our call.`,
        time: 'Just now',
      };
      setMessages((prev) => [...prev, docReply]);
    }, 1200);
  };

  const imageSource =
    typeof doctor.image === 'number'
      ? doctor.image
      : doctor.image?.uri
      ? doctor.image
      : doctor.avatar
      ? typeof doctor.avatar === 'number'
        ? doctor.avatar
        : { uri: doctor.avatar }
      : { uri: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300' };

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent onRequestClose={handleEnd}>
      <View style={styles.container}>
        <AppStatusBar style="light" forceApply restoreOnUnmount="dark" />

        {/* Full Screen Doctor Video Feed */}
        <View style={StyleSheet.absoluteFill}>
          <Image source={imageSource} style={styles.fullVideoFeed} resizeMode="cover" />
          {/* Top dark gradient overlay */}
          <View style={[styles.topGradient, { paddingTop: insets.top + 8 }]} />
          {/* Bottom dark gradient overlay */}
          <View style={styles.bottomGradient} />
        </View>

        {/* Top Bar with Camera Flip */}
        <View style={[styles.topBar, { top: insets.top + 6 }]}>
          <TouchableOpacity
            style={styles.topIconBtn}
            onPress={handleMinimize}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-down" size={28} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.topRightBtns}>
            {/* Flip Camera */}
            <TouchableOpacity
              style={styles.topIconBtn}
              onPress={() => setIsFrontCamera(!isFrontCamera)}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="camera-reverse-outline" size={23} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Toast Notification */}
        {toastMessage && (
          <View style={[styles.toastContainer, { top: insets.top + 54 }]}>
            <View style={styles.toastCard}>
              <Ionicons name={getAudioDeviceIcon()} size={15} color={Colors.primary} />
              <Text style={styles.toastText}>{toastMessage}</Text>
            </View>
          </View>
        )}

        {/* Doctor Info & Duration Badge */}
        <View style={[styles.doctorOverlayInfo, { top: insets.top + 54 }]}>
          <Text style={styles.docName} numberOfLines={1}>
            {doctor.name}
          </Text>
          <Text style={styles.docSpec}>
            {doctor.specialization || 'Consultant'}
          </Text>

          <View style={styles.timerBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.timerText}>{formattedTime}</Text>
          </View>
        </View>

        {/* Floating Self PiP (Picture-in-Picture) */}
        <View style={[styles.pipContainer, { top: insets.top + 50 }]}>
          {isVideoOff ? (
            <View style={styles.pipCameraOff}>
              <Ionicons name="videocam-off" size={24} color={Colors.secondary} />
              <Text style={styles.pipOffText}>Off</Text>
            </View>
          ) : (
            <View style={styles.pipCameraOn}>
              <View style={styles.pipPlaceholder}>
                <Ionicons name="person" size={26} color={Colors.primary} />
                <Text style={styles.pipLabel}>You</Text>
              </View>
              {/* Camera Indicator */}
              <View style={styles.pipFlipIndicator}>
                <Ionicons
                  name={isFrontCamera ? 'person-circle-outline' : 'camera-outline'}
                  size={12}
                  color={Colors.primary}
                />
              </View>
            </View>
          )}
        </View>

        {/* Floating Bottom Video Dock with Text Under Each Icon */}
        <View style={[styles.bottomDockContainer, { paddingBottom: Math.max(insets.bottom + 16, 26) }]}>
          <View style={styles.controlsDock}>
            {/* 1. Switch to Audio Call */}
            {onSwitchToAudio && (
              <View style={styles.actionCol}>
                <TouchableOpacity
                  style={styles.dockBtn}
                  onPress={handleSwitchToAudio}
                  activeOpacity={0.75}
                >
                  <Ionicons name="call-outline" size={21} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.btnLabel}>Audio</Text>
              </View>
            )}

            {/* 2. Video On / Off */}
            <View style={styles.actionCol}>
              <TouchableOpacity
                style={[styles.dockBtn, isVideoOff && styles.dockBtnActive]}
                onPress={() => setIsVideoOff(!isVideoOff)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={isVideoOff ? 'videocam-off' : 'videocam'}
                  size={21}
                  color={isVideoOff ? Colors.error : Colors.white}
                />
              </TouchableOpacity>
              <Text style={styles.btnLabel}>{isVideoOff ? 'Cam Off' : 'Video'}</Text>
            </View>

            {/* 3. Mic Mute / Unmute */}
            <View style={styles.actionCol}>
              <TouchableOpacity
                style={[styles.dockBtn, isMuted && styles.dockBtnActive]}
                onPress={() => setIsMuted(!isMuted)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={isMuted ? 'mic-off' : 'mic'}
                  size={21}
                  color={isMuted ? Colors.error : Colors.white}
                />
              </TouchableOpacity>
              <Text style={styles.btnLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
            </View>

            {/* 4. In-Call Chat / Message Option */}
            <View style={styles.actionCol}>
              <TouchableOpacity
                style={[styles.dockBtn, showChatModal && styles.dockBtnActiveChat]}
                onPress={() => setShowChatModal(true)}
                activeOpacity={0.75}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={21} color={Colors.white} />
                {messages.length > 1 && <View style={styles.dockUnreadDot} />}
              </TouchableOpacity>
              <Text style={styles.btnLabel}>Chat</Text>
            </View>

            {/* 5. Audio Routing (Speaker / Bluetooth / Earpiece) */}
            <View style={styles.actionCol}>
              <TouchableOpacity
                style={[
                  styles.dockBtn,
                  audioDevice === 'bluetooth' && styles.dockBtnActiveBluetooth,
                ]}
                onPress={() => setShowDevicePicker(true)}
                activeOpacity={0.75}
              >
                <Ionicons name={getAudioDeviceIcon()} size={20} color={Colors.white} />
              </TouchableOpacity>
              <Text style={styles.btnLabel}>{getAudioDeviceLabel()}</Text>
            </View>

            {/* 6. End Call Button */}
            <View style={styles.actionCol}>
              <TouchableOpacity
                style={styles.endCallBtn}
                onPress={handleEnd}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="call"
                  size={23}
                  color={Colors.white}
                  style={{ transform: [{ rotate: '135deg' }] }}
                />
              </TouchableOpacity>
              <Text style={[styles.btnLabel, { color: '#FCA5A5' }]}>End</Text>
            </View>
          </View>
        </View>

        {/* Audio Output Device Selector Modal */}
        <Modal
          visible={showDevicePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDevicePicker(false)}
        >
          <TouchableOpacity
            style={styles.pickerOverlay}
            activeOpacity={1}
            onPress={() => setShowDevicePicker(false)}
          >
            <View style={styles.pickerSheet}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Audio Output</Text>
                <TouchableOpacity
                  onPress={() => setShowDevicePicker(false)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={22} color={Colors.secondary} />
                </TouchableOpacity>
              </View>

              {/* 1. Loudspeaker */}
              <TouchableOpacity
                style={[
                  styles.deviceOption,
                  audioDevice === 'speaker' && styles.deviceOptionSelected,
                ]}
                onPress={() => handleSelectAudioDevice('speaker')}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.deviceIconBg,
                    audioDevice === 'speaker' && styles.deviceIconBgSelected,
                  ]}
                >
                  <Ionicons
                    name="volume-high"
                    size={20}
                    color={audioDevice === 'speaker' ? Colors.primary : Colors.textDark}
                  />
                </View>
                <View style={styles.deviceTextCol}>
                  <Text
                    style={[
                      styles.deviceTitle,
                      audioDevice === 'speaker' && styles.deviceTitleSelected,
                    ]}
                  >
                    Speaker (Loudspeaker)
                  </Text>
                  <Text style={styles.deviceSubtitle}>Built-in phone speaker</Text>
                </View>
                {audioDevice === 'speaker' && (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>

              {/* 2. Bluetooth & Headphones */}
              <TouchableOpacity
                style={[
                  styles.deviceOption,
                  audioDevice === 'bluetooth' && styles.deviceOptionSelected,
                ]}
                onPress={() => handleSelectAudioDevice('bluetooth')}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.deviceIconBg,
                    audioDevice === 'bluetooth' && styles.deviceIconBgSelected,
                  ]}
                >
                  <Ionicons
                    name="headset"
                    size={20}
                    color={audioDevice === 'bluetooth' ? Colors.primary : Colors.textDark}
                  />
                </View>
                <View style={styles.deviceTextCol}>
                  <Text
                    style={[
                      styles.deviceTitle,
                      audioDevice === 'bluetooth' && styles.deviceTitleSelected,
                    ]}
                  >
                    Headphones & Bluetooth
                  </Text>
                  <Text style={styles.deviceSubtitle}>
                    Wireless Bluetooth or wired headset
                  </Text>
                </View>
                {audioDevice === 'bluetooth' && (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>

              {/* 3. Phone Earpiece */}
              <TouchableOpacity
                style={[
                  styles.deviceOption,
                  audioDevice === 'earpiece' && styles.deviceOptionSelected,
                ]}
                onPress={() => handleSelectAudioDevice('earpiece')}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.deviceIconBg,
                    audioDevice === 'earpiece' && styles.deviceIconBgSelected,
                  ]}
                >
                  <Ionicons
                    name="phone-portrait-outline"
                    size={20}
                    color={audioDevice === 'earpiece' ? Colors.primary : Colors.textDark}
                  />
                </View>
                <View style={styles.deviceTextCol}>
                  <Text
                    style={[
                      styles.deviceTitle,
                      audioDevice === 'earpiece' && styles.deviceTitleSelected,
                    ]}
                  >
                    Phone Earpiece
                  </Text>
                  <Text style={styles.deviceSubtitle}>Internal handset receiver</Text>
                </View>
                {audioDevice === 'earpiece' && (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* In-Call Messaging Modal Bottom Sheet */}
        <Modal
          visible={showChatModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowChatModal(false)}
        >
          <KeyboardAvoidingView
            style={styles.chatOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.chatSheet}>
              {/* Chat Header */}
              <View style={styles.chatHeader}>
                <View style={styles.chatHeaderDocRow}>
                  <Image source={imageSource} style={styles.chatHeaderAvatar} />
                  <View>
                    <Text style={styles.chatHeaderTitle}>{doctor.name}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.chatCloseBtn}
                  onPress={() => setShowChatModal(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={22} color={Colors.textDark} />
                </TouchableOpacity>
              </View>

              {/* Chat Messages List */}
              <ScrollView
                style={styles.chatMessagesScroll}
                contentContainerStyle={styles.chatMessagesContent}
                showsVerticalScrollIndicator={false}
              >
                {messages.map((m) => {
                  const isUser = m.sender === 'user';
                  return (
                    <View
                      key={m.id}
                      style={[
                        styles.msgBubbleRow,
                        isUser ? styles.msgBubbleRowUser : styles.msgBubbleRowDoc,
                      ]}
                    >
                      <View
                        style={[
                          styles.msgBubble,
                          isUser ? styles.msgBubbleUser : styles.msgBubbleDoc,
                        ]}
                      >
                        <Text
                          style={[
                            styles.msgText,
                            isUser ? styles.msgTextUser : styles.msgTextDoc,
                          ]}
                        >
                          {m.text}
                        </Text>
                        <View style={styles.msgFooter}>
                          <Text
                            style={[
                              styles.msgTime,
                              isUser ? styles.msgTimeUser : styles.msgTimeDoc,
                            ]}
                          >
                            {m.time}
                          </Text>
                          {isUser && (
                            <Ionicons name="checkmark-done" size={13} color={Colors.white} />
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>

              {/* Chat Input Bar */}
              <View style={styles.chatInputBar}>
                <TextInput
                  style={styles.chatTextInput}
                  placeholder="Type a message to doctor..."
                  placeholderTextColor={Colors.inputPlaceholder}
                  value={chatInput}
                  onChangeText={setChatInput}
                  multiline={false}
                  onSubmitEditing={() => handleSendMessage()}
                />
                <TouchableOpacity
                  style={[
                    styles.chatSendBtn,
                    !chatInput.trim() && styles.chatSendBtnDisabled,
                  ]}
                  onPress={() => handleSendMessage()}
                  disabled={!chatInput.trim()}
                  activeOpacity={0.8}
                >
                  <Ionicons name="send" size={17} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.textSlateDark,
  },
  fullVideoFeed: {
    width: '100%',
    height: '100%',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 145,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 175,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  topBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  topRightBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topIconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: Colors.modalOverlayDark,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  dockUnreadDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.primary,
  },
  toastContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 4,
    shadowColor: Colors.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  toastText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
  },
  doctorOverlayInfo: {
    position: 'absolute',
    left: 20,
    zIndex: 9,
    maxWidth: SCREEN_WIDTH * 0.62,
  },
  docName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  docSpec: {
    fontSize: 13,
    color: Colors.borderMedium,
    marginTop: 2,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.modalOverlayDark,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.successGreen,
  },
  timerText: {
    fontSize: 12.5,
    color: Colors.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pipContainer: {
    position: 'absolute',
    right: 18,
    width: 96,
    height: 136,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    elevation: 8,
    shadowColor: Colors.textDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    zIndex: 10,
  },
  pipCameraOn: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 4,
  },
  pipFlipIndicator: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: Colors.accentLight,
    borderRadius: 8,
    padding: 3,
  },
  pipCameraOff: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgLight,
  },
  pipOffText: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '600',
    marginTop: 4,
  },
  bottomDockContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  controlsDock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 36,
    elevation: 8,
    shadowColor: Colors.textDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  actionCol: {
    alignItems: 'center',
    gap: 4,
  },
  dockBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.whiteOverlay20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockBtnActive: {
    backgroundColor: Colors.white,
  },
  dockBtnActiveChat: {
    backgroundColor: Colors.primary,
  },
  dockBtnActiveBluetooth: {
    backgroundColor: Colors.primary,
  },
  btnLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.white,
  },
  endCallBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  // Picker sheet styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pickerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textDark,
  },
  deviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  deviceOptionSelected: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.primary,
  },
  deviceIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceIconBgSelected: {
    backgroundColor: Colors.white,
  },
  deviceTextCol: {
    flex: 1,
  },
  deviceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  deviceTitleSelected: {
    color: Colors.primary,
  },
  deviceSubtitle: {
    fontSize: 11.5,
    color: Colors.secondary,
    marginTop: 2,
  },
  // In-Call Chat Modal styles
  chatOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  chatSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    minHeight: '52%',
    paddingBottom: 16,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chatHeaderDocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chatHeaderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  chatHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
  },
  chatHeaderSubtitle: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  chatCloseBtn: {
    padding: 6,
    backgroundColor: Colors.bgLight,
    borderRadius: 16,
  },
  chatMessagesScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatMessagesContent: {
    paddingVertical: 14,
    gap: 10,
  },
  msgBubbleRow: {
    flexDirection: 'row',
    width: '100%',
  },
  msgBubbleRowUser: {
    justifyContent: 'flex-end',
  },
  msgBubbleRowDoc: {
    justifyContent: 'flex-start',
  },
  msgBubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  msgBubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  msgBubbleDoc: {
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  msgText: {
    fontSize: 13.5,
    lineHeight: 19,
  },
  msgTextUser: {
    color: Colors.white,
    fontWeight: '500',
  },
  msgTextDoc: {
    color: Colors.textDark,
    fontWeight: '500',
  },
  msgFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  msgTime: {
    fontSize: 10,
  },
  msgTimeUser: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  msgTimeDoc: {
    color: Colors.secondary,
  },
  quickChipsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: Colors.primary,
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 8,
    gap: 10,
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13.5,
    color: Colors.textDark,
  },
  chatSendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatSendBtnDisabled: {
    backgroundColor: Colors.primaryDisabled,
  },
});

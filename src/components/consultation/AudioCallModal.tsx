import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useCallTimer, resetGlobalCallTimer } from '../../hooks/useCallTimer';
import AppStatusBar from '../common/AppStatusBar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type AudioOutputDevice = 'speaker' | 'bluetooth' | 'earpiece';

export interface AudioCallModalProps {
  visible: boolean;
  doctor: any;
  onEndCall?: () => void;
  onClose?: () => void;
  onSwitchToVideo?: () => void;
  onMinimize?: () => void;
}

export default function AudioCallModal({
  visible,
  doctor,
  onEndCall,
  onClose,
  onSwitchToVideo,
  onMinimize,
}: AudioCallModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [audioDevice, setAudioDevice] = useState<AudioOutputDevice>('speaker');
  const [showDevicePicker, setShowDevicePicker] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const doctorKey = doctor?.id || doctor?.name || 'doctor';
  const { formattedTime } = useCallTimer(visible && !!doctor, doctorKey);

  // Soft medical brand ripple pulse animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible && !!doctor) {
      const loopAnim = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.25,
              duration: 1800,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1800,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(pulseOpacity, {
              toValue: 0.1,
              duration: 1800,
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacity, {
              toValue: 0.5,
              duration: 1800,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      loopAnim.start();

      return () => {
        loopAnim.stop();
        pulseAnim.setValue(1);
        pulseOpacity.setValue(0.5);
      };
    }
  }, [visible, doctor]);

  if (!doctor) return null;

  const handleEnd = () => {
    resetGlobalCallTimer();
    if (onEndCall) onEndCall();
    else if (onClose) onClose();
  };

  const handleSwitchToVideo = () => {
    // When switching, do not reset global timer so video modal continues seamlessly!
    if (onSwitchToVideo) onSwitchToVideo();
  };

  const handleMinimize = () => {
    if (onMinimize) {
      onMinimize();
    } else {
      handleEnd();
    }
  };

  const handleSelectAudioDevice = (device: AudioOutputDevice) => {
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
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={handleEnd}>
      <View style={styles.background}>
        <AppStatusBar style="dark" forceApply />
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          {/* Top Header */}
          <View style={styles.topHeader}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={handleMinimize}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="chevron-down" size={28} color={Colors.textDark} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerIconButton}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="person-add-outline" size={20} color={Colors.textDark} />
            </TouchableOpacity>
          </View>

          {/* Audio Route Toast Notification */}
          {toastMessage && (
            <View style={styles.toastContainer}>
              <View style={styles.toastCard}>
                <Ionicons
                  name={getAudioDeviceIcon()}
                  size={15}
                  color={Colors.primary}
                />
                <Text style={styles.toastText}>{toastMessage}</Text>
              </View>
            </View>
          )}

          {/* Caller Details Header */}
          <View style={styles.callerHeader}>
            <Text style={styles.docName} numberOfLines={1}>
              {doctor.name}
            </Text>
            <Text style={styles.docSpec}>
              {doctor.specialization || 'General Physician'}
            </Text>
            <View style={styles.statusRow}>
              <View style={styles.liveDot} />
              <Text style={styles.timerText}>{formattedTime}</Text>
            </View>
          </View>

          {/* Center Avatar with Pulse */}
          <View style={styles.centerSection}>
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: pulseOpacity,
                },
              ]}
            />
            <View style={styles.avatarBorderRing}>
              <Image source={imageSource} style={styles.avatar} />
            </View>
          </View>

          {/* WhatsApp Style Bottom Controls Dock in Original Medical Light Theme */}
          <View style={styles.bottomDockContainer}>
            <View style={styles.controlsDock}>
              {/* Audio Route Toggle (Speaker / Bluetooth / Earpiece) */}
              <View style={styles.actionCol}>
                <TouchableOpacity
                  style={[
                    styles.dockBtn,
                    audioDevice !== 'earpiece' && styles.dockBtnActiveSpeaker,
                  ]}
                  onPress={() => setShowDevicePicker(true)}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={getAudioDeviceIcon()}
                    size={24}
                    color={audioDevice !== 'earpiece' ? Colors.white : Colors.textDark}
                  />
                </TouchableOpacity>
                <Text style={styles.btnLabel}>{getAudioDeviceLabel()}</Text>
              </View>

              {/* Video Call Switch */}
              {onSwitchToVideo && (
                <View style={styles.actionCol}>
                  <TouchableOpacity
                    style={styles.dockBtn}
                    onPress={handleSwitchToVideo}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="videocam" size={24} color={Colors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.btnLabel}>Video</Text>
                </View>
              )}

              {/* Mute Toggle */}
              <View style={styles.actionCol}>
                <TouchableOpacity
                  style={[styles.dockBtn, isMuted && styles.dockBtnActiveMute]}
                  onPress={() => setIsMuted(!isMuted)}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={isMuted ? 'mic-off' : 'mic'}
                    size={24}
                    color={isMuted ? Colors.error : Colors.textDark}
                  />
                </TouchableOpacity>
                <Text style={styles.btnLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
              </View>

              {/* End Call Button */}
              <View style={styles.actionCol}>
                <TouchableOpacity
                  style={styles.endCallBtn}
                  onPress={handleEnd}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="call"
                    size={26}
                    color={Colors.white}
                    style={{ transform: [{ rotate: '135deg' }] }}
                  />
                </TouchableOpacity>
                <Text style={[styles.btnLabel, { color: Colors.error }]}>End</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>

        {/* Audio Device Selector Bottom Sheet Modal */}
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: Colors.bgLight,
  },
  toastContainer: {
    position: 'absolute',
    top: 54,
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
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 4,
    shadowColor: Colors.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  toastText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
  },
  callerHeader: {
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 24,
  },
  docName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textDark,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  docSpec: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  timerText: {
    fontSize: 16,
    color: Colors.secondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 175,
    height: 175,
    borderRadius: 87.5,
    backgroundColor: 'rgba(19, 138, 114, 0.16)',
  },
  avatarBorderRing: {
    width: 144,
    height: 144,
    borderRadius: 72,
    padding: 3,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  avatar: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: Colors.bgLight,
  },
  bottomDockContainer: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  controlsDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.bgLight,
    borderRadius: 36,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 3,
    shadowColor: Colors.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  actionCol: {
    alignItems: 'center',
    gap: 6,
  },
  dockBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dockBtnActiveSpeaker: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dockBtnActiveMute: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.error,
  },
  btnLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
  },
  endCallBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  // Picker sheet styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
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
});

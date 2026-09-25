import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export interface VideoCallModalProps {
  visible: boolean;
  doctor: any;
  onEndCall?: () => void;
  onClose?: () => void;
  onSwitchToAudio?: () => void;
}

export default function VideoCallModal({ visible, doctor, onEndCall, onClose, onSwitchToAudio }: VideoCallModalProps) {
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    let timer: any = null;
    if (visible && doctor) {
      setSeconds(0);
      timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [visible, doctor]);

  if (!doctor) return null;

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const remainder = s % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleEnd = () => {
    if (onEndCall) onEndCall();
    else if (onClose) onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={handleEnd}>
      <View style={styles.container}>
        {/* Doctor Main Screen */}
        <View style={styles.mainVideo}>
          <Image source={doctor.image || doctor.avatar} style={styles.mainImage} resizeMode="cover" />
          <View style={styles.videoOverlay}>
            <View style={styles.topInfo}>
              <Text style={styles.docName}>{doctor.name}</Text>
              <Text style={styles.docSpec}>{doctor.specialization}</Text>
              <View style={styles.timerBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.timerText}>{formatTimer(seconds)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* User PiP Camera */}
        <View style={styles.pipView}>
          <Ionicons name="person" size={24} color={Colors.primary} />
          <Text style={styles.pipText}>You</Text>
        </View>

        {/* Call Controls Bar */}
        <View style={styles.controlsBar}>
          <TouchableOpacity
            style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={22} color={isMuted ? Colors.error : Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, isVideoOff && styles.controlBtnActive]}
            onPress={() => setIsVideoOff(!isVideoOff)}
          >
            <Ionicons name={isVideoOff ? 'videocam-off' : 'videocam'} size={22} color={isVideoOff ? Colors.error : Colors.white} />
          </TouchableOpacity>

          {onSwitchToAudio && (
            <TouchableOpacity style={styles.controlBtn} onPress={onSwitchToAudio}>
              <Ionicons name="call" size={22} color={Colors.white} />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.endCallBtn} onPress={handleEnd}>
            <Ionicons name="call" size={26} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  mainVideo: {
    flex: 1,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  videoOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
  },
  topInfo: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  docName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.white,
  },
  docSpec: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  timerText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  pipView: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 90,
    height: 120,
    borderRadius: 14,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 4,
  },
  controlsBar: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  controlBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnActive: {
    backgroundColor: Colors.white,
  },
  endCallBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

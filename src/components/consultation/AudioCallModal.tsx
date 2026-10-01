import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useCallTimer } from '../../hooks/useCallTimer';

export interface AudioCallModalProps {
  visible: boolean;
  doctor: any;
  onEndCall?: () => void;
  onClose?: () => void;
  onSwitchToVideo?: () => void;
}

export default function AudioCallModal({ visible, doctor, onEndCall, onClose, onSwitchToVideo }: AudioCallModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const { formattedTime } = useCallTimer(visible && !!doctor);

  if (!doctor) return null;

  const handleEnd = () => {
    if (onEndCall) onEndCall();
    else if (onClose) onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleEnd}>
      <View style={styles.container}>
        <View style={styles.doctorSection}>
          <Image source={doctor.image || doctor.avatar} style={styles.avatar} />
          <Text style={styles.docName}>{doctor.name}</Text>
          <Text style={styles.docSpec}>{doctor.specialization}</Text>
          <Text style={styles.timer}>{formattedTime}</Text>
        </View>

        {/* Call Controls */}
        <View style={styles.controlsBar}>
          <TouchableOpacity
            style={[styles.btn, isMuted && styles.btnActive]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={24} color={isMuted ? Colors.error : Colors.textDark} />
            <Text style={styles.btnLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.endBtn} onPress={handleEnd}>
            <Ionicons name="call" size={28} color={Colors.white} />
          </TouchableOpacity>

          {onSwitchToVideo && (
            <TouchableOpacity style={styles.btn} onPress={onSwitchToVideo}>
              <Ionicons name="videocam" size={24} color={Colors.primary} />
              <Text style={styles.btnLabel}>Video</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.btn, isSpeaker && styles.btnActive]}
            onPress={() => setIsSpeaker(!isSpeaker)}
          >
            <Ionicons name={isSpeaker ? 'volume-high' : 'volume-mute'} size={24} color={isSpeaker ? Colors.primary : Colors.textDark} />
            <Text style={styles.btnLabel}>{isSpeaker ? 'Speaker' : 'Earpiece'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  doctorSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  docName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
  },
  docSpec: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  timer: {
    fontSize: 16,
    color: Colors.secondary,
    fontWeight: '700',
    marginTop: 12,
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  btn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnActive: {
    backgroundColor: Colors.accentLight,
  },
  btnLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary,
    marginTop: 2,
  },
  endBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

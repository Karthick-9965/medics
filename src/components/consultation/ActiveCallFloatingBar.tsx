import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useCallTimer } from '../../hooks/useCallTimer';

export interface ActiveCallFloatingBarProps {
  call: {
    type: 'audio' | 'video';
    doctor: any;
  };
  isMuted?: boolean;
  onToggleMute?: () => void;
  onExpand: () => void;
  onEnd: () => void;
}

export default function ActiveCallFloatingBar({
  call,
  isMuted = false,
  onToggleMute,
  onExpand,
  onEnd,
}: ActiveCallFloatingBarProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const doctor = call.doctor || {};
  const doctorKey = doctor?.id || doctor?.name || 'doctor';
  const { formattedTime } = useCallTimer(true, doctorKey);

  useEffect(() => {
    // Slide down entrance animation
    Animated.spring(slideAnim, {
      toValue: 0,
      damping: 15,
      stiffness: 150,
      useNativeDriver: true,
    }).start();

    // Pulse animation for live dot
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();

    return () => {
      loop.stop();
    };
  }, []);

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
    <Animated.View
      style={[
        styles.floatingContainer,
        {
          top: Math.max(insets.top + 6, Platform.OS === 'ios' ? 44 : 20),
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.floatingCard}
        onPress={onExpand}
        activeOpacity={0.92}
      >
        {/* Doctor Avatar with Call Type Badge */}
        <View style={styles.avatarWrapper}>
          <Image source={imageSource} style={styles.avatar} />
          <View
            style={[
              styles.callTypeBadge,
              call.type === 'video' ? styles.badgeVideo : styles.badgeAudio,
            ]}
          >
            <Ionicons
              name={call.type === 'video' ? 'videocam' : 'call'}
              size={10}
              color={Colors.white}
            />
          </View>
        </View>

        {/* Doctor Info & Ongoing Timer */}
        <View style={styles.infoCol}>
          <Text style={styles.doctorName} numberOfLines={1}>
            {doctor.name || 'Doctor'}
          </Text>
          <View style={styles.statusRow}>
            <Animated.View
              style={[
                styles.livePulseDot,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <Text style={styles.timerText}>{formattedTime}</Text>
            <Text style={styles.tapToReturn}>• Tap to return</Text>
          </View>
        </View>

        {/* Actions Group (Mute + End Call + Expand) */}
        <View style={styles.actionsGroup}>
          {onToggleMute && (
            <TouchableOpacity
              style={[styles.actionBtn, isMuted && styles.actionBtnMuted]}
              onPress={onToggleMute}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.75}
            >
              <Ionicons
                name={isMuted ? 'mic-off' : 'mic'}
                size={16}
                color={isMuted ? Colors.error : Colors.white}
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.endBtn}
            onPress={onEnd}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="call"
              size={16}
              color={Colors.white}
              style={{ transform: [{ rotate: '135deg' }] }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.expandBtn}
            onPress={onExpand}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons name="expand-outline" size={17} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 9999,
    elevation: 20,
    shadowColor: Colors.textDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  floatingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A', // Sleek dark slate matching modern WhatsApp / FaceTime floating pills
    borderRadius: 24,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 10,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.bgLight,
  },
  callTypeBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#0F172A',
  },
  badgeVideo: {
    backgroundColor: Colors.primary,
  },
  badgeAudio: {
    backgroundColor: '#10B981',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  livePulseDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 3.25,
    backgroundColor: '#10B981',
  },
  timerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  tapToReturn: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnMuted: {
    backgroundColor: Colors.white,
  },
  endBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

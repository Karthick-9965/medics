import React, { useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { AppNotification, sanitizeNotificationText, formatRealtimeNotificationTime } from '../../services/notificationStorage';
import NotificationSwipeActions from './NotificationSwipeActions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ACTIONS_WIDTH = 150;

export interface NotificationTypeMeta {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  label: string;
}

interface SwipeableNotificationCardProps {
  item: AppNotification;
  meta: NotificationTypeMeta;
  onPress: () => void;
  onDelete: (id: string) => void;
}

export default function SwipeableNotificationCard({
  item,
  meta,
  onPress,
  onDelete,
}: SwipeableNotificationCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const undoPressAnim = useRef(new Animated.Value(1)).current;
  const rowHeightAnim = useRef(new Animated.Value(1)).current; // 1 -> 0 on delete collapse
  const isOpenRef = useRef(false);
  const isDeletingRef = useRef(false);
  const isUnread = !item.read;

  const openCard = () => {
    isOpenRef.current = true;
    Animated.spring(translateX, {
      toValue: -ACTIONS_WIDTH,
      friction: 7,
      tension: 50,
      useNativeDriver: true,
    }).start(() => {
      // Energetic spring bounce animation when buttons are revealed
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(pulseAnim, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const closeCard = () => {
    isOpenRef.current = false;
    pulseAnim.setValue(1);
    pressAnim.setValue(1);
    undoPressAnim.setValue(1);
    Animated.spring(translateX, {
      toValue: 0,
      friction: 7,
      tension: 50,
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.88,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleUndoPressIn = () => {
    Animated.spring(undoPressAnim, {
      toValue: 0.88,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleUndoPressOut = () => {
    Animated.spring(undoPressAnim, {
      toValue: 1,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleUndoPress = () => {
    Animated.sequence([
      Animated.timing(undoPressAnim, {
        toValue: 0.82,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(undoPressAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      closeCard();
    });
  };

  const handleDeletePress = () => {
    if (isDeletingRef.current) return;
    isDeletingRef.current = true;

    // 1. Tapping pop animation & slide card out
    Animated.sequence([
      Animated.timing(pressAnim, {
        toValue: 0.82,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(pressAnim, {
        toValue: 1.05,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: -SCREEN_WIDTH,
        duration: 190,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Smooth vertical collapse animation
      Animated.timing(rowHeightAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: false,
      }).start(() => {
        onDelete(item.id);
      });
    });
  };

  const handleCardPress = () => {
    if (isOpenRef.current) {
      closeCard();
    } else {
      onPress();
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (_, gestureState) => {
        const startX = isOpenRef.current ? -ACTIONS_WIDTH : 0;
        const newX = startX + gestureState.dx;
        // Clamp between -ACTIONS_WIDTH - 25 and 0
        const clampedX = Math.min(0, Math.max(-ACTIONS_WIDTH - 25, newX));
        translateX.setValue(clampedX);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isOpenRef.current) {
          if (gestureState.dx > 25) {
            closeCard();
          } else {
            openCard();
          }
        } else {
          if (gestureState.dx < -35) {
            openCard();
          } else {
            closeCard();
          }
        }
      },
      onPanResponderTerminate: () => {
        if (isOpenRef.current) {
          openCard();
        } else {
          closeCard();
        }
      },
    })
  ).current;

  // Smooth row collapse interpolations on deletion
  const rowMaxHeight = rowHeightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });
  const rowMarginBottom = rowHeightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });
  const rowOpacity = rowHeightAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.3, 1],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          maxHeight: rowMaxHeight,
          marginBottom: rowMarginBottom,
          opacity: rowOpacity,
        },
      ]}
    >
      {/* Background Revealed on Swipe Left: Undo & Delete Buttons */}
      <NotificationSwipeActions
        translateX={translateX}
        pulseAnim={pulseAnim}
        undoPressAnim={undoPressAnim}
        pressAnim={pressAnim}
        onUndo={handleUndoPress}
        onUndoPressIn={handleUndoPressIn}
        onUndoPressOut={handleUndoPressOut}
        onDelete={handleDeletePress}
        onDeletePressIn={handlePressIn}
        onDeletePressOut={handlePressOut}
      />

      {/* Swipeable Foreground Notification Card */}
      <Animated.View
        style={[
          styles.card,
          isUnread && styles.cardUnread,
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.cardInner}
          onPress={handleCardPress}
          activeOpacity={0.8}
        >
          {/* Left Type Icon */}
          <View style={[styles.typeIconCircle, { backgroundColor: meta.bg }]}>
            <Ionicons name={meta.icon} size={22} color={meta.color} />
          </View>

          {/* Middle Content */}
          <View style={styles.cardContent}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTypeLabel} numberOfLines={1}>
                {meta.label}
              </Text>
              <Text style={styles.cardTime}>{formatRealtimeNotificationTime(item)}</Text>
            </View>

            <Text
              style={[styles.cardTitle, isUnread && styles.cardTitleUnread]}
              numberOfLines={1}
            >
              {sanitizeNotificationText(item.title)}
            </Text>

            <Text style={styles.cardMessage} numberOfLines={2}>
              {sanitizeNotificationText(item.message)}
            </Text>
          </View>

          {/* Unread indicator dot */}
          {isUnread && (
            <View style={styles.rightIndicatorCol}>
              <View style={styles.unreadDot} />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardUnread: {
    backgroundColor: Colors.tealBg,
    borderColor: Colors.tealLight,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
  },
  typeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    marginRight: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  cardTypeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTime: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 3,
  },
  cardTitleUnread: {
    fontWeight: '800',
    color: Colors.black,
  },
  cardMessage: {
    fontSize: 12.5,
    color: Colors.secondary,
    lineHeight: 18,
  },
  rightIndicatorCol: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
    paddingTop: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
});

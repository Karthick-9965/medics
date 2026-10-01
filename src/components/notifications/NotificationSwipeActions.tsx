import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

const ACTIONS_WIDTH = 150;

export interface NotificationSwipeActionsProps {
  translateX: Animated.Value;
  pulseAnim: Animated.Value;
  undoPressAnim: Animated.Value;
  pressAnim: Animated.Value;
  onUndo: () => void;
  onUndoPressIn: () => void;
  onUndoPressOut: () => void;
  onDelete: () => void;
  onDeletePressIn: () => void;
  onDeletePressOut: () => void;
}

/**
 * Animated background actions (Undo & Delete) revealed on swipe-to-reveal gesture.
 */
export default function NotificationSwipeActions({
  translateX,
  pulseAnim,
  undoPressAnim,
  pressAnim,
  onUndo,
  onUndoPressIn,
  onUndoPressOut,
  onDelete,
  onDeletePressIn,
  onDeletePressOut,
}: NotificationSwipeActionsProps) {
  // Swipe-linked Interpolations
  const btnScale = translateX.interpolate({
    inputRange: [-ACTIONS_WIDTH, -ACTIONS_WIDTH * 0.5, 0],
    outputRange: [1, 0.75, 0.4],
    extrapolate: 'clamp',
  });

  const btnOpacity = translateX.interpolate({
    inputRange: [-ACTIONS_WIDTH, -ACTIONS_WIDTH * 0.3, 0],
    outputRange: [1, 0.45, 0],
    extrapolate: 'clamp',
  });

  const undoTranslateX = translateX.interpolate({
    inputRange: [-ACTIONS_WIDTH, 0],
    outputRange: [0, 16],
    extrapolate: 'clamp',
  });

  const deleteTranslateX = translateX.interpolate({
    inputRange: [-ACTIONS_WIDTH, 0],
    outputRange: [0, 24],
    extrapolate: 'clamp',
  });

  const iconRotate = translateX.interpolate({
    inputRange: [-ACTIONS_WIDTH * 1.2, -ACTIONS_WIDTH, 0],
    outputRange: ['-12deg', '0deg', '25deg'],
    extrapolate: 'clamp',
  });

  const iconScale = translateX.interpolate({
    inputRange: [-ACTIONS_WIDTH, -ACTIONS_WIDTH * 0.5, 0],
    outputRange: [1.1, 0.85, 0.5],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.actionsBackground}>
      {/* Undo Action Button */}
      <Animated.View
        style={[
          styles.actionButtonWrapper,
          {
            opacity: btnOpacity,
            transform: [
              { scale: btnScale },
              { translateX: undoTranslateX },
            ],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.actionButtonInner,
            {
              transform: [
                { scale: pulseAnim },
                { scale: undoPressAnim },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.undoSwipeButton}
            onPress={onUndo}
            onPressIn={onUndoPressIn}
            onPressOut={onUndoPressOut}
            activeOpacity={0.88}
          >
            <View style={styles.iconBox}>
              <Ionicons name="arrow-undo" size={22} color={Colors.white} />
            </View>
            <Text style={styles.actionButtonText}>Undo</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Delete Action Button */}
      <Animated.View
        style={[
          styles.actionButtonWrapper,
          {
            opacity: btnOpacity,
            transform: [
              { scale: btnScale },
              { translateX: deleteTranslateX },
            ],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.actionButtonInner,
            {
              transform: [
                { scale: pulseAnim },
                { scale: pressAnim },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.deleteSwipeButton}
            onPress={onDelete}
            onPressIn={onDeletePressIn}
            onPressOut={onDeletePressOut}
            activeOpacity={0.88}
          >
            <Animated.View
              style={[
                styles.iconBox,
                {
                  transform: [
                    { rotate: iconRotate },
                    { scale: iconScale },
                  ],
                },
              ]}
            >
              <Ionicons name="trash-outline" size={22} color={Colors.white} />
            </Animated.View>
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionsBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: ACTIONS_WIDTH,
    flexDirection: 'row',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  actionButtonWrapper: {
    width: 75,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonInner: {
    width: '100%',
    height: '100%',
  },
  undoSwipeButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.textSlateMedium,
    gap: 4,
  },
  deleteSwipeButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dangerRed,
    gap: 4,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: Colors.dangerRed,
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { AppNotification, formatRealtimeNotificationTime, sanitizeNotificationText } from '../../services/notificationStorage';
import { getNotificationMeta } from '../../utils/notificationMeta';

export interface NotificationDetailModalProps {
  visible: boolean;
  notification: AppNotification | null;
  onClose: () => void;
  onActionPress?: (target: string, conversationId?: string) => void;
}

export default function NotificationDetailModal({
  visible,
  notification,
  onClose,
  onActionPress,
}: NotificationDetailModalProps) {
  if (!notification) return null;

  const meta = getNotificationMeta(notification);

  const getActionLabel = () => {
    const target = notification.actionTarget || notification.type;
    if (target === 'schedule' || target === 'appointment') return 'View Schedule';
    if (target === 'ambulance') return 'Track Ambulance';
    if (target === 'pharmacy' || target === 'order') return 'View Pharmacy Order';
    if (target === 'messages' || target === 'message') return 'Open Conversation';
    return null;
  };

  const actionLabel = getActionLabel();

  const handleAction = () => {
    onClose();
    if (onActionPress && (notification.actionTarget || notification.type)) {
      onActionPress(notification.actionTarget || notification.type, notification.conversationId);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.cardContainer}>
              {/* Header with Icon, Category & Close */}
              <View style={styles.headerRow}>
                <View style={styles.headerLeft}>
                  <View style={[styles.typeIconCircle, { backgroundColor: meta.bg }]}>
                    <Ionicons name={meta.icon} size={22} color={meta.color} />
                  </View>
                  <View>
                    <Text style={styles.categoryLabel}>{meta.label}</Text>
                    <Text style={styles.timeLabel}>
                      {formatRealtimeNotificationTime(notification)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={20} color={Colors.secondary} />
                </TouchableOpacity>
              </View>

              {/* Status pill row */}
              <View style={styles.statusRow}>
                <View style={styles.statusPill}>
                  <Ionicons name="checkmark-circle" size={13} color={Colors.primary} />
                  <Text style={styles.statusPillText}>Opened & Moved to Old Notifications</Text>
                </View>
              </View>

              {/* Scrollable Message Content */}
              <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.titleText}>
                  {sanitizeNotificationText(notification.title)}
                </Text>

                <View style={styles.messageBox}>
                  <Text style={styles.messageText}>
                    {sanitizeNotificationText(notification.message)}
                  </Text>
                </View>
              </ScrollView>

              {/* Actions Footer */}
              <View style={styles.footer}>
                {actionLabel && (
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={handleAction}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.primaryBtnText}>{actionLabel}</Text>
                    <Ionicons name="arrow-forward" size={16} color={Colors.white} />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.closeModalBtn, !actionLabel && styles.fullWidthCloseBtn]}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeModalBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 22,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  timeLabel: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.cardBgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: {
    marginBottom: 14,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  scrollArea: {
    maxHeight: 280,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 12,
    lineHeight: 24,
  },
  messageBox: {
    backgroundColor: Colors.cardBgSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageText: {
    fontSize: 14.5,
    color: Colors.textDark,
    lineHeight: 22,
    fontWeight: '500',
  },
  footer: {
    marginTop: 18,
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  primaryBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  closeModalBtn: {
    backgroundColor: Colors.cardBgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
  },
  fullWidthCloseBtn: {
    backgroundColor: Colors.primary,
  },
  closeModalBtnText: {
    color: Colors.textDark,
    fontSize: 14.5,
    fontWeight: '700',
  },
});

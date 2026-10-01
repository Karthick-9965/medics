import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import ModalHeader from '../common/ModalHeader';
import EmptyState from '../common/EmptyState';
import { getNotificationMeta } from '../../utils/notificationMeta';
import {
  getStoredNotifications,
  markNotificationAsRead,
  clearAllNotifications,
  subscribeNotifications,
  formatRealtimeNotificationTime,
  AppNotification,
} from '../../services/notificationStorage';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateToSchedule?: () => void;
  onNavigateToAmbulance?: () => void;
  onNavigateToPharmacy?: () => void;
  onNavigateToMessages?: (conversationId?: string) => void;
}

/**
 * NotificationsModal renders recent notifications inside a bottom modal sheet.
 * Uses centralized getNotificationMeta for consistent icons, colors, and timestamps.
 */
export default function NotificationsModal({
  visible,
  onClose,
  onNavigateToSchedule,
  onNavigateToAmbulance,
  onNavigateToPharmacy,
  onNavigateToMessages,
}: NotificationsModalProps) {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    getStoredNotifications().then(setNotifications);
    const unsub = subscribeNotifications(setNotifications);

    // Live real-time ticker
    const ticker = setInterval(() => {
      getStoredNotifications().then(setNotifications);
    }, 30000);

    return () => {
      unsub();
      clearInterval(ticker);
    };
  }, []);

  const handleItemPress = (item: AppNotification) => {
    markNotificationAsRead(item.id);
    if ((item.type === 'message' || item.actionTarget === 'messages') && onNavigateToMessages) {
      onClose();
      onNavigateToMessages(item.conversationId);
    } else if (
      (item.type.startsWith('doctor') || item.type === 'appointment' || item.actionTarget === 'schedule') &&
      onNavigateToSchedule
    ) {
      onClose();
      onNavigateToSchedule();
    } else if (item.type.startsWith('ambulance') && onNavigateToAmbulance) {
      onClose();
      onNavigateToAmbulance();
    } else if ((item.type.startsWith('pharmacy') || item.type === 'order') && onNavigateToPharmacy) {
      onClose();
      onNavigateToPharmacy();
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <ModalHeader
            title="Notifications"
            subtitle={`${unreadCount} Unread`}
            onClose={onClose}
            rightAction={{
              icon: 'trash-outline',
              onPress: clearAllNotifications,
              color: Colors.dangerRed,
            }}
          />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {notifications.length === 0 ? (
              <EmptyState
                icon="notifications-off-outline"
                title="No Notifications"
                subtitle="You're all caught up! New updates & booking alerts will appear here."
              />
            ) : (
              notifications.map((item) => {
                const meta = getNotificationMeta(item);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.notifCard, !item.read && styles.notifCardUnread]}
                    onPress={() => handleItemPress(item)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconBox, { backgroundColor: meta.bg }]}>
                      <Ionicons name={meta.icon} size={20} color={meta.color} />
                    </View>
                    <View style={styles.cardContent}>
                      <View style={styles.titleRow}>
                        <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.notifTime}>{formatRealtimeNotificationTime(item)}</Text>
                      </View>
                      <Text style={styles.notifBody} numberOfLines={2}>
                        {item.message}
                      </Text>
                    </View>
                    {!item.read && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.modalOverlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 14,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 10,
    gap: 12,
  },
  notifCardUnread: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.tealLight,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  notifTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSlateDark,
    marginRight: 8,
  },
  notifTitleUnread: {
    fontWeight: '700',
    color: Colors.primary,
  },
  notifBody: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  notifTime: {
    fontSize: 10,
    color: Colors.secondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
});

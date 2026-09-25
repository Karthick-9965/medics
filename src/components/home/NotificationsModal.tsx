import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import ModalHeader from '../common/ModalHeader';
import EmptyState from '../common/EmptyState';
import {
  getStoredNotifications,
  markNotificationAsRead,
  clearAllNotifications,
  subscribeNotifications,
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

export default function NotificationsModal({
  visible,
  onClose,
  onNavigateToSchedule,
  onNavigateToAmbulance,
  onNavigateToPharmacy,
  onNavigateToMessages,
}: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<'All' | 'doctor' | 'message' | 'pharmacy' | 'ambulance'>('All');

  useEffect(() => {
    getStoredNotifications().then(setNotifications);
    const unsub = subscribeNotifications(setNotifications);
    return () => unsub();
  }, []);

  const filtered = notifications.filter((n) => {
    if (filter === 'All') return true;
    if (filter === 'doctor') return n.type.startsWith('doctor') || n.type === 'appointment';
    if (filter === 'message') return n.type === 'message' || n.actionTarget === 'messages';
    if (filter === 'pharmacy') return n.type.startsWith('pharmacy') || n.type === 'order';
    if (filter === 'ambulance') return n.type.startsWith('ambulance');
    return true;
  });

  const handleItemPress = (item: AppNotification) => {
    markNotificationAsRead(item.id);
    if ((item.type === 'message' || item.actionTarget === 'messages') && onNavigateToMessages) {
      onClose();
      onNavigateToMessages(item.conversationId);
    } else if ((item.type.startsWith('doctor') || item.type === 'appointment' || item.actionTarget === 'schedule') && onNavigateToSchedule) {
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

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <ModalHeader
            title="Notifications"
            subtitle={`${notifications.filter((n) => !n.read).length} Unread`}
            onClose={onClose}
            rightAction={{
              icon: 'trash-outline',
              onPress: clearAllNotifications,
              color: Colors.error,
            }}
          />

          {/* Filter Pills */}
          <View style={styles.filterRow}>
            {(['All', 'message', 'doctor', 'pharmacy', 'ambulance'] as const).map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, filter === f && styles.filterChipSelected]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterText, filter === f && styles.filterTextSelected]}>
                  {f === 'All' ? 'All' : f === 'message' ? 'Messages' : f === 'doctor' ? 'Appointments' : f === 'pharmacy' ? 'Pharmacy' : 'Ambulance'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {filtered.length === 0 ? (
              <EmptyState
                icon="notifications-off-outline"
                title="No Notifications"
                subtitle="You're all caught up! New updates & booking alerts will appear here."
              />
            ) : (
              filtered.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.notifCard, !item.read && styles.notifCardUnread]}
                  onPress={() => handleItemPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconBox, !item.read && styles.iconBoxUnread]}>
                    <Ionicons
                      name={
                        item.type === 'message' || item.actionTarget === 'messages'
                          ? 'chatbubble-ellipses'
                          : item.type.startsWith('doctor') || item.type === 'appointment'
                          ? 'calendar'
                          : item.type.startsWith('pharmacy') || item.type === 'order'
                          ? 'bag-check'
                          : item.type.startsWith('ambulance')
                          ? 'medical'
                          : 'information-circle'
                      }
                      size={20}
                      color={!item.read ? Colors.primary : Colors.secondary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]}>{item.title}</Text>
                    <Text style={styles.notifBody}>{item.message}</Text>
                    <Text style={styles.notifTime}>{item.timestamp}</Text>
                  </View>
                  {!item.read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              ))
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: Colors.bgLight,
  },
  filterChipSelected: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
  },
  filterTextSelected: {
    color: Colors.white,
  },
  list: {
    padding: 16,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
    gap: 12,
  },
  notifCardUnread: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.primary + '44',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxUnread: {
    backgroundColor: Colors.white,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
  },
  notifTitleUnread: {
    fontWeight: '700',
    color: Colors.primary,
  },
  notifBody: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
    lineHeight: 16,
  },
  notifTime: {
    fontSize: 10,
    color: Colors.secondary,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
});

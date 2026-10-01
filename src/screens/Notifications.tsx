import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import EmptyState from '../components/common/EmptyState';
import MedicalAlertModal from '../components/modals/MedicalAlertModal';
import SwipeableNotificationCard from '../components/notifications/SwipeableNotificationCard';
import NotificationDetailModal from '../components/notifications/NotificationDetailModal';
import { getNotificationMeta } from '../utils/notificationMeta';
import { sendTestPushNotification } from '../services/notificationManager';
import {
  getStoredNotifications,
  markNotificationAsRead,
  clearAllNotifications,
  deleteNotification,
  subscribeNotifications,
  AppNotification,
} from '../services/notificationStorage';

export interface NotificationsProps {
  navigation?: any;
  onNavigateToSchedule?: () => void;
  onNavigateToMessages?: (conversationId?: string) => void;
  onNavigateToAmbulance?: () => void;
  onNavigateToPharmacy?: () => void;
}

export default function Notifications({
  navigation,
  onNavigateToSchedule,
  onNavigateToMessages,
  onNavigateToAmbulance,
  onNavigateToPharmacy,
}: NotificationsProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);

  const loadNotifications = useCallback(async () => {
    const list = await getStoredNotifications();
    setNotifications(list);
  }, []);

  useEffect(() => {
    loadNotifications();
    const unsubscribe = subscribeNotifications((list) => {
      setNotifications(list);
    });

    // Real-time live ticker to recalculate timestamps every 30 seconds
    const ticker = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => {
      unsubscribe();
      clearInterval(ticker);
    };
  }, [loadNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearAll = () => {
    setShowClearConfirm(true);
  };

  const handleDeleteItem = (id: string) => {
    deleteNotification(id);
  };

  const handlePressItem = (item: AppNotification) => {
    // 1. Mark as read immediately in storage -> moves from New Notifications to Old Notifications
    markNotificationAsRead(item.id);

    // 2. Open notification message modal to read full message
    setSelectedNotification({ ...item, read: true });
  };

  const handleActionFromModal = (target: string, conversationId?: string) => {
    if (target === 'message' || target === 'messages') {
      if (onNavigateToMessages) {
        onNavigateToMessages(conversationId);
      } else {
        navigation?.navigate('Main', { screen: 'MessagesTab' });
      }
    } else if (
      target === 'appointment' ||
      target === 'schedule' ||
      target.startsWith('doctor')
    ) {
      if (onNavigateToSchedule) {
        onNavigateToSchedule();
      } else {
        navigation?.navigate('Main', { screen: 'ScheduleTab' });
      }
    } else if (target.startsWith('ambulance') || target === 'ambulance') {
      if (onNavigateToAmbulance) {
        onNavigateToAmbulance();
      } else {
        navigation?.navigate('Ambulance');
      }
    } else if (target === 'order' || target.startsWith('pharmacy') || target === 'pharmacy') {
      if (onNavigateToPharmacy) {
        onNavigateToPharmacy();
      } else {
        navigation?.navigate('SeeAll', { category: 'pharmacy' });
      }
    }
  };

  const eligibleNotifications = notifications.filter(
    (n) => n.type !== 'message' && n.actionTarget !== 'messages'
  );

  const newNotifications = eligibleNotifications.filter((n) => !n.read);
  const oldNotifications = eligibleNotifications.filter((n) => n.read);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Screen Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.testPushBtn}
            onPress={async () => {
              await sendTestPushNotification({
                title: 'Apollo Medical Alert: Health Checkup Ready',
                message: 'Your comprehensive diagnostic panel reports and doctor recommendations are ready for review.',
                type: 'system',
              });
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="notifications-outline" size={15} color={Colors.primary} />
            <Text style={styles.testPushText}>Test Push</Text>
          </TouchableOpacity>

          {notifications.length > 0 && (
            <TouchableOpacity
              style={styles.iconActionBtn}
              onPress={handleClearAll}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notifications List with Sections */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {eligibleNotifications.length === 0 ? (
          <EmptyState
            icon="notifications-off-outline"
            title="No Notifications"
            subtitle="You're all caught up! You don't have any notifications at the moment."
          />
        ) : (
          <>
            {/* Section 1: New Notifications */}
            {newNotifications.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionTitle}>New Notifications</Text>
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>{newNotifications.length}</Text>
                    </View>
                  </View>
                  <Text style={styles.sectionSubtext}>Unread</Text>
                </View>

                {newNotifications.map((item) => (
                  <SwipeableNotificationCard
                    key={item.id}
                    item={item}
                    meta={getNotificationMeta(item)}
                    onPress={() => handlePressItem(item)}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </View>
            )}

            {/* Section 2: Old Notifications */}
            {oldNotifications.length > 0 && (
              <View style={[styles.sectionContainer, newNotifications.length > 0 && styles.sectionSpacing]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionTitle}>Old Notifications</Text>
                    <View style={styles.oldBadge}>
                      <Text style={styles.oldBadgeText}>{oldNotifications.length}</Text>
                    </View>
                  </View>
                  <Text style={styles.sectionSubtext}>Earlier</Text>
                </View>

                {oldNotifications.map((item) => (
                  <SwipeableNotificationCard
                    key={item.id}
                    item={item}
                    meta={getNotificationMeta(item)}
                    onPress={() => handlePressItem(item)}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Clear All Confirmation Modal */}
      <MedicalAlertModal
        visible={showClearConfirm}
        type="delete"
        title="Clear All Notifications"
        message="Are you sure you want to remove all notifications? This action cannot be undone."
        primaryButtonText="Clear All"
        secondaryButtonText="Cancel"
        isDestructive
        onPrimaryPress={async () => {
          setShowClearConfirm(false);
          await clearAllNotifications();
        }}
        onSecondaryPress={() => setShowClearConfirm(false)}
        onClose={() => setShowClearConfirm(false)}
      />

      {/* Notification Message Detail Modal */}
      <NotificationDetailModal
        visible={!!selectedNotification}
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onActionPress={handleActionFromModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBgSecondary,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  testPushBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.accentLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  testPushText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  iconActionBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: Colors.dangerBgLight,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  sectionContainer: {
    marginBottom: 8,
  },
  sectionSpacing: {
    marginTop: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
  },
  newBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 10,
  },
  newBadgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  oldBadge: {
    backgroundColor: Colors.cardBgSecondary,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 10,
  },
  oldBadgeText: {
    color: Colors.secondary,
    fontSize: 11,
    fontWeight: '700',
  },
  sectionSubtext: {
    fontSize: 11.5,
    color: Colors.secondary,
    fontWeight: '500',
  },
});

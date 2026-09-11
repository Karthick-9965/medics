import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../../../constants/Colors';

export type ScheduleStatus = 'upcoming' | 'completed' | 'canceled';

interface ScheduleStatusTabsProps {
  activeTab: ScheduleStatus;
  onSelectTab: (tab: ScheduleStatus) => void;
  completedCount?: number;
}

const STATUS_TABS: { key: ScheduleStatus; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'canceled', label: 'Canceled' },
];

export default function ScheduleStatusTabs({
  activeTab,
  onSelectTab,
  completedCount = 0,
}: ScheduleStatusTabsProps) {
  return (
    <View style={styles.tabContainer}>
      {STATUS_TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const isCompleted = tab.key === 'completed';

        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, isActive && styles.tabButtonActive]}
            onPress={() => onSelectTab(tab.key)}
            activeOpacity={0.7}
          >
            <View style={styles.tabContentRow}>
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {isCompleted && completedCount > 0 && (
                <View
                  style={[
                    styles.countBadge,
                    isActive ? styles.countBadgeActive : styles.countBadgeInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      isActive ? styles.countTextActive : styles.countTextInactive,
                    ]}
                  >
                    {completedCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.bgLight,
    borderRadius: 14,
    marginHorizontal: 20,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeActive: {
    backgroundColor: Colors.white,
  },
  countBadgeInactive: {
    backgroundColor: Colors.primary,
  },
  countText: {
    fontSize: 11,
    fontWeight: '800',
  },
  countTextActive: {
    color: Colors.primary,
  },
  countTextInactive: {
    color: Colors.white,
  },
});

import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps as RNBottomTabBarProps } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';

export type TabKey = 'home' | 'messages' | 'schedule' | 'profile';

interface TabConfig {
  key: TabKey;
  routeName: string;
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabConfig[] = [
  { key: 'home', routeName: 'HomeTab', label: 'Home', activeIcon: 'home', inactiveIcon: 'home-outline' },
  { key: 'messages', routeName: 'MessagesTab', label: 'Messages', activeIcon: 'chatbubble-ellipses', inactiveIcon: 'chatbubble-ellipses-outline' },
  { key: 'schedule', routeName: 'ScheduleTab', label: 'Schedule', activeIcon: 'calendar', inactiveIcon: 'calendar-outline' },
  { key: 'profile', routeName: 'ProfileTab', label: 'Profile', activeIcon: 'person', inactiveIcon: 'person-outline' },
];

export interface BottomTabBarProps extends Partial<RNBottomTabBarProps> {
  activeTab?: TabKey;
  onTabPress?: (tab: TabKey) => void;
  unreadCount?: number;
}

export default function BottomTabBar({
  state,
  navigation,
  activeTab: manualTab,
  onTabPress: manualOnPress,
  unreadCount,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 10);
  const [dynUnreadCount, setDynUnreadCount] = React.useState(0);

  React.useEffect(() => {
    const fetchUnread = async () => {
      try {
        const stored = await AsyncStorage.getItem('@app_conversations');
        if (stored) {
          const convs = JSON.parse(stored);
          const count = convs.reduce((sum: number, c: any) => sum + (c.unread || 0), 0);
          setDynUnreadCount(count);
        } else {
          setDynUnreadCount(4);
        }
      } catch (e) {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 2000);
    return () => clearInterval(interval);
  }, []);

  const effectiveUnread = unreadCount !== undefined ? unreadCount : dynUnreadCount;

  const currentRouteName = state ? state.routes[state.index]?.name : undefined;
  const activeTab: TabKey = currentRouteName
    ? currentRouteName === 'MessagesTab'
      ? 'messages'
      : currentRouteName === 'ScheduleTab'
      ? 'schedule'
      : currentRouteName === 'ProfileTab'
      ? 'profile'
      : 'home'
    : manualTab || 'home';

  const handlePress = (tab: TabConfig) => {
    if (navigation && state) {
      const isFocused = activeTab === tab.key;
      const event = navigation.emit({
        type: 'tabPress',
        target: tab.routeName,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(tab.routeName);
      }
    } else if (manualOnPress) {
      manualOnPress(tab.key);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <View style={styles.tabsRow}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabButton}
              onPress={() => handlePress(tab)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.inactiveIcon}
                  size={24}
                  color={isActive ? Colors.primary : Colors.secondary}
                />
                {/* Active Indicator Dot */}
                {isActive && <View style={styles.activeDot} />}

                {/* Badge for Messages */}
                {tab.key === 'messages' && effectiveUnread > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{effectiveUnread}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.dividerLine || Colors.border,
    paddingTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 36,
  },
  activeDot: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 4,
    backgroundColor: Colors.error,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
});

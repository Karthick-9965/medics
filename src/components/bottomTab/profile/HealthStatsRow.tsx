import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';

interface HealthStatsRowProps {
  heartRate?: string;
  calories?: string;
  weight?: string;
  isTealTheme?: boolean;
}

export default function HealthStatsRow({
  heartRate = '215bpm',
  calories = '758cal',
  weight = '103lbs',
  isTealTheme = false,
}: HealthStatsRowProps) {
  return (
    <View style={[styles.statsContainer, isTealTheme && styles.statsContainerTeal]}>
      {/* 1. Heart Rate */}
      <View style={styles.statBox}>
        <View
          style={[
            styles.iconBadge,
            { backgroundColor: isTealTheme ? Colors.whiteOverlay22 : Colors.dangerBgTint },
          ]}
        >
          <Ionicons
            name="pulse"
            size={20}
            color={isTealTheme ? Colors.white : Colors.dangerRed}
          />
        </View>
        <Text style={[styles.statLabel, isTealTheme ? styles.statLabelTeal : styles.statLabelLight]}>
          Heart rate
        </Text>
        <Text style={[styles.statValue, isTealTheme ? styles.statValueTeal : styles.statValueLight]}>
          {heartRate}
        </Text>
      </View>

      <View style={[styles.statDivider, isTealTheme ? styles.statDividerTeal : styles.statDividerLight]} />

      {/* 2. Calories */}
      <View style={styles.statBox}>
        <View
          style={[
            styles.iconBadge,
            { backgroundColor: isTealTheme ? Colors.whiteOverlay22 : Colors.warningBgLight },
          ]}
        >
          <Ionicons
            name="flame"
            size={20}
            color={isTealTheme ? Colors.white : Colors.apolloOrange}
          />
        </View>
        <Text style={[styles.statLabel, isTealTheme ? styles.statLabelTeal : styles.statLabelLight]}>
          Calories
        </Text>
        <Text style={[styles.statValue, isTealTheme ? styles.statValueTeal : styles.statValueLight]}>
          {calories}
        </Text>
      </View>

      <View style={[styles.statDivider, isTealTheme ? styles.statDividerTeal : styles.statDividerLight]} />

      {/* 3. Weight */}
      <View style={styles.statBox}>
        <View
          style={[
            styles.iconBadge,
            { backgroundColor: isTealTheme ? Colors.whiteOverlay22 : Colors.accentLight },
          ]}
        >
          <Ionicons
            name="speedometer"
            size={20}
            color={isTealTheme ? Colors.white : Colors.primary}
          />
        </View>
        <Text style={[styles.statLabel, isTealTheme ? styles.statLabelTeal : styles.statLabelLight]}>
          Weight
        </Text>
        <Text style={[styles.statValue, isTealTheme ? styles.statValueTeal : styles.statValueLight]}>
          {weight}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: 8,
    width: '100%',
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statsContainerTeal: {
    backgroundColor: Colors.transparent,
    borderWidth: 0,
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 6,
    shadowOpacity: 0,
    elevation: 0,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 11.5,
    fontWeight: '500',
    marginBottom: 3,
  },
  statLabelLight: {
    color: Colors.secondary,
  },
  statLabelTeal: {
    color: Colors.whiteOverlay85,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  statValueLight: {
    color: Colors.textDark,
  },
  statValueTeal: {
    color: Colors.white,
  },
  statDivider: {
    width: 1,
    height: 38,
  },
  statDividerLight: {
    backgroundColor: Colors.borderLight,
  },
  statDividerTeal: {
    backgroundColor: Colors.whiteOverlay35,
  },
});

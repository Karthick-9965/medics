import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
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
        <View style={styles.iconWrap}>
          <Ionicons name="heart" size={20} color={isTealTheme ? Colors.white : Colors.logoutRed} />
        </View>
        <Text style={[styles.statLabel, isTealTheme ? styles.statLabelTeal : styles.statLabelLight]}>Heart rate</Text>
        <Text style={[styles.statValue, isTealTheme ? styles.statValueTeal : styles.statValueLight]}>{heartRate}</Text>
      </View>

      <View style={[styles.statDivider, isTealTheme ? styles.statDividerTeal : styles.statDividerLight]} />

      {/* 2. Calories */}
      <View style={styles.statBox}>
        <View style={styles.iconWrap}>
          <Ionicons name="flame" size={20} color={isTealTheme ? Colors.white : '#FF9800'} />
        </View>
        <Text style={[styles.statLabel, isTealTheme ? styles.statLabelTeal : styles.statLabelLight]}>Calories</Text>
        <Text style={[styles.statValue, isTealTheme ? styles.statValueTeal : styles.statValueLight]}>{calories}</Text>
      </View>

      <View style={[styles.statDivider, isTealTheme ? styles.statDividerTeal : styles.statDividerLight]} />

      {/* 3. Weight */}
      <View style={styles.statBox}>
        <View style={styles.iconWrap}>
          <FontAwesome5 name="weight" size={18} color={isTealTheme ? Colors.white : Colors.primary} />
        </View>
        <Text style={[styles.statLabel, isTealTheme ? styles.statLabelTeal : styles.statLabelLight]}>Weight</Text>
        <Text style={[styles.statValue, isTealTheme ? styles.statValueTeal : styles.statValueLight]}>{weight}</Text>
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    width: '100%',
    marginBottom: 16,
  },
  statsContainerTeal: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 6,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  iconWrap: {
    marginBottom: 4,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  statLabelLight: {
    color: Colors.secondary,
  },
  statLabelTeal: {
    color: 'rgba(255, 255, 255, 0.85)',
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
    height: 34,
  },
  statDividerLight: {
    backgroundColor: Colors.border,
  },
  statDividerTeal: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
});

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';

interface HealthStatsRowProps {
  heartRate?: string;
  calories?: string;
  weight?: string;
}

export default function HealthStatsRow({
  heartRate = '215bpm',
  calories = '756cal',
  weight = '103lbs',
}: HealthStatsRowProps) {
  return (
    <View style={styles.statsContainer}>
      {/* 1. Heart Rate (Heart Pulse) */}
      <View style={styles.statBox}>
        <View style={[styles.statIconCircle, { backgroundColor: '#FFF0F2' }]}>
          <MaterialCommunityIcons name="heart-pulse" size={20} color="#FF5252" />
        </View>
        <Text style={styles.statValue}>{heartRate}</Text>
        <Text style={styles.statLabel}>Heart rate</Text>
      </View>

      <View style={styles.statDivider} />

      {/* 2. Calories (Fire / Flame) */}
      <View style={styles.statBox}>
        <View style={[styles.statIconCircle, { backgroundColor: '#FFF7E6' }]}>
          <MaterialCommunityIcons name="fire" size={20} color="#FF9800" />
        </View>
        <Text style={styles.statValue}>{calories}</Text>
        <Text style={styles.statLabel}>Calories</Text>
      </View>

      <View style={styles.statDivider} />

      {/* 3. Weight (Weight Scale Machine) */}
      <View style={styles.statBox}>
        <View style={[styles.statIconCircle, { backgroundColor: '#E7F5F2' }]}>
          <MaterialCommunityIcons name="scale-bathroom" size={19} color={Colors.primary} />
        </View>
        <Text style={styles.statValue}>{weight}</Text>
        <Text style={styles.statLabel}>Weight</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 24,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
  },
});

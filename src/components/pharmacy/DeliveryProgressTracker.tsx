import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export interface DeliveryProgressTrackerProps {
  trackingStep: number; // 1: Confirmed, 2: Packed, 3: Out for delivery, 4: Delivered
  eta?: string;
  deliveryAddress: string;
}

/**
 * Reusable 4-Step Vertical Delivery Progress Timeline Tracker.
 * Shows status progression from 'Order Confirmed' to 'Delivered to Doorstep'.
 */
export default function DeliveryProgressTracker({
  trackingStep,
  eta,
  deliveryAddress,
}: DeliveryProgressTrackerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeading}>Delivery Progress</Text>

      {/* Step 1: Confirmed */}
      <View style={styles.row}>
        <View style={styles.iconColumn}>
          <View style={[styles.dot, trackingStep >= 1 && styles.dotActive]}>
            <Ionicons name="checkmark" size={13} color={Colors.white} />
          </View>
          <View style={[styles.line, trackingStep >= 2 && styles.lineActive]} />
        </View>
        <View style={styles.textColumn}>
          <Text style={styles.stepTitle}>Order Confirmed</Text>
          <Text style={styles.stepSubtitle}>Order received & prescription verified</Text>
        </View>
      </View>

      {/* Step 2: Packed */}
      <View style={styles.row}>
        <View style={styles.iconColumn}>
          <View style={[styles.dot, trackingStep >= 2 && styles.dotActive]}>
            <Ionicons
              name={trackingStep >= 2 ? 'checkmark' : 'cube-outline'}
              size={13}
              color={trackingStep >= 2 ? Colors.white : Colors.secondary}
            />
          </View>
          <View style={[styles.line, trackingStep >= 3 && styles.lineActive]} />
        </View>
        <View style={styles.textColumn}>
          <Text style={styles.stepTitle}>Medicines Packed</Text>
          <Text style={styles.stepSubtitle}>Medicines sealed with cold storage safety</Text>
        </View>
      </View>

      {/* Step 3: Out for Delivery */}
      <View style={styles.row}>
        <View style={styles.iconColumn}>
          <View style={[styles.dot, trackingStep >= 3 && styles.dotActive]}>
            <Ionicons
              name={trackingStep >= 3 ? 'bicycle' : 'time-outline'}
              size={13}
              color={trackingStep >= 3 ? Colors.white : Colors.secondary}
            />
          </View>
          <View style={[styles.line, trackingStep >= 4 && styles.lineActive]} />
        </View>
        <View style={styles.textColumn}>
          <Text style={styles.stepTitle}>Out for Delivery</Text>
          <Text style={styles.stepSubtitle}>
            {eta || 'Delivery partner is on the way'}
          </Text>
        </View>
      </View>

      {/* Step 4: Delivered */}
      <View style={styles.row}>
        <View style={styles.iconColumn}>
          <View style={[styles.dot, trackingStep >= 4 && styles.dotActive]}>
            <Ionicons
              name="home"
              size={13}
              color={trackingStep >= 4 ? Colors.white : Colors.secondary}
            />
          </View>
        </View>
        <View style={styles.textColumn}>
          <Text style={styles.stepTitle}>Delivered to Doorstep</Text>
          <Text style={styles.stepSubtitle}>Delivered to: {deliveryAddress}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    minHeight: 52,
  },
  iconColumn: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  dotActive: {
    backgroundColor: Colors.primary,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  lineActive: {
    backgroundColor: Colors.primary,
  },
  textColumn: {
    flex: 1,
    paddingBottom: 14,
  },
  stepTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.textDark,
  },
  stepSubtitle: {
    fontSize: 11.5,
    color: Colors.secondary,
    marginTop: 2,
  },
});

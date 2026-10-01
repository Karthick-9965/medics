import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export interface DeliveryAgent {
  name: string;
  phone: string;
  vehicle: string;
}

export interface DeliveryAgentCardProps {
  agent: DeliveryAgent;
  onCall: (phone: string) => void;
}

/**
 * Reusable Delivery Agent Contact Card.
 * Displays driver avatar, name, vehicle number, and instant phone call action.
 */
export default function DeliveryAgentCard({
  agent,
  onCall,
}: DeliveryAgentCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.avatarBox}>
        <Ionicons name="person" size={20} color={Colors.primary} />
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.agentName}>{agent.name}</Text>
        <Text style={styles.agentVehicle}>{agent.vehicle}</Text>
      </View>
      <TouchableOpacity
        style={styles.callBtn}
        onPress={() => onCall(agent.phone)}
        activeOpacity={0.7}
      >
        <Ionicons name="call" size={14} color={Colors.white} />
        <Text style={styles.callBtnText}>Call</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    padding: 12,
    borderRadius: 14,
    gap: 12,
  },
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    flex: 1,
  },
  agentName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  agentVehicle: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  callBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.white,
  },
});

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface QuickServiceItem {
  id: string;
  name: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
}

const services: QuickServiceItem[] = [
  {
    id: 'doctor',
    name: 'Doctor',
    iconName: 'medkit',
    iconSize: 26,
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    iconName: 'bandage',
    iconSize: 26,
  },
  {
    id: 'hospital',
    name: 'Hospital',
    iconName: 'business',
    iconSize: 24,
  },
  {
    id: 'ambulance',
    name: 'Ambulance',
    iconName: 'car-sport',
    iconSize: 25,
  },
];

interface QuickServicesProps {
  onServicePress?: (serviceId: string) => void;
}

export default function QuickServices({ onServicePress }: QuickServicesProps) {
  return (
    <View style={styles.container}>
      {services.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.itemWrapper}
          onPress={() => onServicePress?.(item.id)}
          activeOpacity={0.8}
        >
          <View style={styles.iconCircle}>
            <Ionicons name={item.iconName} size={item.iconSize || 24} color={Colors.primary} />
          </View>
          <Text style={styles.label}>{item.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 22,
  },
  itemWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: Colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.black,
    textAlign: 'center',
  },
});

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface QuickServiceItem {
  id: string;
  name: string;
  renderIcon: () => React.ReactNode;
}

const services: QuickServiceItem[] = [
  {
    id: 'doctor',
    name: 'Doctor',
    renderIcon: () => (
      <FontAwesome5 name="stethoscope" size={24} color={Colors.primary} />
    ),
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    renderIcon: () => (
      <MaterialCommunityIcons name="pill" size={26} color={Colors.primary} />
    ),
  },
  {
    id: 'hospital',
    name: 'Hospital',
    renderIcon: () => (
      <FontAwesome5 name="hospital-alt" size={22} color={Colors.primary} />
    ),
  },
  {
    id: 'ambulance',
    name: 'Ambulance',
    renderIcon: () => (
      <FontAwesome5 name="ambulance" size={22} color={Colors.primary} />
    ),
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
            {item.renderIcon()}
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
    backgroundColor: '#EDF8F6',
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

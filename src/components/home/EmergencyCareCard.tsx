import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

const ambulanceImage = require('../../assets/images/home/emergency/ambulance.png');

interface EmergencyCareCardProps {
  onGetHelpPress?: () => void;
}

export default function EmergencyCareCard({ onGetHelpPress }: EmergencyCareCardProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <Image source={ambulanceImage} style={styles.ambulanceImage} resizeMode="cover" />
        <View style={styles.content}>
          <Text style={styles.title}>Need immediate medical assistance?</Text>
          <Text style={styles.subtitle}>We are available 24/7 for your emergency</Text>

          <View style={styles.bottomRow}>
            <View style={styles.infoCol}>
              <View style={styles.infoBadge}>
                <Ionicons name="time-outline" size={12} color={Colors.logoutRed} />
                <Text style={styles.infoText}>24/7 Support</Text>
              </View>
              <View style={styles.infoBadge}>
                <Ionicons name="call" size={11} color={Colors.logoutRed} />
                <Text style={styles.infoText}>Call Emergency</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={onGetHelpPress}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>Get Help Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFF2F2',
    borderWidth: 1,
    borderColor: '#FFE2E2',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ambulanceImage: {
    width: 85,
    height: 65,
    borderRadius: 10,
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.black,
  },
  subtitle: {
    fontSize: 10,
    color: Colors.secondary,
    marginTop: 2,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoCol: {
    gap: 4,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 9.5,
    color: Colors.black,
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: Colors.logoutRed,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
});

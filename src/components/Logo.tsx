import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { Colors } from '../constants/Colors';

interface LogoProps {
  size?: number;
  color?: string;
  textColor?: string;
  hideText?: boolean;
}

export default function Logo({ size = 80, color = Colors.primary, textColor = Colors.primary, hideText = false }: LogoProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={{ width: size, height: size, tintColor: color }}
        resizeMode="contain"
      />
      {!hideText && (
        <Text style={[styles.text, { color: textColor, fontSize: size * 0.32 }]}>
          Medics
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: 'bold',
    marginTop: 10,
    letterSpacing: 0.5,
  },
});

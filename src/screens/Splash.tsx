import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Logo from '../components/ui/Logo';
import { Colors } from '../constants/Colors';

interface SplashProps {
  onFinish: () => void;
}

export default function Splash({ onFinish }: SplashProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 3000); // 3 seconds
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <TouchableOpacity style={styles.container} activeOpacity={1} onPress={onFinish}>
      <Logo size={100} color={Colors.white} textColor={Colors.white} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

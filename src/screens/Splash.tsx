import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Logo from '../components/ui/Logo';
import { Colors } from '../constants/Colors';
import AppStatusBar from '../components/common/AppStatusBar';

interface SplashProps {
  onFinish: () => void;
}

export default function Splash({ onFinish }: SplashProps) {
  const onFinishRef = React.useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinishRef.current?.();
    }, 2500); // 2.5 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={() => onFinishRef.current?.()}
    >
      <AppStatusBar style="light" />
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

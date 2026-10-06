import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { Colors } from '../../constants/Colors';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
}

/**
 * Standard Reusable Card container.
 * Enforces unified background, rounded corners, borders, and bottom shadow across the entire app.
 */
export default function Card({ style, children, ...props }: CardProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});

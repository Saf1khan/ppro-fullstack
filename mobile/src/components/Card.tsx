import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { theme } from '../theme';

export interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'flat';
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  style,
  children,
  ...rest
}) => {
  return (
    <View style={[styles.base, styles[variant], style]} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  elevated: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    ...theme.shadows.card,
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  flat: {
    backgroundColor: theme.colors.surface,
  },
});

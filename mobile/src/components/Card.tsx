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
    borderRadius: theme.radius.xl, // 16px modern rounding
    padding: theme.spacing.xl, // 20px comfortable padding
  },
  elevated: {
    borderWidth: 1,
    borderColor: '#F2F4F7',
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

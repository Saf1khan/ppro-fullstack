import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import { theme } from '../theme';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  style,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  const containerStyles: (ViewStyle | false | undefined)[] = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    isDisabled && variant === 'primary' && styles.primaryDisabled,
    isDisabled && variant !== 'primary' && styles.disabledGeneral,
    style as ViewStyle,
  ];

  const textStyles: TextStyle[] = [
    styles.textBase,
    styles[`${variant}Text`],
    styles[`text_size_${size}`],
  ];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={isDisabled}
      style={containerStyles as ViewStyle[]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? theme.colors.surface : theme.colors.primary}
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primary: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryDisabled: {
    backgroundColor: theme.colors.primaryDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  secondary: {
    backgroundColor: theme.colors.primaryLight,
  },
  outline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E4E7EC',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabledGeneral: {
    opacity: 0.5,
  },
  size_sm: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    minHeight: 38,
    borderRadius: 10,
  },
  size_md: {
    paddingVertical: 14,
    paddingHorizontal: theme.spacing['2xl'],
    minHeight: 52,
  },
  size_lg: {
    paddingVertical: 16,
    paddingHorizontal: theme.spacing['2xl'],
    minHeight: 56,
  },
  textBase: {
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  primaryText: {
    color: theme.colors.textInverse,
    fontSize: theme.typography.fontSize.body,
  },
  secondaryText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.body,
  },
  outlineText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.body,
  },
  ghostText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.body,
  },
  text_size_sm: {
    fontSize: theme.typography.fontSize.sm,
  },
  text_size_md: {
    fontSize: theme.typography.fontSize.body, // 16px
  },
  text_size_lg: {
    fontSize: theme.typography.fontSize.subheading,
  },
});

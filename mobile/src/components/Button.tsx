import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
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

  const containerStyles: ViewStyle[] = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    isDisabled ? styles.disabled : {},
    style as ViewStyle,
  ];

  const textStyles: TextStyle[] = [
    styles.textBase,
    styles[`${variant}Text`],
    styles[`text_size_${size}`],
  ];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      style={containerStyles}
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
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.primaryLight,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  size_sm: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    minHeight: 36,
  },
  size_md: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 48,
  },
  size_lg: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing['2xl'],
    minHeight: 56,
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    fontWeight: theme.typography.fontWeight.semiBold,
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
    fontSize: theme.typography.fontSize.body,
  },
  text_size_lg: {
    fontSize: theme.typography.fontSize.subheading,
  },
});

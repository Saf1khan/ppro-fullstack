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
      activeOpacity={0.82}
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
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primary: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 2,
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
    borderColor: '#E5E7EB',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabledGeneral: {
    opacity: 0.5,
  },
  size_sm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    minHeight: 36,
    borderRadius: 10,
  },
  size_md: {
    paddingVertical: 13,
    paddingHorizontal: 22,
    minHeight: 48,
  },
  size_lg: {
    paddingVertical: 15,
    paddingHorizontal: 24,
    minHeight: 52,
  },
  textBase: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  secondaryText: {
    color: theme.colors.primary,
    fontSize: 15,
  },
  outlineText: {
    color: '#111827',
    fontSize: 15,
  },
  ghostText: {
    color: theme.colors.primary,
    fontSize: 15,
  },
  text_size_sm: {
    fontSize: 13,
  },
  text_size_md: {
    fontSize: 15,
  },
  text_size_lg: {
    fontSize: 16,
  },
});

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from '../theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  isPassword?: boolean;
  prefix?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  style,
  onFocus,
  onBlur,
  isPassword = false,
  secureTextEntry,
  prefix,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hidePassword, setHidePassword] = useState(isPassword);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
      >
        {prefix ? <Text style={styles.prefixText}>{prefix}</Text> : null}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#98A2B3"
          secureTextEntry={isPassword ? hidePassword : secureTextEntry}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setHidePassword((prev) => !prev)}
            activeOpacity={0.7}
            accessibilityLabel={hidePassword ? 'Show password' : 'Hide password'}
            accessibilityRole="button"
          >
            <Text style={styles.toggleText}>
              {hidePassword ? 'Show' : 'Hide'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
    width: '100%',
  },
  label: {
    fontSize: theme.typography.fontSize.sm, // 14px
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  inputWrapper: {
    backgroundColor: '#FAFAF8',
    borderWidth: 1.5,
    borderColor: '#E4E7EC',
    borderRadius: 14,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  prefixText: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.textPrimary,
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: theme.typography.fontSize.body, // 16px
    color: theme.colors.textPrimary,
    paddingVertical: theme.spacing.md,
  },
  inputFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: theme.colors.primary,
  },
  inputError: {
    backgroundColor: '#FEF3F2',
    borderColor: theme.colors.error,
  },
  toggleButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  toggleText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  errorText: {
    marginTop: 6,
    fontSize: theme.typography.fontSize.label,
    color: theme.colors.error,
    fontWeight: theme.typography.fontWeight.medium,
  },
  helperText: {
    marginTop: 6,
    fontSize: theme.typography.fontSize.label,
    color: theme.colors.textSecondary,
  },
});

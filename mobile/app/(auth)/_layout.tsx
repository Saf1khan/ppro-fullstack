import React from 'react';
import { Stack } from 'expo-router';
import { theme } from '../../src/theme';

/**
 * Authentication Flow Route Group Layout.
 * Screens (register, verify-otp, login) will be mounted here in Phase 2.
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.primary,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    />
  );
}

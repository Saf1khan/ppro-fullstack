import React from 'react';
import { Stack } from 'expo-router';
import { theme } from '../../src/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: {
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.textPrimary,
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
          title: 'Sign In',
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          headerShown: false,
          title: 'Sign Up',
        }}
      />
      <Stack.Screen
        name="verify-email"
        options={{
          headerShown: false,
          title: 'Verify Email',
        }}
      />
    </Stack>
  );
}

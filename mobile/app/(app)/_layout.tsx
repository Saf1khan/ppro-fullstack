import React from 'react';
import { Stack } from 'expo-router';
import { theme } from '../../src/theme';

/**
 * Main Application Route Group Layout.
 * Screens (home showing selected tasks, profile view, logout) will be mounted here in Phase 4.
 */
export default function AppLayout() {
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

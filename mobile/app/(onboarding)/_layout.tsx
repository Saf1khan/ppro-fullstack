import React from 'react';
import { Stack } from 'expo-router';
import { theme } from '../../src/theme';

/**
 * Onboarding Flow Route Group Layout.
 * Screens (first-login profile, task-selection, confirmation) will be mounted here in Phase 3.
 */
export default function OnboardingLayout() {
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
